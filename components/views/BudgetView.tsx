'use client';

import { useMemo } from 'react';
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
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Upload,
  Lightbulb,
} from 'lucide-react';

// ============================================================================
// Mock MoM data — no tRPC endpoint provides historical month-over-month data
// ============================================================================

const expenseMoMData = [
  { category: '市场推广', 本月: 187.5, 上月: 178.3 },
  { category: '仓储物流', 本月: 145.8, 上月: 140.2 },
  { category: '人员费用', 本月: 109.4, 上月: 108.1 },
  { category: '信息技术', 本月: 85.7, 上月: 65.0 },
  { category: '办公费用', 本月: 52.3, 上月: 50.8 },
  { category: '其他费用', 本月: 38.9, 上月: 40.5 },
];

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

function fmtPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

function fmtRate(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

// ============================================================================
// Custom Tooltips
// ============================================================================

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p style={{ color: entry.payload.color }}>
        占比: {entry.value}%
      </p>
    </div>
  );
}

function MomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: ¥{Number(entry.value).toFixed(2)}万
        </p>
      ))}
    </div>
  );
}

function CostSubjectTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p style={{ color: entry.payload.color }}>
        ¥{Number(entry.value).toFixed(2)}万
      </p>
    </div>
  );
}

// ============================================================================
// Sub-components
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
  tone?: 'up' | 'down' | 'warning' | 'danger' | 'neutral';
}) {
  const toneStyles: Record<string, string> = {
    up: 'text-success',
    down: 'text-danger',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className="elevation-1 ripple-container">
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

function ProgressBar({
  value,
  maxValue,
  widthClass = 'w-24',
}: {
  value: number;
  maxValue: number;
  widthClass?: string;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const isWarning = pct >= 60;
  const isDanger = pct >= 80;

  return (
    <div className={`${widthClass} h-2 rounded-full bg-muted overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all ${
          isDanger
            ? 'bg-danger'
            : isWarning
              ? 'bg-warning'
              : 'bg-chart-1'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function BudgetView() {
  // ─── Queries ───────────────────────────────────────────────────────

  const executionQuery = trpc.budget.execution.useQuery({ fiscalPeriodId: 1 });
  const alertsQuery = trpc.budget.alerts.useQuery({ fiscalPeriodId: 1 });

  const executionData = executionQuery.data ?? [];
  const alertsData = alertsQuery.data ?? [];

  const isExecLoading = executionQuery.isLoading;
  const isAlertsLoading = alertsQuery.isLoading;
  const isExecError = executionQuery.isError;
  const isAlertsError = alertsQuery.isError;
  const execErrorMsg = executionQuery.error?.message;
  const alertsErrorMsg = alertsQuery.error?.message;

  // ─── Derived: department-level aggregation ─────────────────────────

  const departmentAgg = useMemo(() => {
    const map = new Map<string, { annualBudget: number; used: number; variance: number }>();
    for (const item of executionData) {
      const existing = map.get(item.departmentName) ?? { annualBudget: 0, used: 0, variance: 0 };
      existing.annualBudget += item.budgetedAmount;
      existing.used += item.actualAmount;
      existing.variance += item.variance;
      map.set(item.departmentName, existing);
    }
    return Array.from(map.entries()).map(([name, data]) => ({
      departmentName: name,
      annualBudget: Math.round(data.annualBudget * 100) / 100,
      used: Math.round(data.used * 100) / 100,
      reserved: 0, // reservedAmount not included in execution query output
      remaining: Math.round(data.variance * 100) / 100,
      executionRate: data.annualBudget > 0 ? (data.used / data.annualBudget) * 100 : 0,
    }));
  }, [executionData]);

  // ─── Derived: stat cards ───────────────────────────────────────────

  const summaryStats = useMemo(() => {
    const annualBudget = executionData.reduce((s, e) => s + e.budgetedAmount, 0);
    const totalUsed = executionData.reduce((s, e) => s + e.actualAmount, 0);
    return {
      annualBudget: Math.round(annualBudget * 100) / 100,
      totalUsed: Math.round(totalUsed * 100) / 100,
      totalReserved: 0, // not available from execution query
      overallRate: annualBudget > 0 ? (totalUsed / annualBudget) * 100 : 0,
    };
  }, [executionData]);

  // ─── Derived: expense structure pie (by budgetCategory %) ──────────

  const expenseStructureData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of executionData) {
      map.set(item.budgetCategory, (map.get(item.budgetCategory) ?? 0) + item.actualAmount);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    const chartColors = [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
    ];
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100 * 10) / 10 : 0,
      color: chartColors[i % chartColors.length],
    }));
  }, [executionData]);

  // ─── Derived: cost subject pie (by budgetCategory, absolute) ───────

  const costSubjectData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of executionData) {
      map.set(item.budgetCategory, (map.get(item.budgetCategory) ?? 0) + item.actualAmount);
    }
    const chartColors = [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
    ];
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: chartColors[i % chartColors.length],
    }));
  }, [executionData]);

  // ─── Derived: over-budget from alerts query ────────────────────────

  const overBudgetData = useMemo(() => {
    return alertsData.map((item, i) => ({
      id: i + 1,
      department: item.departmentName,
      subject: item.budgetCategory,
      annualBudget: item.budgetedAmount,
      actual: item.actualAmount,
      reserved: 0, // alerts query doesn't include reserved
      overspendRate: item.budgetedAmount > 0
        ? (item.overspend / item.budgetedAmount) * 100
        : 0,
    }));
  }, [alertsData]);

  // ─── IT cost increase detection for MoM badge ──────────────────────

  const itMomIncrease = useMemo(() => {
    const itData = expenseMoMData.find((d) => d.category === '信息技术');
    if (!itData || itData.上月 === 0) return 0;
    return ((itData.本月 - itData.上月) / itData.上月) * 100;
  }, []);

  // ─── Global loading / error state ──────────────────────────────────

  const isLoading = isExecLoading || isAlertsLoading;
  const isError = (!isExecLoading && isExecError) || (!isAlertsLoading && isAlertsError);
  const errorMsg = execErrorMsg || alertsErrorMsg || '数据加载失败';

  // ─── Render helpers ────────────────────────────────────────────────

  const renderSkeletonCards = (count: number) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="elevation-1">
          <CardHeader className="pb-1">
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-36 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSkeletonTable = (rows: number = 5) => (
    <Card className="elevation-1">
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeletonChart = (title: string) => (
    <Card className="elevation-1">
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );

  // ─── Empty state ───────────────────────────────────────────────────

  const isEmpty = !isLoading && !isError && executionData.length === 0;

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            预算与费用{' '}
            <span className="text-sm font-normal text-muted-foreground font-sans">
              · 预算执行分析
            </span>
          </h1>
          <p className="page-subtitle">
            追踪部门预算的使用、占用与异常变化。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors ripple-container">
            <FileText className="h-4 w-4 text-muted-foreground" />
            预算调整记录
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity ripple-container">
            <Upload className="h-4 w-4" />
            录入年度预算
          </button>
        </div>
      </div>

      {/* ========== AI Diagnosis Banner ========== */}
      {!isLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 p-4">
          <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI 诊断
              <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5 bg-warning/20 text-warning">
                需关注
              </Badge>
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              执行率整体正常，但信息技术费用环比大幅增长{itMomIncrease.toFixed(1)}%需关注。
            </p>
          </div>
        </div>
      )}

      {/* ========== 4 Stat Cards ========== */}
      {isLoading ? (
        renderSkeletonCards(4)
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : isEmpty ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无预算执行数据，请先录入年度预算
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="年度总预算"
            value={`¥${summaryStats.annualBudget.toFixed(2)}万`}
            sub="集团合并口径"
            tone="neutral"
          />
          <StatCard
            title="累计已使用"
            value={`¥${summaryStats.totalUsed.toFixed(2)}万`}
            sub="含已入账及预提"
            tone="neutral"
          />
          <StatCard
            title="审批中占用"
            value={`¥${summaryStats.totalReserved.toFixed(2)}万`}
            sub="未入账已锁定额度"
            tone="warning"
          />
          <StatCard
            title="总体执行率"
            value={`${summaryStats.overallRate.toFixed(1)}%`}
            sub="年度已过半 · 正常区间"
            tone="up"
          />
        </div>
      )}

      {/* ========== Department Budget Execution Table ========== */}
      {isLoading ? (
        renderSkeletonTable()
      ) : isExecError ? (
        <Card className="elevation-1">
          <CardContent className="py-8">
            <Alert variant="destructive">
              <AlertTitle>执行数据加载失败</AlertTitle>
              <AlertDescription>{execErrorMsg || '无法获取预算执行数据'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : departmentAgg.length === 0 ? (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>部门预算执行</CardTitle>
            <CardDescription>各部门年度预算使用、占用及剩余情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无部门预算数据
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>部门预算执行</CardTitle>
            <CardDescription>
              各部门年度预算使用、占用及剩余情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="h-10 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap">
                      部门
                    </th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                      年度预算
                    </th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                      已使用
                    </th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                      审批中占用
                    </th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                      剩余可用
                    </th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                      执行率
                    </th>
                    <th className="h-10 px-3 text-center align-middle font-medium text-foreground whitespace-nowrap w-40">
                      进度
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentAgg.map((dept) => (
                    <tr
                      key={dept.departmentName}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 align-middle font-medium text-foreground whitespace-nowrap">
                        {dept.departmentName}
                      </td>
                      <td className="p-3 align-middle text-right text-foreground tabular-nums whitespace-nowrap">
                        ¥{dept.annualBudget.toFixed(2)}万
                      </td>
                      <td className="p-3 align-middle text-right text-foreground tabular-nums whitespace-nowrap">
                        ¥{dept.used.toFixed(2)}万
                      </td>
                      <td className="p-3 align-middle text-right text-warning tabular-nums whitespace-nowrap">
                        ¥{dept.reserved.toFixed(2)}万
                      </td>
                      <td className="p-3 align-middle text-right text-muted-foreground tabular-nums whitespace-nowrap">
                        ¥{dept.remaining.toFixed(2)}万
                      </td>
                      <td className="p-3 align-middle text-right font-semibold tabular-nums whitespace-nowrap">
                        {dept.executionRate.toFixed(1)}%
                      </td>
                      <td className="p-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={dept.used + dept.reserved}
                            maxValue={dept.annualBudget}
                            widthClass="w-28"
                          />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {dept.executionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== Charts Row 1: Expense Structure Pie + MoM Bar ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 费用结构饼图 */}
        {isLoading ? (
          renderSkeletonChart('费用结构')
        ) : expenseStructureData.length === 0 ? (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>费用结构</CardTitle>
              <CardDescription>各类费用占总支出的比例分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-sm text-muted-foreground">
                暂无费用数据
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>费用结构</CardTitle>
              <CardDescription>
                各类费用占总支出的比例分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <Pie
                    data={expenseStructureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {expenseStructureData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value: string) => (
                      <span className="text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 各费用环比趋势 */}
        {isLoading ? (
          renderSkeletonChart('各费用环比趋势')
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>各费用环比趋势</CardTitle>
                <Badge variant="secondary">
                  <TrendingUp className="h-3 w-3 mr-0.5 text-warning" />
                  IT +{itMomIncrease.toFixed(1)}%
                </Badge>
              </div>
              <CardDescription>
                本月 vs 上月各项费用支出对比（单位：万元）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={expenseMoMData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
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
                  <Tooltip content={<MomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="本月"
                    name="本月"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="上月"
                    name="上月"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========== Charts Row 2: Cost Subject Pie + Over-budget Table ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 成本费用结构按会计科目 */}
        {isLoading ? (
          renderSkeletonChart('成本费用结构按会计科目')
        ) : costSubjectData.length === 0 ? (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>成本费用结构按会计科目</CardTitle>
              <CardDescription>按会计科目归集的成本费用构成（单位：万元）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-sm text-muted-foreground">
                暂无会计科目数据
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>成本费用结构按会计科目</CardTitle>
              <CardDescription>
                按会计科目归集的成本费用构成（单位：万元）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <Pie
                    data={costSubjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {costSubjectData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CostSubjectTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value: string) => (
                      <span className="text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 超预算明细表 */}
        {isLoading ? (
          renderSkeletonTable(3)
        ) : isAlertsError ? (
          <Card className="elevation-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>超预算明细</CardTitle>
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  0项
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>预警数据加载失败</AlertTitle>
                <AlertDescription>{alertsErrorMsg || '无法获取超预算预警数据'}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : overBudgetData.length === 0 ? (
          <Card className="elevation-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>超预算明细</CardTitle>
                <Badge variant="secondary" className="text-success">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  0项
                </Badge>
              </div>
              <CardDescription>
                暂无超预算科目，所有部门预算执行均处于正常范围
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-sm text-muted-foreground">
                暂无超预算预警
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="elevation-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>超预算明细</CardTitle>
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  {overBudgetData.length}项
                </Badge>
              </div>
              <CardDescription>
                已使用+审批中占用超过年度预算的异常科目
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="h-10 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap">
                        部门
                      </th>
                      <th className="h-10 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap">
                        科目
                      </th>
                      <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                        年度预算
                      </th>
                      <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                        实际已用
                      </th>
                      <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                        审批中
                      </th>
                      <th className="h-10 px-3 text-right align-middle font-medium text-foreground whitespace-nowrap">
                        超支率
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overBudgetData.map((item) => {
                      const total = item.actual + item.reserved;
                      const overPercent = item.annualBudget > 0
                        ? ((total - item.annualBudget) / item.annualBudget) * 100
                        : 0;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 align-middle font-medium text-foreground whitespace-nowrap">
                            {item.department}
                          </td>
                          <td className="p-3 align-middle text-foreground whitespace-nowrap">
                            {item.subject}
                          </td>
                          <td className="p-3 align-middle text-right text-muted-foreground tabular-nums whitespace-nowrap">
                            ¥{item.annualBudget.toFixed(2)}万
                          </td>
                          <td className="p-3 align-middle text-right text-foreground tabular-nums whitespace-nowrap">
                            ¥{item.actual.toFixed(2)}万
                          </td>
                          <td className="p-3 align-middle text-right text-warning tabular-nums whitespace-nowrap">
                            ¥{item.reserved.toFixed(2)}万
                          </td>
                          <td className="p-3 align-middle text-right tabular-nums whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-semibold text-danger">
                              <TrendingUp className="h-3 w-3" />
                              {fmtRate(overPercent)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary footer */}
              <div className="mt-4 rounded-lg border border-danger/20 bg-danger/8 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      异常提示
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      共 {overBudgetData.length} 个科目出现超预算情况，涉及总超支金额
                      ¥
                      {overBudgetData
                        .reduce(
                          (sum, item) =>
                            sum + (item.actual + item.reserved - item.annualBudget),
                          0
                        )
                        .toFixed(2)}
                      万。建议尽快启动预算调整流程，或冻结相关科目审批。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
