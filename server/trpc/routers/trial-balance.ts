import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const trialBalanceRouter = router({
  list: protectedProcedure
    .input(z.object({
      fiscalPeriodId: z.number(),
      subjectId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        ...tenantWhere(ctx.user.companyId),
        fiscalPeriodId: input.fiscalPeriodId,
      };
      if (input.subjectId) where.subjectId = input.subjectId;

      return ctx.db.trialBalance.findMany({
        where,
        orderBy: { subject: { code: 'asc' } },
        include: { subject: true },
      });
    }),

  generate: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Aggregate from voucher entries to compute trial balance
      const entries = await ctx.db.voucherEntry.findMany({
        where: {
          voucher: {
            companyId: ctx.user.companyId,
            fiscalPeriodId: input.fiscalPeriodId,
            auditStatus: 'posted',
            isVoided: false,
          },
        },
        include: { subject: true, voucher: true },
      });

      // Group by subject
      const balances = new Map<bigint, { debit: number; credit: number }>();
      for (const e of entries) {
        const b = balances.get(e.subjectId) ?? { debit: 0, credit: 0 };
        b.debit += Number(e.debitAmount);
        b.credit += Number(e.creditAmount);
        balances.set(e.subjectId, b);
      }

      // Upsert trial balance rows
      return ctx.db.$transaction(async (tx) => {
        const rows = [];
        for (const [subjectId, b] of balances) {
          const net = b.debit - b.credit;
          const row = await tx.trialBalance.upsert({
            where: {
              fiscalPeriodId_subjectId: {
                fiscalPeriodId: BigInt(input.fiscalPeriodId),
                subjectId,
              },
            },
            update: {
              currentDebit: b.debit,
              currentCredit: b.credit,
              endingDebit: net > 0 ? net : 0,
              endingCredit: net < 0 ? -net : 0,
              endingDirection: net >= 0 ? '借' : '贷',
              isBalanced: true,
            },
            create: {
              companyId: BigInt(ctx.user.companyId),
              fiscalPeriodId: BigInt(input.fiscalPeriodId),
              subjectId,
              currentDebit: b.debit,
              currentCredit: b.credit,
              endingDebit: net > 0 ? net : 0,
              endingCredit: net < 0 ? -net : 0,
              endingDirection: net >= 0 ? '借' : '贷',
            },
          });
          rows.push(row);
        }
        return { count: rows.length };
      });
    }),
});
