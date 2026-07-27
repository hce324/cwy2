import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const payableRouter = router({
  listApplications: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.status) where.status = input.status;
      const [items, total] = await Promise.all([
        ctx.db.paymentApplication.findMany({
          where, skip: input?.offset ?? 0, take: input?.limit ?? 20,
          orderBy: { applicationDate: 'desc' },
          include: { supplier: true },
        }),
        ctx.db.paymentApplication.count({ where }),
      ]);
      return { items, total };
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.paymentApplication.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!app) throw new TRPCError({ code: 'NOT_FOUND' });
      if (app.status !== '待处理' && app.status !== '审核中') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能审批待处理或审核中的申请' });
      }
      return ctx.db.paymentApplication.update({
        where: { id: input.id },
        data: { status: '已批准', reviewerId: BigInt(ctx.user.id), approvedAt: new Date() },
      });
    }),

  suppliers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.supplier.findMany({
      where: tenantWhere(ctx.user.companyId),
      include: { payables: true },
    });
  }),
});
