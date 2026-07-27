import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const auditRouter = router({
  list: protectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      action: z.string().optional(),
      userId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.entityType) where.entityType = input.entityType;
      if (input?.action) where.action = input.action;
      if (input?.userId) where.userId = input.userId;
      const [items, total] = await Promise.all([
        ctx.db.auditLog.findMany({
          where, skip: input?.offset ?? 0, take: input?.limit ?? 50,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.auditLog.count({ where }),
      ]);
      return { items, total };
    }),

  checks: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.accountingCheck.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
        orderBy: { checkedAt: 'desc' },
      });
    }),
});
