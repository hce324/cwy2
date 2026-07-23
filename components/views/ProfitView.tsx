'use client';

import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
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
// Inline Data
// ============================================================================

const MONTHLY_TREND = [
  { month: '2026.01', revenue: 1102.5, profit: 178.5 },
  { month: '2026.02', revenue: 1098.2, profit: 178.5 },
  { month: '2026.03', revenue: 1145.9, profit: 188.1 },
  { month: '2026.04', revenue: 1198.4, profit: 198.7 },
  { month: '2026.05', revenue: 1234.1, profit: 207.3 },
  { month: '2026.06', revenue: 1268.0, profit: 214.7 },
];

interface DrillItem {
  label: string;
  amount: number;
  pct?: string;
  children?: { label: string; amount: number; pct?: string }[];
}

interface DrillSection {
  title: string;
  total: number;
  items: DrillItem[];
  summary?: string;
}

const DRILL_DATA: DrillSection[] = [
  {
    title: '一、收入构成',
    total: 1268.04,
    summary: '营业收入合计',
    items: [
      {
        label: '商品销售收入',
        amount: 892.5,
        pct: '70.4%',
      },
      {
        label: '平台服务收入',
        amount: 210.3,
        pct: '16.6%',
      },
      {
        label: '广告营销收入',
        amount: 98.24,
        pct: '7.7%',
      },
      {
        label: '其他业务收入',
        amount: 67.0,
        pct: '5.3%',
      },
    ],
  },
  {
    title: '二、成本与费用构成',
    total: 1053.36,
    summary: '营业费用合计',
    items: [
      {
        label: '商品成本',
        amount: 761.04,
        pct: '60.0%',
      },
      {
        label: '平台佣金',
        amount: 92.3,
        pct: '7.3%',
      },
      {
        label: '投流营销费用',
        amount: 76.1,
        pct: '6.0%',
      },
      {
        label: '物流仓储费用',
        amount: 38.24,
        pct: '3.0%',
      },
      {
        label: '人员薪酬',
        amount: 42.8,
        pct: '3.4%',
      },
      {
        label: '研发费用',
        amount: 18.68,
        pct: '1.5%',
      },
      {
        label: '管理费用',
        amount: 16.5,
        pct: '1.3%',
      },
      {
        label: '税费及其他',
        amount: 7.7,
        pct: '0.6%',
      },
    ],
  },
];

const COMPARISON_DATA = [
  {
    metric: '营业收入',
    current: 1268.04,
    unit: '万',
    yoy: { value: 8.6, direction: 'up' as const },
    mom: { value: 2.7, direction: 'up' as const },
  },
  {
    metric: '营业费用',
    current: 1053.36,
    unit: '万',
    yoy: { value: 7.2, direction: 'up' as const },
    mom: { value: 1.9, direction: 'up' as const },
  },
  {
    metric: '净利润',
    current: 214.68,
    unit: '万',
    yoy: { value: 12.4, direction: 'up' as const },
    mom: { value: 3.6, direction: 'up' as const },
  },
  {
    metric: '净利率',
    current: 16.9,
    unit: '%',
    yoy: { value: 0.6, direction: 'up' as const },
    mom: { value: 0.2, direction: 'up' as const },
  },
  {
    metric: '毛利率',
    current: 40.0,
    unit: '%',
    yoy: { value: 1.8, direction: 'down' as const },
    mom: { value: 0.3, direction: 'down' as const },
  },
  {
    metric: '费用率',
    current: 83.1,
    unit: '%',
    yoy: { value: 0.4, direction: 'down' as const },
    mom: { value: 0.1, direction: 'down' as const },
  },
];

// ============================================================================
// Formatting helpers
// ============================================================================

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
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
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
}: {
  title: string;
  value: string;
  sub: string;
  tone?: 'up' | 'down' | 'neutral';
}) {
  const toneStyles: Record<string, string> = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-muted-foreground',
  };

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

  const netProfit = 1268.04 - 1053.36;

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

      {/* ========== 6 Stat Indicators ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="营业收入"
          value="¥1,268.04万"
          sub="+8.6% 同比"
          tone="up"
        />
        <StatCard
          title="营业费用"
          value="¥1,053.36万"
          sub="费用率 83.1%"
          tone="neutral"
        />
        <StatCard
          title="净利润"
          value="¥214.68万"
          sub="+12.4% 同比"
          tone="up"
        />
        <StatCard
          title="净利率"
          value="16.9%"
          sub="+0.6pp 同比"
          tone="up"
        />
        <StatCard
          title="毛利率"
          value="40.0%"
          sub="-1.8pp 同比"
          tone="down"
        />
        <StatCard
          title="费用率"
          value="83.1%"
          sub="-0.4pp 同比"
          tone="down"
        />
      </div>

      {/* ========== Chart: 近6个月收入与利润趋势 ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>近6个月收入与利润趋势</CardTitle>
          <CardDescription>
            2026年1月 - 6月营业收入与净利润月度变化
          </CardDescription>
          <Badge variant="secondary" className="mt-1">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            双增长
          </Badge>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={MONTHLY_TREND}
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
                {COMPARISON_DATA.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.metric}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.unit === '%'
                        ? fmtPct(row.current)
                        : fmtWan(row.current)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <DirectionIcon direction={row.yoy.direction} />
                        <span
                          className={
                            row.yoy.direction === 'up'
                              ? 'text-success'
                              : 'text-danger'
                          }
                        >
                          {fmtChange(row.yoy.value, row.unit === '%' ? 'pp' : undefined)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {row.unit === '%'
                        ? '较去年同期'
                        : '较去年同期'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <DirectionIcon direction={row.mom.direction} />
                        <span
                          className={
                            row.mom.direction === 'up'
                              ? 'text-success'
                              : 'text-danger'
                          }
                        >
                          {fmtChange(row.mom.value, row.unit === '%' ? 'pp' : undefined)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {row.unit === '%'
                        ? '较上月'
                        : '较上月'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== Detailed Income / Cost Table with Drill-down ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>收入与费用明细</CardTitle>
          <CardDescription>
            按收入构成与成本费用逐项拆解，支持展开/收起查看明细
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {DRILL_DATA.map((section, si) => (
                  <>
                    {/* Section header row (clickable) */}
                    <TableRow
                      key={`section-${si}`}
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
                            {item.pct || ((item.amount / section.total) * 100).toFixed(1) + '%'}
                          </TableCell>
                        </TableRow>
                      ))}

                    {/* Section summary row */}
                    <TableRow key={`summary-${si}`} className="border-b-2">
                      <TableCell />
                      <TableCell className="text-sm font-medium text-muted-foreground">
                        {section.summary}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        {fmtWan(section.total)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                ))}

                {/* Net Profit summary row */}
                <TableRow className="bg-accent/30">
                  <TableCell />
                  <TableCell className="font-bold text-foreground">
                    净利润
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-success tabular-nums">
                    {fmtWan(netProfit)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {((netProfit / 1268.04) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
