'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────

const PLATFORM_NAMES: Record<string, string> = {
  dy: '抖音',
  tmall: '天猫',
  jd: '京东',
  pdd: '拼多多',
};

function fmtCurrency(n: number | string | undefined | null): string {
  const v = Number(n ?? 0);
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toNum(v: unknown): number {
  return Number(v);
}

// ─── Component ────────────────────────────────────────────────────────

export function ReconcileView() {
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────────────────────────
  const batchesQuery = trpc.reconciliation.platformBatches.useQuery();

  const diffsQuery = trpc.reconciliation.platformDiffs.useQuery(
    { batchId: expandedBatchId!, limit: 20, offset: 0 },
    { enabled: !!expandedBatchId },
  );

  // ── Mutations ────────────────────────────────────────────────────
  const resolveMutation = trpc.reconciliation.resolvePlatformDiff.useMutation({
    onSuccess: () => {
      toast.success('差异已处理');
      utils.reconciliation.platformBatches.invalidate();
      if (expandedBatchId) {
        utils.reconciliation.platformDiffs.invalidate({ batchId: expandedBatchId });
      }
    },
    onError: (err) => {
      toast.error(err.message || '处理失败，请重试');
    },
  });

  // ── Derived data ─────────────────────────────────────────────────
  const batches = batchesQuery.data ?? [];

  // Platform summaries: group by platform field
  const platformSummaryMap = new Map<string, { count: number; diffCount: number; diffAmount: number }>();
  for (const b of batches) {
    const existing = platformSummaryMap.get(b.platform);
    if (existing) {
      existing.count++;
      existing.diffCount += b.diffCount;
      existing.diffAmount += toNum(b.diffAmount);
    } else {
      platformSummaryMap.set(b.platform, {
        count: 1,
        diffCount: b.diffCount,
        diffAmount: toNum(b.diffAmount),
      });
    }
  }

  const platforms = Array.from(platformSummaryMap.entries()).map(([platform, data]) => {
    const name = PLATFORM_NAMES[platform] || platform;
    const hasDiff = data.diffCount > 0;
    return {
      name,
      diff: hasDiff
        ? `${data.diffCount}笔差异 · ${fmtCurrency(data.diffAmount)}`
        : '全部相符',
      status: (hasDiff ? 'warning' : 'success') as 'warning' | 'success',
    };
  });

  // Stats
  const matchedOrders = batches.reduce((s, b) => s + b.matchedOrders, 0);
  const totalOrders = batches.reduce((s, b) => s + b.totalOrders, 0);
  const overallMatchRate =
    totalOrders > 0 ? ((matchedOrders / totalOrders) * 100).toFixed(1) : '0.0';
  const totalDiffs = batches.reduce((s, b) => s + b.diffCount, 0);
  const totalDiffAmount = batches.reduce((s, b) => s + toNum(b.diffAmount), 0);
  const pendingCount = batches.filter((b) => b.status === 'pending').length;

  const stats = [
    {
      label: '本期结算批次',
      value: `${batches.length} 批`,
      sub: `${platforms.length}个平台 · ${batches.length}个批次`,
    },
    {
      label: '订单匹配率',
      value: `${overallMatchRate}%`,
      sub: `${matchedOrders.toLocaleString()} / ${totalOrders.toLocaleString()}笔`,
    },
    {
      label: '已定位差异',
      value: `${totalDiffs} 笔`,
      sub: `差异金额 ${fmtCurrency(totalDiffAmount)}`,
    },
    {
      label: '待处理批次',
      value: `${pendingCount} 批`,
      sub: '需人工确认',
    },
  ];

  // Expanded batch data
  const expandedBatch = batches.find((b) => toNum(b.id) === expandedBatchId);
  const diffItems = diffsQuery.data?.items ?? [];

  // ── Handlers ─────────────────────────────────────────────────────
  const handleToggleBatch = (id: number) => {
    setExpandedBatchId((prev) => (prev === id ? null : id));
  };

  const handleResolve = (itemId: number) => {
    resolveMutation.mutate({
      itemId: toNum(itemId),
      resolution: '确认入账',
    });
  };

  // ── Loading state ────────────────────────────────────────────────
  if (batchesQuery.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            PLATFORM RECONCILIATION
          </div>
          <Skeleton className="h-8 w-48 mt-1" />
          <Skeleton className="h-4 w-96 mt-1" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="elevation-1">
              <CardContent className="pt-3 text-center">
                <Skeleton className="h-5 w-16 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="elevation-1">
              <CardContent className="pt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-32 mt-1" />
                <Skeleton className="h-3 w-40 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (batchesQuery.isError) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            PLATFORM RECONCILIATION
          </div>
          <h1 className="page-title mt-1">平台结算对账</h1>
        </div>
        <Separator />
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>
            {batchesQuery.error?.message || '无法加载平台对账数据，请稍后重试。'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => batchesQuery.refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> 重试
        </Button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────
  if (batches.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              PLATFORM RECONCILIATION
            </div>
            <h1 className="page-title mt-1">平台结算对账</h1>
            <p className="page-subtitle">
              平台账单由系统自动归集匹配，会计主管查看证据链、确认差异原因并下发待制证资料。
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 ripple-container">
              <RefreshCw className="h-4 w-4" />
              同步平台账单
            </Button>
          </div>
        </div>
        <Separator />
        <Alert>
          <AlertTitle>暂无数据</AlertTitle>
          <AlertDescription>
            当前没有平台结算批次数据。请先同步平台账单以开始对账。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            PLATFORM RECONCILIATION
          </div>
          <h1 className="page-title mt-1">平台结算对账</h1>
          <p className="page-subtitle">
            平台账单由系统自动归集匹配，会计主管查看证据链、确认差异原因并下发待制证资料。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 ripple-container">
            <RefreshCw className="h-4 w-4" />
            同步平台账单
          </Button>
          <Button size="sm" variant="outline" className="ripple-container">
            重新执行匹配
          </Button>
        </div>
      </div>

      <Separator />

      {/* ========== Platform Summaries ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {platforms.map((p) => (
          <Card
            key={p.name}
            className={cn(
              'elevation-1',
              p.status === 'warning' ? 'border-warning/30' : 'border-success/30',
            )}
          >
            <CardContent className="pt-3 text-center">
              <div className="text-sm font-medium">{p.name}</div>
              <div
                className={cn(
                  'text-xs mt-0.5',
                  p.status === 'success' ? 'text-success' : 'text-warning',
                )}
              >
                {p.diff}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Stats ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold mt-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Settlement Batches ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">结算批次</CardTitle>
          <CardDescription>共 {batches.length} 个批次</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {batches.map((batch) => {
            const batchId = toNum(batch.id);
            const isExpanded = expandedBatchId === batchId;
            const hasDiff = batch.diffCount > 0;
            const entityName = batch.settlementEntity?.name || batch.platform;
            const platformName = PLATFORM_NAMES[batch.platform] || batch.platform;

            return (
              <div key={String(batch.id)} className="border rounded-lg">
                <button
                  onClick={() => handleToggleBatch(batchId)}
                  className="w-full text-left p-3 hover:bg-muted/30 rounded-t-lg ripple-container"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {entityName} · {batch.batchNo}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {platformName} · {batch.totalOrders.toLocaleString()}笔订单
                      </div>
                    </div>
                    {hasDiff ? (
                      <Badge className="bg-warning/10 text-warning">
                        {fmtCurrency(toNum(batch.diffAmount))}
                      </Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success">✓ 已匹配</Badge>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-3 border-t space-y-3 text-sm">
                    {/* Batch summary grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">结算金额</span>
                        <p className="font-medium">{fmtCurrency(toNum(batch.totalAmount))}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">匹配率</span>
                        <p className="font-medium">
                          {batch.matchRate != null
                            ? `${(toNum(batch.matchRate) * 100).toFixed(1)}%`
                            : `${batch.matchedOrders}/${batch.totalOrders}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">差异笔数</span>
                        <p
                          className={cn(
                            'font-medium',
                            hasDiff ? 'text-warning' : 'text-success',
                          )}
                        >
                          {batch.diffCount} 笔
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">差异金额</span>
                        <p
                          className={cn(
                            'font-medium',
                            hasDiff ? 'text-warning' : 'text-success',
                          )}
                        >
                          {fmtCurrency(toNum(batch.diffAmount))}
                        </p>
                      </div>
                    </div>

                    {/* Diff items loading */}
                    {diffsQuery.isLoading && (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    )}

                    {/* Diff items list */}
                    {!diffsQuery.isLoading && diffItems.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-medium text-xs">差异明细：</p>
                        {diffItems.map((item) => (
                          <div
                            key={String(item.id)}
                            className="bg-accent/30 rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">
                                {item.orderNo
                                  ? `订单 ${item.orderNo}`
                                  : `对账项 #${String(item.id)}`}
                              </span>
                              <Badge
                                className={cn(
                                  'text-xs',
                                  item.status === 'resolved'
                                    ? 'bg-success/10 text-success'
                                    : 'bg-warning/10 text-warning',
                                )}
                                variant="outline"
                              >
                                {item.status === 'resolved' ? '已处理' : '待处理'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">平台金额</span>
                                <p className="font-medium">
                                  {fmtCurrency(toNum(item.platformAmount))}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">系统金额</span>
                                <p className="font-medium">
                                  {fmtCurrency(toNum(item.systemAmount))}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">差异</span>
                                <p
                                  className={cn(
                                    'font-medium',
                                    toNum(item.diffAmount) !== 0
                                      ? 'text-warning'
                                      : 'text-success',
                                  )}
                                >
                                  {fmtCurrency(toNum(item.diffAmount))}
                                </p>
                              </div>
                            </div>

                            {item.diffReason && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">差异原因：</span>
                                {item.diffReason}
                              </div>
                            )}

                            {item.resolution && (
                              <div className="text-xs text-success">
                                <span className="font-medium">处理方案：</span>
                                {item.resolution}
                              </div>
                            )}

                            {item.status !== 'resolved' && (
                              <div className="flex gap-2 pt-1">
                                <Button
                                  size="sm"
                                  className="ripple-container h-7 text-xs"
                                  onClick={() => handleResolve(toNum(item.id))}
                                  disabled={resolveMutation.isPending}
                                >
                                  确认入账
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ripple-container h-7 text-xs"
                                >
                                  待人工复核
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No diffs */}
                    {!diffsQuery.isLoading && diffItems.length === 0 && (
                      <div className="text-xs text-muted-foreground py-2">
                        该批次无差异项，所有订单均已匹配。
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
