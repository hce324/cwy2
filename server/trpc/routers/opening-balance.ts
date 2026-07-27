import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const openingBalanceRouter = router({
  listByPeriod: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      const where = tenantWhere(ctx.user.companyId, {
        fiscalPeriodId: BigInt(input.fiscalPeriodId),
      });

      const balances = await ctx.db.openingBalance.findMany({
        where,
        include: {
          subject: {
            select: { code: true, name: true, category: true, direction: true },
          },
        },
        orderBy: { subject: { code: 'asc' } },
      });

      return balances.map((b) => ({
        id: Number(b.id),
        subjectId: Number(b.subjectId),
        subjectCode: b.subject.code,
        subjectName: b.subject.name,
        subjectCategory: b.subject.category,
        amount: Number(b.amount),
        direction: b.direction,
      }));
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        fiscalPeriodId: z.number(),
        subjectId: z.number(),
        amount: z.number(),
        direction: z.enum(['借', '贷']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.openingBalance.findFirst({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
          subjectId: BigInt(input.subjectId),
        },
      });

      if (existing) {
        return ctx.db.openingBalance.update({
          where: { id: existing.id },
          data: { amount: input.amount, direction: input.direction },
        });
      }

      return ctx.db.openingBalance.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
          subjectId: BigInt(input.subjectId),
          amount: input.amount,
          direction: input.direction,
        },
      });
    }),
});
