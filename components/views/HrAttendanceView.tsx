'use client';

import {
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
import { HrPageHeader, HrMetricCard, HrProgress, HrTodoItem, HrAiPanel, HrTooltip } from './hr-ui';
import { hrAttendance, hrActiveCount } from '@/lib/hr-data';

const rateColor = (rate: number) =>
  rate >= 97 ? 'var(--chart-3)' : rate >= 95 ? 'var(--chart-4)' : 'var(--chart-5)';

export function HrAttendanceView() {
  const latest = hrAttendance[hrAttendance.length - 1];
  const trend = hrAttendance.map((a) => ({ month: a.month, rate: a.rate }));

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="考勤管理"
        subtitle="2026年6月 · 月度考勤汇总"
        description={`出勤率${latest.rate}% · 迟到${latest.late}次 · 请假${latest.leave}次 · 加班${latest.overtime}小时（人均${(latest.overtime / hrActiveCount).toFixed(1)}h）`}
      />

      {/* KPI */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HrMetricCard label="出勤率" value={`${latest.rate}%`} trend="+0.5%" trendUp color="var(--chart-3)" />
        <HrMetricCard label="迟到人次" value={`${latest.late}`} trend="-17.6%" trendUp={false} color="var(--chart-4)" />
        <HrMetricCard label="请假人次" value={`${latest.leave}`} trend="-18.2%" trendUp={false} color="var(--chart-1)" />
        <HrMetricCard label="人均加班时长" value={`${(latest.overtime / hrActiveCount).toFixed(1)}h`} trend="-9.0%" trendUp={false} color="var(--chart-2)" />
      </div>

      {/* 趋势 */}
      <Card className="elevation-1 card-hover ripple-container mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>上半年考勤趋势</CardTitle>
          <CardDescription>月度出勤率（%）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <RechartsTooltip content={<HrTooltip />} cursor={{ stroke: 'var(--chart-3)' }} />
              <Area type="monotone" dataKey="rate" name="出勤率" stroke="var(--chart-3)" strokeWidth={2} fill="var(--chart-3)" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 月度明细 */}
      <Card className="elevation-1 card-hover ripple-container mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>月度明细</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border text-left text-muted-foreground">
                <TableHead className="px-4 py-2 font-medium">月份</TableHead>
                <TableHead className="px-4 py-2 font-medium">出勤率</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">迟到(次)</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">请假(次)</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">加班(小时)</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">人均(小时)</TableHead>
                <TableHead className="px-4 py-2 font-medium">趋势</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hrAttendance.map((a) => {
                const c = rateColor(a.rate);
                return (
                  <TableRow key={a.month} className="border-b border-border last:border-0">
                    <TableCell className="px-4 py-2 text-foreground">{a.month}</TableCell>
                    <TableCell className="px-4 py-2 font-medium tabular-nums" style={{ color: c }}>{a.rate}%</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums text-muted-foreground">{a.late}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums text-muted-foreground">{a.leave}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums text-muted-foreground">{a.overtime}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums text-muted-foreground">{(a.overtime / hrActiveCount).toFixed(1)}</TableCell>
                    <TableCell className="px-4 py-2 w-40">
                      <HrProgress value={a.rate} color={c} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 异常提醒 */}
      <Card className="elevation-1 card-hover ripple-container mx-auto w-full max-w-[1100px]">
        <CardHeader>
          <CardTitle>考勤异常提醒</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <HrTodoItem color="var(--chart-4)">张明远（技术部）· 6月18日 迟到32分钟 · 未提交说明</HrTodoItem>
            <HrTodoItem color="var(--chart-4)">陈思宇（市场部）· 6月12日 缺卡1次 · 待补签</HrTodoItem>
            <HrTodoItem color="var(--chart-1)">林若溪（产品部）· 6月5-7日 年假3天 · 已审批</HrTodoItem>
          </div>
        </CardContent>
      </Card>

      <HrAiPanel viewId="hr-attendance" className="mx-auto w-full max-w-[1100px]" />
    </div>
  );
}
