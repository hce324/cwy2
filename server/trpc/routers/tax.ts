import { z } from 'zod';
import { protectedProcedure, directorProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const taxRouter = router({
  // ── existing ──
  listFilings: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input.fiscalPeriodId) where.fiscalPeriodId = input.fiscalPeriodId;
      return ctx.db.taxFiling.findMany({ where, orderBy: { filingDeadline: 'asc' } });
    }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    return ctx.db.taxFiling.findFirst({
      where: {
        ...tenantWhere(ctx.user.companyId),
        taxPeriodFrom: { lte: now },
        taxPeriodTo: { gte: now },
      },
    });
  }),

  // ── new ──

  list: protectedProcedure
    .input(z.object({
      taxType: z.string().optional(),
      fiscalPeriodId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = tenantWhere(ctx.user.companyId);
      if (input?.taxType) where.taxType = input.taxType;
      if (input?.fiscalPeriodId) where.fiscalPeriodId = input.fiscalPeriodId;
      const [items, total] = await Promise.all([
        ctx.db.taxFiling.findMany({
          where,
          skip: input?.offset ?? 0,
          take: input?.limit ?? 20,
          orderBy: { filingDeadline: 'asc' },
        }),
        ctx.db.taxFiling.count({ where }),
      ]);
      return { items, total };
    }),

  create: directorProcedure
    .input(z.object({
      fiscalPeriodId: z.number(),
      taxType: z.string(),
      taxPeriod: z.string(),
      taxableAmount: z.number(),
      taxRate: z.number(),
      taxAmount: z.number(),
      actualPayment: z.number().optional(),
      paymentDate: z.string().optional(),
      status: z.string().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const periodDate = new Date(input.taxPeriod);
      const result = await ctx.db.taxFiling.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
          taxType: input.taxType,
          formName: `${input.taxType}-${input.taxPeriod}`,
          formDetail: JSON.stringify({
            taxRate: input.taxRate,
            actualPayment: input.actualPayment,
            paymentDate: input.paymentDate,
          }),
          taxPeriodFrom: periodDate,
          taxPeriodTo: periodDate,
          filingDeadline: periodDate,
          outputTax: input.taxableAmount,
          taxPayable: input.taxAmount,
          status: input.status ?? '待复核',
          diffNote: input.remarks,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'CREATE',
          entityType: 'TaxFiling',
          entityId: result.id,
          newValueJson: {
            fiscalPeriodId: input.fiscalPeriodId,
            taxType: input.taxType,
            taxAmount: input.taxAmount,
            status: input.status ?? '待复核',
          },
        },
      });
      return result;
    }),

  summary: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      const records = await ctx.db.taxFiling.findMany({
        where: { ...tenantWhere(ctx.user.companyId), fiscalPeriodId: input.fiscalPeriodId },
        select: { taxType: true, outputTax: true, inputTax: true, taxPayable: true },
      });
      let outputTaxTotal = 0;
      let inputTaxTotal = 0;
      for (const r of records) {
        const out = Number(r.outputTax ?? 0);
        const inp = Number(r.inputTax ?? 0);
        if (r.taxType === '销项税' || r.taxType === 'output') {
          outputTaxTotal += out;
        } else if (r.taxType === '进项税' || r.taxType === 'input') {
          inputTaxTotal += inp;
        } else {
          // unknown type — treat outputTax as the tax amount
          outputTaxTotal += out;
          inputTaxTotal += inp;
        }
      }
      return {
        outputTaxTotal: Math.round(outputTaxTotal * 100) / 100,
        inputTaxTotal: Math.round(inputTaxTotal * 100) / 100,
        netPayable: Math.round((outputTaxTotal - inputTaxTotal) * 100) / 100,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.taxFiling.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!record) throw new Error('TaxFiling not found');
      return record;
    }),
});
