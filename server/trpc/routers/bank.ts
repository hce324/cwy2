import { z } from 'zod';
import { protectedProcedure, cashierProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const bankRouter = router({
  listAccounts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.bankAccount.findMany({
      where: tenantWhere(ctx.user.companyId),
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.bankAccount.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  transactions: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where = { ...tenantWhere(ctx.user.companyId), bankAccountId: input.accountId };
      const [items, total] = await Promise.all([
        ctx.db.fundTransaction.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { transactionDate: 'desc' },
        }),
        ctx.db.fundTransaction.count({ where }),
      ]);
      return { items, total };
    }),

  createAccount: cashierProcedure
    .input(z.object({
      accountName: z.string().min(1),
      accountNo: z.string().min(1),
      bankName: z.string().min(1),
      accountType: z.string(),
      balance: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bankAccount.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          accountName: input.accountName,
          accountNo: input.accountNo,
          bankName: input.bankName,
          accountType: input.accountType,
          balance: input.balance,
        },
      });
    }),
});
