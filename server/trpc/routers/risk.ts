import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const riskRouter = router({
  list: protectedProcedure
    .input(z.object({
      riskLevel: z.enum(['high', 'mid', 'low', 'all']).default('all'),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input.riskLevel !== 'all') where.riskLevel = input.riskLevel;
      const [items, total] = await Promise.all([
        ctx.db.riskException.findMany({
          where, skip: input.offset, take: input.limit,
          orderBy: { detectedAt: 'desc' },
        }),
        ctx.db.riskException.count({ where }),
      ]);
      return { items, total };
    }),

  counts: protectedProcedure.query(async ({ ctx }) => {
    const base = tenantWhere(ctx.user.companyId);
    const [all, high, mid, low] = await Promise.all([
      ctx.db.riskException.count({ where: base }),
      ctx.db.riskException.count({ where: { ...base, riskLevel: 'high' } }),
      ctx.db.riskException.count({ where: { ...base, riskLevel: 'mid' } }),
      ctx.db.riskException.count({ where: { ...base, riskLevel: 'low' } }),
    ]);
    return { all, high, mid, low };
  }),

  indicators: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.riskIndicator.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
      });
    }),

  resolve: protectedProcedure
    .input(z.object({ id: z.number(), resolution: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.riskException.update({
        where: { id: input.id },
        data: { status: 'resolved', resolution: input.resolution, resolvedAt: new Date(), resolvedBy: BigInt(ctx.user.id) },
      });
    }),
});
