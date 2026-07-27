import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const createSchema = z.object({
  applicantId: z.number().optional(),
  departmentName: z.string().optional(),
  expenseType: z.enum(['差旅费', '办公费', '招待费', '交通费', '其他']),
  amount: z.number().positive('金额必须大于0'),
  expenseDate: z.string(),
  description: z.string().min(1, '描述不能为空'),
  attachmentCount: z.number().int().min(0).default(0),
  paymentStatus: z.string().optional(),
  voucherId: z.number().optional(),
});

const listSchema = z.object({
  approvalStatus: z.string().optional(),
  expenseType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ─── Router ───────────────────────────────────────────────────────

export const expenseRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const { approvalStatus, expenseType, dateFrom, dateTo, keyword, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (approvalStatus) where.approvalStatus = approvalStatus;
      if (expenseType) where.expenseType = expenseType;
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        where.expenseDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { description: { contains: keyword } },
          { departmentName: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.expenseReport.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { expenseDate: 'desc' },
        }),
        ctx.db.expenseReport.count({ where }),
      ]);
      return { items, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.expenseReport.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const report = await tx.expenseReport.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            applicantId: input.applicantId ? BigInt(input.applicantId) : null,
            departmentName: input.departmentName ?? null,
            expenseType: input.expenseType,
            amount: input.amount,
            expenseDate: new Date(input.expenseDate),
            description: input.description,
            attachmentCount: input.attachmentCount,
            paymentStatus: input.paymentStatus ?? null,
            voucherId: input.voucherId ? BigInt(input.voucherId) : null,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'CREATE',
            entityType: 'expense_report',
            entityId: report.id,
            newValueJson: {
              expenseType: input.expenseType,
              amount: input.amount,
              description: input.description,
            },
          },
        });

        return report;
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.expenseReport.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!report) throw new TRPCError({ code: 'NOT_FOUND' });
      if (report.approvalStatus !== '待审批') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能审批待审批状态的报销单' });
      }
      return ctx.db.expenseReport.update({
        where: { id: input.id },
        data: { approvalStatus: '已审批' },
      });
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.expenseReport.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!report) throw new TRPCError({ code: 'NOT_FOUND' });
      if (report.approvalStatus !== '待审批') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能驳回待审批状态的报销单' });
      }
      return ctx.db.expenseReport.update({
        where: { id: input.id },
        data: {
          approvalStatus: '已驳回',
          description: `${report.description}\n驳回原因：${input.reason}`,
        },
      });
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.expenseReport.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!report) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.db.expenseReport.update({
        where: { id: input.id },
        data: { paymentStatus: '已支付' },
      });
    }),
});
