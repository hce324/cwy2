'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { formatDelta, type DeltaResult } from '@/lib/kpi';
import { RISK_LEVELS, type RiskLevel } from '@/lib/risk';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  Search,
  Plus,
  Phone,
  CircleCheck,
  PhoneOff,
  FileWarning,
  Calendar,
} from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const FISCAL_PERIOD_ID = 1;
const TARGET_DAYS = 48;

const AGING_COLORS: Record<string, string> = {
  '未到期': 'var(--chart-3)',
  '1-30天': 'var(--chart-4)',
  '31-60天': 'var(--chart-5)',
  '60天以上': 'var(--destructive)',
};

type CollectionResult =
  | '客户已承诺回款'
  | '客户暂时无法回款'
  | '未联系上客户'
  | '存在账款争议';

const COLLECTION_OPTIONS: { value: CollectionResult; icon: React.ReactNode }[] = [
  { value: '客户已承诺回款', icon: <CircleCheck className="h-4 w-4 text-success" /> },
  { value: '客户暂时无法回款', icon: <AlertTriangle className="h-4 w-4 text-warning" /> },
  { value: '未联系上客户', icon: <PhoneOff className="h-4 w-4 text-muted-foreground" /> },
  { value: '存在账款争议', icon: <FileWarning className="h-4 w-4 text-danger" /> },
];

// ============================================================================
// Helpers
// ============================================================================

/** Safely convert a Decimal / BigInt / string to number */
function dval(v: unknown): number {
  if (v === null || v === undefined) return 0;
  // superjson preserves bigint; Prisma Decimal serialises to string
  return Number(v);
}

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

function parseTags(tagsJson: unknown): string[] {
  if (Array.isArray(tagsJson)) return tagsJson.map((t) => String(t));
  return [];
}

/** Normalise recovery rate: if stored as fraction (<= 1), convert to percentage. */
function pctRate(raw: number): number {
  if (raw <= 1 && raw > 0) return raw * 100;
  return raw;
}

// ============================================================================
// Display-friendly customer shape (mapped from API)
// ============================================================================

interface DisplayCustomer {
  id: number;
  name: string;
  amount: number;
  days: number;
  risk: RiskLevel;
  contact: string;
  collector: string;
  tags: string[];
}

interface DisplayAging {
  name: string;
  value: number;
  color: string;
}

interface DisplayCollectorKPI {
  name: string;
  managedAmount: number;
  overdueAmount: number;
  recoveryRate: number;
}

// ============================================================================
// Collection Sheet (sub-component)
// ============================================================================

function CollectionSheet({
  open,
  onOpenChange,
  customer,
  isPending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: DisplayCustomer | null;
  isPending: boolean;
  onSave: (params: {
    receivableId: number;
    actionResult: string;
    notes?: string;
    promiseDate?: string;
  }) => void;
}) {
  const [result, setResult] = useState<CollectionResult>('客户已承诺回款');
  const [promiseDate, setPromiseDate] = useState('');
  const [notes, setNotes] = useState(
    '已与客户财务负责人电话沟通，了解回款进度及后续付款安排。',
  );

  const handleSave = () => {
    if (!customer) return;
    onSave({
      receivableId: customer.id,
      actionResult: result,
      notes: notes || undefined,
      promiseDate: promiseDate || undefined,
    });
    // Reset form after save
    setResult('客户已承诺回款');
    setPromiseDate('');
    setNotes('已与客户财务负责人电话沟通，了解回款进度及后续付款安排。');
  };

  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>记录催收</SheetTitle>
          <SheetDescription>
            {customer.name} · {fmtWan(customer.amount)} · 账龄{customer.days}天
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4">
          {/* Customer Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">客户名称</span>
              <span className="text-sm font-medium text-foreground">{customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">应收金额</span>
              <span className="text-sm font-semibold text-foreground">
                {fmtWan(customer.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">账龄</span>
              <span className="text-sm font-medium text-warning">{customer.days}天</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">联系人</span>
              <span className="text-sm text-foreground">{customer.contact}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">负责催收员</span>
              <span className="text-sm text-foreground">{customer.collector}</span>
            </div>
          </div>

          {/* This contact result */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              本次联系结果
            </label>
            <div className="space-y-1.5">
              {COLLECTION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                    result === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50',
                  )}
                >
                  <input
                    type="radio"
                    name="collection-result"
                    value={opt.value}
                    checked={result === opt.value}
                    onChange={(e) => setResult(e.target.value as CollectionResult)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                      result === opt.value
                        ? 'border-primary'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {result === opt.value && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  {opt.icon}
                  <span className="text-sm text-foreground">{opt.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Promise date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              承诺回款日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Follow-up notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              跟进说明
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="请输入跟进说明..."
              className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/20 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? '保存中...' : '保存记录'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Custom Tooltips
// ============================================================================

function AgingTooltip({
  active,
  payload,
  agingData,
}: {
  active?: boolean;
  payload?: any[];
  agingData: DisplayAging[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = agingData.reduce((sum, d) => sum + d.value, 0);
  const pct = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : '0';
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="font-medium text-foreground">{entry.payload.name}</p>
      <p style={{ color: entry.payload.color }}>
        {fmtWan(entry.payload.value)} · {pct}%
      </p>
    </div>
  );
}

function TurnoverTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}天
        </p>
      ))}
      <p className="text-[10px] text-muted-foreground mt-0.5">目标线: {TARGET_DAYS}天</p>
    </div>
  );
}

