import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const receivableRouter = router({
  list: protectedProcedure
    .input(z.object({
      riskLevel: z.enum(['high', 'mid', 'low']).optional(),
      collectorName: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.riskLevel) where.riskLevel = input.riskLevel;
      if (input?.collectorName) where.collectorName = input.collectorName;
      const [items, total] = await Promise.all([
        ctx.db.customerReceivable.findMany({
          where, skip: input?.offset ?? 0, take: input?.limit ?? 20,
          orderBy: { overdueDays: 'desc' },
        }),
        ctx.db.customerReceivable.count({ where }),
      ]);
      return { items, total };
    }),

  aging: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.receivableAgingSnapshot.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
      });
    }),

  collectors: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collectorKpi.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
      });
    }),

  addCollection: protectedProcedure
    .input(z.object({
      receivableId: z.number(),
      actionResult: z.string(),
      notes: z.string().optional(),
      promiseDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collectionRecord.create({
        data: {
          receivableId: BigInt(input.receivableId),
          collectorId: BigInt(ctx.user.id),
          actionResult: input.actionResult,
          notes: input.notes,
          promiseDate: input.promiseDate ? new Date(input.promiseDate) : null,
        },
      });
    }),
});
