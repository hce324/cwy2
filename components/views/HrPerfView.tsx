'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { HrPageHeader, HrMetricCard, HrProgress, HrAiPanel, HrTooltip } from './hr-ui';
import { hrPerformance, hrPerfTotal, hrActiveCount, hrPerfExcellentRate } from '@/lib/hr-data';

const top5 = [
  { rank: 1, name: '张涛', dept: '技术部·高级工程师', level: 'S', desc: '核心系统重构完成，性能提升40%' },
  { rank: 2, name: '沈怡', dept: '产品部·高级产品经理', level: 'A', desc: '新产品线上线首月营收¥320万' },
  { rank: 3, name: '丁敏', dept: '销售部·大客户经理', level: 'A', desc: '季度签约额¥1,260万，超额32%' },
  { rank: 4, name: '殷静', dept: '市场部·品牌经理', level: 'A', desc: '品牌知名度调查提升18个百分点' },
  { rank: 5, name: '赵雅琴', dept: '财务部·财务总监', level: 'A', desc: '完成成本管控方案，节省¥840万/年' },
];

const distRows = [
  { label: 'S·卓越', value: hrPerfTotal.S, color: 'var(--chart-5)' },
  { label: 'A·优秀', value: hrPerfTotal.A, color: 'var(--chart-3)' },
  { label: 'B·良好', value: hrPerfTotal.B, color: 'var(--chart-1)' },
  { label: 'C+D·待改进', value: hrPerfTotal.C + hrPerfTotal.D, color: 'var(--chart-4)' },
];

export function HrPerfView() {
  const stacked = hrPerformance.map((d) => ({
    dept: d.dept,
    S: d.S,
    A: d.A,
    B: d.B,
    C: d.C,
    D: d.D,
  }));

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="绩效管理"
        subtitle="2026年Q2 · 4-6月考核周期"
        description={`参评${hrActiveCount}人 · S级${hrPerfTotal.S}人 · A级${hrPerfTotal.A}人 · 优良率${hrPerfExcellentRate}%`}
      />

      {/* KPI */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HrMetricCard label="S级（卓越）" value={`${hrPerfTotal.S}`} color="var(--chart-5)" />
        <HrMetricCard label="A级（优秀）" value={`${hrPerfTotal.A}`} color="var(--chart-3)" />
        <HrMetricCard label="B级（良好）" value={`${hrPerfTotal.B}`} color="var(--chart-1)" />
        <HrMetricCard label="C+D（待改进）" value={`${hrPerfTotal.C + hrPerfTotal.D}`} color="var(--chart-4)" />
      </div>

      {/* 分布图 */}
      <Card className="elevation-1 card-hover ripple-container mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>各部门绩效分布</CardTitle>
          <CardDescription>按 S/A/B/C/D 等级堆叠（人）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stacked} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <RechartsTooltip content={<HrTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="S" stackId="total" name="S级" fill="var(--chart-5)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="A" stackId="total" name="A级" fill="var(--chart-3)" />
              <Bar dataKey="B" stackId="total" name="B级" fill="var(--chart-1)" />
              <Bar dataKey="C" stackId="total" name="C级" fill="var(--chart-4)" />
              <Bar dataKey="D" stackId="total" name="D级" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 分布概览 + TOP5 */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>绩效分布概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distRows.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{r.label}</span>
                    <span className="tabular-nums text-muted-foreground">{r.value}人 · {((r.value / hrActiveCount) * 100).toFixed(1)}%</span>
                  </div>
                  <HrProgress value={(r.value / hrActiveCount) * 100} color={r.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover ripple-container">
          <CardHeader>
            <CardTitle>Q2 TOP 5 绩优员工</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {top5.map((t) => {
                const isS = t.level === 'S';
                const accent = isS ? 'var(--chart-5)' : 'var(--chart-3)';
                return (
                  <div
                    key={t.rank}
                    className="rounded-r-md px-3 py-2"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                      borderLeft: `4px solid ${accent}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{t.rank}</span>
                      <span className="text-sm font-semibold text-foreground">{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.dept}</span>
                      <span
                        className="ml-auto text-xs font-bold"
                        style={{ color: accent }}
                      >
                        {t.level}级
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部提醒 */}
      <div className="mx-auto w-full max-w-[1100px] rounded-lg border-l-4 border-[--chart-4] px-4 py-2.5 text-sm text-foreground" style={{ backgroundColor: 'color-mix(in srgb, var(--chart-4) 10%, transparent)' }}>
        Q2绩效评审截止日期为7月25日，请各部门负责人及时完成。当前已完成 {hrActiveCount}/{hrActiveCount} 人评审。
      </div>

      <HrAiPanel viewId="hr-perf" className="mx-auto w-full max-w-[1100px]" />
    </div>
  );
}
