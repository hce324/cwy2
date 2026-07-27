import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const profitRouter = router({
  snapshot: protectedProcedure
    .input(
      z.object({
        fiscalPeriodId: z.number().default(1),
        months: z.number().min(1).max(24).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.monthlyFinancialSnapshot.findMany({
        where: tenantWhere(ctx.user.companyId),
        include: { fiscalPeriod: true },
        orderBy: [
          { fiscalPeriod: { year: 'desc' } },
          { fiscalPeriod: { month: 'desc' } },
        ],
        take: input.months,
      });
    }),

  details: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.profitDetail.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: input.fiscalPeriodId,
        },
        orderBy: { sortOrder: 'asc' },
      });
    }),
});
