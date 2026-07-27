import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const periodRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return ctx.db.fiscalPeriod.findFirst({
      where: tenantWhere(ctx.user.companyId, { year, month }),
    });
  }),

  list: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.fiscalPeriod.findMany({
        where: tenantWhere(ctx.user.companyId, input?.year ? { year: input.year } : {}),
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 24,
      });
    }),

  close: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.fiscalPeriod.update({
        where: { id: input.id },
        data: { isClosed: true, closedAt: new Date(), closedBy: BigInt(ctx.user.id) },
      });
    }),
});
