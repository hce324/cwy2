import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';
import { generateVoucherNo } from '@/server/utils/voucher-no';

// ─── Zod schemas ──────────────────────────────────────────────────

const entrySchema = z.object({
  subjectId: z.number(),
  summary: z.string().optional(),
  debitAmount: z.number().default(0),
  creditAmount: z.number().default(0),
});

const createSchema = z.object({
  voucherWord: z.enum(['收', '付', '转']),
  voucherDate: z.string(),
  summary: z.string().min(1, '摘要不能为空'),
  entries: z.array(entrySchema).min(2, '至少需要2条分录'),
});

const listSchema = z.object({
  auditStatus: z.enum(['pending', 'approved', 'posted', 'all']).optional(),
  category: z.string().optional(),
  year: z.string().optional(),
  month: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(500).default(20),
  offset: z.number().min(0).default(0),
});

// ─── Helpers ──────────────────────────────────────────────────────

// 按凭证日期的年-月匹配会计期间；找不到则回退到未关闭期间，再回退到最近期间，最后兜底 id=1。
// 同时消除原 voucher.create 中硬编码 fiscalPeriodId: 1n 的 TODO。
async function resolveFiscalPeriodId(db: any, date: Date, companyId: number): Promise<bigint> {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const matched = await db.fiscalPeriod.findFirst({
    where: { companyId: BigInt(companyId), year: y, month: m },
  });
  if (matched) return matched.id;
  const open = await db.fiscalPeriod.findFirst({
    where: { companyId: BigInt(companyId), isClosed: false },
    orderBy: { startDate: 'desc' },
  });
  if (open) return open.id;
  const latest = await db.fiscalPeriod.findFirst({
    where: { companyId: BigInt(companyId) },
    orderBy: { startDate: 'desc' },
  });
  return latest?.id ?? 1n;
}

// ─── Router ───────────────────────────────────────────────────────

