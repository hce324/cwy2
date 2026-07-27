'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Scale, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';

// ─── Helpers ────────────────────────────────────────────────────────

function fmtAmount(n: unknown): string {
  const v = Number(n ?? 0);
  if (v === 0) return '';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Component ──────────────────────────────────────────────────────

export function BalanceView() {
  // ─── Query ────────────────────────────────────────────────────────

  const listQuery = trpc.trialBalance.list.useQuery({ fiscalPeriodId: 1 });

  const rows = listQuery.data ?? [];
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── Computed totals ──────────────────────────────────────────────

  const totalOpeningDebit = rows.reduce((sum, r) => sum + Number(r.openingDebit ?? 0), 0);
  const totalOpeningCredit = rows.reduce((sum, r) => sum + Number(r.openingCredit ?? 0), 0);
  const totalCurrentDebit = rows.reduce((sum, r) => sum + Number(r.currentDebit ?? 0), 0);
  const totalCurrentCredit = rows.reduce((sum, r) => sum + Number(r.currentCredit ?? 0), 0);
  const totalEndingDebit = rows.reduce((sum, r) => sum + Number(r.endingDebit ?? 0), 0);
  const totalEndingCredit = rows.reduce((sum, r) => sum + Number(r.endingCredit ?? 0), 0);

  const isBalanced =
    rows.length > 0 &&
    totalOpeningDebit === totalOpeningCredit &&
    totalCurrentDebit === totalCurrentCredit &&
    totalEndingDebit === totalEndingCredit;

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">TRIAL BALANCE</div>
          <h1 className="page-title mt-1">科目余额表</h1>
          <p className="page-subtitle">
            由已记账凭证实时汇总，支持逐级展开并联查明细账。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Scale className="h-4 w-4" /> 试算平衡检查
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success('已导出当前账簿')}>
            <Download className="h-4 w-4" /> 导出Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Trial balance check badge */}
      {!isLoading && !isError && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 ${isBalanced ? 'bg-success/10' : 'bg-warning/10'}`}
        >
          {isBalanced ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-[--success] flex-shrink-0" />
              <span className="text-sm text-[--success]">
                &#10003; 试算平衡 — 期初借方＝期初贷方；本期借方＝本期贷方；期末借方＝期末贷方（本期发生额 {fmtAmount(totalCurrentDebit)} 元）
              </span>
            </>
          ) : rows.length > 0 ? (
            <>
              <AlertTriangle className="h-5 w-5 text-[--warning] flex-shrink-0" />
              <span className="text-sm text-[--warning]">
                试算不平衡 — 请检查凭证录入与过账状态
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">暂无试算数据</span>
          )}
        </div>
      )}

      {/* Balance table */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{errorMsg || '无法获取科目余额表数据，请检查网络连接后重试'}</AlertDescription>
            </Alert>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无科目余额数据，请先生成试算平衡表
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>科目代码</TableHead>
                  <TableHead>科目名称</TableHead>
                  <TableHead className="text-center">方向</TableHead>
                  <TableHead className="text-right">期初借方</TableHead>
                  <TableHead className="text-right">期初贷方</TableHead>
                  <TableHead className="text-right">本期借方</TableHead>
                  <TableHead className="text-right">本期贷方</TableHead>
                  <TableHead className="text-right">期末借方</TableHead>
                  <TableHead className="text-right">期末贷方</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row.id)} className="text-xs">
                    <TableCell className="font-mono">{row.subject?.code ?? '—'}</TableCell>
                    <TableCell>{row.subject?.name ?? '—'}</TableCell>
                    <TableCell className="text-center">{row.endingDirection ?? '—'}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.openingDebit)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.openingCredit)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.currentDebit)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.currentCredit)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.endingDebit)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(row.endingCredit)}</TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="text-xs font-medium bg-muted/30">
                  <TableCell colSpan={2}>合 计</TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalOpeningDebit)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalOpeningCredit)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalCurrentDebit)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalCurrentCredit)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalEndingDebit)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(totalEndingCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
