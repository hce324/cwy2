'use client';

import { HrPageHeader, HrBadge, HrMetricCard, HrAiPanel } from './hr-ui';
import {
  hrDepartments,
  hrStaffAll,
  hrActiveCount,
  getDeptTopPositions,
} from '@/lib/hr-data';

export function HrOrgView() {
  const onsiteCount = (dept: string) =>
    hrStaffAll.filter((s) => s.department === dept).length;

  const totalHeadcount = hrDepartments.reduce((s, d) => s + d.headcount, 0);
  const overallRate = Math.round((hrActiveCount / totalHeadcount) * 100);

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="组织架构"
        subtitle="组织与编制 · 截至2026年7月"
        description={`澜川数字科技有限公司 · ${hrDepartments.length}个部门 · 在职${hrActiveCount}人`}
      />

      {/* 编制总览 KPI */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HrMetricCard label="部门数" value={`${hrDepartments.length}`} color="var(--chart-1)" />
        <HrMetricCard label="总编制" value={`${totalHeadcount}人`} color="var(--chart-4)" />
        <HrMetricCard label="在岗人数" value={`${hrActiveCount}人`} color="var(--chart-3)" />
        <HrMetricCard label="整体编制达成率" value={`${overallRate}%`} sub={overallRate >= 100 ? '编制已满' : `缺编${totalHeadcount - hrActiveCount}人`} color="var(--chart-2)" />
      </div>

      {/* 部门卡片 */}
      <div className="mx-auto w-full max-w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hrDepartments.map((d) => {
          const onsite = onsiteCount(d.name);
          const rate = Math.round((onsite / d.headcount) * 100);
          const positions = getDeptTopPositions(d.name, 4);
          return (
            <div
              key={d.id}
              className="rounded-xl border border-border bg-card elevation-1 overflow-hidden"
            >
              <div className="h-1" style={{ backgroundColor: d.color }} />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{d.name}</h3>
                  <HrBadge color={d.color} soft>编制{d.headcount}人</HrBadge>
                </div>
                <div className="text-sm text-muted-foreground">负责人：{d.head}</div>
                <div className="text-sm text-foreground">
                  在岗{onsite}人 · <span style={{ color: d.color }}>编制达成率{rate}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {onsite < d.headcount ? `缺编${d.headcount - onsite}人` : '编制已满'}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {positions.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 组织层级图 */}
      <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-border bg-card elevation-1 p-4">
        <div className="text-sm font-medium text-foreground mb-3">组织层级</div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center justify-center rounded-lg border-2 border-[--chart-1] px-4 py-2 text-sm font-semibold text-[--chart-1]">
            CEO
          </div>
          <span className="text-muted-foreground">→</span>
          {hrDepartments.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium"
              style={{ borderColor: d.color, color: d.color }}
            >
              {d.name}（{d.head}）
            </div>
          ))}
        </div>
      </div>

      <HrAiPanel viewId="hr-org" className="mx-auto w-full max-w-[1100px]" />
    </div>
  );
}
