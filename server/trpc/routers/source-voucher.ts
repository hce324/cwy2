import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';
import { uploadFile } from '@/server/lib/oss';
import { recognizeInvoice } from '@/server/lib/invoice-ocr';

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

// 采集录入即原始凭证电子版：支持原图上传(fileData)、结构化录入(rawDataJson)、类目/来源等。
const createSchema = z.object({
  voucherNo: z.string().min(1).optional(), // 原始凭证号，缺省自动生成
  itemDescription: z.string().min(1, '事项描述不能为空'),
  businessDate: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().default('CNY'),
  category: z.string().max(50).optional(),
  source: z.string().default('smart'), // smart=智能采集 manual=手工
  fileData: z.string().optional(), // 原图 base64 data URL，服务端上传 OSS / 本地
  rawDataJson: z.any().optional(), // 录入结构化字段
  recognitionStatus: z.string().default('recognized'),
  settlementEntityId: z.number().optional(),
  businessEntity: z.string().optional(),
  counterparty: z.string().optional(),
  handlerName: z.string().optional(),
  handlerDepartment: z.string().optional(),
  riskStatus: z.string().default('待确认'),
  status: z.string().default('待制证'),
});

const revertSchema = z.object({ id: z.number() });

// AI 发票识别后人工核对：可修正字段并确认识别结果
const updateSchema = z.object({
  id: z.number(),
  voucherNo: z.string().optional(),
  itemDescription: z.string().optional(),
  businessDate: z.string().optional(),
  amount: z.number().optional(),
  counterparty: z.string().optional(),
  recognitionStatus: z.string().optional(),
  rawDataJson: z.any().optional(),
  category: z.string().optional(),
});

// AI 发票识别：按 id 调 OCR 抽取字段回填
const recognizeSchema = z.object({ id: z.number() });

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

  // 智能采集唯一录入入口：创建原始凭证（电子版）
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      // 原图上传：fileData(base64) → OSS / 本地，得到可访问 URL
      let fileUrl: string | null = null;
      if (input.fileData) {
        fileUrl = await uploadFile(input.fileData);
      }

      const voucherNo = input.voucherNo || `YS${Date.now()}`;

      return ctx.db.$transaction(async (tx) => {
        const voucher = await tx.sourceVoucher.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            settlementEntityId: input.settlementEntityId ? BigInt(input.settlementEntityId) : null,
            voucherNo,
            itemDescription: input.itemDescription,
            businessDate: input.businessDate ? new Date(input.businessDate) : new Date(),
            amount: input.amount ?? 0,
            currency: input.currency ?? 'CNY',
            category: input.category ?? null,
            source: input.source ?? 'smart',
            fileUrl,
            rawDataJson: input.rawDataJson,
            recognitionStatus: input.recognitionStatus ?? 'recognized',
            riskStatus: input.riskStatus,
            businessEntity: input.businessEntity,
            counterparty: input.counterparty,
            handlerName: input.handlerName,
            handlerDepartment: input.handlerDepartment,
            status: input.status,
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
            newValueJson: { voucherNo, itemDescription: input.itemDescription },
          },
        });

        return voucher;
      });
    }),

  // 编辑已录入的原始凭证（用于 AI 识别后人工核对：修正字段 / 确认识别结果）
  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

      const data: any = {};
      if (input.voucherNo !== undefined) data.voucherNo = input.voucherNo;
      if (input.itemDescription !== undefined) data.itemDescription = input.itemDescription;
      if (input.businessDate !== undefined) data.businessDate = new Date(input.businessDate);
      if (input.amount !== undefined) data.amount = input.amount;
      if (input.counterparty !== undefined) data.counterparty = input.counterparty;
      if (input.recognitionStatus !== undefined) data.recognitionStatus = input.recognitionStatus;
      if (input.rawDataJson !== undefined) data.rawDataJson = input.rawDataJson;
      if (input.category !== undefined) data.category = input.category;

      const updated = await ctx.db.sourceVoucher.update({ where: { id: input.id }, data });

      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'UPDATE',
          entityType: 'source_voucher',
          entityId: BigInt(input.id),
          newValueJson: { ...data },
        },
      });

      return updated;
    }),

  // AI 发票识别：调用阿里云增值税发票 OCR 抽取字段，回填 sourceVoucher，置「待核对」待人工确认。
  recognize: protectedProcedure
    .input(recognizeSchema)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });

      const recognized = await recognizeInvoice(voucher.fileUrl);

      const data: any = { recognitionStatus: '待核对', rawDataJson: recognized.raw };
      if (recognized.invoiceNo) data.voucherNo = recognized.invoiceNo;
      if (recognized.amount != null) data.amount = recognized.amount;
      if (recognized.invoiceDate) data.businessDate = new Date(recognized.invoiceDate);
      if (recognized.itemName) data.itemDescription = recognized.itemName;
      if (recognized.sellerName) data.counterparty = recognized.sellerName;

      const updated = await ctx.db.sourceVoucher.update({ where: { id: input.id }, data });

      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'RECOGNIZE',
          entityType: 'source_voucher',
          entityId: BigInt(input.id),
          newValueJson: { recognitionStatus: '待核对', fields: recognized.raw as any },
        },
      });

      return { recognized, voucher: updated };
    }),

  // 校验为软关卡：记录核对结果，全部通过则标记资料完整；不阻塞后续制证。
  verify: protectedProcedure
    .input(verifyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });

      const allPassed = input.results.every((r) => r.isPassed);

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.sourceVoucher.update({
          where: { id: input.id },
          data: { riskStatus: allPassed ? '资料完整' : '待确认' },
        });

        await tx.voucherVerificationResult.createMany({
          data: input.results.map((r) => ({
            voucherId: BigInt(input.id),
            checkItem: r.checkItem,
            isPassed: r.isPassed,
          })),
        });

        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'VERIFY',
            entityType: 'source_voucher',
            entityId: BigInt(input.id),
            newValueJson: { riskStatus: updated.riskStatus, results: input.results },
          },
        });

        return updated;
      });
    }),

  // 退回：将已制证的原始凭证拆回待制证（清空关联记账凭证 id）
  revert: protectedProcedure
    .input(revertSchema)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!voucher.voucherId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '该原始凭证尚未制证，无需退回' });
      }

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.sourceVoucher.update({
          where: { id: input.id },
          data: { voucherId: null, status: '待制证' },
        });

        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'REVERT',
            entityType: 'source_voucher',
            entityId: BigInt(input.id),
            newValueJson: { status: '待制证' },
          },
        });

        return updated;
      });
    }),
});
