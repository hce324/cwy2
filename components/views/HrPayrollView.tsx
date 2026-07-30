'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { HrPageHeader, HrMetricCard, HrProgress, HrAiPanel } from './hr-ui';
import {
  hrPayroll,
  hrPayrollTotal,
  hrAvgSalaryWeighted,
  hrActiveCount,
  hrCostRevenueRatio,
} from '@/lib/hr-data';

const DEPT_CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-2)',
];

function HrTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-lg min-w-[150px]">
      {label != null && (
        <p className="mb-1 font-medium text-foreground border-b border-border pb-1">{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 tabular-nums">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-foreground text-right">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const payrollStructure = [
  { name: '基本工资', pct: 60, color: 'var(--chart-1)' },
  { name: '绩效工资', pct: 25, color: 'var(--chart-3)' },
  { name: '补贴与津贴', pct: 10, color: 'var(--chart-4)' },
  { name: '社保公积金', pct: 5, color: 'var(--chart-5)' },
];

const payrollChanges = [
  '技术部2人转正调薪（+¥3,000/月）',
  '产品部1人晋升调薪（+¥5,000/月）',
  '市场部1人离职停薪（-¥15,000/月）',
  '销售部季度绩效奖金发放（总额¥86,000）',
  '全员年度公积金基数调整（7月起生效）',
];

export function HrPayrollView() {
  const topDept = [...hrPayroll].sort((a, b) => b.avgSalary - a.avgSalary)[0];
  const rows = hrPayroll.map((d, i) => ({
    dept: d.dept,
    headcount: d.headcount,
    avg: d.avgSalary,
    total: d.avgSalary * d.headcount,
    color: DEPT_CHART_COLORS[i % DEPT_CHART_COLORS.length],
  }));

  const chartData = rows.map((r) => ({ name: r.dept, value: r.total, color: r.color }));

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="薪酬管理"
        subtitle="2026年7月 · 匿名统计"
        description={`月度总额¥${(hrPayrollTotal / 10000).toFixed(2)}万 · 人均月薪¥${(hrAvgSalaryWeighted / 10000).toFixed(2)}万 · 在职${hrActiveCount}人`}
      />

      {/* KPI */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <HrMetricCard label="薪酬总额" value={`¥${(hrPayrollTotal / 10000).toFixed(2)}万`} trend="+3.2%" trendUp color="var(--chart-1)" />
        <HrMetricCard label="人均月薪" value={`¥${(hrAvgSalaryWeighted / 10000).toFixed(2)}万`} trend="+1.8%" trendUp color="var(--chart-3)" />
        <HrMetricCard label="最高部门" value={topDept.dept} sub={`¥${(topDept.avgSalary / 10000).toFixed(2)}万`} color="var(--chart-5)" />
        <HrMetricCard label="薪酬人数" value={`${hrActiveCount}人`} color="var(--chart-3)" />
        <HrMetricCard label="人力成本营收比" value={`${hrCostRevenueRatio}%`} sub="薪酬年化÷营收" color="var(--chart-2)" />
      </div>

      {/* 对比图 */}
      <Card className="elevation-1 card-hover mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>各部门薪酬对比</CardTitle>
          <CardDescription>各部门月度薪酬总额（元）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <RechartsTooltip content={<HrTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="value" name="部门总额" radius={[4, 4, 0, 0]} barSize={28}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 明细表 */}
      <Card className="elevation-1 card-hover mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>部门薪酬明细</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">部门</th>
                <th className="px-4 py-2 font-medium text-right">人数</th>
                <th className="px-4 py-2 font-medium text-right">人均月薪</th>
                <th className="px-4 py-2 font-medium text-right">部门总额</th>
                <th className="px-4 py-2 font-medium">占比</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = (r.total / hrPayrollTotal) * 100;
                return (
                  <tr key={r.dept} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-foreground">{r.dept}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.headcount}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">¥{(r.avg / 10000).toFixed(2)}万</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums text-foreground">¥{(r.total / 10000).toFixed(1)}万</td>
                    <td className="px-4 py-2 w-48">
                      <HrProgress value={pct} color={r.color} />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-muted/60">
                <td className="px-4 py-2 font-semibold text-[--chart-1]">合计</td>
                <td className="px-4 py-2 text-right tabular-nums text-[--chart-1]">{hrActiveCount}</td>
                <td className="px-4 py-2 text-right font-mono text-muted-foreground">—</td>
                <td className="px-4 py-2 text-right font-mono font-bold tabular-nums text-[--chart-1]">¥{(hrPayrollTotal / 10000).toFixed(1)}万</td>
                <td className="px-4 py-2" />
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 结构与变动 */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle>薪酬结构</CardTitle>
            <CardDescription>月度薪酬构成占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payrollStructure.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{s.name}</span>
                    <span className="tabular-nums text-muted-foreground">{s.pct}%</span>
                  </div>
                  <HrProgress value={s.pct} color={s.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle>本月薪酬变动</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {payrollChanges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <HrAiPanel viewId="hr-payroll" className="mx-auto w-full max-w-[1100px]" />
    </div>
  );
}
