'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  revenueTrend,
  profitTrend,
  marginTrend,
  cashFlowTrend,
  overdueRatio,
  fundCoverage,
} from '@/lib/kpi-mock';
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
  ShieldAlert,
  Info,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// Inline Data
// ============================================================================

const trendData = [
  { month: '2025.08', revenue: 1024.8, profit: 165.2, margin: 16.1 },
  { month: '2025.09', revenue: 1078.3, profit: 175.6, margin: 16.3 },
  { month: '2025.10', revenue: 1123.5, profit: 182.4, margin: 16.2 },
  { month: '2025.11', revenue: 1156.7, profit: 188.9, margin: 16.3 },
  { month: '2025.12', revenue: 1201.3, profit: 195.1, margin: 16.2 },
  { month: '2026.01', revenue: 1187.6, profit: 192.8, margin: 16.2 },
  { month: '2026.02', revenue: 1098.2, profit: 178.5, margin: 16.3 },
  { month: '2026.03', revenue: 1145.9, profit: 188.1, margin: 16.4 },
  { month: '2026.04', revenue: 1198.4, profit: 198.7, margin: 16.6 },
  { month: '2026.05', revenue: 1234.1, profit: 207.3, margin: 16.8 },
  { month: '2026.06', revenue: 1268.0, profit: 214.7, margin: 16.9 },
  { month: '2026.07', revenue: 1268.0, profit: 214.7, margin: 16.9 },
];

const waterfallData = [
  { key: '确认收入', label: '确认收入', value: 1268, fill: true, color: 'var(--chart-1)' },
  { key: '商品成本', label: '商品成本', value: -761, fill: true, color: 'var(--chart-5)' },
  { key: '平台佣金', label: '平台佣金', value: -92, fill: true, color: 'var(--chart-5)' },
  { key: '投流营销', label: '投流营销', value: -76, fill: true, color: 'var(--chart-5)' },
  { key: '物流售后', label: '物流售后', value: -38, fill: true, color: 'var(--chart-5)' },
  { key: '净利润', label: '净利润', value: 215, fill: true, color: 'var(--chart-3)' },
];

// Build bottom-aligned bars: all bars rise from y=0, height = abs(value)
interface WaterfallBar {
  key: string;
  label: string;
  value: number;
  base: number;
  height: number;
  color: string;
}

const waterfallBars: WaterfallBar[] = waterfallData.map((item) => ({
  key: item.key,
  label: item.label,
  value: item.value,
  base: 0,
  height: Math.abs(item.value),
  color: item.color,
}));

const cashPredictionDays = [
  { label: '期初', balance: 788.30 },
  { label: 'D+5', balance: 832.50 },
  { label: 'D+10', balance: 876.80 },
  { label: 'D+15', balance: 905.20 },
  { label: 'D+20', balance: 882.40 },
  { label: 'D+25', balance: 858.60 },
  { label: 'D+27', balance: 850.10 },
  { label: '期末', balance: 842.66 },
];

const cashFlowSummary = {
  opening: 788.30,
  inflow: 428.60,
  outflow: 374.24,
  closing: 842.66,
};

const liveRoomRanking = [
  { rank: 1, name: '美妆精选直播间', profit: 89.52, margin: 32.1, trend: 'up' as const },
  { rank: 2, name: '服饰穿搭直播间', profit: 62.18, margin: 28.7, trend: 'up' as const },
  { rank: 3, name: '食品好物直播间', profit: 35.66, margin: 22.4, trend: 'down' as const },
];

const productRanking = [
  { rank: 1, name: '精华液套装（焕白系列）', profit: 52.38, margin: 45.2, trend: 'up' as const },
  { rank: 2, name: '轻奢风衣（春秋款）', profit: 38.91, margin: 38.6, trend: 'up' as const },
  { rank: 3, name: '坚果混合礼盒', profit: 18.74, margin: 26.3, trend: 'down' as const },
];

const riskItems = [
  {
    id: 1,
    title: '逾期应收占比过高',
    detail: '当前逾期应收¥161.43万，占应收总额42.0%，其中超90天逾期¥62.8万，存在坏账风险。',
    level: 'high' as const,
  },
  {
    id: 2,
    title: '未来30天流动性缺口',
    detail: '预测期末现金余额¥842.66万，但30天内需支付供应商结算款¥884.66万，存在¥42万缺口。',
    level: 'high' as const,
  },
  {
    id: 3,
    title: '毛利率持续下滑',
    detail: '毛利率从去年同期41.8%降至40.0%，降幅1.8个百分点，主要受平台佣金率上调及物流成本上升影响。',
    level: 'mid' as const,
  },
  {
    id: 4,
    title: '食品好物直播间利润下滑',
    detail: '该直播间净利润环比下降8.3%，主因投流ROI从2.6降至1.9，需关注投放策略调整。',
    level: 'mid' as const,
  },
  {
    id: 5,
    title: '坚果混合礼盒库存周转放缓',
    detail: '库存周转天数从32天升至48天，季节性产品面临过季滞销风险，建议限时促销去库存。',
    level: 'low' as const,
  },
];

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

