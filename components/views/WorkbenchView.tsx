'use client';

import { useAppStore } from '@/lib/store';
import { trpc } from '@/lib/trpc-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  FileText,
  Clock,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// ============================================================
// WorkbenchView — role-based financial management workbench
// ============================================================

export function WorkbenchView() {
  const { currentRole } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      {/* Page title — consistent across all roles */}
      <div>
        <h1 className="page-title">
          我的工作台
        </h1>
      </div>

      {currentRole === '财务负责人' && <DirectorWorkbench />}
      {currentRole === '财务专员' && <SpecialistWorkbench />}
      {currentRole === '出纳' && <CashierWorkbench />}
    </div>
  );
}

// ============================================================
// 财务负责人 (Financial Director) Workbench
// ============================================================

function DirectorWorkbench() {
  const pendingVouchers = trpc.voucher.list.useQuery({ auditStatus: 'pending', limit: 1 });
  const pendingPayments = trpc.payment.list.useQuery({ group: 'pending', limit: 1 });
  const riskCounts = trpc.risk.counts.useQuery();
  const closingTasks = trpc.closing.tasks.useQuery({ fiscalPeriodId: 1 });
  const riskIndicators = trpc.risk.indicators.useQuery({ fiscalPeriodId: 1 });

  const isLoadingAll =
    pendingVouchers.isLoading ||
    pendingPayments.isLoading ||
    riskCounts.isLoading ||
    closingTasks.isLoading ||
    riskIndicators.isLoading;

  const isErrorAll =
    pendingVouchers.isError ||
    pendingPayments.isError ||
    riskCounts.isError ||
    closingTasks.isError ||
    riskIndicators.isError;

  // ── Derived stats ───────────────────────────────────────────────
  const pendingVoucherCount = pendingVouchers.data?.total ?? 0;
  const pendingPaymentCount = pendingPayments.data?.total ?? 0;
  const riskAllCount = riskCounts.data?.all ?? 0;
  const riskHighCount = riskCounts.data?.high ?? 0;

  // Indicator health rate
  const indicators = riskIndicators.data ?? [];
  const indicatorCount = indicators.length;
  const indicatorWarningCount = indicators.filter((i) => i.isWarning).length;
  const healthRate =
    indicatorCount > 0
      ? `${((indicatorCount - indicatorWarningCount) / indicatorCount * 100).toFixed(1)}%`
      : '—';

  // Incomplete closing tasks
  const tasks = (closingTasks.data ?? []).filter((t) => !t.isCompleted);

  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: isLoadingAll ? '—' : `${pendingVoucherCount}张`,
      label: '待复核凭证',
      sub: 'AI 已预填',
      extra: '原始凭证与分录',
    },
    {
      icon: <Clock className="h-5 w-5 text-[--warning]" />,
      value: isLoadingAll ? '—' : `${pendingPaymentCount}项`,
      label: '待审批事项',
      sub: '付款与期末结转',
      extra: '合规校验已完成',
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-[--danger]" />,
      value: isLoadingAll ? '—' : `${riskAllCount}项`,
      label: '待处理风险',
      sub: `${riskHighCount}项高优先级`,
      extra: '资金、账税与经营',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-[--success]" />,
      value: isLoadingAll ? '—' : healthRate,
      label: '指标健康率',
      sub: (
        <span
          className={
            indicatorWarningCount > 0 ? 'text-[--warning] font-medium' : 'text-[--success] font-medium'
          }
        >
          {indicatorWarningCount > 0 ? `${indicatorWarningCount}项预警` : '全部达标'}
        </span>
      ),
      extra: '风险指标监控',
    },
  ];

  // AI domains derived from live query data
  const aiDomains = [
    {
      title: '智能采集与原始凭证',
      description: `${pendingVoucherCount} 张凭证等待复核，AI 已完成预填与归类`,
    },
    {
      title: '资金收付与银行对账',
      description: `${pendingPaymentCount} 笔付款待审批，已完成合规校验`,
    },
    {
      title: '凭证、账簿与报表',
      description: `指标健康率 ${healthRate}，重点关注报表勾稽与列报口径`,
    },
    {
      title: '风险、税务与经营分析',
      description: `${riskAllCount} 项 AI 诊断需要负责人决策与闭环`,
    },
  ];

  // ── Error state for entire dashboard ────────────────────────────
  if (isErrorAll) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>数据加载失败</AlertTitle>
        <AlertDescription>
          无法获取工作台数据，请检查网络连接后重试。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-heading">
                财务负责人 · 衡账 AI 协同工作台
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                汇集衡账 AI 的采集、核算、资金、报表、税务和风险事项；仅展示需要负责人复核、审批或决策的内容。
              </CardDescription>
            </div>
            <Button className="shrink-0" size="lg">
              <AlertTriangle className="h-4 w-4" />
              处理风险与异常
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Permission bar */}
      <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[--success]" />
        <span>
          ✓ 负责人权限已启用 — 可查看全局看板、AI 诊断、风险异常，并对付款、结转和报表执行复核审批。
        </span>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card
            key={i}
            className="elevation-1 hover:elevation-2 cursor-pointer transition-shadow duration-200"
            size="sm"
          >
            <CardContent>
              {isLoadingAll ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {card.label}
                    </span>
                    <div className="flex-shrink-0 rounded-full bg-muted p-1.5">
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground font-heading">
                    {card.value}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{card.sub}</span>
                    <span className="text-border">|</span>
                    <span>{card.extra}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Todo list + AI domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todo list */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-[--warning]" />
              待办事项
            </CardTitle>
            <CardDescription>需要复核、审批和决策的事项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {closingTasks.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : closingTasks.isError ? (
              <div className="py-4 text-center">
                <p className="text-sm text-[--danger]">待办事项加载失败</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {'数据加载失败，请稍后重试'}
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                暂无待办事项
              </div>
            ) : (
              tasks.slice(0, 6).map((task, i) => (
                <div key={String(task.id)}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={task.priority === '高' ? 'destructive' : 'secondary'}
                      className="mt-0.5 shrink-0 text-[11px]"
                    >
                      {task.priority}
                    </Badge>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{task.module ?? '—'}</span>
                        <span className="text-border">·</span>
                        <Clock className="h-3 w-3" />
                        <span>{task.deadline ?? '—'}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI work domains */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              衡账 AI 工作域
            </CardTitle>
            <CardDescription>智能助理在各模块的工作进展</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAll ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              aiDomains.map((domain, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[--primary] flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">账</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {domain.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {domain.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// 财务专员 (Specialist) Workbench
// ============================================================

function SpecialistWorkbench() {
  const pendingSourceVouchers = trpc.sourceVoucher.list.useQuery({
    status: '待处理',
    limit: 1,
  });
  const pendingVouchers = trpc.voucher.list.useQuery({ auditStatus: 'pending', limit: 1 });
  const platformBatches = trpc.reconciliation.platformBatches.useQuery();
  const closingProgress = trpc.closing.progress.useQuery({ fiscalPeriodId: 1 });
  const closingTasks = trpc.closing.tasks.useQuery({ fiscalPeriodId: 1 });

  const isLoadingAll =
    pendingSourceVouchers.isLoading ||
    pendingVouchers.isLoading ||
    platformBatches.isLoading ||
    closingProgress.isLoading ||
    closingTasks.isLoading;

  const isErrorAll =
    pendingSourceVouchers.isError ||
    pendingVouchers.isError ||
    platformBatches.isError ||
    closingProgress.isError ||
    closingTasks.isError;

  // ── Derived stats ───────────────────────────────────────────────
  const pendingSourceCount = pendingSourceVouchers.data?.total ?? 0;
  const pendingVoucherFillCount = pendingVouchers.data?.total ?? 0;

  const batches = platformBatches.data ?? [];
  const pendingBatchCount = batches.filter(
    (b) => b.status === 'pending' || b.status === 'in_progress',
  ).length;

  const cp = closingProgress.data;
  const completedClosing = cp?.completed ?? 0;
  const totalClosing = cp?.total ?? 0;

  // ── Task progress from closing tasks (group tasks by module for progress bars) ──
  const allClosingTasks = closingTasks.data ?? [];
  // Group tasks by module for progress bars
  const taskGroups: { label: string; done: number; total: number; color: string }[] = [];
  if (allClosingTasks.length > 0) {
    const grouped = new Map<string, { done: number; total: number }>();
    for (const t of allClosingTasks) {
      const key = t.module ?? '其他';
      const entry = grouped.get(key) ?? { done: 0, total: 0 };
      entry.total += 1;
      if (t.isCompleted) entry.done += 1;
      grouped.set(key, entry);
    }
    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)'];
    let ci = 0;
    for (const [label, counts] of grouped) {
      taskGroups.push({ label, ...counts, color: colors[ci % colors.length] });
      ci++;
    }
  }
  // Fallback if no real data
  if (taskGroups.length === 0) {
    taskGroups.push(
      { label: '平台对账', done: 0, total: 0, color: 'var(--primary)' },
      { label: '凭证填制', done: 0, total: 0, color: 'var(--success)' },
      { label: '月结任务', done: completedClosing, total: totalClosing, color: 'var(--warning)' },
    );
  }

  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: isLoadingAll ? '—' : `${pendingSourceCount}张`,
      label: '待审核原始凭证',
      sub: 'AI已完成识别与归类',
    },
    {
      icon: <FileText className="h-5 w-5 text-[--warning]" />,
      value: isLoadingAll ? '—' : `${pendingVoucherFillCount}张`,
      label: '待填制凭证',
      sub: '待确认会计科目与税率',
    },
    {
      icon: <Wallet className="h-5 w-5 text-primary" />,
      value: isLoadingAll ? '—' : `${pendingBatchCount}份`,
      label: '平台账单待对账',
      sub: '佣金、退款与运费险待核',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-[--success]" />,
      value: isLoadingAll ? '—' : `${completedClosing}/${totalClosing}`,
      label: '期末结转任务',
      sub: '待提交负责人复核',
    },
  ];

  if (isErrorAll) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>数据加载失败</AlertTitle>
        <AlertDescription>
          无法获取工作台数据，请检查网络连接后重试。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-heading">
                财务专员 · 工作台
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                集中处理分配给我的应收应付、月结和数据质量任务。
              </CardDescription>
            </div>
            <Button className="shrink-0" size="lg">
              <FileText className="h-4 w-4" />
              处理应收任务
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Permission bar */}
      <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[--success]" />
        <span>
          ✓ 当前以财务专员权限登录 — 仅显示与本岗位相关的菜单、数据和操作；无权访问的页面不会出现在导航中。
        </span>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card
            key={i}
            className="elevation-1 hover:elevation-2 cursor-pointer transition-shadow duration-200"
            size="sm"
          >
            <CardContent>
              {isLoadingAll ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {card.label}
                    </span>
                    <div className="flex-shrink-0 rounded-full bg-muted p-1.5">
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground font-heading">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task progress section */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="h-4 w-4 text-[--warning]" />
            任务进度
          </CardTitle>
          <CardDescription>当前分配给我的各项任务完成情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {closingTasks.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : taskGroups.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              暂无任务数据
            </div>
          ) : (
            taskGroups.map((task, i) => {
              const pct = task.total > 0 ? Math.round((task.done / task.total) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {task.label}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {task.done}/{task.total}
                    </span>
                  </div>
                  <Progress value={pct}>
                    <ProgressTrack>
                      <ProgressIndicator
                        className="h-full transition-all"
                        style={{ backgroundColor: task.color }}
                      />
                    </ProgressTrack>
                  </Progress>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// 出纳 (Cashier) Workbench
// ============================================================

function CashierWorkbench() {
  const bankAccounts = trpc.bank.listAccounts.useQuery();
  const bankStatements = trpc.reconciliation.bankStatements.useQuery();
  const paymentStats = trpc.payment.stats.useQuery();
  const pendingPayments = trpc.payment.list.useQuery({ group: 'pending', limit: 1 });
  const closingTasks = trpc.closing.tasks.useQuery({ fiscalPeriodId: 1 });

  const isLoadingAll =
    bankAccounts.isLoading ||
    bankStatements.isLoading ||
    paymentStats.isLoading ||
    pendingPayments.isLoading ||
    closingTasks.isLoading;

  const isErrorAll =
    bankAccounts.isError ||
    bankStatements.isError ||
    paymentStats.isError ||
    pendingPayments.isError ||
    closingTasks.isError;

  // ── Derived stats ───────────────────────────────────────────────
  const statements = bankStatements.data ?? [];
  const pendingImportCount = statements.filter((s) => s.importStatus === 'pending').length;

  // Count unmatched bank reconciliation items (approximate via statement status)
  const importedStatements = statements.filter((s) => s.importStatus === 'imported').length;

  // Payment stats
  const pendingPaymentCount = paymentStats.data?.pending ?? 0;
  const completedPaymentCount = paymentStats.data?.completed ?? 0;
  const totalPaymentCount =
    (paymentStats.data?.pending ?? 0) +
    (paymentStats.data?.processing ?? 0) +
    (paymentStats.data?.completed ?? 0);

  // Bank accounts
  const accounts = bankAccounts.data ?? [];
  const primaryAccount = accounts[0];

  // Closing tasks for cashier
  const tasks = (closingTasks.data ?? []).filter((t) => !t.isCompleted);

  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: isLoadingAll ? '—' : `${pendingImportCount}份`,
      label: '待导入银行流水',
      sub: primaryAccount?.accountName ?? '法人账户',
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-[--warning]" />,
      value: isLoadingAll ? '—' : `${pendingPaymentCount}笔`,
      label: '待执行付款',
      sub: '已审批待银行付款',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-[--success]" />,
      value: isLoadingAll
        ? '—'
        : `${completedPaymentCount}/${totalPaymentCount}`,
      label: '付款完成进度',
      sub: `${importedStatements} 份对账单已导入`,
    },
  ];

  // ── Today's payment summary amounts (static, no dedicated today-summary query) ──
  const paymentSummary = {
    income: { amount: '¥128,500.00', count: 4 },
    expense: { amount: '¥357,200.00', count: pendingPaymentCount || 5 },
  };

  if (isErrorAll) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>数据加载失败</AlertTitle>
        <AlertDescription>
          无法获取工作台数据，请检查网络连接后重试。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-heading">
                出纳 · 工作台
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                集中处理账户流水、已审批付款、回款登记和银行对账。
              </CardDescription>
            </div>
            <Button className="shrink-0" size="lg">
              <Wallet className="h-4 w-4" />
              进入资金管理
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Permission bar */}
      <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[--success]" />
        <span>
          ✓ 当前以出纳权限登录 — 仅显示与本岗位相关的菜单、数据和操作；无权访问的页面不会出现在导航中。
        </span>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <Card
            key={i}
            className="elevation-1 hover:elevation-2 cursor-pointer transition-shadow duration-200"
            size="sm"
          >
            <CardContent>
              {isLoadingAll ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {card.label}
                    </span>
                    <div className="flex-shrink-0 rounded-full bg-muted p-1.5">
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground font-heading">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Todo list + Payment summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todo list */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-[--warning]" />
              待办事项
            </CardTitle>
            <CardDescription>当前需要处理的资金相关任务</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {closingTasks.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : closingTasks.isError ? (
              <div className="py-4 text-center">
                <p className="text-sm text-[--danger]">待办事项加载失败</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {'数据加载失败，请稍后重试'}
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                暂无待办事项
              </div>
            ) : (
              tasks.slice(0, 6).map((item, i) => (
                <div key={String(item.id)}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{item.module ?? '—'}</span>
                        <span className="text-border">·</span>
                        <Clock className="h-3 w-3" />
                        <span>{item.deadline ?? '—'}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 今日收付概况 */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              今日收付概况
            </CardTitle>
            <CardDescription>当日资金流入流出汇总</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Income */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">今日收入</p>
                <p className="text-xs text-muted-foreground">
                  {isLoadingAll ? (
                    <Skeleton className="h-3 w-10 inline-block" />
                  ) : (
                    `${paymentSummary.income.count} 笔`
                  )}
                </p>
              </div>
              <p className="text-lg font-bold text-[--success] font-heading tabular-nums">
                {paymentSummary.income.amount}
              </p>
            </div>

            <Separator />

            {/* Expense */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">今日支出</p>
                <p className="text-xs text-muted-foreground">
                  {isLoadingAll ? (
                    <Skeleton className="h-3 w-10 inline-block" />
                  ) : (
                    `${paymentSummary.expense.count} 笔`
                  )}
                </p>
              </div>
              <p className="text-lg font-bold text-[--danger] font-heading tabular-nums">
                {paymentSummary.expense.amount}
              </p>
            </div>

            <Separator />

            {/* Net */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">今日净额</p>
              <p className="text-lg font-bold text-foreground font-heading tabular-nums">
                -¥228,700.00
              </p>
            </div>

            {/* Bank account info */}
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">关联银行账户</span>
                {primaryAccount && (
                  <Badge variant="outline" className="text-[11px]">
                    {primaryAccount.bankName}
                  </Badge>
                )}
              </div>
              {isLoadingAll ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : primaryAccount ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    {primaryAccount.accountType === '法人账户' ? '法人账户' : primaryAccount.accountType} ·{' '}
                    {primaryAccount.accountNo.slice(0, 4)} **** ****{' '}
                    {primaryAccount.accountNo.slice(-4)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>账户余额</span>
                    <span className="font-medium text-foreground tabular-nums">
                      ¥{Number(primaryAccount.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">暂无关联银行账户</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
