import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  category: z.enum(['发票', '合同', '银行回单', '其他']),
  amount: z.number().positive('金额必须大于0'),
  settlementEntityId: z.number().optional(),
  subDescription: z.string().max(512).optional(),
  source: z.string().max(255).optional(),
  currency: z.string().default('CNY'),
  documentDate: z.string().optional(),
  recognitionStatus: z.enum(['pending', 'recognized', 'linked', 'archived']).optional(),
  isAbnormal: z.boolean().optional(),
  rawDataJson: z.any().optional(),
});

const updateSchema = createSchema.partial().extend({
  id: z.number(),
});

const listSchema = z.object({
  recognitionStatus: z.string().optional(),
  category: z.string().optional(),
  keyword: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ─── Router ───────────────────────────────────────────────────────

export const documentsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const { recognitionStatus, category, keyword, dateFrom, dateTo, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (recognitionStatus) where.recognitionStatus = recognitionStatus;
      if (category) where.category = category;
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        where.documentDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
          { subDescription: { contains: keyword } },
          { source: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.collectedDocument.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { documentDate: 'desc' },
        }),
        ctx.db.collectedDocument.count({ where }),
      ]);
      return { items, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collectedDocument.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const document = await tx.collectedDocument.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            settlementEntityId: input.settlementEntityId ? BigInt(input.settlementEntityId) : null,
            name: input.name,
            subDescription: input.subDescription,
            category: input.category,
            source: input.source ?? '',
            amount: input.amount,
            currency: input.currency ?? 'CNY',
            documentDate: input.documentDate ? new Date(input.documentDate) : null,
            recognitionStatus: input.recognitionStatus ?? 'pending',
            isAbnormal: input.isAbnormal ?? false,
            rawDataJson: input.rawDataJson,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'CREATE',
            entityType: 'collected_document',
            entityId: document.id,
            newValueJson: { name: input.name, category: input.category, amount: input.amount },
          },
        });

        return document;
      });
    }),

  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.collectedDocument.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: '单据不存在' });

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.subDescription !== undefined) updateData.subDescription = data.subDescription;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.documentDate !== undefined) {
        updateData.documentDate = data.documentDate ? new Date(data.documentDate) : null;
      }
      if (data.recognitionStatus !== undefined) updateData.recognitionStatus = data.recognitionStatus;
      if (data.isAbnormal !== undefined) updateData.isAbnormal = data.isAbnormal;
      if (data.rawDataJson !== undefined) updateData.rawDataJson = data.rawDataJson;
      if (data.settlementEntityId !== undefined) {
        updateData.settlementEntityId = data.settlementEntityId ? BigInt(data.settlementEntityId) : null;
      }

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.collectedDocument.update({
          where: { id },
          data: updateData,
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'UPDATE',
            entityType: 'collected_document',
            entityId: id,
            oldValueJson: { name: existing.name, category: existing.category },
            newValueJson: { name: updated.name, category: updated.category },
          },
        });

        return updated;
      });
    }),

  recognize: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.collectedDocument.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: '单据不存在' });
      if (document.recognitionStatus === 'recognized') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '单据已识别' });
      }

      return ctx.db.collectedDocument.update({
        where: { id: input.id },
        data: {
          recognitionStatus: 'recognized',
          isRead: true,
        },
      });
    }),

  associate: protectedProcedure
    .input(z.object({ id: z.number(), sourceVoucherId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.collectedDocument.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: '单据不存在' });

      const sourceVoucher = await ctx.db.sourceVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.sourceVoucherId },
      });
      if (!sourceVoucher) throw new TRPCError({ code: 'NOT_FOUND', message: '来源凭证不存在' });

      return ctx.db.$transaction(async (tx) => {
        // Store sourceVoucherId in rawDataJson on the collected document
        const updated = await tx.collectedDocument.update({
          where: { id: input.id },
          data: {
            recognitionStatus: 'linked',
            rawDataJson: {
              ...((document.rawDataJson as any) ?? {}),
              sourceVoucherId: input.sourceVoucherId,
            },
          },
        });

        // Append document name to source voucher's includedDocuments
        const existingDocs = sourceVoucher.includedDocuments
          ? sourceVoucher.includedDocuments.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        if (!existingDocs.includes(document.name)) {
          existingDocs.push(document.name);
        }
        await tx.sourceVoucher.update({
          where: { id: input.sourceVoucherId },
          data: { includedDocuments: existingDocs.join(',') },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'ASSOCIATE',
            entityType: 'collected_document',
            entityId: input.id,
            newValueJson: { sourceVoucherId: input.sourceVoucherId, recognitionStatus: 'linked' },
          },
        });

        return updated;
      });
    }),
});
