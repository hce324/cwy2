import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const listSchema = z.object({
  status: z.string().optional(),
  riskStatus: z.string().optional(),
  keyword: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const createSchema = z.object({
  settlementEntityId: z.number().optional(),
  voucherNo: z.string().min(1, '编号不能为空'),
  itemDescription: z.string().min(1, '事项描述不能为空'),
  businessDate: z.string(),
  amount: z.number().positive('金额必须大于0'),
  includedDocuments: z.string().optional(),
  riskStatus: z.string().default('待确认'),
  businessEntity: z.string().optional(),
  counterparty: z.string().optional(),
  handlerName: z.string().optional(),
  handlerDepartment: z.string().optional(),
});

const verifyInputSchema = z.object({
  id: z.number(),
  results: z.array(z.object({
    checkItem: z.string().min(1, '校验项不能为空'),
    isPassed: z.boolean().default(true),
  })).min(1, '至少需要1条校验结果'),
});

// ─── Router ───────────────────────────────────────────────────────

export const sourceVoucherRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const { status, riskStatus, keyword, dateFrom, dateTo, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (status) where.status = status;
      if (riskStatus) where.riskStatus = riskStatus;
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        where.businessDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { voucherNo: { contains: keyword } },
          { itemDescription: { contains: keyword } },
          { businessEntity: { contains: keyword } },
          { counterparty: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.sourceVoucher.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { businessDate: 'desc' },
          include: {
            settlementEntity: true,
            businessFacts: true,
            verificationResults: true,
          },
        }),
        ctx.db.sourceVoucher.count({ where }),
      ]);
      return { items, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
        include: {
          settlementEntity: true,
          businessFacts: true,
          verificationResults: true,
        },
      });
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const voucher = await tx.sourceVoucher.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            settlementEntityId: input.settlementEntityId ? BigInt(input.settlementEntityId) : null,
            voucherNo: input.voucherNo,
            itemDescription: input.itemDescription,
            businessDate: new Date(input.businessDate),
            amount: input.amount,
            includedDocuments: input.includedDocuments,
            riskStatus: input.riskStatus,
            businessEntity: input.businessEntity,
            counterparty: input.counterparty,
            handlerName: input.handlerName,
            handlerDepartment: input.handlerDepartment,
            status: '待处理',
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'CREATE',
            entityType: 'source_voucher',
            entityId: voucher.id,
            newValueJson: { voucherNo: input.voucherNo, itemDescription: input.itemDescription },
          },
        });

        return voucher;
      });
    }),

  verify: protectedProcedure
    .input(verifyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });
      if (voucher.status !== '待处理' && voucher.status !== '待校验') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能校验待处理或待校验状态的原单' });
      }

      return ctx.db.$transaction(async (tx) => {
        // Update status to '已校验'
        const updated = await tx.sourceVoucher.update({
          where: { id: input.id },
          data: { status: '已校验' },
        });

        // Create verification results
        await tx.voucherVerificationResult.createMany({
          data: input.results.map((r) => ({
            voucherId: BigInt(input.id),
            checkItem: r.checkItem,
            isPassed: r.isPassed,
          })),
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'VERIFY',
            entityType: 'source_voucher',
            entityId: BigInt(input.id),
            newValueJson: { status: '已校验', results: input.results },
          },
        });

        return updated;
      });
    }),

  postToVoucher: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });
      if (voucher.status !== '已校验') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只有已校验状态的原单才能入账' });
      }

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.sourceVoucher.update({
          where: { id: input.id },
          data: { status: '已入账' },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'POST',
            entityType: 'source_voucher',
            entityId: BigInt(input.id),
            newValueJson: { status: '已入账' },
          },
        });

        return updated;
      });
    }),
});
