import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const bankItemSchema = z.object({
  entryDate: z.string(),
  summary: z.string().optional(),
  bankAmount: z.number().default(0),
  bookAmount: z.number().default(0),
  type: z.string(),
});

const importBankStatementSchema = z.object({
  bankAccountId: z.number(),
  fiscalPeriodId: z.number(),
  statementNo: z.string().optional(),
  totalEntries: z.number().default(0),
  totalDebit: z.number().default(0),
  totalCredit: z.number().default(0),
  items: z.array(bankItemSchema).min(1, '至少需要1条对账记录'),
});

// ─── Router ───────────────────────────────────────────────────────

export const reconciliationRouter = router({
  // ── Bank Recon (hz-bankrecon) ──────────────────────────────────

  bankStatements: protectedProcedure.query(async ({ ctx }) => {
    const where: any = tenantWhere(ctx.user.companyId);
    const items = await ctx.db.bankStatement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { bankAccount: true, fiscalPeriod: true },
    });
    return items;
  }),

  bankStatementById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.bankStatement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
        include: {
          bankAccount: true,
          fiscalPeriod: true,
          items: { orderBy: { entryDate: 'desc' } },
        },
      });
    }),

  bankReconItems: protectedProcedure
    .input(
      z.object({
        statementId: z.number(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify statement belongs to company
      const statement = await ctx.db.bankStatement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.statementId },
      });
      if (!statement) throw new TRPCError({ code: 'NOT_FOUND', message: '银行对账单不存在' });

      const where: any = { statementId: input.statementId };
      const [items, total] = await Promise.all([
        ctx.db.bankReconciliationItem.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { entryDate: 'desc' },
        }),
        ctx.db.bankReconciliationItem.count({ where }),
      ]);
      return { items, total };
    }),

  importBankStatement: protectedProcedure
    .input(importBankStatementSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify bank account belongs to company
      const account = await ctx.db.bankAccount.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.bankAccountId },
      });
      if (!account) throw new TRPCError({ code: 'NOT_FOUND', message: '银行账户不存在' });

      return ctx.db.$transaction(async (tx) => {
        const statement = await tx.bankStatement.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            bankAccountId: BigInt(input.bankAccountId),
            fiscalPeriodId: BigInt(input.fiscalPeriodId),
            statementNo: input.statementNo ?? null,
            totalEntries: input.totalEntries,
            totalDebit: input.totalDebit,
            totalCredit: input.totalCredit,
            importStatus: 'imported',
          },
        });

        await tx.bankReconciliationItem.createMany({
          data: input.items.map((item) => ({
            statementId: statement.id,
            bankAccountId: BigInt(input.bankAccountId),
            entryDate: new Date(item.entryDate),
            summary: item.summary ?? null,
            bankAmount: item.bankAmount,
            bookAmount: item.bookAmount,
            diffAmount: item.bankAmount - item.bookAmount,
            type: item.type,
            status: 'pending',
          })),
        });

        return statement;
      });
    }),

  matchBankItem: protectedProcedure
    .input(z.object({ itemId: z.number(), voucherId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.bankReconciliationItem.findUnique({
        where: { id: input.itemId },
        include: { statement: true },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: '对账记录不存在' });

      // Tenant isolation: verify parent statement belongs to company
      const statement = await ctx.db.bankStatement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: item.statementId },
      });
      if (!statement) throw new TRPCError({ code: 'NOT_FOUND', message: '银行对账单不存在' });

      // Verify voucher belongs to company
      const voucher = await ctx.db.accountingVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.voucherId },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND', message: '凭证不存在' });

      return ctx.db.bankReconciliationItem.update({
        where: { id: input.itemId },
        data: {
          voucherId: BigInt(input.voucherId),
          isMatched: true,
          matchedAt: new Date(),
          status: 'matched',
        },
      });
    }),

  unmatchBankItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.bankReconciliationItem.findUnique({
        where: { id: input.itemId },
        include: { statement: true },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: '对账记录不存在' });

      // Tenant isolation
      const statement = await ctx.db.bankStatement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: item.statementId },
      });
      if (!statement) throw new TRPCError({ code: 'NOT_FOUND', message: '银行对账单不存在' });

      return ctx.db.bankReconciliationItem.update({
        where: { id: input.itemId },
        data: {
          voucherId: null,
          isMatched: false,
          matchedAt: null,
          status: 'pending',
        },
      });
    }),

  bankReconBalance: protectedProcedure
    .input(z.object({ bankAccountId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify bank account belongs to company
      const account = await ctx.db.bankAccount.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.bankAccountId },
      });
      if (!account) throw new TRPCError({ code: 'NOT_FOUND', message: '银行账户不存在' });

      // Aggregate reconciliation data for the balance sheet
      const [statements, items] = await Promise.all([
        ctx.db.bankStatement.findMany({
          where: {
            ...tenantWhere(ctx.user.companyId),
            bankAccountId: input.bankAccountId,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        ctx.db.bankReconciliationItem.findMany({
          where: { bankAccountId: input.bankAccountId },
          orderBy: { entryDate: 'desc' },
          take: 500,
        }),
      ]);

      const matchedCount = items.filter((i) => i.isMatched).length;
      const unmatchedCount = items.filter((i) => !i.isMatched).length;
      const totalDiff =
        items.reduce((sum, i) => sum + Number(i.diffAmount), 0);

      return {
        account,
        statements,
        items,
        summary: {
          statementCount: statements.length,
          itemCount: items.length,
          matchedCount,
          unmatchedCount,
          matchRate: items.length > 0 ? matchedCount / items.length : 0,
          totalDiff,
        },
      };
    }),

  // ── Platform Recon (hz-reconcile) ───────────────────────────────

  platformBatches: protectedProcedure.query(async ({ ctx }) => {
    const where: any = tenantWhere(ctx.user.companyId);
    return ctx.db.platformSettlement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { settlementEntity: true, fiscalPeriod: true },
    });
  }),

  platformBatchById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.platformSettlement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
        include: {
          settlementEntity: true,
          fiscalPeriod: true,
          items: { orderBy: { createdAt: 'desc' } },
        },
      });
    }),

  platformDiffs: protectedProcedure
    .input(
      z.object({
        batchId: z.number(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify batch belongs to company
      const batch = await ctx.db.platformSettlement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.batchId },
      });
      if (!batch) throw new TRPCError({ code: 'NOT_FOUND', message: '平台结算批次不存在' });

      // Only items with differences
      const where: any = {
        settlementId: input.batchId,
        diffAmount: { not: 0 },
      };
      const [items, total] = await Promise.all([
        ctx.db.platformReconciliationItem.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { diffAmount: 'desc' },
        }),
        ctx.db.platformReconciliationItem.count({ where }),
      ]);
      return { items, total };
    }),

  resolvePlatformDiff: protectedProcedure
    .input(z.object({ itemId: z.number(), resolution: z.string().min(1, '处理方案不能为空') }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.platformReconciliationItem.findUnique({
        where: { id: input.itemId },
        include: { settlement: true },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: '平台对账记录不存在' });

      // Tenant isolation: verify parent settlement belongs to company
      const settlement = await ctx.db.platformSettlement.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: item.settlementId },
      });
      if (!settlement) throw new TRPCError({ code: 'NOT_FOUND', message: '平台结算批次不存在' });

      return ctx.db.platformReconciliationItem.update({
        where: { id: input.itemId },
        data: {
          resolution: input.resolution,
          status: 'resolved',
        },
      });
    }),
});
