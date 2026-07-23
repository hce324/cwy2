'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
// Inline Data
// ============================================================================

/** Department budget execution */
const departmentBudgetData = [
  {
    id: 1,
    name: '市场部',
    annualBudget: 480.0,
    used: 312.56,
    reserved: 28.4,
    remaining: 139.04,
    executionRate: 65.1,
  },
  {
    id: 2,
    name: '技术部',
    annualBudget: 350.0,
    used: 212.3,
    reserved: 15.6,
    remaining: 122.1,
    executionRate: 60.7,
  },
  {
    id: 3,
    name: '仓储物流部',
    annualBudget: 220.0,
    used: 98.45,
    reserved: 8.12,
    remaining: 113.43,
    executionRate: 44.8,
  },
  {
    id: 4,
    name: '人力资源部',
    annualBudget: 130.0,
    used: 58.37,
    reserved: 4.3,
    remaining: 67.33,
    executionRate: 44.9,
  },
  {
    id: 5,
    name: '财务部',
    annualBudget: 100.0,
    used: 43.0,
    reserved: 2.0,
    remaining: 55.0,
    executionRate: 43.0,
  },
];

/** Expense structure pie */
const expenseStructureData = [
  { name: '市场推广', value: 36, color: 'var(--chart-1)' },
  { name: '仓储物流', value: 28, color: 'var(--chart-2)' },
  { name: '人员费用', value: 21, color: 'var(--chart-3)' },
  { name: '其他', value: 15, color: 'var(--chart-4)' },
];

/** Expense MoM comparison bar */
const expenseMoMData = [
  { category: '市场推广', 本月: 187.5, 上月: 178.3 },
  { category: '仓储物流', 本月: 145.8, 上月: 140.2 },
  { category: '人员费用', 本月: 109.4, 上月: 108.1 },
  { category: '信息技术', 本月: 85.7, 上月: 65.0 },
  { category: '办公费用', 本月: 52.3, 上月: 50.8 },
  { category: '其他费用', 本月: 38.9, 上月: 40.5 },
];

/** Cost structure by accounting subject */
const costSubjectData = [
  { name: '销售费用', value: 412.8, color: 'var(--chart-1)' },
  { name: '管理费用', value: 178.5, color: 'var(--chart-2)' },
  { name: '研发费用', value: 98.2, color: 'var(--chart-3)' },
  { name: '财务费用', value: 22.6, color: 'var(--chart-4)' },
  { name: '税金', value: 12.57, color: 'var(--chart-5)' },
];

/** Over-budget detail */
const overBudgetData = [
  {
    id: 1,
    department: '技术部',
    subject: '信息技术服务费',
    annualBudget: 85.0,
    actual: 78.2,
    reserved: 12.0,
    overspendRate: 6.1,
  },
  {
    id: 2,
    department: '市场部',
    subject: '线上推广投放',
    annualBudget: 200.0,
    actual: 185.6,
    reserved: 35.0,
    overspendRate: 10.3,
  },
  {
    id: 3,
    department: '仓储物流部',
    subject: '第三方物流费',
    annualBudget: 120.0,
    actual: 98.4,
    reserved: 28.0,
    overspendRate: 5.3,
  },
];

// ============================================================================
// Stat display values
// ============================================================================

const summaryStats = {
  annualBudget: 1280.0,
  totalUsed: 724.68,
  totalReserved: 58.42,
  overallRate: 56.6,
};

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
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
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
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
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
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
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
            执行率整体正常，但信息技术费用环比大幅增长31.8%需关注。
          </p>
        </div>
      </div>

      {/* ========== 4 Stat Cards ========== */}
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

      {/* ========== Department Budget Execution Table ========== */}
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
                {departmentBudgetData.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 align-middle font-medium text-foreground whitespace-nowrap">
                      {dept.name}
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

      {/* ========== Charts Row 1: Expense Structure Pie + MoM Bar ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 费用结构饼图 */}
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

        {/* 各费用环比趋势 */}
        <Card className="elevation-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>各费用环比趋势</CardTitle>
              <Badge variant="secondary">
                {/* IT cost increase */}
                <TrendingUp className="h-3 w-3 mr-0.5 text-warning" />
                IT +31.8%
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
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
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
      </div>

      {/* ========== Charts Row 2: Cost Subject Pie + Over-budget Table ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 成本费用结构按会计科目 */}
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

        {/* 超预算明细表 */}
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
                    const overPercent = ((total - item.annualBudget) / item.annualBudget) * 100;

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
                          sum +
                          (item.actual + item.reserved - item.annualBudget),
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
      </div>
    </div>
  );
}
