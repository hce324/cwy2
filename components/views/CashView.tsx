'use client';

import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Wallet,
  Building2,
  ArrowUpRight,
  Eye,
  ShieldAlert,
  Calendar,
  CreditCard,
  Zap,
  CheckCircle2,
  FileUp,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';
import { fmtAmount, fmtDate } from '@/lib/format';

// ============================================================
// Demo chart data — no time-series API for balance trend / cash flow structure yet.
// These would be replaced by dedicated aggregation endpoints in production.
// ============================================================

const BALANCE_TREND = [
  { month: '1月', 余额: 786 },
  { month: '2月', 余额: 812 },
  { month: '3月', 余额: 798 },
  { month: '4月', 余额: 824 },
  { month: '5月', 余额: 812 },
  { month: '6月', 余额: 843 },
];

const CASH_FLOW_STRUCTURE = [
  { month: '1月', 经营: 386, 投资: 124, 筹资: 68 },
  { month: '2月', 经营: 412, 投资: 98, 筹资: 56 },
  { month: '3月', 经营: 398, 投资: 142, 筹资: 74 },
  { month: '4月', 经营: 428, 投资: 116, 筹资: 62 },
  { month: '5月', 经营: 406, 投资: 132, 筹资: 58 },
  { month: '6月', 经营: 444, 投资: 108, 筹资: 72 },
].map((row) => ({
  ...row,
  total: row.经营 + row.投资 + row.筹资,
}));

// ============================================================
// Static business-finance penetration data (no API)
// ============================================================

const BUSINESS_FINANCE_ITEMS = [
  { label: '业务回款穿透', value: '86%', desc: '订单到回款的自动化覆盖率' },
  { label: '业务付款穿透', value: '92%', desc: '采购到付款的流程贯通率' },
  { label: '费用管控穿透', value: '78%', desc: '费用预算与实际执行偏差' },
  { label: '利润穿透', value: '91%', desc: '收入与成本匹配的自动化程度' },
];

// ============================================================
// Helpers
// ============================================================

/** Format a Decimal / number / string to 万元 with one decimal */
function fmtWan(n: unknown): string {
  const v = Number(n ?? 0) / 10000;
  return `¥${v.toFixed(2)}万`;
}

function statusBadge(s: string | undefined): { label: string; cls: string } {
  switch (s) {
    case 'pending':
      return { label: '待付款', cls: 'text-warning' };
    case 'processing':
      return { label: '处理中', cls: 'text-primary' };
    case 'completed':
      return { label: '已完成', cls: 'text-success' };
    default:
      return { label: s ?? '—', cls: 'text-muted-foreground' };
  }
}

// ============================================================
// Cash Flow Tooltip — Material styled detailed tooltip
// ============================================================

