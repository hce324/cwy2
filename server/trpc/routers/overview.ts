import { z } from 'zod';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

/**
 * Overview / Dashboard router
 * Exposes MonthlyFinancialSnapshot, ProfitDetail, CashFlowPrediction,
 * LiveRoomProfitRanking, and ProductProfitRanking for the OverviewView.
 */
export const overviewRouter = router({
  /** Current-period KPIs (revenue, profit, margin, cash flow, risk ratios). */
  snapshot: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.monthlyFinancialSnapshot.findFirst({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
        },
      });
    }),

  /** Multi-period financial data for 12-month trend charts & sparklines. */
  trends: protectedProcedure
    .input(z.object({ fiscalPeriodIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.monthlyFinancialSnapshot.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: {
            in: input.fiscalPeriodIds.map((id) => BigInt(id)),
          },
        },
        include: { fiscalPeriod: true },
        orderBy: { fiscalPeriodId: 'asc' },
      });
    }),

  /** Profit-structure waterfall for a given period. */
  waterfall: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.profitDetail.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
        },
        orderBy: { sortOrder: 'asc' },
      });
    }),

  /** Cash-flow 30-day prediction for a given period. */
  cashPrediction: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.cashFlowPrediction.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          periodId: BigInt(input.fiscalPeriodId),
        },
        orderBy: { dayOffset: 'asc' },
      });
    }),

  /** Top-N live-room profit rankings for a given period. */
  liveRoomRanking: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.liveRoomProfitRanking.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
        },
        orderBy: { rank: 'asc' },
      });
    }),

  /** Top-N product profit rankings for a given period. */
  productRanking: protectedProcedure
    .input(z.object({ fiscalPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.productProfitRanking.findMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
        },
        orderBy: { rank: 'asc' },
      });
    }),
});
