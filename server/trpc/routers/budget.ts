import { z } from 'zod';
import { protectedProcedure, directorProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const budgetRouter = router({
  // ── existing (upgraded to paginated) ──
  list: protectedProcedure
    .input(z.object({
      departmentName: z.string().optional(),
      fiscalPeriodId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.departmentName) where.departmentName = input.departmentName;
      if (input?.fiscalPeriodId) where.fiscalPeriodId = input.fiscalPeriodId;
      const [items, total] = await Promise.all([
        ctx.db.budgetExecution.findMany({
          where,
          skip: input?.offset ?? 0,
          take: input?.limit ?? 20,
          orderBy: { executionRate: 'desc' },
        }),
        ctx.db.budgetExecution.count({ where }),
      ]);
      return { items, total };
    }),

  departments: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.budget.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
      });
    }),

  // ── new ──

  create: directorProcedure
    .input(z.object({
      fiscalPeriodId: z.number(),
      departmentName: z.string(),
      budgetCategory: z.string(),
      budgetedAmount: z.number(),
      period: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.budget.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
          departmentName: input.departmentName,
          budgetCategory: input.budgetCategory,
          annualBudget: input.budgetedAmount,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'CREATE',
          entityType: 'Budget',
          entityId: result.id,
          newValueJson: {
            departmentName: input.departmentName,
            budgetCategory: input.budgetCategory,
            budgetedAmount: input.budgetedAmount,
            period: input.period,
          },
        },
      });
      return result;
    }),

  execution: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.budgetExecution.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
        include: { budget: true },
      });
      return items.map((e) => ({
        departmentName: e.departmentName,
        budgetCategory: e.budget.budgetCategory,
        budgetedAmount: Number(e.budget.annualBudget),
        actualAmount: Number(e.usedAmount),
        executionRate: Number(e.executionRate),
        variance: Math.round((Number(e.budget.annualBudget) - Number(e.usedAmount)) * 100) / 100,
      }));
    }),

  alerts: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.budgetExecution.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
        include: { budget: true },
      });
      return items
        .filter((e) => Number(e.usedAmount) > Number(e.budget.annualBudget))
        .map((e) => ({
          departmentName: e.departmentName,
          budgetCategory: e.budget.budgetCategory,
          budgetedAmount: Number(e.budget.annualBudget),
          actualAmount: Number(e.usedAmount),
          overspend: Math.round((Number(e.usedAmount) - Number(e.budget.annualBudget)) * 100) / 100,
        }));
    }),
});
