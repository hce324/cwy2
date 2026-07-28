'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RippleContainer } from '@/components/custom/RippleContainer';
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Trash2,
  ListChecks,
} from 'lucide-react';
import { fmtDate } from '@/lib/format';

// ─── Helpers ────────────────────────────────────────────────────────

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

function fmtVoucherNo(v: { voucherWord: string; voucherNumber: number }): string {
  return `${v.voucherWord}字${v.voucherNumber}号`;
}

// ─── Component ──────────────────────────────────────────────────────

export function VoucherOrganizeView() {
  const [period, setPeriod] = useState({ year: 2026, month: 7 });
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState('delete-and-reorder');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const periodLabel = `${period.year}年${period.month}月`;

  // ─── tRPC query: fetch all vouchers in the current period ─────────
  // We fetch broadly then filter client-side for voided vouchers,
  // because the list router does not expose a direct isVoided filter.
  const listQuery = trpc.voucher.list.useQuery({
    auditStatus: 'all',
    year: String(period.year),
    month: String(period.month),
    limit: 100,
    offset: 0,
  });

  const allItems = listQuery.data?.items ?? [];
  const voidedItems = useMemo(
    () => allItems.filter((v) => v.isVoided),
    [allItems],
  );

  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── tRPC mutations ───────────────────────────────────────────────

  const utils = trpc.useUtils();
  const voidMutation = trpc.voucher.void.useMutation({
    onSuccess: () => {
      utils.voucher.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '操作失败，请重试');
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────

  const toggleSelect = (voucherNo: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(voucherNo)) next.delete(voucherNo);
      else next.add(voucherNo);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === voidedItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(voidedItems.map((v) => v.voucherNo)));
    }
  };

  const handleExecute = () => {
    if (voidedItems.length === 0) {
      toast.error('当前期间没有可整理的作废凭证');
      return;
    }
    if (selected.size === 0) {
      toast.error('请至少选择一张作废凭证');
      return;
    }
    // Void each selected voucher with an organize reason
    const targets = voidedItems.filter((v) => selected.has(v.voucherNo));
    targets.forEach((v) => {
      voidMutation.mutate({
        id: Number(v.id),
        reason: option === 'delete-and-reorder'
          ? '凭证整理：删除并重排断号'
          : '凭证整理：仅删除作废凭证',
      });
    });
    toast.success('凭证整理已提交', {
      description: `正在整理 ${targets.length} 张凭证：${option === 'delete-and-reorder' ? '删除作废凭证并整理断号' : '仅删除作废凭证'}`,
    });
    setSelected(new Set());
  };

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER ARRANGEMENT</div>
        <h1 className="page-title mt-1">整理凭证</h1>
        <p className="page-subtitle">
          按用友U8的处理逻辑，删除当前期间已作废、未审核且未记账的凭证，并可将剩余未记账凭证重新连续编号。
        </p>
      </div>

      {/* Period summary bar */}
      <Card className="elevation-1">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Period picker */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">会计期间</p>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger className="group flex appearance-none items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 py-0.5 text-lg font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                    {periodLabel}
                    <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-3">
                      {/* Year navigator */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="上一年"
                          onClick={() => setPeriod((p) => ({ ...p, year: p.year - 1 }))}
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {period.year} 年
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="下一年"
                          onClick={() => setPeriod((p) => ({ ...p, year: p.year + 1 }))}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                      {/* Month grid */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {MONTHS.map((m, i) => {
                          const month = i + 1;
                          const selected2 = period.month === month;
                          return (
                            <Button
                              key={m}
                              variant={selected2 ? 'default' : 'outline'}
                              size="sm"
                              className={cn('h-8', !selected2 && 'text-foreground')}
                              onClick={() => {
                                setPeriod((p) => ({ ...p, month }));
                                setOpen(false);
                              }}
                            >
                              {month}月
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <Trash2 className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-muted-foreground">待整理作废凭证</p>
                  <p className="font-semibold tabular-nums text-foreground">
                    {isLoading ? '...' : `${voidedItems.length} 张`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListChecks className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-muted-foreground">整理后剩余断号</p>
                  <p className="font-semibold tabular-nums text-foreground">
                    {isLoading ? '...' : `${Math.max(0, voidedItems.length - selected.size)} 处`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk hint */}
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="text-foreground/90">
          凭证整理为<strong>不可逆操作</strong>：已作废凭证将从当前期间凭证库永久移除，请确认后再执行。仅会计专员可操作。
        </p>
      </div>

      {/* Options + void voucher list */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Options */}
        <Card className="elevation-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              整理选项
            </CardTitle>
            <CardDescription>选择本次凭证整理的处理方式。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={option} onValueChange={setOption}>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="delete-and-reorder" id="r1" />
                <Label htmlFor="r1" className="text-sm">删除作废凭证并整理断号</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="delete-only" id="r2" />
                <Label htmlFor="r2" className="text-sm">仅删除作废凭证，不整理断号</Label>
              </div>
            </RadioGroup>
            <Separator />
            <div className="space-y-2">
              <RippleContainer className="ripple-container">
                <Button
                  className="w-full"
                  onClick={handleExecute}
                  disabled={voidMutation.isPending || voidedItems.length === 0}
                >
                  {voidMutation.isPending ? '整理中...' : '执行凭证整理'}
                </Button>
              </RippleContainer>
              <p className="text-xs text-muted-foreground text-center">仅会计专员可操作</p>
            </div>
          </CardContent>
        </Card>

        {/* Void voucher list */}
        <Card className="elevation-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">作废凭证清单</CardTitle>
            <CardDescription>
              仅显示已作废、未审核、未记账的凭证；整理后将从当前期间凭证库移除。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertTitle>数据加载失败</AlertTitle>
                <AlertDescription>{errorMsg || '无法获取作废凭证列表'}</AlertDescription>
              </Alert>
            ) : voidedItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {periodLabel} 暂无已作废的凭证
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          voidedItems.length > 0 && selected.size === voidedItems.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>原凭证字号</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead>作废状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voidedItems.map((v) => (
                    <TableRow key={String(v.id)}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(v.voucherNo)}
                          onCheckedChange={() => toggleSelect(v.voucherNo)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{fmtVoucherNo(v)}</TableCell>
                      <TableCell className="tabular-nums">{fmtDate(v.voucherDate)}</TableCell>
                      <TableCell>{v.summary}</TableCell>
                      <TableCell>
                        <span className="text-[10px] bg-danger/10 text-danger rounded px-1.5 py-0.5">
                          已作废{v.voucherDate ? ` · ${fmtDate(v.voucherDate)}` : ''}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
