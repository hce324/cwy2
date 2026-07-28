'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { canAccess } from '@/lib/navigation';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { ArrowRight, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { ViewId } from '@/lib/types';
import { fmtAmount, fmtDate } from '@/lib/format';

// ============================================================
// Types & Constants
// ============================================================

type PaymentStatusGroup = 'pending' | 'processing' | 'completed';
type StatusKind = 'warning' | 'destructive' | 'success';

const tabs = [
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '已完成' },
] as const;

const flowSteps = [
  '1 接收已审批任务',
  '2 付款前核验',
  '3 执行付款',
  '4 回单与移交',
  '5 资金凭证签字',
];

// ============================================================
// Helpers
// ============================================================

/** Format a Decimal / number / string to ¥X.XX */
/** Format a DB id + createdAt into "FK-YYYYMM-NNNN" style */
function formatPaymentId(id: unknown, createdAt: unknown): string {
  const numId = String(id ?? '');
  const dateStr = fmtDate(createdAt);
  // Extract YYYYMM from YYYY-MM-DD
  const yyyymm = dateStr.replace(/-/g, '').slice(0, 6);
  return `FK-${yyyymm}-${numId.padStart(4, '0')}`;
}

/** Derive display status label and badge kind from payment + approval status */
function getStatusInfo(paymentStatus: string, approvalStatus: string): { label: string; kind: StatusKind } {
  const isBlocked =
    approvalStatus.includes('缺') ||
    approvalStatus.includes('阻断') ||
    approvalStatus.includes('不足') ||
    approvalStatus.includes('未');

  if (paymentStatus === 'pending') {
    if (isBlocked) return { label: '禁止付款', kind: 'destructive' };
    return { label: '待付款', kind: 'warning' };
  }
  if (paymentStatus === 'processing') return { label: '付款中', kind: 'warning' };
  if (paymentStatus === 'completed') return { label: '已付款', kind: 'success' };
  return { label: paymentStatus || '—', kind: 'warning' };
}

// ============================================================
// Navigation hook
// ============================================================

function useNavigateWithAccess() {
  const { setView, currentRole, isPresentationMode } = useAppStore();

  const navigate = (viewId: ViewId) => {
    if (!canAccess(viewId, currentRole, isPresentationMode)) {
      toast.error('当前角色无权访问该页面');
      return;
    }
    setView(viewId);
  };

  return navigate;
}

// ============================================================
// Skeleton placeholders
// ============================================================

