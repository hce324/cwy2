import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const ledgerRouter = router({
  list: protectedProcedure
    .input(z.object({
      bookType: z.enum(['journal', 'classify', 'memo']).default('journal'),
      subjectId: z.number().optional(),
      fiscalPeriodId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        ...tenantWhere(ctx.user.companyId),
        bookType: input.bookType,
      };
      if (input.subjectId) where.subjectId = input.subjectId;
      if (input.fiscalPeriodId) where.fiscalPeriodId = input.fiscalPeriodId;

      const [items, total] = await Promise.all([
        ctx.db.ledgerEntry.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { entryDate: 'asc' },
          include: { subject: true },
        }),
        ctx.db.ledgerEntry.count({ where }),
      ]);
      return { items, total };
    }),

  postVoucher: protectedProcedure
    .input(z.object({ voucherId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Post a voucher's entries to the ledger
      const voucher = await ctx.db.accountingVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.voucherId },
        include: { entries: true },
      });
      if (!voucher) throw new Error('凭证不存在');
      if (voucher.status !== 'approved') throw new Error('只能过账已审核的凭证');

      // Check if already posted
      const existing = await ctx.db.ledgerEntry.findFirst({
        where: { voucherId: input.voucherId },
      });
      if (existing) throw new Error('该凭证已过账');

      return ctx.db.$transaction(async (tx) => {
        // Update voucher status
        await tx.accountingVoucher.update({
          where: { id: input.voucherId },
          data: { status: 'posted', auditStatus: 'posted' },
        });

        // Create ledger entries for cash-related subjects (1001, 1002)
        const cashSubjects = ['1001', '1002'];
        for (const entry of voucher.entries) {
          const subject = await tx.accountingSubject.findUnique({
            where: { id: entry.subjectId },
          });
          if (!subject || !cashSubjects.some(c => subject.code.startsWith(c))) continue;

          await tx.ledgerEntry.create({
            data: {
              companyId: BigInt(ctx.user.companyId),
              fiscalPeriodId: voucher.fiscalPeriodId,
              subjectId: entry.subjectId,
              voucherId: voucher.id,
              entryDate: voucher.voucherDate,
              voucherWord: voucher.voucherWord,
              voucherNumber: voucher.voucherNumber,
              summary: entry.summary ?? voucher.summary,
              debitAmount: entry.debitAmount,
              creditAmount: entry.creditAmount,
              direction: entry.direction,
              balance: 0, // Will be computed by a separate balance-calculation step
              bookType: 'journal',
            },
          });
        }

        return { success: true };
      });
    }),
});
