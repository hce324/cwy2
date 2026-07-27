'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatDelta, type DeltaResult } from '@/lib/kpi';
import { RISK_LEVELS, countRiskLevels, type RiskLevel } from '@/lib/risk';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// Type helpers
// ============================================================================

interface WaterfallBar {
  key: string;
  label: string;
  value: number;
  base: number;
  height: number;
  color: string;
}

type TrendSeries = {
  key: string;
  color: string;
  kind: 'area' | 'line' | 'bar';
  dashed?: boolean;
};

// ============================================================================
// Safe number conversion (Prisma Decimal / BigInt -> number)
// ============================================================================

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

// ============================================================================
// Formatting helpers
// ============================================================================

/**
 * 自适应金额格式化（入参单位：元）。
 * 大数自动升级到 万 / 亿，避免超长字符串撑破卡片与图表。
 */
function fmtAmount(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e8) return `¥${(v / 1e8).toFixed(2)}亿`;
  if (abs >= 1e4) return `¥${(v / 1e4).toLocaleString('zh-CN', { maximumFractionDigits: 1 })}万`;
  return `¥${v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

/** tooltip 用，同 fmtAmount */
function fmtWan(v: number): string {
  return fmtAmount(v);
}

/** 坐标轴刻度 / 图内标签用的紧凑格式（无 ¥ 前缀） */
function fmtCompact(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(1)}亿`;
  if (abs >= 1e4) return `${sign}${(abs / 1e4).toFixed(0)}万`;
  return `${sign}${abs.toFixed(0)}`;
}

/**
 * 比率归一化为百分数：数据库存 0.08（小数）或 8 / 11.36（百分数）都能正确显示。
 * |v| <= 1.5 视为小数比率并 ×100。
 */
function toPct(v: number): number {
  return Math.abs(v) <= 1.5 ? v * 100 : v;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('.');
  return `${y.slice(2)}/${m}`;
}

// ============================================================================
// Custom Tooltips
// ============================================================================

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs elevation-3 min-w-[170px]">
      <p className="mb-1 font-medium text-foreground border-b border-border pb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 tabular-nums">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-foreground text-right">
            {entry.name === '净利率'
              ? entry.value.toFixed(1) + '%'
              : fmtWan(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function WaterfallTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const bar = payload[0]?.payload as WaterfallBar | undefined;
  if (!bar) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs elevation-3">
      <p className="mb-1 font-medium text-foreground">{bar.label}</p>
      <p className="tabular-nums font-medium" style={{ color: bar.value >= 0 ? 'var(--chart-3)' : 'var(--chart-5)' }}>
        {bar.value >= 0 ? '+' : ''}{fmtCompact(bar.value)}
      </p>
    </div>
  );
}

function CashTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs elevation-3">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-3 tabular-nums">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-foreground text-right">
            {fmtAmount(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// KPI Trend — inline sparkline
// ============================================================================

function KpiTrend({
  data,
  series,
  height = 48,
  label,
}: {
  data: any[];
  series: TrendSeries[];
  height?: number;
  label?: string;
}) {
  const useBar = series.some((s) => s.kind === 'bar');
  const useArea = series.some((s) => s.kind === 'area');
  const Chart = useBar ? BarChart : useArea ? AreaChart : LineChart;

  if (!data || data.length === 0) return null;

  // 仅 1 期数据时无趋势可画，明确告知用户；避免依赖 recharts 在单点 Area 上的退化占位渲染
  if (data.length < 2) {
    return (
      <div
        role="img"
        aria-label={label ?? '仅当期数据'}
        className="mt-3 w-full min-w-[100px] flex items-center gap-2 text-[11px] text-muted-foreground"
        style={{ height }}
      >
        <span className="inline-block h-px flex-1 bg-[--border]" aria-hidden />
        <span className="shrink-0">仅当期数据 · 暂无趋势</span>
        <span className="inline-block h-px flex-1 bg-[--border]" aria-hidden />
      </div>
    );
  }

  // 每条 series 独立线性归一化到 [0,1]：使迷你图在任意量级 / 单调数据下都用满高度，形状始终可见
  const normData = data.map((row) => {
    const next: any = { ...row };
    for (const s of series) {
      const vals = data.map((d) => Number(d[s.key]) || 0);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const span = max - min;
      const raw = Number(row[s.key]) || 0;
      next[s.key] = span === 0 ? 0.5 : (raw - min) / span;
    }
    return next;
  });

  return (
    <div role="img" aria-label={label ?? '趋势迷你图'} className="mt-3 w-full min-w-[100px]" style={{ height }}>
      <ResponsiveContainer key={data.length} width="100%" height="100%">
        <Chart data={normData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
          <YAxis hide domain={[0, 1]} />
          {series.map((s) => {
            if (s.kind === 'area') {
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fill={s.color}
                  fillOpacity={0.2}
                  dot={false}
                  strokeDasharray={s.dashed ? '4 3' : undefined}
                  isAnimationActive={false}
                />
              );
            }
            if (s.kind === 'bar') {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={s.color}
                  radius={[2, 2, 0, 0]}
                  barSize={5}
                  isAnimationActive={false}
                />
              );
            }
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray={s.dashed ? '4 3' : undefined}
                isAnimationActive={false}
              />
            );
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Stat Card — with variant support + inline trend / progress
// ============================================================================

function StatCard({
  title,
  value,
  sub,
  delta,
  riskLevel,
  variant = 'default',
  onClick,
  trend,
  progress,
}: {
  title: string;
  value: string;
  sub?: string;
  delta?: DeltaResult;
  riskLevel?: RiskLevel;
  variant?: 'default' | 'primary' | 'danger';
  onClick?: () => void;
  trend?: { data: any[]; series: TrendSeries[]; label?: string };
  progress?: { value: number; color: 'danger' | 'warning' };
}) {
  const isPrimary = variant === 'primary';
  const clickable = !!onClick;

  const footer = delta ? (
    <p className={cn('mt-0.5 flex items-center gap-0.5', delta.className)}>
      <span className="kpi-delta__symbol" aria-hidden>{delta.symbol}</span>
      <span>{delta.text}</span>
    </p>
  ) : riskLevel ? (
    <div className="mt-0.5 flex items-center gap-1.5">
      <span className={cn('risk-badge', RISK_LEVELS[riskLevel].badge)}>{RISK_LEVELS[riskLevel].label}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  ) : sub ? (
    <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
  ) : null;

  return (
    <Card
      className={cn(
        'elevation-1 card-hover',
        isPrimary && 'border-l-[3px] border-l-[--primary] bg-accent/20',
        riskLevel && RISK_LEVELS[riskLevel].surface,
        clickable && 'cursor-pointer transition-opacity hover:opacity-90',
      )}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <CardHeader className="pb-1">
        <CardDescription className={!isPrimary ? 'text-xs' : ''}>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-heading text-foreground tracking-tight tabular-nums leading-tight">
          {value}
        </p>
        {footer}
        {trend && <KpiTrend data={trend.data} series={trend.series} label={trend.label} />}
        {progress && (
          <Progress
            value={progress.value}
            className={`mt-3 [&_[data-slot=progress-indicator]]:!bg-${progress.color} [&_[data-slot=progress-track]]:!h-2`}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Stat Card Skeleton
// ============================================================================

function StatCardSkeleton({ isPrimary = false }: { isPrimary?: boolean }) {
  return (
    <Card className={cn('elevation-1', isPrimary && 'border-l-[3px] border-l-[--primary] bg-accent/20')}>
      <CardHeader className="pb-1">
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className={cn('h-8', isPrimary ? 'w-36' : 'w-24')} />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Chart Skeleton
// ============================================================================

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card className="elevation-1">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton style={{ height }} className="w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Ranking Row
// ============================================================================

function RankingRow({
  rank,
  name,
  profit,
  margin,
  trend,
}: {
  rank: number;
  name: string;
  profit: number;
  margin: number;
  trend: 'up' | 'down';
}) {
  const rankColors: Record<number, string> = {
    1: 'bg-chart-1 text-primary-foreground',
    2: 'bg-chart-2 text-secondary-foreground',
    3: 'bg-chart-4 text-primary-foreground',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rankColors[rank] || 'bg-muted text-muted-foreground'}`}
      >
        {rank}
      </span>
      <span className="flex-1 text-sm text-foreground truncate">{name}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {fmtAmount(profit)}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
        {toPct(margin).toFixed(1)}%
      </span>
      <span className="w-5 text-center">
        {trend === 'up' ? (
          <TrendingUp className="h-3.5 w-3.5 text-trend-up inline" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-trend-down inline" />
        )}
      </span>
    </div>
  );
}

// ============================================================================
// Ranking Skeleton
// ============================================================================

function RankingSkeleton() {
  return (
    <Card className="elevation-1">
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OverviewView() {
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  // ─── tRPC Queries ────────────────────────────────────────────────────

  const periodQuery = trpc.period.current.useQuery();

  const fiscalPeriodId = periodQuery.data ? Number(periodQuery.data.id) : 1;
  const currentPeriodLabel = periodQuery.data
    ? `${periodQuery.data.year}年${periodQuery.data.month}月`
    : '加载中...';

  // KPI snapshot (single period)
  const snapshotQuery = trpc.overview.snapshot.useQuery(
    { fiscalPeriodId },
    { enabled: fiscalPeriodId > 0 },
  );

  // 12-month trends (uses profit.snapshot — returns most recent N months in desc order)
  const trendsQuery = trpc.profit.snapshot.useQuery(
    { fiscalPeriodId, months: 12 },
    { enabled: fiscalPeriodId > 0 },
  );

  // Profit waterfall
  const waterfallQuery = trpc.profit.details.useQuery(
    { fiscalPeriodId },
    { enabled: fiscalPeriodId > 0 },
  );

  // Cash prediction
  const cashPredictionQuery = trpc.overview.cashPrediction.useQuery(
    { fiscalPeriodId },
    { enabled: fiscalPeriodId > 0 },
  );

  // Live room ranking
  const liveRoomQuery = trpc.overview.liveRoomRanking.useQuery(
    { fiscalPeriodId },
    { enabled: fiscalPeriodId > 0 },
  );

  // Product ranking
  const productRankingQuery = trpc.overview.productRanking.useQuery(
    { fiscalPeriodId },
    { enabled: fiscalPeriodId > 0 },
  );

  // Risk
  const riskCountsQuery = trpc.risk.counts.useQuery();
  const riskListQuery = trpc.risk.list.useQuery({
    riskLevel: riskFilter === 'all' ? 'all' : riskFilter,
    limit: 20,
    offset: 0,
  });

  // Bank accounts (for cash balance)
  const bankAccountsQuery = trpc.bank.listAccounts.useQuery();

  // ─── Derived Data ─────────────────────────────────────────────────────

  const snapshot = snapshotQuery.data;

  // Map trends to chart-ready arrays (profit.snapshot returns desc order; reverse for asc charts)
  const trendChartData = useMemo(() => {
    if (!trendsQuery.data) return [];
    return [...trendsQuery.data]
      .reverse()
      .filter((s) => s.fiscalPeriod)
      .map((s) => ({
        month: `${s.fiscalPeriod.year}.${String(s.fiscalPeriod.month).padStart(2, '0')}`,
        revenue: toNum(s.revenue),
        profit: toNum(s.netProfit),
        margin: toPct(toNum(s.netMargin)),
      }));
  }, [trendsQuery.data]);

  // Sparkline data for KPI cards
  const revenueTrendData = useMemo(() => {
    if (!trendsQuery.data) return [];
    return [...trendsQuery.data]
      .reverse()
      .filter((s) => s.fiscalPeriod)
      .map((s) => ({
        month: `${s.fiscalPeriod.year}.${String(s.fiscalPeriod.month).padStart(2, '0')}`,
        value: toNum(s.revenue),
        yoy: toNum(s.revenueYoy),
      }));
  }, [trendsQuery.data]);

  const profitTrendData = useMemo(() => {
    if (!trendsQuery.data) return [];
    return [...trendsQuery.data]
      .reverse()
      .filter((s) => s.fiscalPeriod)
      .map((s) => ({
        month: `${s.fiscalPeriod.year}.${String(s.fiscalPeriod.month).padStart(2, '0')}`,
        value: toNum(s.netProfit),
        yoy: toNum(s.netProfitYoy),
      }));
  }, [trendsQuery.data]);

  const marginTrendData = useMemo(() => {
    if (!trendsQuery.data) return [];
    return [...trendsQuery.data]
      .reverse()
      .filter((s) => s.fiscalPeriod)
      .map((s) => ({
        net: toPct(toNum(s.netMargin)),
        gross: toPct(toNum(s.grossMargin)),
        bench: toPct(toNum(s.grossMarginBenchmark)),
      }));
  }, [trendsQuery.data]);

  const cashFlowTrendData = useMemo(() => {
    if (!trendsQuery.data) return [];
    const recent = [...trendsQuery.data].reverse().filter((s) => s.fiscalPeriod).slice(-6);
    return recent.map((s, idx) => ({
      idx,
      value: toNum(s.operatingCashFlow),
    }));
  }, [trendsQuery.data]);

  // Waterfall data
  const waterfallBars: WaterfallBar[] = useMemo(() => {
    if (!waterfallQuery.data || waterfallQuery.data.length === 0) return [];
    return waterfallQuery.data.map((item) => {
      // section 兼容多种写法：'收入' / '收入构成' / 'revenue'、'利润' / 'profit' 等
      const section = String(item.section ?? '');
      const isRevenue = section.includes('收入') || section.toLowerCase().includes('revenue');
      const isProfit = section.includes('利润') || section.toLowerCase().includes('profit');
      const rawAmount = toNum(item.amount);
      const value = isRevenue || isProfit ? rawAmount : -Math.abs(rawAmount);
      return {
        key: item.itemLabel,
        label: item.itemLabel,
        value,
        base: 0,
        height: Math.abs(value),
        color: isRevenue ? 'var(--chart-1)' : isProfit ? 'var(--chart-3)' : 'var(--chart-5)',
      };
    });
  }, [waterfallQuery.data]);

  // Cash prediction data
  const cashPredictionDays = useMemo(() => {
    if (!cashPredictionQuery.data) return [];
    return cashPredictionQuery.data.map((d) => ({
      label: d.dayLabel,
      balance: toNum(d.balance),
    }));
  }, [cashPredictionQuery.data]);

  const cashFlowSummary = useMemo(() => {
    if (cashPredictionDays.length === 0) return { opening: 0, inflow: 0, outflow: 0, closing: 0 };
    const first = cashPredictionDays[0];
    const last = cashPredictionDays[cashPredictionDays.length - 1];
    const inflow = Math.max(0, toNum(last.balance) - toNum(first.balance));
    const outflow = Math.max(0, toNum(first.balance) - toNum(last.balance));
    return {
      opening: toNum(first.balance),
      inflow: inflow > 0 ? inflow : Math.abs(toNum(last.balance) - toNum(first.balance)),
      outflow: outflow > 0 ? outflow : 0,
      closing: toNum(last.balance),
    };
  }, [cashPredictionDays]);

  // Live room rankings
  const liveRoomRanking = useMemo(() => {
    if (!liveRoomQuery.data) return [];
    return liveRoomQuery.data.map((r) => ({
      rank: r.rank,
      name: r.roomName,
      profit: toNum(r.profit),
      margin: toNum(r.margin),
      trend: (r.trend as 'up' | 'down') || 'up',
    }));
  }, [liveRoomQuery.data]);

  // Product rankings
  const productRanking = useMemo(() => {
    if (!productRankingQuery.data) return [];
    return productRankingQuery.data.map((r) => ({
      rank: r.rank,
      name: r.productName,
      profit: toNum(r.profit),
      margin: toNum(r.margin),
      trend: (r.trend as 'up' | 'down') || 'up',
    }));
  }, [productRankingQuery.data]);

  // Risk data
  const riskItems = useMemo(() => {
    if (!riskListQuery.data?.items) return [];
    return riskListQuery.data.items.map((r) => ({
      id: Number(r.id),
      title: r.title,
      detail: r.description,
      level: r.riskLevel as RiskLevel,
    }));
  }, [riskListQuery.data]);

  const riskCounts = useMemo(() => {
    if (riskItems.length > 0) return countRiskLevels(riskItems);
    if (riskCountsQuery.data) {
      return {
        all: riskCountsQuery.data.all,
        high: riskCountsQuery.data.high,
        mid: riskCountsQuery.data.mid,
        low: riskCountsQuery.data.low,
      };
    }
    return { all: 0, high: 0, mid: 0, low: 0 };
  }, [riskItems, riskCountsQuery.data]);

  const visibleRisks =
    riskFilter === 'all' ? riskItems : riskItems.filter((r) => r.level === riskFilter);

  // Compute deltas from trends (compare last two months for "环比")
  const revenueDelta = useMemo(() => {
    if (trendChartData.length < 2) return undefined;
    const curr = trendChartData[trendChartData.length - 1].revenue;
    const prev = trendChartData[trendChartData.length - 2].revenue;
    if (prev === 0) return undefined;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    return formatDelta({ value: parseFloat(pct.toFixed(1)), unit: '%', period: '环比', good: pct >= 0 });
  }, [trendChartData]);

  const profitDelta = useMemo(() => {
    if (trendChartData.length < 2) return undefined;
    const curr = trendChartData[trendChartData.length - 1].profit;
    const prev = trendChartData[trendChartData.length - 2].profit;
    if (prev === 0) return undefined;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    return formatDelta({ value: parseFloat(pct.toFixed(1)), unit: '%', period: '环比', good: pct >= 0 });
  }, [trendChartData]);

  const netMarginDelta = useMemo(() => {
    if (marginTrendData.length < 2) return undefined;
    const curr = marginTrendData[marginTrendData.length - 1].net;
    const prev = marginTrendData[marginTrendData.length - 2].net;
    const pp = curr - prev;
    return formatDelta({ value: parseFloat(pp.toFixed(1)), unit: 'pp', good: pp >= 0 });
  }, [marginTrendData]);

  const grossMarginDelta = useMemo(() => {
    if (marginTrendData.length < 2) return undefined;
    const curr = marginTrendData[marginTrendData.length - 1].gross;
    const prev = marginTrendData[marginTrendData.length - 2].gross;
    const pp = curr - prev;
    return formatDelta({ value: parseFloat(pp.toFixed(1)), unit: 'pp', good: pp >= 0 });
  }, [marginTrendData]);

  const cashFlowDelta = useMemo(() => {
    if (cashFlowTrendData.length < 2) return undefined;
    const curr = cashFlowTrendData[cashFlowTrendData.length - 1].value;
    const prev = cashFlowTrendData[cashFlowTrendData.length - 2].value;
    if (prev === 0) return undefined;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    return formatDelta({ value: parseFloat(pct.toFixed(1)), unit: '%', period: '环比', good: pct >= 0 });
  }, [cashFlowTrendData]);

  // Cash balance from bank accounts or snapshot
  const cashBalance = useMemo(() => {
    if (bankAccountsQuery.data && bankAccountsQuery.data.length > 0) {
      return bankAccountsQuery.data.reduce((sum, a) => sum + toNum(a.balance), 0);
    }
    if (snapshot) return toNum(snapshot.closingCash);
    return 0;
  }, [bankAccountsQuery.data, snapshot]);

  const cashBalanceDelta = useMemo(() => {
    if (!snapshot) return undefined;
    const closing = toNum(snapshot.closingCash);
    const opening = toNum(snapshot.openingCash);
    if (opening === 0) return undefined;
    const pct = ((closing - opening) / Math.abs(opening)) * 100;
    return formatDelta({ value: parseFloat(pct.toFixed(1)), unit: '%', good: pct >= 0 });
  }, [snapshot]);

  // ─── Loading / Error / Empty state helpers ──────────────────────────

  const periodLoading = periodQuery.isLoading;
  const snapshotLoading = snapshotQuery.isLoading;
  const trendsLoading = trendsQuery.isLoading;
  const waterfallLoading = waterfallQuery.isLoading;
  const cashPredictionLoading = cashPredictionQuery.isLoading;
  const liveRoomLoading = liveRoomQuery.isLoading;
  const productRankingLoading = productRankingQuery.isLoading;
  const riskLoading = riskListQuery.isLoading;

  const mainError =
    periodQuery.error || snapshotQuery.error || trendsQuery.error;

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div>
        <h1 className="page-title">
          经营驾驶舱
          <Tooltip>
            <TooltipTrigger>
              <Info className="inline-block ml-2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help align-middle" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">
              口径：以确认收入为统一口径。数据来源于财务系统，每日 10:30 自动更新。
            </TooltipContent>
          </Tooltip>
        </h1>
        <p className="page-subtitle">
          口径：确认收入{periodQuery.data ? ` · 期间 ${currentPeriodLabel}` : ''} · 数据截至 {new Date().toISOString().slice(0, 10)}
        </p>
      </div>

      {/* ========== Filter Bar ========== */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 bg-muted/30">
          <span className="text-muted-foreground">期间:</span>
          <span className="font-medium text-foreground">
            {periodLoading ? <Skeleton className="inline-block h-4 w-20 align-middle" /> : currentPeriodLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 bg-muted/30">
          <span className="text-muted-foreground">组织:</span>
          <span className="font-medium text-foreground">集团合并</span>
        </div>
      </div>

      {/* ========== Global Error Banner ========== */}
      {mainError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>
            {mainError.message || '无法获取经营数据，请稍后重试。'}
          </AlertDescription>
        </Alert>
      )}

      {/* ========== KPI Cards ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Core KPIs */}
        {snapshotLoading ? (
          <>
            <StatCardSkeleton isPrimary />
            <StatCardSkeleton isPrimary />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : snapshot ? (
          <>
            <StatCard
              title="确认收入"
              value={fmtAmount(toNum(snapshot.revenue))}
              delta={revenueDelta}
              variant="primary"
              trend={{
                data: revenueTrendData,
                series: [
                  { key: 'value', color: 'var(--chart-1)', kind: 'area' },
                  { key: 'yoy', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
                ],
                label: '确认收入近12个月趋势，含同比',
              }}
            />
            <StatCard
              title="净利润"
              value={fmtAmount(toNum(snapshot.netProfit))}
              delta={profitDelta}
              variant="primary"
              trend={{
                data: profitTrendData,
                series: [
                  { key: 'value', color: 'var(--chart-1)', kind: 'area' },
                  { key: 'yoy', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
                ],
                label: '净利润近12个月趋势，含同比',
              }}
            />
            <StatCard
              title="净利率"
              value={`${toPct(toNum(snapshot.netMargin)).toFixed(1)}%`}
              delta={netMarginDelta}
              trend={{
                data: marginTrendData,
                series: [
                  { key: 'net', color: 'var(--chart-3)', kind: 'line' },
                  { key: 'gross', color: 'var(--chart-4)', kind: 'line' },
                ],
                label: '净利率与毛利率对比',
              }}
            />
            <StatCard
              title="毛利率"
              value={`${toPct(toNum(snapshot.grossMargin)).toFixed(1)}%`}
              delta={grossMarginDelta}
              trend={{
                data: marginTrendData,
                series: [
                  { key: 'gross', color: 'var(--chart-4)', kind: 'line' },
                  { key: 'bench', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
                ],
                label: '毛利率与基准线对比',
              }}
            />
          </>
        ) : (
          <>
            <StatCardSkeleton isPrimary />
            <StatCardSkeleton isPrimary />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        )}

        {/* Row 2: Secondary + Risk cards */}
        {snapshotLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : snapshot ? (
          <>
            <StatCard
              title="经营现金流"
              value={fmtAmount(toNum(snapshot.operatingCashFlow))}
              delta={cashFlowDelta}
              trend={{
                data: cashFlowTrendData,
                series: [{ key: 'value', color: 'var(--chart-3)', kind: 'bar' }],
                label: '近6个月经营现金流',
              }}
            />
            <StatCard
              title="可用现金余额"
              value={fmtAmount(cashBalance)}
              delta={cashBalanceDelta}
              trend={{
                data: cashPredictionDays,
                series: [{ key: 'balance', color: 'var(--chart-1)', kind: 'area' }],
                label: '现金余额及30天预测',
              }}
            />
            <StatCard
              title="逾期应收"
              value={`${toPct(toNum(snapshot.overdueRatio)).toFixed(1)}%`}
              riskLevel="high"
              sub="占应收比例"
              onClick={() => setRiskFilter('high')}
              progress={{ value: Math.min(100, toPct(toNum(snapshot.overdueRatio))), color: 'danger' }}
            />
            <StatCard
              title="未来30天资金预测"
              value={
                cashFlowSummary.outflow > cashFlowSummary.inflow
                  ? fmtAmount(cashFlowSummary.outflow - cashFlowSummary.inflow)
                  : '无资金缺口'
              }
              riskLevel="mid"
              sub={
                cashFlowSummary.outflow > cashFlowSummary.inflow
                  ? `资金缺口 · 保障倍数 ${toNum(snapshot.fundCoverage).toFixed(2)}x`
                  : `资金保障倍数 ${toNum(snapshot.fundCoverage).toFixed(2)}x`
              }
              onClick={() => setRiskFilter('mid')}
              progress={{ value: Math.min(100, toPct(toNum(snapshot.fundCoverage))), color: 'warning' }}
            />
          </>
        ) : (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        )}
      </div>

      {/* ========== Charts Row 1: Trend + Waterfall ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 收入、利润趋势 */}
        {trendsLoading ? (
          <ChartSkeleton height={280} />
        ) : trendChartData.length > 0 ? (
          <Card className="elevation-1 card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>收入、利润趋势</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help inline-block" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[240px]">
                    近12个月确认收入、净利润与净利率变化。数据来源于财务系统月度快照。
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                近12个月确认收入、净利润与净利率变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={trendChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonthLabel}
                    interval={1}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    width={52}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtCompact}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, (dataMax: number) => Math.max(20, Math.ceil(dataMax / 5) * 5)]}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RechartsTooltip content={<TrendTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="确认收入"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="profit"
                    name="净利润"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    name="净利率"
                    stroke="var(--chart-3)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--chart-3)' }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>收入、利润趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                暂无趋势数据，请先完成月度财务快照数据录入。
              </p>
            </CardContent>
          </Card>
        )}

        {/* 利润结构瀑布 */}
        {waterfallLoading ? (
          <ChartSkeleton height={280} />
        ) : waterfallBars.length > 0 ? (
          <Card className="elevation-1 card-hover">
            <CardHeader>
              <CardTitle>利润结构瀑布</CardTitle>
              <CardDescription>
                从确认收入至净利润的各环节拆解（单位：万元）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={waterfallBars}
                  margin={{ top: 12, right: 4, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    angle={-28}
                    textAnchor="end"
                    height={56}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    width={52}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtCompact}
                  />
                  <RechartsTooltip content={<WaterfallTooltip />} />
                  <Bar dataKey="height" radius={[4, 4, 0, 0]}>
                    {waterfallBars.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.color}
                        fillOpacity={entry.value < 0 ? 0.82 : 1}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v) => {
                        const num = Number(v ?? 0);
                        return `${num >= 0 ? '+' : ''}${fmtCompact(num)}`;
                      }}
                      style={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>利润结构瀑布</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                暂无利润结构数据，请先完成利润明细数据录入。
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========== Charts Row 2: Cash + Rankings ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 现金余额及30天预测 */}
        {cashPredictionLoading ? (
          <ChartSkeleton height={260} />
        ) : cashPredictionDays.length > 0 ? (
          <Card className="elevation-1 card-hover">
            <CardHeader>
              <CardTitle>现金余额及30天预测</CardTitle>
              <CardDescription>
                期初{fmtAmount(cashFlowSummary.opening)} · 流入{fmtAmount(cashFlowSummary.inflow)} · 流出{fmtAmount(cashFlowSummary.outflow)} · 期末{fmtAmount(cashFlowSummary.closing)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={cashPredictionDays}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    width={56}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtCompact}
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip content={<CashTooltip />} />
                  <ReferenceLine
                    y={6_000_000}
                    stroke="var(--danger)"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    ifOverflow="discard"
                    label={{
                      value: '安全线 ¥600万',
                      position: 'insideBottomRight',
                      fontSize: 11,
                      fill: 'var(--danger)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="现金余额"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>现金余额及30天预测</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                暂无现金流预测数据，请先完成现金流预测数据录入。
              </p>
            </CardContent>
          </Card>
        )}

        {/* 直播间利润排行 + 产品利润排行 */}
        <div className="space-y-4">
          {liveRoomLoading ? (
            <RankingSkeleton />
          ) : liveRoomRanking.length > 0 ? (
            <Card className="elevation-1 card-hover">
              <CardHeader>
                <CardTitle>直播间利润排行</CardTitle>
              </CardHeader>
              <CardContent>
                {liveRoomRanking.map((item) => (
                  <RankingRow key={item.rank} {...item} />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="elevation-1">
              <CardHeader>
                <CardTitle>直播间利润排行</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-4 text-center">
                  暂无排行数据
                </p>
              </CardContent>
            </Card>
          )}

          {productRankingLoading ? (
            <RankingSkeleton />
          ) : productRanking.length > 0 ? (
            <Card className="elevation-1 card-hover">
              <CardHeader>
                <CardTitle>产品利润排行</CardTitle>
              </CardHeader>
              <CardContent>
                {productRanking.map((item) => (
                  <RankingRow key={item.rank} {...item} />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="elevation-1">
              <CardHeader>
                <CardTitle>产品利润排行</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-4 text-center">
                  暂无排行数据
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ========== Risk List ========== */}
      {/* 风险等级筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'high', 'mid', 'low'] as const).map((lv) => {
          const active = riskFilter === lv;
          const meta = lv === 'all' ? null : RISK_LEVELS[lv];
          const count = riskCounts[lv];
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setRiskFilter(lv)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {meta && <span className={cn('risk-dot', meta.dot)} />}
              <span>{lv === 'all' ? '全部' : meta!.short}</span>
              <span className="tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {riskLoading ? (
        <Card className="elevation-1">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 rounded-lg border p-3">
                <Skeleton className="h-3 w-3 mt-1.5 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="elevation-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>经营风险 / 异常 Top {riskItems.length}</CardTitle>
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  {visibleRisks.length}项
                </Badge>
              </div>
              <button
                className="inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline transition-colors"
                onClick={() => setRiskFilter('all')}
              >
                查看风险明细
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {visibleRisks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                暂无{riskFilter === 'all' ? '' : RISK_LEVELS[riskFilter].label}风险记录
              </p>
            ) : (
              <div className="space-y-3">
                {visibleRisks.map((item) => {
                  const meta = RISK_LEVELS[item.level];

                  return (
                    <div
                      key={item.id}
                      className={cn('flex gap-3 rounded-lg border p-3', meta.surface)}
                    >
                      <span className={cn('risk-dot mt-1.5', meta.dot)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {item.title}
                          </span>
                          <span className={cn('risk-badge', meta.badge)}>{meta.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
