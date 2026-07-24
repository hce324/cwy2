'use client';

import { Fragment } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  HrPageHeader,
  HrMetricCard,
  HrProgress,
  HrBadge,
  HrAiPanel,
} from './hr-ui';
import {
  hrActiveCount,
  hrPayrollTotal,
  hrEduMix,
  hrAgeMix,
  hrCostTrend,
  hrEquityPlans,
  hrEquityCovered,
  hrEquityCoverageRate,
  hrExecComp,
  hrExecCompTotal,
  hrTalentGrid,
  hrHiPoCount,
  hrSuccession,
  hrCompliance,
  hrTraining,
} from '@/lib/hr-data';
import {
  Landmark,
  GraduationCap,
  Gift,
  Crown,
  Network,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

// 财务模块图表配色：统一使用 --chart-1..5 调色板
const EDU_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];
const AGE_COLORS = [
  'var(--chart-4)',
  'var(--chart-1)',
  'var(--chart-3)',
  'var(--chart-5)',
];

// 自定义 Tooltip（对齐财务模块 TrendTooltip 风格）
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

const PERF_COLS = ['优', '中', '待改进'];
const POT_ROWS = ['高', '中', '基础'];

export function HrManageView() {
  const annualCost = (hrPayrollTotal * 12) / 10000; // 万元

  const eduData = hrEduMix.map((d, i) => ({
    name: d.level,
    value: d.count,
    color: EDU_COLORS[i % EDU_COLORS.length],
  }));
  const ageData = hrAgeMix.map((d, i) => ({
    name: d.range,
    value: d.count,
    color: AGE_COLORS[i % AGE_COLORS.length],
  }));

  const findCell = (pot: string, perf: string) =>
    hrTalentGrid.find((c) => c.potential === pot && c.perf === perf);

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="上市公司人力管理中台"
        subtitle="2026 中报口径 · 人力资本与长期激励"
        description={`澜川数字科技（证券代码 688XXX）· 在职${hrActiveCount}人 · 人力资本相关信息披露`}
        maxWidth="max-w-[1280px]"
      />

      {/* KPI 指标 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <HrMetricCard label="员工总数" value={`${hrActiveCount}`} trend="+2.1%" trendUp sub="较上月" color="var(--chart-1)" />
        <HrMetricCard label="年度人力成本" value={`¥${annualCost.toFixed(0)}万`} trend="+3.8%" trendUp sub="同比" color="var(--chart-3)" />
        <HrMetricCard label="人均营收" value="¥186万" trend="+6.2%" trendUp sub="效能" color="var(--chart-2)" />
        <HrMetricCard label="年离职率" value="8.3%" trend="-1.1%" trendUp={false} sub="同比" color="var(--chart-5)" />
        <HrMetricCard label="长期激励覆盖" value={`${hrEquityCovered}人`} sub={`覆盖率${hrEquityCoverageRate}%`} color="var(--chart-4)" />
        <HrMetricCard label="董监高薪酬" value={`¥${hrExecCompTotal}万`} sub="年报披露" color="var(--chart-1)" />
      </div>

      {/* 学历结构 + 年龄结构 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[--chart-3]" /> 学历结构
            </CardTitle>
            <CardDescription>全日制学历分布（人）</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eduData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<HrTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="value" name="人数" radius={[4, 4, 0, 0]} barSize={28}>
                  {eduData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4 text-[--chart-1]" /> 年龄结构
            </CardTitle>
            <CardDescription>各年龄段人数分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<HrTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="value" name="人数" radius={[4, 4, 0, 0]} barSize={28}>
                  {ageData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 人力成本趋势 + 长期激励计划 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[--chart-4]" /> 人力成本趋势
            </CardTitle>
            <CardDescription>年度人力成本（万元，年报口径）</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hrCostTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip content={<HrTooltip />} cursor={{ stroke: 'var(--chart-4)' }} />
                <Area type="monotone" dataKey="cost" name="人力成本" stroke="var(--chart-4)" strokeWidth={2} fill="var(--chart-4)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[--chart-1]" /> 长期激励计划
            </CardTitle>
            <CardDescription>限制性股票 / 股票期权 / 员工持股计划（ESOP）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hrEquityPlans.map((p) => (
              <div key={p.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <HrBadge color={p.color}>{p.type}</HrBadge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>授予 {p.granted} · 覆盖 {p.covered} 人</span>
                  <span className="tabular-nums">实施 {p.progress}%</span>
                </div>
                <div className="mt-2">
                  <HrProgress value={p.progress} color={p.color} />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              去重后长期激励覆盖 <span className="font-medium text-foreground">{hrEquityCovered}</span> 人，覆盖率 <span className="font-medium text-foreground">{hrEquityCoverageRate}%</span>。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 董监高薪酬 + 人才九宫格 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[--chart-5]" /> 董监高薪酬
            </CardTitle>
            <CardDescription>董事、监事、高管薪酬总额（万元，年报披露）</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>职务</TableHead>
                  <TableHead className="text-right">人数</TableHead>
                  <TableHead className="text-right">薪酬(万)</TableHead>
                  <TableHead className="text-right">占比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hrExecComp.map((r) => (
                  <TableRow key={r.role}>
                    <TableCell className="text-foreground">{r.role}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{r.count}</TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{r.total}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {((r.total / hrExecCompTotal) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-border">
                  <TableCell className="font-medium text-foreground">合计</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {hrExecComp.reduce((s, r) => s + r.count, 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-foreground">{hrExecCompTotal}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4 text-[--chart-2]" /> 人才九宫格
            </CardTitle>
            <CardDescription>绩效 × 潜力（高潜 {hrHiPoCount} 人 · 关键岗位继任覆盖 {hrSuccession.rate}%）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-2">
              <div />
              {PERF_COLS.map((p) => (
                <div key={p} className="text-center text-xs text-muted-foreground">绩效·{p}</div>
              ))}
              {POT_ROWS.map((pot) => (
                <Fragment key={pot}>
                  <div className="flex items-center pr-2 text-xs text-muted-foreground">潜力·{pot}</div>
                  {PERF_COLS.map((perf) => {
                    const cell = findCell(pot, perf);
                    const count = cell?.count ?? 0;
                    const hl = cell?.highlight;
                    return (
                      <div
                        key={perf}
                        className={cn(
                          'flex items-center justify-center rounded-lg border py-3 text-lg font-bold tabular-nums',
                          hl ? 'border-[--chart-1] text-[--chart-1]' : 'border-border text-foreground'
                        )}
                        style={hl ? { backgroundColor: 'color-mix(in srgb, var(--chart-1) 12%, transparent)' } : undefined}
                      >
                        {count}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[--chart-1]">{hrHiPoCount}</div>
                <div className="text-xs text-muted-foreground">高潜人才（高潜力）</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[--chart-3]">{hrSuccession.rate}%</div>
                <div className="text-xs text-muted-foreground">关键岗位继任覆盖（{hrSuccession.covered}/{hrSuccession.keyRoles}）</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 合规与披露 + 培训发展 */}
      <div className="mx-auto w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[--chart-3]" /> 合规与披露
            </CardTitle>
            <CardDescription>ESG / 年报人力相关指标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hrCompliance.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground">{r.label}</span>
                  <span className="tabular-nums font-medium text-foreground">{r.value}</span>
                </div>
                <HrProgress value={r.pct} color={r.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="elevation-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[--chart-2]" /> 培训与人才发展
            </CardTitle>
            <CardDescription>年度培训投入与人才赋能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[--chart-2]">¥{hrTraining.invest}万</div>
                <div className="text-xs text-muted-foreground">年度培训投入</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[--chart-1]">{hrTraining.hoursPerCap}h</div>
                <div className="text-xs text-muted-foreground">人均培训学时</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[--chart-3]">{hrTraining.certRate}%</div>
                <div className="text-xs text-muted-foreground">关键岗位认证率</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              培训投入占人力成本约 <span className="font-medium text-foreground">{((hrTraining.invest * 10000) / (hrPayrollTotal * 12) * 100).toFixed(1)}%</span>，重点投向高潜人才与关键岗位认证。
            </p>
          </CardContent>
        </Card>
      </div>

      <HrAiPanel viewId="hr-manage" className="mx-auto w-full max-w-[1280px]" />
    </div>
  );
}
