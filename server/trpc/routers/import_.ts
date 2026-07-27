import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const templateCreateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空'),
  usageDescription: z.string().optional(),
  frequency: z.string().min(1, '使用频率不能为空'),
  fileUrl: z.string().optional(),
});

const recordListSchema = z.object({
  templateId: z.number().optional(),
  status: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const recordCreateSchema = z.object({
  templateId: z.number().optional(),
  fileName: z.string().min(1, '文件名不能为空'),
  uploaderName: z.string().min(1, '上传人不能为空'),
  uploaderId: z.number().optional(),
  recordCount: z.number().default(0),
});

const updateRecordStatusSchema = z.object({
  id: z.number(),
  status: z.string(),
  errorDetail: z.any().optional(),
});

// ─── Router ───────────────────────────────────────────────────────

export const importRouter = router({
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.importTemplate.findMany({
      where: tenantWhere(ctx.user.companyId),
      orderBy: { createdAt: 'desc' },
    });
  }),

  templateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.importTemplate.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  createTemplate: protectedProcedure
    .input(templateCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.importTemplate.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          name: input.name,
          usageDescription: input.usageDescription,
          frequency: input.frequency,
          fileUrl: input.fileUrl,
        },
      });
    }),

  listRecords: protectedProcedure
    .input(recordListSchema)
    .query(async ({ ctx, input }) => {
      const { templateId, status, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (templateId) where.templateId = templateId;
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        ctx.db.importRecord.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.importRecord.count({ where }),
      ]);
      return { items, total };
    }),

  recordById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // template relation not defined in schema — use templateId to look up separately if needed
      return ctx.db.importRecord.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  createRecord: protectedProcedure
    .input(recordCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.importRecord.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          templateId: input.templateId ? BigInt(input.templateId) : null,
          fileName: input.fileName,
          uploaderName: input.uploaderName,
          uploaderId: input.uploaderId ? BigInt(input.uploaderId) : null,
          recordCount: input.recordCount,
          status: '待处理',
        },
      });
    }),

  updateRecordStatus: protectedProcedure
    .input(updateRecordStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.importRecord.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!record) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.db.importRecord.update({
        where: { id: input.id },
        data: {
          status: input.status,
          errorCount: input.errorDetail ? (record.errorCount + 1) : record.errorCount,
          errorDetails: input.errorDetail ?? undefined,
        },
      });
    }),
});