function StatCardSkeleton() {
  return (
    <Card className="elevation-1">
      <CardContent className="pt-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

// ============================================================
// CashManagementView
// ============================================================

export function CashManagementView() {
  const [activeTab, setActiveTab] = useState<PaymentStatusGroup>('pending');
  const navigate = useNavigateWithAccess();
  const utils = trpc.useUtils();

  // ─── Queries ──────────────────────────────────────────────────

  const accountsQuery = trpc.bank.listAccounts.useQuery();
  const statsQuery = trpc.payment.stats.useQuery();
  const paymentsQuery = trpc.payment.list.useQuery(
    { group: activeTab, limit: 50, offset: 0 },
  );

  // For receipt table: fetch transactions of first bank account (inflows)
  const firstAccountId = accountsQuery.data?.[0]?.id;
  const transactionsQuery = trpc.bank.transactions.useQuery(
    { accountId: Number(firstAccountId ?? 0), limit: 10, offset: 0 },
    { enabled: !!firstAccountId },
  );

  // ─── Mutation ─────────────────────────────────────────────────

  const executeMutation = trpc.payment.execute.useMutation({
    onSuccess: () => {
      toast.success('付款已执行');
      utils.payment.list.invalidate();
      utils.payment.stats.invalidate();
      utils.bank.listAccounts.invalidate();
      if (firstAccountId) {
        utils.bank.transactions.invalidate({ accountId: Number(firstAccountId) });
      }
    },
    onError: (err) => {
      toast.error(err.message || '付款执行失败，请重试');
    },
  });

  // ─── Computed ─────────────────────────────────────────────────

  const accounts = accountsQuery.data ?? [];
  const availableFunds = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const stats = statsQuery.data ?? { pending: 0, processing: 0, completed: 0 };
  const paymentTasks = paymentsQuery.data?.items ?? [];

  // Build a lookup map: bankAccountId → account info
  const accountMap = useMemo(() => {
    const map = new Map<string, { name: string; bankName: string; accountNo: string }>();
    for (const a of accounts) {
      map.set(String(a.id), {
        name: a.accountName,
        bankName: a.bankName,
        accountNo: a.accountNo,
      });
    }
    return map;
  }, [accounts]);

  // Receipt rows from inflow transactions
  const receiptRows = useMemo(() => {
    if (!transactionsQuery.data?.items) return [];
    const inflowItems = transactionsQuery.data.items.filter(
      (tx) => tx.type === 'inflow',
    );
    return inflowItems.map((tx) => {
      const acctInfo = accountMap.get(String(tx.bankAccountId));
      const accountLabel = acctInfo
        ? `${acctInfo.bankName} ${acctInfo.name} ${acctInfo.accountNo}`
        : '—';
      const hasCounterparty = Boolean(tx.counterparty);
      return {
        serial: `${String(tx.id).padStart(6, '0')} · ${fmtDate(tx.transactionDate).slice(5)}`,
        source: tx.counterparty
          ? `${tx.counterparty}·${tx.summary ?? '银行流水'}`
          : (tx.summary ?? '银行流水'),
        account: accountLabel,
        amount: fmtAmount(tx.amount),
        match: hasCounterparty ? '已匹配' : '待核对',
        matchKind: (hasCounterparty ? 'success' : 'warning') as 'success' | 'warning',
        status: '待确认入账',
      };
    });
  }, [transactionsQuery.data, accountMap]);

  // Tab counts
  const tabCounts = {
    pending: stats.pending,
    processing: stats.processing,
    completed: stats.completed,
  };

  // Pending total amount
  const pendingAmount = useMemo(() => {
    // Approximate: use the loaded payment tasks if on pending tab, else 0
    // For a real implementation, a separate aggregation endpoint would be better
    if (activeTab === 'pending') {
      return paymentTasks.reduce((sum, t) => sum + Number(t.amount), 0);
    }
    return 0;
  }, [activeTab, paymentTasks]);

  const handleExecute = (id: unknown) => {
    executeMutation.mutate({ id: Number(id) });
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ================================================================ */}
      {/* Page Header                                                      */}
      {/* ================================================================ */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            CASH & PAYMENT OPERATIONS
          </div>
          <h1 className="page-title mt-1">
            资金收付
          </h1>
          <p className="page-subtitle">
            监管大额及异常资金支付授权、查看付款证据和审计轨迹；会计主管不代替出纳执行网银付款。
          </p>
        </div>
        <RippleContainer>
          <Button size="sm" onClick={() => navigate('risk')}>
            查核大额支付授权
          </Button>
        </RippleContainer>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/* Role Boundaries Note Block                                       */}
      {/* ================================================================ */}
      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">岗位边界：</p>
        <p>
          <strong>业务部门/审批人：</strong>确认业务发生、预算和付款授权{' '}
          | <strong>出纳：</strong>核对支付指令、收款账户、金额、审批链和资金余额并执行收付{' '}
          | <strong>会计专员：</strong>根据回单及原始凭证制证{' '}
          | <strong>会计主管：</strong>监督授权与异常资金事项
        </p>
      </div>

      {/* ================================================================ */}
      {/* 4 Stat Cards                                                     */}
      {/* ================================================================ */}
      {accountsQuery.isLoading || statsQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : accountsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>账户数据加载失败</AlertTitle>
          <AlertDescription>{accountsQuery.error.message}</AlertDescription>
        </Alert>
      ) : statsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>统计数据加载失败</AlertTitle>
          <AlertDescription>{statsQuery.error.message}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">可用银行余额</div>
              <div className="text-lg font-bold font-mono mt-1">
                {fmtAmount(availableFunds)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {accounts.length}个账户 · 已扣除冻结资金
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">待付款任务</div>
              <div className="text-lg font-bold mt-1">{stats.pending} 笔</div>
              <div className="text-[10px] text-muted-foreground">
                {activeTab === 'pending' && stats.pending > 0
                  ? `合计 ${fmtAmount(pendingAmount)}`
                  : '—'}
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">待确认收款</div>
              <div className="text-lg font-bold mt-1">
                {transactionsQuery.data
                  ? transactionsQuery.data.items.filter((tx) => tx.type === 'inflow').length
                  : 0} 笔
              </div>
              <div className="text-[10px] text-muted-foreground">
                {transactionsQuery.data
                  ? `合计 ${fmtAmount(
                      transactionsQuery.data.items
                        .filter((tx) => tx.type === 'inflow')
                        .reduce((s, tx) => s + Number(tx.amount), 0),
                    )}`
                  : '—'}
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">待移交回单</div>
              <div className="text-lg font-bold mt-1">1 笔</div>
              <div className="text-[10px] text-muted-foreground">付款后当日移交</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================================ */}
      {/* 5-Step Flow (static)                                             */}
      {/* ================================================================ */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {flowSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
              {step}
            </span>
            {i < flowSteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/* Payment Tasks Table                                              */}
      {/* ================================================================ */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">付款任务</CardTitle>
          <CardDescription>
            任务来自费控/采购/OA审批，不以扫描发票本身作为付款指令
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as PaymentStatusGroup)}
          >
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                  {tab.label} {tabCounts[tab.key]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {paymentsQuery.isLoading ? (
            <div className="mt-3">
              <TableSkeleton rows={5} />
            </div>
          ) : paymentsQuery.isError ? (
            <div className="mt-3">
              <Alert variant="destructive">
                <AlertTitle>付款任务加载失败</AlertTitle>
                <AlertDescription>{paymentsQuery.error.message}</AlertDescription>
              </Alert>
            </div>
          ) : paymentTasks.length === 0 ? (
            <div className="mt-3">
              <Alert>
                <AlertTitle>
                  {activeTab === 'pending'
                    ? '暂无待付款任务'
                    : activeTab === 'processing'
                      ? '暂无处理中任务'
                      : '暂无已完成任务'}
                </AlertTitle>
                <AlertDescription>
                  {activeTab === 'pending'
                    ? '所有付款任务已处理完毕。'
                    : activeTab === 'processing'
                      ? '当前没有正在执行的付款任务。'
                      : '尚未有已完成的付款记录。'}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Table className="mt-3">
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>付款凭证号</TableHead>
                  <TableHead>收款单位·客户</TableHead>
                  <TableHead>付款账户</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>审批与资料</TableHead>
                  <TableHead>资金检查</TableHead>
                  <TableHead>付款状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTasks.map((task) => {
                  const statusInfo = getStatusInfo(
                    task.paymentStatus ?? '',
                    task.approvalStatus ?? '',
                  );
                  const acctInfo = accountMap.get(String(task.bankAccountId));
                  const accountLabel = acctInfo
                    ? `${acctInfo.bankName} ${acctInfo.name} ${acctInfo.accountNo}`
                    : '—';

                  return (
                    <TableRow key={String(task.id)} className="text-xs">
                      <TableCell className="font-mono">
                        {formatPaymentId(task.id, task.createdAt)}
                      </TableCell>
                      <TableCell>{task.payee}</TableCell>
                      <TableCell>{accountLabel}</TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAmount(task.amount)}
                      </TableCell>
                      <TableCell>{task.approvalStatus || '—'}</TableCell>
                      <TableCell>{task.checkStatus || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusInfo.kind === 'destructive' &&
                              'bg-destructive/10 text-destructive',
                            statusInfo.kind === 'success' &&
                              'bg-success/10 text-success',
                            statusInfo.kind === 'warning' &&
                              'bg-warning/10 text-warning',
                          )}
                        >
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {task.paymentStatus === 'pending' ? (
                          <RippleContainer>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={
                                executeMutation.isPending ||
                                statusInfo.kind === 'destructive'
                              }
                              onClick={() => handleExecute(task.id)}
                            >
                              {executeMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Zap className="h-3 w-3" />
                              )}
                              执行付款
                            </Button>
                          </RippleContainer>
                        ) : (
                          <RippleContainer>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => navigate('hz-sourcevoucher')}
                            >
                              查看依据
                            </Button>
                          </RippleContainer>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Receipt Confirmation Table                                       */}
      {/* ================================================================ */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">收款确认与回单归集</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <TableSkeleton rows={3} />
          ) : transactionsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>银行流水加载失败</AlertTitle>
              <AlertDescription>{transactionsQuery.error.message}</AlertDescription>
            </Alert>
          ) : !firstAccountId ? (
            <Alert>
              <AlertTitle>暂无银行账户</AlertTitle>
              <AlertDescription>
                请先添加银行账户以查看收款流水。
              </AlertDescription>
            </Alert>
          ) : receiptRows.length === 0 ? (
            <Alert>
              <AlertTitle>暂无收款记录</AlertTitle>
              <AlertDescription>
                当前账户暂无流入流水记录。
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>银行流水号</TableHead>
                  <TableHead>付款方·业务来源</TableHead>
                  <TableHead>收款客户</TableHead>
                  <TableHead className="text-right">到账金额</TableHead>
                  <TableHead>自动匹配</TableHead>
                  <TableHead>处理状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptRows.map((row, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="font-mono">{row.serial}</TableCell>
                    <TableCell>{row.source}</TableCell>
                    <TableCell>{row.account}</TableCell>
                    <TableCell className="text-right font-mono">{row.amount}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.matchKind === 'success'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }
                      >
                        {row.match}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <RippleContainer>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => navigate('hz-bankrecon')}
                        >
                          查看流水
                        </Button>
                      </RippleContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Rules Block (static)                                             */}
      {/* ================================================================ */}
      <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-warning space-y-1">
          <p className="font-medium">票据控制：</p>
          <p>
            章款不完整、收款账户不一致、重复付、金额不足或超额度权限时禁止付款；付款完成后必须保留银行交易流水号或电子回单，并形成不可删除的移交记录。
          </p>
        </div>
      </div>
    </div>
  );
}