// ============================================================================
// Custom Tooltips
// ============================================================================

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-lg min-w-[170px]">
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
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{bar.label}</p>
      <p className="tabular-nums font-medium" style={{ color: bar.value >= 0 ? 'var(--chart-3)' : 'var(--chart-5)' }}>
        {bar.value >= 0 ? '+' : ''}{bar.value.toFixed(0)}万
      </p>
    </div>
  );
}

function CashTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-3 tabular-nums">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-foreground text-right">
            ¥{Number(entry.value).toFixed(2)}万
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ============================================================================
// KPI Trend — inline sparkline (ComposedChart-driven, no new component file)
// Supports area / line / bar kinds; all tokens, no gradients (fillOpacity only).
// ============================================================================

type TrendSeries = {
  key: string;
  color: string;
  kind: 'area' | 'line' | 'bar';
  dashed?: boolean;
};

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

  return (
    <div role="img" aria-label={label ?? '趋势迷你图'} className="mt-3 -mb-1">
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
          {series.map((s) => {
            if (s.kind === 'area') {
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={s.color}
                  fillOpacity={0.12}
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
                strokeWidth={2}
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
  tone = 'neutral',
  variant = 'default',
  trend,
  progress,
}: {
  title: string;
  value: string;
  sub: string;
  tone?: 'up' | 'down' | 'warning' | 'danger' | 'neutral';
  variant?: 'default' | 'primary' | 'danger';
  trend?: { data: any[]; series: TrendSeries[]; label?: string };
  progress?: { value: number; color: 'danger' | 'warning' };
}) {
  const toneStyles: Record<string, string> = {
    up: 'text-success',
    down: 'text-danger',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  if (variant === 'danger') {
    return (
      <Card className="elevation-1 kpi-card--danger card-hover">
        <CardHeader className="pb-1">
          <CardDescription>{title}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold font-heading text-foreground tracking-tight tabular-nums">
            {value}
          </p>
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${toneStyles[tone]}`}>
            <AlertTriangle className="h-3 w-3" />
            {sub}
          </p>
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

  const isPrimary = variant === 'primary';
  return (
    <Card className={`elevation-1 card-hover ${isPrimary ? 'border-l-[3px] border-l-[--primary] bg-accent/20' : ''}`}>
      <CardHeader className="pb-1">
        <CardDescription className={!isPrimary ? 'text-xs' : ''}>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`${isPrimary ? 'text-[1.75rem]' : 'text-lg'} font-bold font-heading text-foreground tracking-tight tabular-nums leading-tight`}>
          {value}
        </p>
        <p className={`mt-0.5 ${!isPrimary ? 'text-[11px]' : 'text-xs'} ${toneStyles[tone]}`}>{sub}</p>
        {trend && <KpiTrend data={trend.data} series={trend.series} label={trend.label} />}
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
        ¥{profit.toFixed(2)}万
      </span>
      <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
        {margin.toFixed(1)}%
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
// Month tick formatter: "2025.08" → "25/08"
// ============================================================================
function formatMonthLabel(month: string): string {
  const [y, m] = month.split('.');
  return `${y.slice(2)}/${m}`;
}

// ============================================================================
// Main Component
// ============================================================================

export function OverviewView() {
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
          口径：确认收入 · 数据截至 2026-07-13 10:30
        </p>
      </div>

      {/* ========== Filter Bar ========== */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 bg-muted/30">
          <span className="text-muted-foreground">期间:</span>
          <span className="font-medium text-foreground">2026年7月</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 bg-muted/30">
          <span className="text-muted-foreground">组织:</span>
          <span className="font-medium text-foreground">集团合并</span>
        </div>
      </div>

      {/* ========== KPI Cards — visual hierarchy ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Core KPIs */}
        <StatCard
          title="确认收入"
          value="¥1,268.04万"
          sub="+8.6% 同比"
          tone="up"
          variant="primary"
          trend={{
            data: revenueTrend,
            series: [
              { key: 'value', color: 'var(--chart-1)', kind: 'area' },
              { key: 'yoy', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
            ],
            label: '确认收入近12个月趋势，含同比',
          }}
        />
        <StatCard
          title="净利润"
          value="¥214.68万"
          sub="+12.4% 同比"
          tone="up"
          variant="primary"
          trend={{
            data: profitTrend,
            series: [
              { key: 'value', color: 'var(--chart-1)', kind: 'area' },
              { key: 'yoy', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
            ],
            label: '净利润近12个月趋势，含同比',
          }}
        />
        <StatCard
          title="净利率"
          value="16.9%"
          sub="+0.6pp"
          tone="up"
          trend={{
            data: marginTrend,
            series: [
              { key: 'net', color: 'var(--chart-3)', kind: 'line' },
              { key: 'gross', color: 'var(--chart-4)', kind: 'line' },
            ],
            label: '净利率与毛利率对比',
          }}
        />
        <StatCard
          title="毛利率"
          value="40.0%"
          sub="-1.8pp"
          tone="down"
          trend={{
            data: marginTrend,
            series: [
              { key: 'gross', color: 'var(--chart-4)', kind: 'line' },
              { key: 'bench', color: 'var(--muted-foreground)', kind: 'line', dashed: true },
            ],
            label: '毛利率与基准线对比',
          }}
        />

        {/* Row 2: Secondary + Risk cards */}
        <StatCard
          title="经营现金流"
          value="¥54.36万"
          sub="+18.4% 同比"
          tone="up"
          trend={{
            data: cashFlowTrend,
            series: [{ key: 'value', color: 'var(--chart-3)', kind: 'bar' }],
            label: '近6个月经营现金流',
          }}
        />
        <StatCard
          title="可用现金余额"
          value="¥842.66万"
          sub="+3.2%"
          tone="up"
          trend={{
            data: cashPredictionDays,
            series: [{ key: 'balance', color: 'var(--chart-1)', kind: 'area' }],
            label: '现金余额及30天预测',
          }}
        />
        <StatCard
          title="逾期应收"
          value="¥161.43万"
          sub="42.0% 占应收"
          tone="danger"
          variant="danger"
          progress={{ value: overdueRatio, color: 'danger' }}
        />
        <StatCard
          title="未来30天资金预测"
          value="缺口¥42.00万"
          sub="中风险"
          tone="warning"
          variant="danger"
          progress={{ value: fundCoverage, color: 'warning' }}
        />
      </div>

      {/* ========== Charts Row 1: Trend + Waterfall ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 收入、利润趋势 */}
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>收入、利润趋势</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help inline-block" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[240px]">
                  近12个月确认收入、净利润与净利率变化。净利润同比增长12.4%，经营状况持续改善。
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              近12个月确认收入、净利润与净利率变化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 20]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <RechartsTooltip content={<TrendTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
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

        {/* 利润结构瀑布 */}
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
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <RechartsTooltip content={<WaterfallTooltip />} />
                {/* Bottom-aligned value bar */}
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
                      return `${num >= 0 ? '+' : ''}${num}`;
                    }}
                    style={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ========== Charts Row 2: Cash + Rankings ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 现金余额及30天预测 */}
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle>现金余额及30天预测</CardTitle>
            <CardDescription>
              期初¥{cashFlowSummary.opening.toFixed(2)}万 · 流入¥{cashFlowSummary.inflow.toFixed(2)}万 · 流出¥{cashFlowSummary.outflow.toFixed(2)}万 · 期末¥{cashFlowSummary.closing.toFixed(2)}万
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
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                  domain={[500, 950]}
                />
                <RechartsTooltip content={<CashTooltip />} />
                {/* Safety line at ¥600万 */}
                <ReferenceLine
                  y={600}
                  stroke="var(--danger)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
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

        {/* 直播间利润排行 + 产品利润排行 */}
        <div className="space-y-4">
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
        </div>
      </div>

      {/* ========== Risk List ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>经营风险 / 异常 Top 5</CardTitle>
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-0.5" />
                {riskItems.length}项
              </Badge>
            </div>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline transition-colors">
              查看风险明细
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskItems.map((item) => {
              const levelConfig: Record<string, { badge: string; bg: string; icon: React.ReactNode }> = {
                high: {
                  badge: '高风险',
                  bg: 'bg-danger/8 border-danger/20',
                  icon: <ShieldAlert className="h-4 w-4 text-danger shrink-0 mt-0.5" />,
                },
                mid: {
                  badge: '中风险',
                  bg: 'bg-warning/8 border-warning/20',
                  icon: <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
                },
                low: {
                  badge: '低风险',
                  bg: 'bg-muted border-border',
                  icon: <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />,
                },
              };
              const cfg = levelConfig[item.level];

              return (
                <div
                  key={item.id}
                  className={`flex gap-3 rounded-lg border p-3 ${cfg.bg}`}
                >
                  {cfg.icon}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      <Badge
                        variant={
                          item.level === 'high'
                            ? 'destructive'
                            : item.level === 'mid'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-[10px] h-4 px-1.5"
                      >
                        {cfg.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