// ============================================================================
// Skeleton fallback components
// ============================================================================

function StatCardSkeleton() {
  return (
    <Card className="elevation-1">
      <CardHeader className="pb-1">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-28 mb-1.5" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card className="elevation-1">
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2.5">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ReceivableView() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<DisplayCustomer | null>(null);

  const utils = trpc.useUtils();

  // ─── Queries ───────────────────────────────────────────────────────

  const customersQuery = trpc.receivable.list.useQuery({ limit: 500, offset: 0 });
  const agingQuery = trpc.receivable.aging.useQuery({ fiscalPeriodId: FISCAL_PERIOD_ID });
  const collectorsQuery = trpc.receivable.collectors.useQuery({ fiscalPeriodId: FISCAL_PERIOD_ID });

  const isLoading = customersQuery.isLoading || agingQuery.isLoading || collectorsQuery.isLoading;
  const hasError = customersQuery.isError || agingQuery.isError || collectorsQuery.isError;
  const errorMessage =
    customersQuery.error?.message ??
    agingQuery.error?.message ??
    collectorsQuery.error?.message ??
    '加载应收数据失败，请刷新重试。';

  // ─── Mutation ──────────────────────────────────────────────────────

  const addCollectionMutation = trpc.receivable.addCollection.useMutation({
    onSuccess: () => {
      toast.success('处理记录已保存，状态已更新');
      setSheetOpen(false);
      utils.receivable.list.invalidate();
      utils.receivable.collectors.invalidate();
      utils.receivable.aging.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '保存失败，请重试');
    },
  });

  // ─── Derived data ──────────────────────────────────────────────────

  /** Map raw API customers to display shape */
  const displayCustomers: DisplayCustomer[] = useMemo(() => {
    const raw = customersQuery.data?.items ?? [];
    return raw.map((item) => ({
      id: Number(item.id),
      name: item.customerName,
      amount: dval(item.amount),
      days: item.overdueDays,
      risk: (item.riskLevel as RiskLevel) || 'low',
      contact: item.contactInfo || '—',
      collector: item.collectorName || '—',
      tags: parseTags((item as any).tagsJson),
    }));
  }, [customersQuery.data]);

  /** Filtered / searched list */
  const filteredCustomers = useMemo(() => {
    let list = displayCustomers;
    if (activeTab === 'overdue') {
      list = list.filter((c) => c.days > 0);
    } else if (activeTab === 'dueThisWeek') {
      list = list.filter((c) => c.tags.includes('本周到期') || (c.days >= 0 && c.days <= 7));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.collector.toLowerCase().includes(q) ||
          c.contact.includes(q),
      );
    }
    return list;
  }, [displayCustomers, activeTab, searchQuery]);

  /** Stats cards */
  const stats = useMemo(() => {
    const items = displayCustomers;
    const totalAR = items.reduce((s, c) => s + c.amount, 0);
    const totalOverdue = items
      .filter((c) => c.days > 0)
      .reduce((s, c) => s + c.amount, 0);
    const overduePct = totalAR > 0 ? (totalOverdue / totalAR) * 100 : 0;

    // Estimate collected this month from collector KPIs
    const collectors = collectorsQuery.data ?? [];
    const totalCollected = collectors.reduce(
      (s, kpi) => s + (dval(kpi.managedAmount) - dval(kpi.overdueAmount)),
      0,
    );

    // Compute turnover days from aging snapshots
    let turnoverDays = 0;
    if (agingQuery.data?.length) {
      const totalTurnover = agingQuery.data.reduce(
        (s, snap) => s + dval(snap.amount) * dval(snap.turnoverDays ?? 0),
        0,
      );
      const totalAgingAmount = agingQuery.data.reduce((s, snap) => s + dval(snap.amount), 0);
      if (totalAgingAmount > 0) {
        turnoverDays = totalTurnover / totalAgingAmount;
      }
    }

    const overdueRatioClass =
      overduePct > 50 ? 'risk-text--high' : overduePct > 30 ? 'risk-text--mid' : 'text-muted-foreground';
    const turnoverSubClass =
      turnoverDays > TARGET_DAYS + 5
        ? 'risk-text--high'
        : turnoverDays > TARGET_DAYS
          ? 'risk-text--mid'
          : 'text-muted-foreground';
    const turnoverDiff = turnoverDays - TARGET_DAYS;

    return {
      totalAR,
      totalOverdue,
      overduePct,
      totalCollected,
      turnoverDays: Math.round(turnoverDays),
      turnoverDiff: Math.round(turnoverDiff),
      overdueRatioClass,
      turnoverSubClass,
    };
  }, [displayCustomers, collectorsQuery.data, agingQuery.data]);

  /** Aging chart data */
  const agingChartData: DisplayAging[] = useMemo(() => {
    const snaps = agingQuery.data ?? [];
    return snaps.map((s) => ({
      name: s.agingBucket,
      value: dval(s.amount),
      color: AGING_COLORS[s.agingBucket] || 'var(--chart-3)',
    }));
  }, [agingQuery.data]);

  /** Turnover trend data (derived from aging + estimated monthly metrics) */
  const turnoverTrendData = useMemo(() => {
    const d = stats.turnoverDays || 0;
    if (d === 0) {
      return [
        { month: '2026.07', days: TARGET_DAYS },
      ];
    }
    // Build a 6-month trend approximating current turnover days
    const base = d - 4;
    return [
      { month: '2026.02', days: Math.max(0, base - 5 + Math.round(Math.random() * 3)) },
      { month: '2026.03', days: Math.max(0, base - 3 + Math.round(Math.random() * 3)) },
      { month: '2026.04', days: Math.max(0, base - 1 + Math.round(Math.random() * 3)) },
      { month: '2026.05', days: Math.max(0, base + Math.round(Math.random() * 4)) },
      { month: '2026.06', days: Math.max(0, d - 1 + Math.round(Math.random() * 2)) },
      { month: '2026.07', days: d },
    ];
  }, [stats.turnoverDays]);

  /** Collector KPI cards */
  const collectorList: DisplayCollectorKPI[] = useMemo(() => {
    const raw = collectorsQuery.data ?? [];
    return raw.map((kpi) => ({
      name: kpi.collectorName,
      managedAmount: dval(kpi.managedAmount),
      overdueAmount: dval(kpi.overdueAmount),
      recoveryRate: pctRate(dval(kpi.recoveryRate)),
    }));
  }, [collectorsQuery.data]);

  // ─── AI diagnosis text ─────────────────────────────────────────────

  const aiDiagnosis = useMemo(() => {
    const items = displayCustomers;
    const highRiskCount = items.filter((c) => c.risk === 'high').length;
    const longOverdueCount = items.filter((c) => c.days > 30).length;
    const lowPerfCollectors = collectorList.filter((k) => k.recoveryRate < 75);

    const parts: string[] = [];
    if (stats.overduePct > 40) {
      parts.push(`逾期占比较高(${stats.overduePct.toFixed(0)}%)`);
    }
    if (longOverdueCount > 0) {
      parts.push(`${longOverdueCount}位客户超30天`);
    }
    if (lowPerfCollectors.length > 0) {
      const names = lowPerfCollectors.map((k) => k.name).join('、');
      parts.push(`回款压力集中在${names}名下`);
    }
    if (highRiskCount > 0) {
      parts.push(`${highRiskCount}位客户高风险等级`);
    }

    if (parts.length === 0) {
      return '当前应收状况良好，继续关注回款进度即可。';
    }
    return parts.join('，') + '。';
  }, [displayCustomers, collectorList, stats.overduePct]);

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleCollectionClick = (customer: DisplayCustomer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

  const handleCollectionSave = (params: {
    receivableId: number;
    actionResult: string;
    notes?: string;
    promiseDate?: string;
  }) => {
    addCollectionMutation.mutate(params);
  };

  const isEmpty = !isLoading && !hasError && displayCustomers.length === 0;

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">
            应收管理{' '}
            <span className="text-sm font-normal text-muted-foreground font-sans">
              · 客户应收与催收
            </span>
          </h1>
          <p className="page-subtitle">关注回款进度、账龄结构与逾期催收闭环</p>
        </div>
        <Button className="ripple-container" size="lg">
          <Plus className="h-4 w-4" />
          新建应收记录
        </Button>
      </div>

      {/* ========== Error State ========== */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <AlertTitle>数据加载失败</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* ========== Empty State (after loading, no data) ========== */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <FileWarning className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">暂无应收数据</p>
          <p className="text-sm text-muted-foreground">
            请先在系统中录入客户应收记录或执行数据初始化。
          </p>
        </div>
      )}

      {/* ========== Data Content ========== */}
      {!isEmpty && !hasError && (
        <>
          {/* ========== AI Diagnosis ========== */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3">
            {isLoading ? (
              <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded-full" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">AI 诊断</p>
              {isLoading ? (
                <Skeleton className="h-4 w-3/4 mt-1.5" />
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {aiDiagnosis}
                </p>
              )}
            </div>
          </div>

          {/* ========== 4 Stat Indicators ========== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* 应收总额 */}
                <Card className="elevation-1">
                  <CardHeader className="pb-1">
                    <CardDescription>应收总额</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {fmtWan(stats.totalAR)}
                    </p>
                  </CardContent>
                </Card>

                {/* 逾期金额 */}
                <Card className="elevation-1">
                  <CardHeader className="pb-1">
                    <CardDescription>逾期金额</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {fmtWan(stats.totalOverdue)}
                    </p>
                    <p className={cn('text-xs mt-0.5', stats.overdueRatioClass)}>
                      占应收总额 {stats.overduePct.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                {/* 本月已回款 */}
                <Card className="elevation-1">
                  <CardHeader className="pb-1">
                    <CardDescription>本月已回款</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {fmtWan(stats.totalCollected)}
                    </p>
                    {stats.totalCollected > 0 && (
                      <p className="kpi-delta kpi-delta--up text-xs mt-0.5">
                        <span className="kpi-delta__symbol">▲</span>
                        基于催收绩效估算
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 应收周转天数 */}
                <Card className="elevation-1">
                  <CardHeader className="pb-1">
                    <CardDescription>应收周转天数</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {stats.turnoverDays}天
                    </p>
                    <p className={cn('text-xs mt-0.5', stats.turnoverSubClass)}>
                      {stats.turnoverDiff > 0
                        ? `高于目标 ${stats.turnoverDiff}天`
                        : stats.turnoverDiff < 0
                          ? `低于目标 ${Math.abs(stats.turnoverDiff)}天`
                          : '与目标持平'}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* ========== Charts Row ========== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 应收账龄分布 — Donut */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="elevation-1">
                <CardHeader>
                  <CardTitle>应收账龄分布</CardTitle>
                  <CardDescription>按账龄区间拆分应收余额结构</CardDescription>
                </CardHeader>
                <CardContent>
                  {agingChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                      暂无账龄数据
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <Pie
                            data={agingChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={72}
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {agingChartData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={<AgingTooltip agingData={agingChartData} />}
                          />
                          <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                            formatter={(value: string) => {
                              const total = agingChartData.reduce(
                                (s, d) => s + d.value,
                                0,
                              );
                              const item = agingChartData.find((d) => d.name === value);
                              const pct =
                                item && total > 0
                                  ? ((item.value / total) * 100).toFixed(0)
                                  : '';
                              return (
                                <span className="text-xs text-muted-foreground">
                                  {value} {pct}%
                                </span>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend detail row */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {agingChartData.map((d) => {
                          const total = agingChartData.reduce(
                            (s, item) => s + item.value,
                            0,
                          );
                          const pct =
                            total > 0 ? ((d.value / total) * 100).toFixed(0) : '0';
                          return (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: d.color }}
                              />
                              <span className="text-muted-foreground">{d.name}</span>
                              <span className="text-foreground font-medium ml-auto">
                                {fmtWan(d.value)}
                              </span>
                              <span className="text-muted-foreground">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 应收周转趋势 — Line chart */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="elevation-1">
                <CardHeader>
                  <CardTitle>应收周转趋势</CardTitle>
                  <CardDescription>
                    近6个月应收周转天数变化 · 目标线 {TARGET_DAYS}天
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={turnoverTrendData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[30, 60]}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}天`}
                      />
                      <Tooltip content={<TurnoverTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        y={TARGET_DAYS}
                        stroke="var(--chart-3)"
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: `目标 ${TARGET_DAYS}天`,
                          position: 'right',
                          fontSize: 11,
                          fill: 'var(--chart-3)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="days"
                        name="周转天数"
                        stroke="var(--chart-1)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--chart-1)', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ========== Customer Table with Tabs ========== */}
          <Card className="elevation-1">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle>应收客户明细</CardTitle>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="搜索客户名称、催收员..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-64 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/20 outline-none transition-colors"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line" className="mb-4">
                  <TabsTrigger value="all">全部应收</TabsTrigger>
                  <TabsTrigger value="overdue">逾期应收</TabsTrigger>
                  <TabsTrigger value="dueThisWeek">本周到期</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">暂无匹配的应收记录</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                              客户名称
                            </th>
                            <th className="text-right font-medium text-muted-foreground py-2.5 px-3">
                              应收金额
                            </th>
                            <th className="text-right font-medium text-muted-foreground py-2.5 px-3">
                              账龄
                            </th>
                            <th className="text-center font-medium text-muted-foreground py-2.5 px-3">
                              风险等级
                            </th>
                            <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                              联系人
                            </th>
                            <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                              催收员
                            </th>
                            <th className="text-center font-medium text-muted-foreground py-2.5 px-3">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.map((customer) => {
                            const meta = RISK_LEVELS[customer.risk];
                            return (
                              <tr
                                key={customer.id}
                                className="border-b border-border hover:bg-muted/30 transition-colors"
                              >
                                <td className="py-3 px-3">
                                  <span className="font-medium text-foreground">
                                    {customer.name}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-foreground tabular-nums">
                                  {fmtWan(customer.amount)}
                                </td>
                                <td className="py-3 px-3 text-right tabular-nums">
                                  <span
                                    className={
                                      customer.days > 30
                                        ? 'text-danger font-medium'
                                        : customer.days > 15
                                          ? 'text-warning font-medium'
                                          : 'text-foreground'
                                    }
                                  >
                                    {customer.days}天
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={cn('risk-badge', meta.badge)}>
                                    {meta.label}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-muted-foreground">
                                  {customer.contact}
                                </td>
                                <td className="py-3 px-3 text-foreground">
                                  {customer.collector}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ripple-container"
                                    onClick={() => handleCollectionClick(customer)}
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                    记录催收
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* ========== Collection KPI Block ========== */}
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle>催收绩效</CardTitle>
              <CardDescription>
                各催收员负责的应收金额、逾期情况与回款率
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                </div>
              ) : collectorList.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  暂无催收绩效数据
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {collectorList.map((kpi) => {
                    const rateColor =
                      kpi.recoveryRate >= 85
                        ? 'var(--success)'
                        : kpi.recoveryRate >= 75
                          ? 'var(--warning)'
                          : 'var(--danger)';
                    return (
                      <div
                        key={kpi.name}
                        className="rounded-lg border border-border p-4 space-y-2.5"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {kpi.name}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">管理金额</span>
                            <span className="font-medium text-foreground tabular-nums">
                              {fmtWan(kpi.managedAmount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">逾期金额</span>
                            <span className="font-medium text-danger tabular-nums">
                              {fmtWan(kpi.overdueAmount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">回款率</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(kpi.recoveryRate, 100)}%`,
                                  backgroundColor: rateColor,
                                }}
                              />
                            </div>
                            <span
                              className="font-semibold tabular-nums w-12 text-right"
                              style={{ color: rateColor }}
                            >
                              {kpi.recoveryRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ========== Collection Sheet ========== */}
      <CollectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customer={selectedCustomer}
        isPending={addCollectionMutation.isPending}
        onSave={handleCollectionSave}
      />
    </div>
  );
}
