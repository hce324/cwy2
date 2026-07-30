'use client';

import {
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
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
import {
  HrPageHeader,
  HrMetricCard,
  HrProgress,
  HrTodoItem,
  HrAiPanel,
  HrTooltip,
} from './hr-ui';
import {
  hrDepartments,
  hrAttendance,
  hrPayroll,
  hrActiveCount,
  hrRecruitPositions,
  hrPayrollTotal,
} from '@/lib/hr-data';

// 财务模块图表配色：统一使用 --chart-1..5 调色板
const DEPT_CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-2)',
];

// 自定义 Tooltip（对齐财务模块 TrendTooltip / CashTooltip 风格）
export function HrOverviewView() {
  const payrollPct = (d: { avgSalary: number; headcount: number }) =>
    (d.avgSalary * d.headcount) / hrPayrollTotal * 100;

  const deptDist = hrDepartments.map((d, i) => ({
    name: d.name,
    value: d.headcount,
    color: DEPT_CHART_COLORS[i % DEPT_CHART_COLORS.length],
  }));

  const attendanceTrend = hrAttendance.map((a) => ({
    month: a.month,
    rate: a.rate,
  }));

  const payrollRows = hrPayroll.map((d) => ({
    dept: d.dept,
    total: d.avgSalary * d.headcount,
    pct: payrollPct(d),
    color: DEPT_CHART_COLORS[hrDepartments.findIndex((x) => x.name === d.dept) % DEPT_CHART_COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="HR管理总览"
        subtitle="2026年7月 · 数据更新至今日"
        description={`澜川数字科技有限公司 · 在职${hrActiveCount}人 · ${hrDepartments.length}个部门`}
        maxWidth="max-w-[1280px]"
      />

      {/* KPI 指标 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <HrMetricCard label="在职员工" value={`${hrActiveCount}`} trend="+2.1%" trendUp sub="较上月" color="var(--chart-1)" />
        <HrMetricCard label="本月入职" value="3" trend="+50.0%" trendUp color="var(--chart-3)" />
        <HrMetricCard label="本月离职" value="1" trend="-66.7%" trendUp={false} color="var(--chart-5)" />
        <HrMetricCard label="出勤率" value={`${hrAttendance[hrAttendance.length - 1].rate}%`} trend="+0.5%" trendUp color="var(--chart-3)" />
        <HrMetricCard label="在招岗位" value={`${hrRecruitPositions.length}`} color="var(--chart-4)" />
        <HrMetricCard label="月度薪酬总额" value={`¥${(hrPayrollTotal / 10000).toFixed(2)}万`} trend="+3.2%" trendUp color="var(--chart-1)" />
      </div>

      {/* 可视化 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>部门人员分布</CardTitle>
            <CardDescription>各部门在职人数</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptDist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip content={<HrTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="value" name="在职人数" radius={[4, 4, 0, 0]} barSize={28}>
                  {deptDist.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>月度出勤趋势</CardTitle>
            <CardDescription>上半年月度出勤率（%）</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip content={<HrTooltip />} cursor={{ stroke: 'var(--chart-1)' }} />
                <Area type="monotone" dataKey="rate" name="出勤率" stroke="var(--chart-1)" strokeWidth={2} fill="var(--chart-1)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 薪酬占比 + 待办 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>部门薪酬占比</CardTitle>
            <CardDescription>各部门月度薪酬总额占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payrollRows.map((r) => (
                <div key={r.dept}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{r.dept}</span>
                    <span className="tabular-nums text-muted-foreground">{(r.total / 10000).toFixed(1)}万 · {r.pct.toFixed(1)}%</span>
                  </div>
                  <HrProgress value={r.pct} color={r.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>HR待办事项</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <HrTodoItem color="var(--chart-3)">入职办理：3名新员工待办理入职手续（技术部×2、产品部×1）</HrTodoItem>
              <HrTodoItem color="var(--chart-4)">面试安排：本周5场面试待确认时间（招聘管理中查看详情）</HrTodoItem>
              <HrTodoItem color="var(--chart-5)">绩效评审：Q2绩效考核结果待审批（截至7月25日）</HrTodoItem>
              <HrTodoItem color="var(--chart-1)">考勤核对：6月考勤数据已归档，请核对异常记录</HrTodoItem>
              <HrTodoItem color="var(--chart-2)">薪酬核算：7月薪资数据待汇总，请于25日前完成</HrTodoItem>
            </div>
          </CardContent>
        </Card>
      </div>

      <HrAiPanel viewId="hr-overview" className="mx-auto w-full max-w-[1280px]" />
    </div>
  );
}
