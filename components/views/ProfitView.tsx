'use client';

import { Fragment, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

// ============================================================================
// Helpers
// ============================================================================

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function fmtChange(v: number, unit?: string): string {
  const sign = v >= 0 ? '+' : '';
  if (unit === 'pp') return `${sign}${v.toFixed(1)}pp`;
  return `${sign}${v.toFixed(1)}%`;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {fmtWan(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// Stat Card
// ============================================================================

function StatCard({
  title,
  value,
  sub,
  tone = 'neutral',
  loading = false,
}: {
  title: string;
  value: string;
  sub: string;
  tone?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}) {
  const toneStyles: Record<string, string> = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  if (loading) {
    return (
      <Card className="elevation-1">
        <CardHeader className="pb-1">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3.5 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="elevation-1">
      <CardHeader className="pb-1">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold font-heading text-foreground tracking-tight">
          {value}
        </p>
        <p className={`text-xs mt-0.5 ${toneStyles[tone]}`}>{sub}</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Direction Icon
// ============================================================================

function DirectionIcon({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') {
    return <ArrowUpRight className="h-3.5 w-3.5 text-success inline" />;
  }
  if (direction === 'down') {
    return <ArrowDownRight className="h-3.5 w-3.5 text-danger inline" />;
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground inline" />;
}

// ============================================================================
// Types
// ============================================================================

interface SnapshotItem {
  id: unknown;
  fiscalPeriodId: unknown;
  revenue: unknown;
  revenueYoy: unknown;
  costOfGoods: unknown;
  platformCommission: unknown;
  marketingCost: unknown;
  logisticsCost: unknown;
  netProfit: unknown;
  netProfitYoy: unknown;
  netMargin: unknown;
  grossMargin: unknown;
  fiscalPeriod: { year: number; month: number };
}

interface ProfitDetailItem {
  id: unknown;
  section: string;
  itemLabel: string;
  amount: unknown;
  percentage: unknown;
  parentId: unknown;
  sortOrder: number;
}

interface ComparisonRow {
  metric: string;
  current: number;
  unit: string;
  yoy: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    computable: boolean;
  };
  mom: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    computable: boolean;
  };
}

// ============================================================================
// Main Component
// ============================================================================

export function ProfitView() {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // ─── Queries ─────────────────────────────────────────────────────

  const defaultFiscalPeriodId = 1;

  const snapshotQuery = trpc.profit.snapshot.useQuery(
    { fiscalPeriodId: defaultFiscalPeriodId, months: 12 },
    { staleTime: 30_000 },
  );

  const detailsQuery = trpc.profit.details.useQuery(
    { fiscalPeriodId: defaultFiscalPeriodId },
    { staleTime: 30_000 },
  );

  // ─── Derived data ────────────────────────────────────────────────

  const snapshots = (snapshotQuery.data ?? []) as SnapshotItem[];
  const profitDetails = (detailsQuery.data ?? []) as ProfitDetailItem[];

  // Chronological order (oldest first) for the trend chart
  const chronologicalSnapshots = useMemo(
    () => [...snapshots].reverse(),
    [snapshots],
  );

  // Latest snapshot (current month)
  const currentSnapshot = snapshots[0] ?? null;

  // Previous month snapshot (for MoM)
  const prevSnapshot = snapshots[1] ?? null;

  // Previous year same month snapshot (for YoY)
  const yoySnapshot = useMemo(() => {
    if (!currentSnapshot) return null;
    const { year, month } = currentSnapshot.fiscalPeriod;
    return (
      snapshots.find(
        (s) => s.fiscalPeriod.year === year - 1 && s.fiscalPeriod.month === month,
      ) ?? null
    );
  }, [snapshots, currentSnapshot]);

  // Compute KPI values
  const revenue = currentSnapshot ? toNum(currentSnapshot.revenue) : 0;
  const totalExpenses = currentSnapshot
    ? toNum(currentSnapshot.costOfGoods) +
      toNum(currentSnapshot.platformCommission) +
      toNum(currentSnapshot.marketingCost) +
      toNum(currentSnapshot.logisticsCost)
    : 0;
  const netProfit = currentSnapshot ? toNum(currentSnapshot.netProfit) : 0;
  const netMargin = currentSnapshot
    ? toNum(currentSnapshot.netMargin) * 100
    : 0;
  const grossMargin = currentSnapshot
    ? toNum(currentSnapshot.grossMargin) * 100
    : 0;
  const expenseRate = revenue > 0 ? (totalExpenses / revenue) * 100 : 0;

  // Revenue YoY: prefer built-in field, else compute
  const revenueYoy = currentSnapshot
    ? toNum(currentSnapshot.revenueYoy ?? 0) * 100
    : 0;
  const computeMoM = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : 0;

  // Build comparison table rows
  const comparisonData: ComparisonRow[] = useMemo(() => {
    if (!currentSnapshot) return [];

    const prevRevenue = prevSnapshot ? toNum(prevSnapshot.revenue) : 0;
    const prevNetProfit = prevSnapshot ? toNum(prevSnapshot.netProfit) : 0;
    const prevExpenses = prevSnapshot
      ? toNum(prevSnapshot.costOfGoods) +
        toNum(prevSnapshot.platformCommission) +
        toNum(prevSnapshot.marketingCost) +
        toNum(prevSnapshot.logisticsCost)
      : 0;
    const prevNetMargin = prevSnapshot
      ? toNum(prevSnapshot.netMargin) * 100
      : 0;
    const prevGrossMargin = prevSnapshot
      ? toNum(prevSnapshot.grossMargin) * 100
      : 0;
    const prevExpenseRate = prevRevenue > 0 ? (prevExpenses / prevRevenue) * 100 : 0;

    const yoyRevenue = yoySnapshot ? toNum(yoySnapshot.revenue) : 0;
    const yoyNetProfit = yoySnapshot ? toNum(yoySnapshot.netProfit) : 0;
    const yoyExpenses = yoySnapshot
      ? toNum(yoySnapshot.costOfGoods) +
        toNum(yoySnapshot.platformCommission) +
        toNum(yoySnapshot.marketingCost) +
        toNum(yoySnapshot.logisticsCost)
      : 0;
    const yoyNetMargin = yoySnapshot ? toNum(yoySnapshot.netMargin) * 100 : 0;
    const yoyGrossMargin = yoySnapshot ? toNum(yoySnapshot.grossMargin) * 100 : 0;
    const yoyExpenseRate = yoyRevenue > 0 ? (yoyExpenses / yoyRevenue) * 100 : 0;

    const hasMoM = prevSnapshot !== null;
    const hasYoY = yoySnapshot !== null;

    const dir = (v: number) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat';

    return [
      {
        metric: '营业收入',
        current: revenue,
        unit: '万',
        yoy: { value: hasYoY ? computeMoM(revenue, yoyRevenue) : 0, direction: hasYoY ? dir(computeMoM(revenue, yoyRevenue)) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? computeMoM(revenue, prevRevenue) : 0, direction: hasMoM ? dir(computeMoM(revenue, prevRevenue)) : 'flat', computable: hasMoM },
      },
      {
        metric: '营业费用',
        current: totalExpenses,
        unit: '万',
        yoy: { value: hasYoY ? computeMoM(totalExpenses, yoyExpenses) : 0, direction: hasYoY ? dir(computeMoM(totalExpenses, yoyExpenses)) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? computeMoM(totalExpenses, prevExpenses) : 0, direction: hasMoM ? dir(computeMoM(totalExpenses, prevExpenses)) : 'flat', computable: hasMoM },
      },
      {
        metric: '净利润',
        current: netProfit,
        unit: '万',
        yoy: { value: hasYoY ? computeMoM(netProfit, yoyNetProfit) : 0, direction: hasYoY ? dir(computeMoM(netProfit, yoyNetProfit)) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? computeMoM(netProfit, prevNetProfit) : 0, direction: hasMoM ? dir(computeMoM(netProfit, prevNetProfit)) : 'flat', computable: hasMoM },
      },
      {
        metric: '净利率',
        current: netMargin,
        unit: '%',
        yoy: { value: hasYoY ? netMargin - yoyNetMargin : 0, direction: hasYoY ? dir(netMargin - yoyNetMargin) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? netMargin - prevNetMargin : 0, direction: hasMoM ? dir(netMargin - prevNetMargin) : 'flat', computable: hasMoM },
      },
      {
        metric: '毛利率',
        current: grossMargin,
        unit: '%',
        yoy: { value: hasYoY ? grossMargin - yoyGrossMargin : 0, direction: hasYoY ? dir(grossMargin - yoyGrossMargin) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? grossMargin - prevGrossMargin : 0, direction: hasMoM ? dir(grossMargin - prevGrossMargin) : 'flat', computable: hasMoM },
      },
      {
        metric: '费用率',
        current: expenseRate,
        unit: '%',
        yoy: { value: hasYoY ? expenseRate - yoyExpenseRate : 0, direction: hasYoY ? dir(expenseRate - yoyExpenseRate) : 'flat', computable: hasYoY },
        mom: { value: hasMoM ? expenseRate - prevExpenseRate : 0, direction: hasMoM ? dir(expenseRate - prevExpenseRate) : 'flat', computable: hasMoM },
      },
    ];
  }, [currentSnapshot, prevSnapshot, yoySnapshot, revenue, totalExpenses, netProfit, netMargin, grossMargin, expenseRate]);

  // Trend chart data from chronological snapshots (oldest first)
  const trendData = useMemo(() => {
    // Show up to 6 most recent months
    const recent = chronologicalSnapshots.slice(-6);
    return recent.map((s) => {
      const y = s.fiscalPeriod.year;
      const m = String(s.fiscalPeriod.month).padStart(2, '0');
      return {
        month: `${y}.${m}`,
        revenue: toNum(s.revenue),
        profit: toNum(s.netProfit),
      };
    });
  }, [chronologicalSnapshots]);

  // Drill-down sections from profit details
  const drillSections = useMemo(() => {
    if (profitDetails.length === 0) return [];

    // Group by section
    const grouped = new Map<string, ProfitDetailItem[]>();
    for (const item of profitDetails) {
      const existing = grouped.get(item.section) ?? [];
      existing.push(item);
      grouped.set(item.section, existing);
    }

    const revenueSection = '收入';
    const expenseSection = '成本与费用';

    const sections: {
      title: string;
      total: number;
      items: { label: string; amount: number; pct?: string }[];
      summary?: string;
    }[] = [];

    const revenueItems = grouped.get(revenueSection) ?? [];
    // Filter revenue items that also appear in grouped but may have different section name
    const allRevenueItems = profitDetails.filter((d) =>
      [revenueSection, '营业收入'].includes(d.section),
    );
    if (allRevenueItems.length > 0) {
      const topLevel = allRevenueItems.filter((d) => !d.parentId);
      const total = topLevel.reduce((s, d) => s + toNum(d.amount), 0);
      sections.push({
        title: '一、收入构成',
        total,
        summary: '营业收入合计',
        items: topLevel.map((d) => ({
          label: d.itemLabel,
          amount: toNum(d.amount),
          pct: d.percentage != null ? `${(toNum(d.percentage) * 100).toFixed(1)}%` : undefined,
        })),
      });
    } else {
      // Fallback: use all revenue-category items
      const total = allRevenueItems.reduce((s, d) => s + toNum(d.amount), 0);
      if (allRevenueItems.length > 0) {
        sections.push({
          title: '一、收入构成',
          total,
          summary: '营业收入合计',
          items: allRevenueItems.map((d) => ({
            label: d.itemLabel,
            amount: toNum(d.amount),
            pct: d.percentage != null ? `${(toNum(d.percentage) * 100).toFixed(1)}%` : undefined,
          })),
        });
      }
    }

    const expenseItems = profitDetails.filter((d) =>
      [expenseSection, '营业费用', '成本', '费用'].includes(d.section),
    );
    if (expenseItems.length > 0) {
      const topLevel = expenseItems.filter((d) => !d.parentId);
      const allForTotal = topLevel.length > 0 ? topLevel : expenseItems;
      const total = allForTotal.reduce((s, d) => s + toNum(d.amount), 0);
      sections.push({
        title: '二、成本与费用构成',
        total,
        summary: '营业费用合计',
        items: allForTotal.map((d) => ({
          label: d.itemLabel,
          amount: toNum(d.amount),
          pct: d.percentage != null ? `${(toNum(d.percentage) * 100).toFixed(1)}%` : undefined,
        })),
      });
    }

    // If no sections parsed by section name, fallback: treat all items as a single section
    if (sections.length === 0) {
      const total = profitDetails.reduce((s, d) => s + toNum(d.amount), 0);
      sections.push({
        title: '明细',
        total,
        items: profitDetails.map((d) => ({
          label: d.itemLabel,
          amount: toNum(d.amount),
          pct: d.percentage != null ? `${(toNum(d.percentage) * 100).toFixed(1)}%` : undefined,
        })),
      });
    }

    return sections;
  }, [profitDetails]);

  // Compute drill-down net profit
  const drillNetProfit =
    drillSections.length >= 2
      ? drillSections[0].total - drillSections[1].total
      : drillSections.length === 1
        ? drillSections[0].total
        : 0;

  const drillRevenueTotal = drillSections.length >= 1 ? drillSections[0].total : 0;

  // ─── Loading & error state helpers ────────────────────────────────

  const isSnapshotLoading = snapshotQuery.isLoading;
  const isSnapshotError = snapshotQuery.isError;
  const snapshotErrorMsg = snapshotQuery.error?.message;

  const isDetailsLoading = detailsQuery.isLoading;
  const isDetailsError = detailsQuery.isError;
  const detailsErrorMsg = detailsQuery.error?.message;

  const hasSnapshotData = snapshots.length > 0;
  const hasDetailsData = profitDetails.length > 0;

  // Trend direction badge
  const trendDirection = useMemo(() => {
    if (trendData.length < 2) return 'flat';
    const firstRevenue = trendData[0].revenue;
    const lastRevenue = trendData[trendData.length - 1].revenue;
    const firstProfit = trendData[0].profit;
    const lastProfit = trendData[trendData.length - 1].profit;
    if (lastRevenue > firstRevenue && lastProfit > firstProfit) return 'up';
    if (lastRevenue < firstRevenue && lastProfit < firstProfit) return 'down';
    return 'flat';
  }, [trendData]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            利润管理{' '}
            <span className="text-sm font-normal text-muted-foreground font-sans">
              · 收入与费用
            </span>
          </h1>
          <p className="page-subtitle">
            归集收入与费用，跟踪净利润、毛利率与净利率，及时发现盈利异常并支持诊断。
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary text-primary hover:bg-accent"
        >
          <Sparkles className="h-4 w-4" />
          AI 利润诊断
        </Button>
      </div>

      <Separator />

      {/* ========== Snapshot Error State ========== */}
      {isSnapshotError && (
        <Alert variant="destructive">
          <AlertTitle>快照数据加载失败</AlertTitle>
          <AlertDescription>
            {snapshotErrorMsg || '无法获取利润快照数据，请检查网络连接后重试'}
          </AlertDescription>
        </Alert>
      )}

      {/* ========== 6 Stat Indicators ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="营业收入"
          value={hasSnapshotData ? fmtWan(revenue) : '--'}
          sub={
            hasSnapshotData
              ? fmtChange(revenueYoy) + ' 同比'
              : '暂无数据'
          }
          tone={revenueYoy >= 0 ? 'up' : 'down'}
          loading={isSnapshotLoading}
        />
        <StatCard
          title="营业费用"
          value={hasSnapshotData ? fmtWan(totalExpenses) : '--'}
          sub={
            hasSnapshotData
              ? `费用率 ${expenseRate.toFixed(1)}%`
              : '暂无数据'
          }
          tone="neutral"
          loading={isSnapshotLoading}
        />
        <StatCard
          title="净利润"
          value={hasSnapshotData ? fmtWan(netProfit) : '--'}
          sub={
            hasSnapshotData
              ? fmtChange(
                  currentSnapshot
                    ? toNum(currentSnapshot.netProfitYoy ?? 0) * 100
                    : 0,
                ) + ' 同比'
              : '暂无数据'
          }
          tone={netProfit >= 0 ? 'up' : 'down'}
          loading={isSnapshotLoading}
        />
        <StatCard
          title="净利率"
          value={hasSnapshotData ? fmtPct(netMargin) : '--'}
          sub={
            hasSnapshotData && prevSnapshot
              ? fmtChange(
                  netMargin -
                    toNum(prevSnapshot.netMargin ?? 0) * 100,
                  'pp',
                ) + ' 环比'
              : '暂无数据'
          }
          tone={netMargin >= 0 ? (netMargin >= (prevSnapshot ? toNum(prevSnapshot.netMargin ?? 0) * 100 : 0) ? 'up' : 'down') : 'neutral'}
          loading={isSnapshotLoading}
        />
        <StatCard
          title="毛利率"
          value={hasSnapshotData ? fmtPct(grossMargin) : '--'}
          sub={
            hasSnapshotData && prevSnapshot
              ? fmtChange(
                  grossMargin -
                    toNum(prevSnapshot.grossMargin ?? 0) * 100,
                  'pp',
                ) + ' 环比'
              : '暂无数据'
          }
          tone={
            grossMargin >=
            (prevSnapshot ? toNum(prevSnapshot.grossMargin ?? 0) * 100 : 0)
              ? 'up'
              : 'down'
          }
          loading={isSnapshotLoading}
        />
        <StatCard
          title="费用率"
          value={hasSnapshotData ? fmtPct(expenseRate) : '--'}
          sub={
            hasSnapshotData && prevSnapshot
              ? (() => {
                  const prevExp =
                    toNum(prevSnapshot.costOfGoods) +
                    toNum(prevSnapshot.platformCommission) +
                    toNum(prevSnapshot.marketingCost) +
                    toNum(prevSnapshot.logisticsCost);
                  const prevRevenue = toNum(prevSnapshot.revenue);
                  const prevRate =
                    prevRevenue > 0 ? (prevExp / prevRevenue) * 100 : 0;
                  return (
                    fmtChange(expenseRate - prevRate, 'pp') + ' 环比'
                  );
                })()
              : '暂无数据'
          }
          tone={
            (() => {
              if (!prevSnapshot) return 'neutral';
              const prevExp =
                toNum(prevSnapshot.costOfGoods) +
                toNum(prevSnapshot.platformCommission) +
                toNum(prevSnapshot.marketingCost) +
                toNum(prevSnapshot.logisticsCost);
              const prevRevenue = toNum(prevSnapshot.revenue);
              const prevRate =
                prevRevenue > 0 ? (prevExp / prevRevenue) * 100 : 0;
              return expenseRate <= prevRate ? 'down' : 'up';
            })()
          }
          loading={isSnapshotLoading}
        />
      </div>

      {/* ========== Chart: Monthly Revenue & Profit Trend ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>近6个月收入与利润趋势</CardTitle>
          <CardDescription>
            营业收入与净利润月度变化
          </CardDescription>
          {hasSnapshotData && trendData.length >= 2 && (
            <Badge variant="secondary" className="mt-1">
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : trendDirection === 'down' ? (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              ) : null}
              {trendDirection === 'up'
                ? '双增长'
                : trendDirection === 'down'
                  ? '双下降'
                  : '波动'}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isSnapshotLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : !hasSnapshotData ? (
            <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
              暂无利润趋势数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={trendData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="营业收入"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profit"
                  name="净利润"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--chart-3)' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ========== YoY / MoM Comparison Block ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>同比与环比对照</CardTitle>
          <CardDescription>
            关键利润指标的本期值、同比（去年同期对比）与环比（上月对比）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSnapshotLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !hasSnapshotData ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无对比数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">指标</TableHead>
                    <TableHead className="text-right">本期值</TableHead>
                    <TableHead className="text-right">同比</TableHead>
                    <TableHead className="text-right">同比变动</TableHead>
                    <TableHead className="text-right">环比</TableHead>
                    <TableHead className="text-right">环比变动</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.unit === '%'
                          ? fmtPct(row.current)
                          : fmtWan(row.current)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.yoy.computable ? (
                          <span className="inline-flex items-center gap-1">
                            <DirectionIcon direction={row.yoy.direction} />
                            <span
                              className={
                                row.yoy.direction === 'up'
                                  ? 'text-success'
                                  : row.yoy.direction === 'down'
                                    ? 'text-danger'
                                    : 'text-muted-foreground'
                              }
                            >
                              {fmtChange(
                                row.yoy.value,
                                row.unit === '%' ? 'pp' : undefined,
                              )}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {row.yoy.computable ? '较去年同期' : '暂无同期数据'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.mom.computable ? (
                          <span className="inline-flex items-center gap-1">
                            <DirectionIcon direction={row.mom.direction} />
                            <span
                              className={
                                row.mom.direction === 'up'
                                  ? 'text-success'
                                  : row.mom.direction === 'down'
                                    ? 'text-danger'
                                    : 'text-muted-foreground'
                              }
                            >
                              {fmtChange(
                                row.mom.value,
                                row.unit === '%' ? 'pp' : undefined,
                              )}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {row.mom.computable ? '较上月' : '暂无环比数据'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== Detailed Drill-down Table ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>收入与费用明细</CardTitle>
          <CardDescription>
            按收入构成与成本费用逐项拆解，支持展开/收起查看明细
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Details Error State */}
          {isDetailsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>明细数据加载失败</AlertTitle>
              <AlertDescription>
                {detailsErrorMsg || '无法获取利润明细数据，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isDetailsLoading && !isDetailsError && !hasDetailsData && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无利润明细数据
            </div>
          )}

          {/* Loading State */}
          {isDetailsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          )}

          {/* Data Table */}
          {!isDetailsLoading && !isDetailsError && hasDetailsData && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>项目</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    <TableHead className="text-right">占比</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drillSections.map((section, si) => (
                    <Fragment key={`section-${si}`}>
                      {/* Section header row (clickable) */}
                      <TableRow
                        className="cursor-pointer bg-muted/30 hover:bg-muted/50"
                        onClick={() => toggleSection(si)}
                      >
                        <TableCell>
                          <span className="inline-flex items-center justify-center">
                            {expandedSections[si] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {section.title}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-foreground tabular-nums">
                          {fmtWan(section.total)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          100%
                        </TableCell>
                      </TableRow>

                      {/* Sub-items */}
                      {expandedSections[si] &&
                        section.items.map((item, ii) => (
                          <TableRow key={`item-${si}-${ii}`}>
                            <TableCell />
                            <TableCell className="pl-8 text-sm text-foreground">
                              {item.label}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                              {fmtWan(item.amount)}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                              {item.pct ??
                                (section.total > 0
                                  ? (
                                      (item.amount / section.total) *
                                      100
                                    ).toFixed(1) + '%'
                                  : '0.0%')}
                            </TableCell>
                          </TableRow>
                        ))}

                      {/* Section summary row */}
                      <TableRow className="border-b-2">
                        <TableCell />
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          {section.summary}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold tabular-nums">
                          {fmtWan(section.total)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </Fragment>
                  ))}

                  {/* Net Profit summary row */}
                  {drillSections.length >= 2 && (
                    <TableRow className="bg-accent/30">
                      <TableCell />
                      <TableCell className="font-bold text-foreground">
                        净利润
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-success tabular-nums">
                        {fmtWan(drillNetProfit)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {drillRevenueTotal > 0
                          ? ((drillNetProfit / drillRevenueTotal) * 100).toFixed(
                              1,
                            ) + '%'
                          : '--'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
