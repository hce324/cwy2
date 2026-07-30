'use client';

import { HrPageHeader, HrBadge, HrProgress, HrAiPanel } from './hr-ui';
import { hrRecruitPositions, hrRecruitTotals } from '@/lib/hr-data';

const urgencyColor: Record<string, string> = {
  紧急: 'var(--chart-5)',
  普通: 'var(--chart-4)',
  低: 'var(--chart-3)',
};

const stages = [
  { label: '简历投递', value: hrRecruitTotals.candidates, color: 'var(--chart-1)', width: 100 },
  { label: '面试中', value: hrRecruitTotals.interviewed, color: 'var(--chart-4)', width: 72 },
  { label: '已发Offer', value: hrRecruitTotals.offered, color: 'var(--chart-3)', width: 48 },
];

const totalPlanned = hrRecruitPositions.reduce((s, p) => s + p.planned, 0);
const completionRate = Math.round((hrRecruitTotals.offered / totalPlanned) * 100);

export function HrRecruitView() {
  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="招聘管理"
        subtitle="在招岗位 · 候选人管道"
        description={`${hrRecruitPositions.length}个在招岗位（紧急×${hrRecruitTotals.urgent}）· 候选人${hrRecruitTotals.candidates}人 · 已发Offer${hrRecruitTotals.offered}人 · 招聘完成率${completionRate}%`}
        maxWidth="max-w-[1200px]"
      />

      {/* 招聘漏斗 */}
      <div className="mx-auto w-full max-w-[1200px] rounded-xl border border-border bg-card elevation-1 p-4">
        <div className="text-sm font-medium text-foreground mb-3">招聘漏斗（全部岗位汇总）</div>
        <div className="flex flex-col items-center gap-2">
          {stages.map((s) => (
            <div key={s.label} className="flex items-center gap-4 w-full">
              <div className="w-20 text-right text-xs text-muted-foreground shrink-0">{s.label}</div>
              <div className="flex-1">
                <div
                  className="mx-auto flex items-center justify-center rounded-lg text-white font-semibold py-3 tabular-nums"
                  style={{ width: `${s.width}%`, backgroundColor: s.color }}
                >
                  {s.value} 人
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-foreground font-medium">整体招聘完成率</span>
            <span className="tabular-nums text-foreground">{completionRate}%（已发Offer {hrRecruitTotals.offered} / 计划 {totalPlanned}）</span>
          </div>
          <HrProgress value={completionRate} color="var(--chart-1)" />
        </div>
      </div>

      {/* 岗位卡片 */}
      <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-4">
        {hrRecruitPositions.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-card elevation-1 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
              <HrBadge color={urgencyColor[p.urgency]}>{p.urgency}</HrBadge>
            </div>
            <div className="text-sm text-muted-foreground">
              {p.dept} · 薪资预算 {p.budget}
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums text-foreground">{p.candidates}</div>
                <div className="text-xs text-muted-foreground">候选人</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums text-foreground">{p.interviewed}</div>
                <div className="text-xs text-muted-foreground">面试中</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums text-foreground">{p.offered}</div>
                <div className="text-xs text-muted-foreground">已发Offer</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums text-foreground">{p.planned}</div>
                <div className="text-xs text-muted-foreground">计划招聘</div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>岗位招聘完成率</span>
                <span className="tabular-nums">{Math.round((p.offered / p.planned) * 100)}%</span>
              </div>
              <HrProgress value={Math.round((p.offered / p.planned) * 100)} color={urgencyColor[p.urgency]} />
            </div>
          </div>
        ))}
      </div>
    <HrAiPanel viewId="hr-recruit" className="mx-auto w-full max-w-[1200px]" />
    </div>
  );
}