export const voucherRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const { auditStatus, category, year, month, keyword, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (auditStatus && auditStatus !== 'all') where.auditStatus = auditStatus;
      if (category) where.category = category;
      if (year || month) {
        const dateFilter: any = {};
        if (year) dateFilter.gte = new Date(`${year}-${month ? month.padStart(2, '0') : '01'}-01`);
        if (year && month) {
          const lastDay = new Date(Number(year), Number(month), 0).getDate();
          dateFilter.lte = new Date(`${year}-${month.padStart(2, '0')}-${lastDay}`);
        }
        where.voucherDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { voucherNo: { contains: keyword } },
          { summary: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.accountingVoucher.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { voucherDate: 'desc' },
          include: { entries: { include: { subject: true } } },
        }),
        ctx.db.accountingVoucher.count({ where }),
      ]);
      return { items, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const voucher = await ctx.db.accountingVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
        include: {
          entries: {
            include: { subject: true },
            orderBy: { sortOrder: 'asc' },
          },
          signatures: true,
        },
      });
      if (!voucher) return null;

      // 来源原始凭证清单（审计追溯）：sourceVoucherIds 为 Json 数组（number[]）
      const rawIds = (voucher.sourceVoucherIds as number[] | null) ?? [];
      const sourceVouchers =
        rawIds.length > 0
          ? await ctx.db.sourceVoucher.findMany({
              where: {
                id: { in: rawIds.map((x) => BigInt(x)) },
                companyId: BigInt(ctx.user.companyId),
              },
              select: {
                id: true,
                voucherNo: true,
                itemDescription: true,
                amount: true,
                currency: true,
                businessDate: true,
                status: true,
                fileUrl: true,
              },
            })
          : [];

      return { ...voucher, sourceVouchers };
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate debit = credit
      const debitTotal = input.entries.reduce((s, e) => s + e.debitAmount, 0);
      const creditTotal = input.entries.reduce((s, e) => s + e.creditAmount, 0);
      if (Math.abs(debitTotal - creditTotal) > 0.001) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `借贷不平衡：借方 ${debitTotal} ≠ 贷方 ${creditTotal}`,
        });
      }

      const voucherNo = await generateVoucherNo(ctx.db, input.voucherWord, ctx.user.companyId);

      return ctx.db.$transaction(async (tx) => {
        const voucher = await tx.accountingVoucher.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            fiscalPeriodId: await resolveFiscalPeriodId(tx, new Date(input.voucherDate), ctx.user.companyId),
            voucherNo,
            voucherWord: input.voucherWord,
            voucherNumber: 1, // Will be set by generateVoucherNo
            voucherDate: new Date(input.voucherDate),
            summary: input.summary,
            debitAmount: debitTotal,
            creditAmount: creditTotal,
            creatorId: BigInt(ctx.user.id),
            status: 'draft',
            auditStatus: 'pending',
          },
        });

        await tx.voucherEntry.createMany({
          data: input.entries.map((e, i) => ({
            voucherId: voucher.id,
            subjectId: BigInt(e.subjectId),
            summary: e.summary,
            debitAmount: e.debitAmount,
            creditAmount: e.creditAmount,
            direction: e.debitAmount > 0 ? '借' : '贷',
            sortOrder: i + 1,
          })),
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'CREATE',
            entityType: 'accounting_voucher',
            entityId: voucher.id,
            newValueJson: { voucherNo, summary: input.summary },
          },
        });

        return voucher;
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.db.accountingVoucher.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!voucher) throw new TRPCError({ code: 'NOT_FOUND' });
      if (voucher.status !== 'draft' && voucher.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '只能审核草稿或待审核状态的凭证' });
      }
      return ctx.db.accountingVoucher.update({
        where: { id: input.id },
        data: { status: 'approved', auditStatus: 'approved', reviewerId: BigInt(ctx.user.id) },
      });
    }),

  void: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.accountingVoucher.update({
        where: { id: input.id },
        data: { isVoided: true, voidReason: input.reason, status: 'voided' },
      });
    }),

  // 从原始凭证汇总生成记账凭证：多张原始凭证 → 一张记账凭证。
  // 校验来源均为待制证且未关联，生成后回写每张原始凭证的 voucherId 与状态「已制证」。
  batchCreate: protectedProcedure
    .input(
      z.object({
        sourceVoucherIds: z.array(z.number()).min(1, '至少选择1张原始凭证'),
        voucherWord: z.enum(['收', '付', '转']),
        voucherDate: z.string(),
        summary: z.string().min(1, '摘要不能为空'),
        entries: z.array(entrySchema).min(2, '至少需要2条分录'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 校验借贷平衡
      const debitTotal = input.entries.reduce((s, e) => s + e.debitAmount, 0);
      const creditTotal = input.entries.reduce((s, e) => s + e.creditAmount, 0);
      if (Math.abs(debitTotal - creditTotal) > 0.001) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `借贷不平衡：借方 ${debitTotal} ≠ 贷方 ${creditTotal}`,
        });
      }

      const idList = input.sourceVoucherIds.map((id) => BigInt(id));

      return ctx.db.$transaction(async (tx) => {
        // 校验来源原始凭证：必须全部存在、待制证、未关联
        const sources = await tx.sourceVoucher.findMany({
          where: { id: { in: idList }, companyId: BigInt(ctx.user.companyId) },
        });
        if (sources.length !== idList.length) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '部分原始凭证不存在' });
        }
        const bad = sources.find((s) => s.status !== '待制证' || s.voucherId);
        if (bad) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `原始凭证 ${bad.voucherNo} 已制证或非待制证状态，无法重复制证`,
          });
        }

        const fiscalPeriodId = await resolveFiscalPeriodId(tx, new Date(input.voucherDate), ctx.user.companyId);
        const voucherNo = await generateVoucherNo(tx, input.voucherWord, ctx.user.companyId);
        const voucherNumber = parseInt(voucherNo.replace(/\D/g, ''), 10) || 1;

        const voucher = await tx.accountingVoucher.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            fiscalPeriodId,
            voucherNo,
            voucherWord: input.voucherWord,
            voucherNumber,
            voucherDate: new Date(input.voucherDate),
            summary: input.summary,
            debitAmount: debitTotal,
            creditAmount: creditTotal,
            sourceVoucherIds: input.sourceVoucherIds,
            creatorId: BigInt(ctx.user.id),
            status: 'draft',
            auditStatus: 'pending',
          },
        });

        await tx.voucherEntry.createMany({
          data: input.entries.map((e, i) => ({
            voucherId: voucher.id,
            subjectId: BigInt(e.subjectId),
            summary: e.summary,
            debitAmount: e.debitAmount,
            creditAmount: e.creditAmount,
            direction: e.debitAmount > 0 ? '借' : '贷',
            sortOrder: i + 1,
          })),
        });

        // 回写每张原始凭证：关联记账凭证 + 状态「已制证」
        await tx.sourceVoucher.updateMany({
          where: { id: { in: idList }, companyId: BigInt(ctx.user.companyId) },
          data: { voucherId: voucher.id, status: '已制证' },
        });

        await tx.auditLog.create({
          data: {
            companyId: BigInt(ctx.user.companyId),
            userId: BigInt(ctx.user.id),
            action: 'CREATE',
            entityType: 'accounting_voucher',
            entityId: voucher.id,
            newValueJson: {
              voucherNo,
              summary: input.summary,
              fromSourceVoucherIds: input.sourceVoucherIds,
            },
          },
        });

        return { count: 1, id: voucher.id };
      });
    }),
});
