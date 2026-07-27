'use client';

import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Scale, Hash, Calendar } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────

const CHECK_TYPE_META: Record<string, { label: string; icon: typeof Scale }> = {
  balance: { label: '借贷平衡', icon: Scale },
  uniqueness: { label: '凭证号唯一', icon: Hash },
  period: { label: '会计期间', icon: Calendar },
};

function getCheckMeta(checkType: string) {
  return CHECK_TYPE_META[checkType] ?? { label: checkType, icon: Scale };
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

// ─── Component ──────────────────────────────────────────────────────

export function AccountingCheckView() {
  // Fetch current fiscal period
  const periodQuery = trpc.period.current.useQuery();
  const period = periodQuery.data;

  // Fetch accounting checks only when period is available
  const checksQuery = trpc.audit.checks.useQuery(
    { fiscalPeriodId: Number(period?.id ?? 0) },
    { enabled: !!period },
  );

  const checks = checksQuery.data ?? [];
  const periodLoading = periodQuery.isLoading;
  const checksLoading = !!period && checksQuery.isLoading;
  const isLoading = periodLoading || checksLoading;
  const isError = periodQuery.isError || checksQuery.isError;
  const errorMsg = checksQuery.error?.message || periodQuery.error?.message;

  const periodLabel = period
    ? `${period.year}-${String(period.month).padStart(2, '0')}`
    : '';

  const handleRunChecks = () => {
    if (checks.every((c) => c.isPassed)) {
      toast.success('数据校验完成：全部校验通过');
    } else {
      const failed = checks.filter((c) => !c.isPassed);
      toast.warning(`数据校验完成：${failed.length} 项未通过`, {
        description: failed.map((c) => getCheckMeta(c.checkType).label).join('、'),
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">凭证与期间控制</h1>
          <p className="page-subtitle">
            基础控制：借贷平衡、凭证号唯一、会计期间开放状态...
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleRunChecks}
          disabled={isLoading}
        >
          执行数据校验
        </Button>
      </div>

      <Separator />

      {/* ── Error state ─────────────────────────────────────────── */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>
            {errorMsg || '无法获取会计校验数据，请检查网络连接后重试'}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Loading state ───────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="elevation-1">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── No period ───────────────────────────────────────────── */}
      {!isLoading && !isError && !period && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          未找到当前会计期间，无法加载校验数据
        </div>
      )}

      {/* ── Data ────────────────────────────────────────────────── */}
      {!isLoading && !isError && checks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {checks.map((check) => {
            const meta = getCheckMeta(check.checkType);
            const Icon = meta.icon;
            const detailText =
              check.details ||
              (check.checkType === 'period' ? periodLabel : fmtDate(check.checkedAt));
            return (
              <Card
                key={check.id ?? check.checkType}
                className={cn(
                  'elevation-1',
                  check.isPassed ? 'border-success/20' : 'border-danger/20',
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        check.isPassed ? 'text-success' : 'text-danger',
                      )}
                    />
                    {meta.label}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {detailText}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={
                      check.isPassed
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }
                  >
                    {check.isPassed ? '已通过' : '未通过'}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Empty checks ────────────────────────────────────────── */}
      {!isLoading && !isError && period && checks.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          当前期间（{periodLabel}）暂无校验记录，请点击"执行数据校验"生成
        </div>
      )}
    </div>
  );
}
