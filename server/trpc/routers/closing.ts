import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const closingRouter = router({
  tasks: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.closingTask.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: input.fiscalPeriodId,
          roleTarget: ctx.user.role,
        },
        orderBy: { sortOrder: 'asc' },
      });
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.closingTask.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!task) throw new Error('任务不存在');
      return ctx.db.closingTask.update({
        where: { id: input.id },
        data: {
          isCompleted: !task.isCompleted,
          completedAt: task.isCompleted ? null : new Date(),
          completedBy: task.isCompleted ? null : BigInt(ctx.user.id),
        },
      });
    }),

  progress: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      const base = { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId, roleTarget: ctx.user.role };
      const [total, completed] = await Promise.all([
        ctx.db.closingTask.count({ where: base }),
        ctx.db.closingTask.count({ where: { ...base, isCompleted: true } }),
      ]);
      return { total, completed, progress: total > 0 ? (completed / total) * 100 : 0 };
    }),

  periodEnd: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [steps, transfers] = await Promise.all([
        ctx.db.periodEndStep.findMany({
          where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
          orderBy: { sortOrder: 'asc' },
        }),
        ctx.db.periodEndTransfer.findMany({
          where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
        }),
      ]);
      return { steps, transfers };
    }),
});
