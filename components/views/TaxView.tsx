'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtCurrency(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '');
}

function taxTypeBadge(taxType: string): string {
  const map: Record<string, string> = {
    '增': '增',
    '企': '企',
    '印': '印',
    '个': '个',
  };
  return map[taxType] ?? taxType.slice(0, 1);
}

function statusVariant(status: string): 'outline' | 'secondary' | 'default' {
  if (status === '校验通过' || status === '已申报') return 'secondary';
  if (status === '待复核') return 'default';
  return 'outline';
}

function statusTextClass(status: string): string {
  if (status === '校验通过' || status === '已申报') return 'text-success';
  if (status === '待复核') return 'text-warning';
  if (status === '已驳回') return 'text-danger';
  return '';
}

// Maps status prefix to display label
function statusLabel(status: string): string {
  if (status === '待复核' || status === '已申报' || status === '校验通过' || status === '已驳回') {
    return status;
  }
  return status || '待复核';
}

// ============================================================================
// Main Component
// ============================================================================

export function TaxView() {
  const [confirmed, setConfirmed] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────

  const listQuery = trpc.tax.list.useQuery();
  const summaryQuery = trpc.tax.summary.useQuery({ fiscalPeriodId: 1 });

  const filings = listQuery.data?.items ?? [];
  const summary = summaryQuery.data;

  const isListLoading = listQuery.isLoading;
  const isSummaryLoading = summaryQuery.isLoading;
  const isListError = listQuery.isError;
  const isSummaryError = summaryQuery.isError;
  const listErrorMsg = listQuery.error?.message;
  const summaryErrorMsg = summaryQuery.error?.message;

  const isLoading = isListLoading || isSummaryLoading;
  const isError = (!isListLoading && isListError) || (!isSummaryLoading && isSummaryError);
  const errorMsg = listErrorMsg || summaryErrorMsg || '数据加载失败';

  // ─── Derived: tax diff from filings ────────────────────────────────

  const taxDiffTotal = filings
    .filter((f) => f.taxDiff)
    .reduce((sum, f) => sum + Number(f.taxDiff ?? 0), 0);

  // ─── Render helpers ────────────────────────────────────────────────

  const renderSkeletonStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="elevation-1">
          <CardContent className="pt-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-36 mt-1" />
            <Skeleton className="h-3 w-32 mt-0.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSkeletonFilings = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="elevation-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-8 rounded-full mt-0.5" />
                <div>
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">TAX FILING</div>
          <h1 className="page-title mt-1">纳税申报</h1>
          <p className="page-subtitle">
            复核申报表、税会差异与勾稽关系，确认后由授权人员提交。
          </p>
        </div>
        <Button size="sm">复核申报表</Button>
      </div>

      <Separator />

      {/* Stats */}
      {isLoading ? (
        renderSkeletonStats()
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">销项税额</div>
              <div className="text-xl font-bold font-mono mt-1">
                {summary ? fmtCurrency(summary.outputTaxTotal) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">已与开票数据核对</div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">进项税额</div>
              <div className="text-xl font-bold font-mono mt-1">
                {summary ? fmtCurrency(summary.inputTaxTotal) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {filings.filter((f) => f.taxType === '进项税' || f.taxType === 'input').length}笔待用途确认
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">预计应纳增值税</div>
              <div className="text-xl font-bold font-mono mt-1">
                {summary ? fmtCurrency(summary.netPayable) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">未包含上期留抵</div>
            </CardContent>
          </Card>
          <Card className="elevation-1 border-warning/20">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">账票差异</div>
              <div className="text-xl font-bold font-mono mt-1 text-warning">
                {fmtCurrency(taxDiffTotal)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {filings.filter((f) => f.diffNote).length}项需要说明
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filing period info */}
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        税款所属期：2026-07-01 至 2026-07-31 ｜ 申报截止：2026-08-17
      </div>

      {/* Filing forms */}
      {isLoading ? (
        renderSkeletonFilings()
      ) : isListError ? (
        <Alert variant="destructive">
          <AlertTitle>申报列表加载失败</AlertTitle>
          <AlertDescription>{listErrorMsg || '无法获取纳税申报数据'}</AlertDescription>
        </Alert>
      ) : filings.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无纳税申报数据
        </div>
      ) : (
        <div className="space-y-3">
          {filings.map((form) => {
            const badge = taxTypeBadge(form.taxType);
            const taxAmount = form.taxPayable ?? form.outputTax ?? 0;
            const detail = form.formDetail ? (() => {
              try {
                return JSON.parse(form.formDetail);
              } catch {
                return null;
              }
            })() : null;

            return (
              <Card key={form.id} className="elevation-1">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5">{badge}</Badge>
                    <div>
                      <div className="text-sm font-medium">{form.formName}</div>
                      <div className="text-xs text-muted-foreground">
                        {form.taxType === '增' || form.taxType === 'output'
                          ? '一般纳税人 · 1张主表＋6张附表'
                          : form.taxType === '企' || form.taxType === 'corporate'
                            ? 'A类 · 季度申报'
                            : form.taxType === '印' || form.taxType === 'stamp'
                              ? '印花税 · 按次/按季'
                              : `申报截止: ${fmtDate(form.filingDeadline)}`}
                      </div>
                      <div className="text-xs font-mono text-foreground mt-0.5">
                        {form.taxType === '增' || form.taxType === 'output'
                          ? `应补（退）税额 ${fmtCurrency(taxAmount)}`
                          : form.taxType === '企' || form.taxType === 'corporate'
                            ? `本期应补所得税 ${fmtCurrency(taxAmount)}`
                            : `本期应纳税额 ${fmtCurrency(taxAmount)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={statusVariant(form.status)}
                      className={statusTextClass(form.status)}
                    >
                      {statusLabel(form.status)}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs">预览</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation */}
      <Card className="elevation-1">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="confirm-tax"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="confirm-tax" className="text-sm cursor-pointer">
              我已复核申报数据，并确认由授权人员执行正式申报
            </Label>
          </div>
          <Button
            size="sm"
            disabled={!confirmed || isLoading}
            onClick={() => toast('申报清册已提交')}
          >
            提交申报清册
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
