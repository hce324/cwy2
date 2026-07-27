import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const subjectRouter = router({
  tree: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all subjects and build tree in-memory (avoids recursive DB queries)
    const all = await ctx.db.accountingSubject.findMany({
      where: tenantWhere(ctx.user.companyId, { status: '启用' }),
      orderBy: { code: 'asc' },
    });

    const map = new Map<bigint, any>();
    const roots: any[] = [];

    for (const s of all) {
      map.set(s.id, { ...s, children: [] });
    }
    for (const s of all) {
      const node = map.get(s.id)!;
      if (s.parentId && map.has(s.parentId)) {
        map.get(s.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }),

  list: protectedProcedure
    .input(z.object({ category: z.string().optional(), keyword: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.category && input.category !== '全部') where.category = input.category;
      if (input?.keyword) {
        where.OR = [
          { code: { contains: input.keyword } },
          { name: { contains: input.keyword } },
        ];
      }
      return ctx.db.accountingSubject.findMany({
        where,
        orderBy: { code: 'asc' },
      });
    }),

  byCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.accountingSubject.findFirst({
        where: tenantWhere(ctx.user.companyId, { code: input.code }),
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const [total, active, usedCount, disabledCount] = await Promise.all([
      ctx.db.accountingSubject.count({ where: tenantWhere(ctx.user.companyId) }),
      ctx.db.accountingSubject.count({
        where: tenantWhere(ctx.user.companyId, { status: '启用' }),
      }),
      // Count subjects referenced in voucher entries
      ctx.db.voucherEntry.groupBy({
        by: ['subjectId'],
        where: {
          voucher: {
            companyId: BigInt(ctx.user.companyId),
          },
        },
      }).then(r => r.length),

      ctx.db.accountingSubject.count({
        where: tenantWhere(ctx.user.companyId, { status: '停用' }),
      }),
    ]);
    return { total, active, usedCount: Number(usedCount), disabledCount };
  }),
});
