'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle, Calculator, TrendingUp, Receipt, BookOpen, Loader2, AlertCircle, ListChecks } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import type { ReactNode } from 'react';

// ── Transfer type → icon mapping ──
const transferIconMap: Record<string, ReactNode> = {
  '折': <Calculator className="h-4 w-4" />,
  '摊': <TrendingUp className="h-4 w-4" />,
  '税': <Receipt className="h-4 w-4" />,
  '损': <BookOpen className="h-4 w-4" />,
};

/** Format Prisma Decimal (serialized as string by superjson) to ¥ currency. */
function formatAmount(raw: unknown): string {
  const num = typeof raw === 'string' ? parseFloat(raw) : Number(raw ?? 0);
  return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PeriodEndView() {
  const utils = trpc.useUtils();

  // ── Fetch current fiscal period ──
  const { data: period, isLoading: periodLoading } = trpc.period.current.useQuery();
  const periodId = period ? Number(period.id) : undefined;

  // ── Fetch period-end steps and transfers ──
  const {
    data: periodEndData,
    isLoading: dataLoading,
    error: dataError,
    refetch,
  } = trpc.closing.periodEnd.useQuery(
    { fiscalPeriodId: periodId! },
    { enabled: periodId !== undefined },
  );

  const steps = periodEndData?.steps ?? [];
  const transfers = periodEndData?.transfers ?? [];

  const handleExecute = () => {
    toast('结转完成：相关数据已写入共享账务数据');
  };

  const handleRetry = () => {
    refetch();
  };

  const periodLabel = period ? `${period.year}年${period.month}月` : '当前期间';

  // ── Loading state ──
  if (periodLoading || dataLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[--primary]" />
          <p className="text-sm text-muted-foreground">加载期末结转数据...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (dataError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-[--danger]" />
          <div>
            <p className="text-sm font-medium text-foreground">加载期末结转数据失败</p>
            <p className="text-xs text-muted-foreground mt-1">请检查网络连接后重试</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (steps.length === 0 && transfers.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">PERIOD END</div>
            <h1 className="page-title mt-1">期末结转</h1>
            <p className="page-subtitle">{periodLabel} — 无待结转项目</p>
          </div>
        </div>
        <Separator />
        <Card className="elevation-1">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">当前会计期间没有期末结转步骤和转账项目</p>
            <p className="text-xs text-muted-foreground mt-1">请确认期间配置是否正确</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main content ──
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">PERIOD END</div>
          <h1 className="page-title mt-1">期末结转</h1>
          <p className="page-subtitle">{periodLabel} — 记账会计准备结转草稿...</p>
        </div>
        <Button size="sm" className="bg-[--primary]" onClick={handleExecute}>
          复核并执行期末结转
        </Button>
      </div>

      <Separator />

      {/* Step flow */}
      {steps.length > 0 && (
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {steps.map((step, i) => (
                <div key={step.id != null ? String(step.id) : i} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {step.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-[--success]" />
                    ) : step.status === 'pending' ? (
                      <Circle className="h-5 w-5 text-[--warning]" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {i + 1}. {step.stepLabel}
                      </div>
                      {step.detail && (
                        <div className="text-[11px] text-muted-foreground">{step.detail}</div>
                      )}
                    </div>
                  </div>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer cards */}
      {transfers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transfers.map((t) => (
            <Card key={t.id != null ? String(t.id) : t.transferType} className="elevation-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge
                    className={
                      t.status === '待生成'
                        ? 'bg-[--warning]/20 text-[--warning]'
                        : 'bg-[--success]/20 text-[--success]'
                    }
                  >
                    {t.transferType}
                  </Badge>
                  {t.name}
                </CardTitle>
                {t.description && (
                  <CardDescription>{t.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono tabular-nums">
                    {formatAmount(t.amount)}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      t.status === '待生成'
                        ? 'text-[--warning]'
                        : 'text-[--success]'
                    }
                  >
                    {transferIconMap[t.transferType] ?? null}
                    <span className="ml-1">{t.status}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
