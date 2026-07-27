'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Download, Calendar, Building2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';

type BookType = 'journal' | 'classify' | 'memo';

interface LedgerColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function fmtVoucherNo(word: string, number: number): string {
  return `${word}字${number}号`;
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

function fmtAmount(n: unknown): string {
  const v = Number(n ?? 0);
  if (v === 0) return '';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAmountAlways(n: unknown): string {
  return Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Column definitions per book type ─────────────────────────────────

const columnsByType: Record<BookType, LedgerColumn[]> = {
  journal: [
    { key: 'entryDate', label: '日期' },
    { key: 'voucher', label: '凭证字号' },
    { key: 'summary', label: '摘要' },
    { key: 'debitAmount', label: '借方发生额', align: 'right', mono: true },
    { key: 'creditAmount', label: '贷方发生额', align: 'right', mono: true },
    { key: 'direction', label: '方向', align: 'center' },
    { key: 'balance', label: '余额', align: 'right', mono: true },
  ],
  classify: [
    { key: 'entryDate', label: '日期' },
    { key: 'voucher', label: '凭证字号' },
    { key: 'subject', label: '明细科目' },
    { key: 'summary', label: '摘要' },
    { key: 'debitAmount', label: '借方发生额', align: 'right', mono: true },
    { key: 'creditAmount', label: '贷方发生额', align: 'right', mono: true },
    { key: 'direction', label: '方向', align: 'center' },
    { key: 'balance', label: '余额', align: 'right', mono: true },
  ],
  memo: [
    { key: 'entryDate', label: '登记日期' },
    { key: 'event', label: '业务事项' },
    { key: 'counterparty', label: '对方单位' },
    { key: 'memoSummary', label: '摘要' },
    { key: 'amount', label: '数量/金额', align: 'right', mono: true },
    { key: 'keeper', label: '保管人' },
    { key: 'note', label: '备注' },
  ],
};

const bookLabels: Record<BookType, {
  sub: string;
  label: string;
  desc: string;
  pageFormat: string;
  tableTitle: string;
  tableDesc: string;
}> = {
  journal: {
    sub: '日',
    label: '日记账',
    desc: '库存现金、银行存款',
    pageFormat: '银行存款日记账（三栏式）',
    tableTitle: '三栏式银行存款日记账',
    tableDesc: '单位：元',
  },
  classify: {
    sub: '分',
    label: '分类账簿',
    desc: '总分类账、明细分类账',
    pageFormat: '总分类账（三栏式）',
    tableTitle: '三栏式总分类账',
    tableDesc: '单位：元',
  },
  memo: {
    sub: '备',
    label: '备查账簿',
    desc: '辅助核算、固定资产等',
    pageFormat: '备查账簿（多栏式）',
    tableTitle: '备查账簿 · 租入固定资产登记簿',
    tableDesc: '登记主体：杭州星芒供应链有限公司',
  },
};

// ─── Helpers for row mapping ──────────────────────────────────────────

/** Type for a LedgerEntry returned by the API (includes subject relation). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LedgerEntryRow = any;

function mapRowToCells(entry: LedgerEntryRow, bookType: BookType): string[] {
  const subject = entry.subject as { code: string; name: string } | undefined;

  switch (bookType) {
    case 'journal':
      return [
        fmtDate(entry.entryDate),
        fmtVoucherNo(entry.voucherWord, entry.voucherNumber),
        entry.summary ?? '',
        fmtAmount(entry.debitAmount),
        fmtAmount(entry.creditAmount),
        entry.direction ?? '',
        fmtAmount(entry.balance),
      ];
    case 'classify':
      return [
        fmtDate(entry.entryDate),
        fmtVoucherNo(entry.voucherWord, entry.voucherNumber),
        subject ? `${subject.code} ${subject.name}` : '—',
        entry.summary ?? '',
        fmtAmount(entry.debitAmount),
        fmtAmount(entry.creditAmount),
        entry.direction ?? '',
        fmtAmount(entry.balance),
      ];
    case 'memo':
      return [
        fmtDate(entry.entryDate),
        entry.summary ?? '',
        '—',
        entry.summary ?? '',
        fmtAmount(Number(entry.debitAmount) || Number(entry.creditAmount)),
        '—',
        '—',
      ];
    default:
      return [];
  }
}

// ─── Component ────────────────────────────────────────────────────────

export function LedgerView() {
  const [bookType, setBookType] = useState<BookType>('classify');

  // ─── tRPC query ──────────────────────────────────────────────────

  const listQuery = trpc.ledger.list.useQuery({ bookType });

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  const columns = columnsByType[bookType];
  const config = bookLabels[bookType];

  // ─── Build display rows ───────────────────────────────────────────

  const rows = items.map((entry) => mapRowToCells(entry, bookType));

  const totalDebit = items.reduce((sum, e) => sum + Number(e.debitAmount ?? 0), 0);
  const totalCredit = items.reduce((sum, e) => sum + Number(e.creditAmount ?? 0), 0);

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            ACCOUNTING BOOKS
          </div>
          <h1 className="page-title mt-1">会计账簿</h1>
          <p className="page-subtitle">
            按日记账、分类账簿和备查账簿组织，并根据科目性质自动选择适用账页格式。
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => toast('已导出当前账簿')}
        >
          <Download className="h-4 w-4" /> 导出当前账簿
        </Button>
      </div>

      <Separator />

      {/* ── Rules ────────────────────────────────────────────────── */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p>
          <strong className="text-foreground">日记账：</strong>
          逐日逐笔登记库存现金和银行存款。
        </p>
        <p>
          <strong className="text-foreground">分类账簿：</strong>
          包括总分类账及适用不同账页格式的明细分类账。
        </p>
        <p>
          <strong className="text-foreground">备查账簿：</strong>
          补充登记辅助核算和需查考事项。
        </p>
      </div>

      {/* ── Book type tabs ────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(Object.keys(bookLabels) as BookType[]).map((id) => {
          const b = bookLabels[id];
          return (
            <Button
              key={id}
              variant={bookType === id ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setBookType(id)}
              aria-pressed={bookType === id}
            >
              <Badge className="text-[10px] px-1 h-4">{b.sub}</Badge>
              <span className="text-xs">{b.label}</span>
            </Button>
          );
        })}
      </div>

      {/* ── Query area ────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          {bookType === 'classify' && (
            <div className="flex items-center gap-2">
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general" className="text-xs">
                    总分类账（一级科目）
                  </TabsTrigger>
                  <TabsTrigger value="detail" className="text-xs">
                    明细分类账（二/三级科目）
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="general" />
                <TabsContent value="detail" />
              </Tabs>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计期间：</span>
              <span className="font-medium">—</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计科目：</span>
              <span className="font-medium">
                {items.length > 0 && (items[0] as LedgerEntryRow).subject
                  ? `${(items[0] as LedgerEntryRow).subject.code} ${(items[0] as LedgerEntryRow).subject.name}`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">核算主体：</span>
              <span className="font-medium">杭州星芒供应链有限公司</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            适用账页格式：{config.pageFormat}
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => listQuery.refetch()}
          >
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
        </CardContent>
      </Card>

      {/* ── Table card ────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{config.tableTitle}</CardTitle>
          <CardDescription>{config.tableDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {errorMsg || '无法获取账簿数据，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无账簿数据
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px]">
                    {columns.map((col) => (
                      <TableHead
                        key={col.key}
                        className={cn(
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                        )}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((cells, i) => (
                    <TableRow key={i} className="text-xs">
                      {cells.map((cell, j) => {
                        const col = columns[j];
                        return (
                          <TableCell
                            key={j}
                            className={cn(
                              col.align === 'right' && 'text-right',
                              col.align === 'center' && 'text-center',
                              col.mono && 'font-mono',
                            )}
                          >
                            {cell}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Totals row */}
              {items.length > 0 && (
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex flex-wrap items-center justify-end gap-6 px-4">
                  {(bookType === 'journal' || bookType === 'classify') && (
                    <>
                      <span>借方合计：{fmtAmountAlways(totalDebit)}</span>
                      <span>贷方合计：{fmtAmountAlways(totalCredit)}</span>
                    </>
                  )}
                  <span>共 {total} 条记录</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
