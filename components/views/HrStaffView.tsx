'use client';

import { useAppStore } from '@/lib/store';
import { HrPageHeader, HrBadge, HrSection, HrProgress, HrAiPanel } from './hr-ui';
import { hrStaffAll, hrActiveCount, hrDepartments } from '@/lib/hr-data';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CURRENT_YEAR = 2026;
const PAGE_SIZE = 15;
const DEPT_OPTIONS = ['全部部门', ...hrDepartments.map((d) => d.name)];

export function HrStaffView() {
  const search = useAppStore((s) => s.hrStaffSearch);
  const deptFilter = useAppStore((s) => s.hrStaffDeptFilter);
  const page = useAppStore((s) => s.hrStaffPage);
  const setSearch = useAppStore((s) => s.setHrStaffSearch);
  const setDeptFilter = useAppStore((s) => s.setHrStaffDeptFilter);
  const setPage = useAppStore((s) => s.setHrStaffPage);

  const filtered = hrStaffAll.filter((s) => {
    if (deptFilter !== '全部部门' && s.department !== deptFilter) return false;
    if (
      search &&
      !s.name.includes(search) &&
      !s.code.includes(search) &&
      !s.position.includes(search)
    )
      return false;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const tenure = (entryDate: string) => {
    const y = CURRENT_YEAR - parseInt(entryDate.slice(0, 4), 10);
    return y >= 1 ? `${y}年` : '不足1年';
  };

  // 司龄分布（基于入职日期派生，按年限分桶）
  const tenureBuckets = (() => {
    const buckets = [
      { label: '不足1年', min: 0, max: 1, color: 'var(--chart-5)', count: 0 },
      { label: '1-3年', min: 1, max: 3, color: 'var(--chart-4)', count: 0 },
      { label: '3-5年', min: 3, max: 5, color: 'var(--chart-3)', count: 0 },
      { label: '5年以上', min: 5, max: 99, color: 'var(--chart-1)', count: 0 },
    ];
    for (const s of hrStaffAll) {
      const y = CURRENT_YEAR - parseInt(s.entryDate.slice(0, 4), 10);
      const b = buckets.find((bk) => y >= bk.min && y < bk.max);
      if (b) b.count += 1;
    }
    return buckets.map((b) => ({ ...b, pct: Math.round((b.count / hrActiveCount) * 100) }));
  })();

  return (
    <div className="p-6 space-y-6">
      <HrPageHeader
        title="员工花名册"
        subtitle="员工档案 · 全生命周期"
        description={`共${hrStaffAll.length}人 · 在职${hrActiveCount}人`}
        maxWidth="max-w-[1300px]"
      />

      {/* 搜索与筛选 */}
      <div className="mx-auto w-full max-w-[1300px] flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索姓名 / 工号 / 岗位"
          className="sm:max-w-xs"
        />
        <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? '全部部门')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="全部部门" />
          </SelectTrigger>
          <SelectContent>
            {DEPT_OPTIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 表格 */}
      <div className="mx-auto w-full max-w-[1300px] rounded-xl border border-border bg-card elevation-1 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>岗位</TableHead>
              <TableHead>入职日期</TableHead>
              <TableHead>司龄</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-[--chart-1]">{s.code}</TableCell>
                <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.department}</TableCell>
                <TableCell className="text-muted-foreground">{s.position}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{s.entryDate}</TableCell>
                <TableCell className="text-muted-foreground">{tenure(s.entryDate)}</TableCell>
                <TableCell>
                  {s.status === '在职' ? (
                    <HrBadge color="var(--chart-3)" soft>在职</HrBadge>
                  ) : (
                    <HrBadge color="var(--chart-5)" soft>离职</HrBadge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className="mx-auto w-full max-w-[1300px] flex items-center justify-between text-sm">
        <span className="text-muted-foreground">共 {filtered.length} 条记录</span>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">第 {safePage} / {pageCount} 页</span>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-muted-foreground disabled:opacity-40 enabled:hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> 上一页
          </button>
          <button
            disabled={safePage >= pageCount}
            onClick={() => setPage(safePage + 1)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-muted-foreground disabled:opacity-40 enabled:hover:bg-muted transition-colors"
          >
            下一页 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 司龄分布 */}
      <HrSection
        title="司龄分布"
        description="按入职年限分组的在职员工构成（基于入职日期派生）"
        className="mx-auto w-full max-w-[1300px]"
        contentClassName="space-y-3"
      >
        {tenureBuckets.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-sm text-foreground">{b.label}</div>
            <div className="flex-1">
              <HrProgress value={b.pct} color={b.color} />
            </div>
            <div className="w-28 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {b.count}人 · {b.pct}%
            </div>
          </div>
        ))}
      </HrSection>

      <HrAiPanel viewId="hr-staff" className="mx-auto w-full max-w-[1300px]" />
    </div>
  );
}
