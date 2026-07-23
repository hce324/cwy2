'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { toast } from 'sonner';
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

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const VOID_VOUCHERS = [
  { id: '记字138号', date: '2026-07-13', summary: '采购蓝牙耳机入库' },
  { id: '转字066号', date: '2026-07-12', summary: '平台服务费暂估' },
];

export function VoucherOrganizeView() {
  const [period, setPeriod] = useState({ year: 2026, month: 7 });
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState('delete-and-reorder');

  const periodLabel = `${period.year}年${period.month}月`;

  const handleExecute = () => {
    toast('凭证整理完成', {
      description: `已对 ${periodLabel} 执行整理：${
        option === 'delete-and-reorder' ? '删除作废凭证并整理断号' : '仅删除作废凭证'
      }`,
    });
  };

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

      {/* Period summary bar — 会计期间可切换时间 */}
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
                          const selected = period.month === month;
                          return (
                            <Button
                              key={m}
                              variant={selected ? 'default' : 'outline'}
                              size="sm"
                              className={cn('h-8', !selected && 'text-foreground')}
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
                  <p className="font-semibold tabular-nums text-foreground">{VOID_VOUCHERS.length} 张</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListChecks className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-muted-foreground">整理后剩余断号</p>
                  <p className="font-semibold tabular-nums text-foreground">0 处</p>
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
                <Button className="w-full" onClick={handleExecute}>
                  执行凭证整理
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">选择</TableHead>
                  <TableHead>原凭证字号</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead>作废状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VOID_VOUCHERS.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="font-medium">{v.id}</TableCell>
                    <TableCell className="tabular-nums">{v.date}</TableCell>
                    <TableCell>{v.summary}</TableCell>
                    <TableCell>
                      <span className="text-[10px] bg-danger/10 text-danger rounded px-1.5 py-0.5">
                        已作废 · 等待凭证整理
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
