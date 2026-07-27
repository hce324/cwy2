import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const assetRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.fixedAsset.findMany({
      where: tenantWhere(ctx.user.companyId),
      include: { depreciationRecords: { take: 1, orderBy: { createdAt: 'desc' } } },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      assetName: z.string().min(1),
      category: z.string(),
      departmentName: z.string().optional(),
      originalValue: z.number(),
      usefulLifeYears: z.number().min(1),
      status: z.string().default('在用'),
    }))
    .mutation(async ({ ctx, input }) => {
      const monthlyDep = input.originalValue / (input.usefulLifeYears * 12);
      return ctx.db.fixedAsset.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          assetName: input.assetName,
          category: input.category,
          departmentName: input.departmentName,
          originalValue: input.originalValue,
          netValue: input.originalValue,
          usefulLifeYears: input.usefulLifeYears,
          monthlyDepreciation: monthlyDep,
          status: input.status,
        },
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const assets = await ctx.db.fixedAsset.findMany({
      where: tenantWhere(ctx.user.companyId),
    });
    const totalOrig = assets.reduce((s, a) => s + Number(a.originalValue), 0);
    const totalDep = assets.reduce((s, a) => s + Number(a.accumulatedDepreciation), 0);
    return {
      originalValue: totalOrig,
      accumulatedDepreciation: totalDep,
      netValue: totalOrig - totalDep,
      count: assets.length,
    };
  }),
});
