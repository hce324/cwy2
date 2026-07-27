import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, cashierProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const paymentRouter = router({
  list: protectedProcedure
    .input(z.object({
      group: z.enum(['pending', 'processing', 'completed']).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input.group) where.paymentStatus = input.group;
      const [items, total] = await Promise.all([
        ctx.db.paymentTask.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.paymentTask.count({ where }),
      ]);
      return { items, total };
    }),

  execute: cashierProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.paymentTask.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!task) throw new TRPCError({ code: 'NOT_FOUND' });
      if (task.paymentStatus !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能执行待付款任务' });
      }

      return ctx.db.$transaction(async (tx) => {
        // Update payment status
        const updated = await tx.paymentTask.update({
          where: { id: input.id },
          data: { paymentStatus: 'completed' },
        });

        // Debit bank account
        if (task.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: task.bankAccountId },
            data: { balance: { decrement: task.amount } },
          });
        }

        // Record fund transaction
        await tx.fundTransaction.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            bankAccountId: task.bankAccountId!,
            transactionDate: new Date(),
            type: 'outflow',
            amount: task.amount,
            counterparty: task.payee,
            summary: `付款执行: ${task.payee}`,
          },
        });

        // Audit
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'EXECUTE',
            entityType: 'payment_task',
            entityId: BigInt(input.id),
            newValueJson: { paymentStatus: 'completed', payee: task.payee, amount: task.amount.toString() },
          },
        });

        return updated;
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const base = tenantWhere(ctx.user.companyId);
    const [pending, processing, completed] = await Promise.all([
      ctx.db.paymentTask.count({ where: { ...base, paymentStatus: 'pending' } }),
      ctx.db.paymentTask.count({ where: { ...base, paymentStatus: 'processing' } }),
      ctx.db.paymentTask.count({ where: { ...base, paymentStatus: 'completed' } }),
    ]);
    return { pending, processing, completed };
  }),
});