interface CashFlowTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CashFlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CashFlowTooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const order = ['经营', '投资', '筹资'];
  const ordered = order
    .map((k) => payload.find((p) => p.dataKey === k))
    .filter((p): p is CashFlowTooltipPayloadItem => Boolean(p));
  const total = ordered.reduce((sum, p) => sum + p.value, 0);

  const labelMap: Record<string, { dot: string }> = {
    经营: { dot: 'bg-[--chart-1]' },
    投资: { dot: 'bg-[--chart-3]' },
    筹资: { dot: 'bg-[--chart-4]' },
  };

  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground elevation-3 px-3.5 py-3 min-w-[200px]">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
        <span className="text-xs font-semibold text-foreground font-heading">
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          现金流结构
        </span>
      </div>
      <div className="space-y-1.5">
        {ordered.map((p) => {
          const meta = labelMap[p.dataKey];
          const percent = total > 0 ? (p.value / total) * 100 : 0;
          return (
            <div
              key={p.dataKey}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${meta.dot}`}
                  aria-hidden
                />
                <span className="text-muted-foreground">{p.dataKey}</span>
              </div>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="font-semibold text-foreground">
                  ¥{p.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {percent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/60">
        <span className="text-xs text-muted-foreground">月度合计</span>
        <span className="text-sm font-bold text-foreground font-heading tabular-nums">
          ¥{total}万
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Cash Flow Legend — Material styled interactive legend
// ============================================================

const CASH_FLOW_LEGEND = [
  { key: '经营', label: '经营活动', color: 'var(--chart-1)', desc: '主营业务' },
  { key: '投资', label: '投资活动', color: 'var(--chart-3)', desc: '资产配置' },
  { key: '筹资', label: '筹资活动', color: 'var(--chart-4)', desc: '融资借款' },
];

function CashFlowLegend() {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      {CASH_FLOW_LEGEND.map((item) => (
        <button
          key={item.key}
          type="button"
          className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-1"
          title={item.desc}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm transition-transform group-hover:scale-110"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-xs font-medium text-foreground">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

function StatCard({
  title,
  value,
  sub,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
}) {
  return (
    <Card size="sm" className="card-hover">
      <CardHeader className="pb-1">
        <CardDescription className="text-xs flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground font-heading">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium inline-flex items-center gap-0.5',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground',
              )}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {sub}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Loading / Error / Empty states
// ============================================================

function StatCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-28" />
      </CardContent>
    </Card>
  );
}

function AccountCardSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// CashView
// ============================================================

export function CashView() {
  const { currentRole } = useAppStore();
  const isCashier = currentRole === '出纳';
  const utils = trpc.useUtils();

  // ─── Queries ─────────────────────────────────────────────────────

  const accountsQuery = trpc.bank.listAccounts.useQuery();
  const statsQuery = trpc.payment.stats.useQuery();
  const pendingQuery = trpc.payment.list.useQuery({
    group: 'pending',
    limit: 10,
    offset: 0,
  });
  const completedQuery = trpc.payment.list.useQuery({
    group: 'completed',
    limit: 8,
    offset: 0,
  });

  // ─── Mutation ────────────────────────────────────────────────────

  const executeMutation = trpc.payment.execute.useMutation({
    onSuccess: () => {
      toast.success('付款已执行');
      utils.payment.list.invalidate();
      utils.payment.stats.invalidate();
      utils.bank.listAccounts.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '付款执行失败，请重试');
    },
  });

  // ─── Computed ────────────────────────────────────────────────────

  const accounts = accountsQuery.data ?? [];
  const availableFunds = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const stats = statsQuery.data ?? { pending: 0, processing: 0, completed: 0 };
  const pendingTasks = pendingQuery.data?.items ?? [];
  const completedTasks = completedQuery.data?.items ?? [];

  const handleExecute = (id: unknown) => {
    executeMutation.mutate({ id: Number(id) });
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6 max-w-[1440px] mx-auto w-full">

        {/* ================================================================ */}
        {/* Page Header                                                      */}
        {/* ================================================================ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0">
            <h1 className="page-title">
              资金管理 — 资金账户与预测
            </h1>
            <p className="page-subtitle">
              统一查看账户余额、资金流动与近期资金缺口。
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
          >
            <FileUp className="h-3.5 w-3.5" />
            导入银行流水
          </Button>
        </div>

        {/* ================================================================ */}
        {/* AI Diagnosis Bar                                                 */}
        {/* ================================================================ */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-warning/15">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-warning/15 text-warning border-warning/30 text-[11px]"
              >
                需关注
              </Badge>
              <p className="text-sm text-foreground">
                {stats.pending > 0
                  ? `当前有 ${stats.pending} 笔待付款任务需处理，请及时安排资金。`
                  : '现金流整体健康，暂无异常待付款项。'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-primary shrink-0 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            查看 AI 诊断
          </Button>
        </div>

        {/* ================================================================ */}
        {/* Stat Cards                                                       */}
        {/* ================================================================ */}
        {accountsQuery.isLoading || statsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCardSkeleton />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard
              title="可用资金"
              value={fmtWan(availableFunds)}
              sub={`${accounts.length}个账户`}
              trend="neutral"
              icon={Wallet}
            />
            <StatCard
              title="待付款任务"
              value={`${stats.pending}笔`}
              sub={stats.pending > 0 ? '需处理' : '无待办'}
              trend={stats.pending > 0 ? 'down' : 'up'}
              icon={AlertTriangle}
            />
            <StatCard
              title="处理中"
              value={`${stats.processing}笔`}
              sub="进行中"
              trend="neutral"
              icon={ArrowUpRight}
            />
            <StatCard
              title="已完成"
              value={`${stats.completed}笔`}
              sub="累计完成"
              trend="up"
              icon={Calendar}
            />
            <StatCard
              title="银行账户"
              value={`${accounts.length}个`}
              sub="已关联"
              trend="neutral"
              icon={Building2}
            />
          </div>
        )}

        {/* ================================================================ */}
        {/* Bank Accounts                                                    */}
        {/* ================================================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground font-heading">
              银行账户
            </h2>
            {!accountsQuery.isLoading && !accountsQuery.isError && (
              <Badge variant="secondary" className="text-[10px]">
                {accounts.length}个账户
              </Badge>
            )}
          </div>

          {accountsQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AccountCardSkeleton />
              <AccountCardSkeleton />
              <AccountCardSkeleton />
            </div>
          ) : accountsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>银行账户加载失败</AlertTitle>
              <AlertDescription>{accountsQuery.error.message}</AlertDescription>
            </Alert>
          ) : accounts.length === 0 ? (
            <Alert>
              <AlertTitle>暂无银行账户</AlertTitle>
              <AlertDescription>请联系系统管理员添加银行账户。</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accounts.map((account) => (
                <Card key={String(account.id)} size="sm" className="card-hover">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            {account.accountName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-success border-success/30 bg-success/5 shrink-0"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            {account.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {account.bankName} · {account.accountNo}
                        </p>
                        <span className="text-lg font-bold text-foreground font-heading">
                          {fmtAmount(account.balance)}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* Charts                                                           */}
        {/* ================================================================ */}
        {/* NOTE: These charts use demo data. A dedicated time-series        */}
        {/* aggregation endpoint would be needed for production use.         */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Balance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                资金余额历史趋势
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-2">
                近6个月余额变化（演示数据，单位：万元）
                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">
                  趋势上升
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={BALANCE_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      domain={['dataMin - 20', 'dataMax + 20']}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background))',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [`¥${value}万`, '余额']}
                    />
                    <Line
                      type="monotone"
                      dataKey="余额"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Structure Chart */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                现金流结构分析
              </CardTitle>
              <CardDescription className="text-xs">
                经营 / 投资 / 筹资活动现金流（演示数据，单位：万元）
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CASH_FLOW_STRUCTURE}
                    margin={{ top: 24, right: 12, left: 0, bottom: 0 }}
                    barCategoryGap="32%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: 'var(--muted-foreground)',
                      }}
                      dy={4}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      content={<CashFlowTooltip />}
                      cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
                    />
                    {/* 经营（底）—— 仅顶部圆角 */}
                    <Bar
                      dataKey="经营"
                      stackId="cash"
                      fill="var(--chart-1)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      <LabelList
                        dataKey="经营"
                        position="center"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: 'var(--primary-foreground)',
                        }}
                        formatter={(v: any) => (Number(v) >= 90 ? v : '')}
                      />
                    </Bar>
                    {/* 投资（中）—— 无圆角 */}
                    <Bar
                      dataKey="投资"
                      stackId="cash"
                      fill="var(--chart-3)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                      animationEasing="ease-out"
                      animationBegin={150}
                    >
                      <LabelList
                        dataKey="投资"
                        position="center"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: 'var(--primary-foreground)',
                        }}
                        formatter={(v: any) => (Number(v) >= 50 ? v : '')}
                      />
                    </Bar>
                    {/* 筹资（顶）—— 仅顶部圆角 */}
                    <Bar
                      dataKey="筹资"
                      stackId="cash"
                      fill="var(--chart-4)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                      animationEasing="ease-out"
                      animationBegin={300}
                    >
                      <LabelList
                        dataKey="筹资"
                        position="center"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: 'var(--primary-foreground)',
                        }}
                        formatter={(v: any) => (Number(v) >= 50 ? v : '')}
                      />
                      <LabelList
                        dataKey="total"
                        position="top"
                        offset={8}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fill: 'var(--foreground)',
                        }}
                        formatter={(v: any) => `${v}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <CashFlowLegend />
            </CardContent>
          </Card>
        </div>

        {/* ================================================================ */}
        {/* Pending Payment Tasks (replaces Fund Gap Predictions)            */}
        {/* ================================================================ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              待付款任务
            </CardTitle>
            <CardDescription className="text-xs">
              需要执行的付款任务，请确认后逐笔执行。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : pendingQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>待付款任务加载失败</AlertTitle>
                <AlertDescription>{pendingQuery.error.message}</AlertDescription>
              </Alert>
            ) : pendingTasks.length === 0 ? (
              <Alert>
                <AlertTitle>暂无待付款任务</AlertTitle>
                <AlertDescription>所有付款任务已处理完毕。</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_120px_120px_100px] gap-3 px-2 py-1.5 text-xs text-muted-foreground font-medium border-b pb-2">
                    <span>收款方</span>
                    <span className="text-right">金额</span>
                    <span className="text-right">到期日</span>
                    <span className="text-right">操作</span>
                  </div>
                  {/* Items */}
                  <div className="divide-y divide-border/50">
                    {pendingTasks.map((task) => {
                      const sb = statusBadge(task.paymentStatus);
                      return (
                        <div
                          key={String(task.id)}
                          className="grid grid-cols-[1fr_120px_120px_100px] gap-3 px-2 py-2.5 text-sm items-center hover:bg-muted/40 rounded transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="text-foreground font-medium truncate block">
                              {task.payee}
                            </span>
                            {task.category && (
                              <span className="text-xs text-muted-foreground truncate block">
                                {task.category}
                              </span>
                            )}
                          </div>
                          <span className="text-right font-medium tabular-nums text-destructive">
                            -{fmtAmount(task.amount)}
                          </span>
                          <span className="text-right text-xs text-muted-foreground tabular-nums">
                            {task.dueDate ? fmtDate(task.dueDate) : '—'}
                          </span>
                          <span className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1 h-7"
                              disabled={executeMutation.isPending}
                              onClick={() => handleExecute(task.id)}
                            >
                              {executeMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Zap className="h-3 w-3" />
                              )}
                              执行
                            </Button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* Recent Completed Payments (replaces Today's Activity)            */}
        {/* ================================================================ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              最近付款记录
            </CardTitle>
            <CardDescription className="text-xs">
              最近完成的付款任务
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : completedQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>付款记录加载失败</AlertTitle>
                <AlertDescription>{completedQuery.error.message}</AlertDescription>
              </Alert>
            ) : completedTasks.length === 0 ? (
              <Alert>
                <AlertTitle>暂无付款记录</AlertTitle>
                <AlertDescription>尚未有已完成的付款任务。</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {completedTasks.map((task) => (
                  <div
                    key={String(task.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {task.payee}
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-muted-foreground">
                        {fmtAmount(task.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* Business-Finance Integration                                    */}
        {/* ================================================================ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              业财一体穿透
            </CardTitle>
            <CardDescription className="text-xs">
              业务数据到财务核算的自动化贯通
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BUSINESS_FINANCE_ITEMS.map((item, i) => (
                <div key={i} className="text-center p-3 rounded-lg border border-border/60">
                  <span className="text-2xl font-bold font-heading text-primary">
                    {item.value}
                  </span>
                  <p className="text-xs font-medium text-foreground mt-1">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* Permission Note (出纳 role only)                                */}
        {/* ================================================================ */}
        {isCashier && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              当前角色为<strong>出纳</strong>
              ，可查看资金账户与流水，大额付款（&gt;¥10万）
              需财务负责人审批。账户新增与删除请联系系统管理员。
            </p>
          </div>
        )}

        {/* Spacer for bottom breathing room */}
        <div className="h-4" />

      </div>
    </div>
  );
}
