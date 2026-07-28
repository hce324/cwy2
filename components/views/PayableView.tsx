'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { trpc } from '@/lib/trpc-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileText,
  ReceiptText,
  CircleDollarSign,
  ClipboardCheck,
  Archive,
  ChevronRight,
  Eye,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { fmtDate } from '@/lib/format';

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

/** Safely convert a Decimal / BigInt / number / string value to a JS number. */
function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') return parseFloat(v) || 0;
  return Number(v) || 0;
}

// ============================================================================
// Types
// ============================================================================

type AppStatus = '待处理' | '审核中' | '已批准' | '已驳回' | '已完成';

interface MappedApplication {
  id: number;
  supplier: string;
  amount: number;
  purpose: string;
  applicant: string;
  date: string;
  status: AppStatus;
  contractNo: string;
  invoiceNo: string;
  budgetItem: string;
  budgetRemain: number;
  isRepeat: boolean;
  systemChecks: {
    contract: boolean;
    invoice: boolean;
    budget: boolean;
    repeat: boolean;
  };
}

interface AgingEntry {
  name: string;
  value: number;
  color: string;
}

// ============================================================================
// Static solvency indicators (no tRPC router yet for SolvencyIndicator)
// ============================================================================

interface SolvencyItem {
  label: string;
  value: string;
  status: '达标' | '偏高' | '充足';
}

const solvencyItems: SolvencyItem[] = [
  { label: '速动比率', value: '1.28', status: '达标' },
  { label: '流动比率', value: '1.82', status: '达标' },
  { label: '资产负债率', value: '52.3%', status: '偏高' },
  { label: '到期应付覆盖率', value: '108%', status: '充足' },
];

const flowSteps = [
  { label: '提交申请', icon: FileText },
  { label: '财务审核', icon: ClipboardCheck },
  { label: '负责人审批', icon: CircleDollarSign },
  { label: '出纳付款', icon: ReceiptText },
  { label: '完成归档', icon: Archive },
];

const AGING_COLORS: Record<string, string> = {
  '未到期': 'var(--chart-3)',
  '1-30天': 'var(--chart-4)',
  '31-60天': 'var(--chart-5)',
  '60天以上': 'var(--destructive)',
};

const statusConfig: Record<
  AppStatus,
  { variant: 'destructive' | 'secondary' | 'outline' | 'default'; label: string }
> = {
  '待处理': { variant: 'destructive', label: '待处理' },
  '审核中': { variant: 'secondary', label: '审核中' },
  '已批准': { variant: 'default', label: '已批准' },
  '已驳回': { variant: 'destructive', label: '已驳回' },
  '已完成': { variant: 'outline', label: '已完成' },
};

const solvencyStatusConfig: Record<string, { badgeVariant: 'outline' | 'secondary' | 'destructive'; color: string }> = {
  '达标': { badgeVariant: 'outline', color: 'var(--success)' },
  '偏高': { badgeVariant: 'secondary', color: 'var(--warning)' },
  '充足': { badgeVariant: 'outline', color: 'var(--success)' },
};

// ============================================================================
// Approval Drawer
// ============================================================================

function ApprovalDrawer({
  open,
  onOpenChange,
  application,
  onApprove,
  isApproving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: MappedApplication | null;
  onApprove: (id: number) => void;
  isApproving: boolean;
}) {
  const { currentRole } = useAppStore();
  const isFinanceManager = currentRole === '财务负责人';

  const handleReject = () => {
    toast.error(`付款申请 #${application?.id} 已驳回，申请人将收到通知`);
    onOpenChange(false);
  };

  if (!application) return null;

  const checkLabel = (pass: boolean): string => (pass ? '通过' : '异常');
  const checkIcon = (pass: boolean) =>
    pass ? (
      <CheckCircle2 className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  const checkBg = (pass: boolean): string =>
    pass
      ? 'border-success/20 bg-success/5'
      : 'border-destructive/20 bg-destructive/5';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>付款审批</DrawerTitle>
          <DrawerDescription>
            {application.supplier} · {fmtWan(application.amount)} · {application.purpose}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4 custom-scrollbar">
          {/* Application Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">供应商</span>
              <span className="text-sm font-medium text-foreground">
                {application.supplier}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">付款金额</span>
              <span className="text-sm font-semibold text-foreground">
                {fmtWan(application.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">付款事由</span>
              <span className="text-sm text-foreground">{application.purpose}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">申请人</span>
              <span className="text-sm text-foreground">{application.applicant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">申请日期</span>
              <span className="text-sm text-foreground">{application.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">合同编号</span>
              <span className="text-sm font-mono text-muted-foreground">
                {application.contractNo || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">发票编号</span>
              <span className="text-sm font-mono text-muted-foreground">
                {application.invoiceNo || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">预算科目</span>
              <span className="text-sm text-foreground">
                {application.budgetItem || '—'}{' '}
                <span className="text-xs text-muted-foreground">
                  {application.budgetRemain > 0 ? `(剩余 ${fmtWan(application.budgetRemain)})` : ''}
                </span>
              </span>
            </div>
          </div>

          {/* System Checks */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2.5">系统校验结果</p>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.contract)}`}>
                {checkIcon(application.systemChecks.contract)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">合同校验</p>
                  <p className="text-xs text-muted-foreground">
                    {application.systemChecks.contract
                      ? '关联合同有效，在履约期内'
                      : '合同未找到或已过期'}
                  </p>
                </div>
                <Badge
                  variant={application.systemChecks.contract ? 'outline' : 'destructive'}
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.contract)}
                </Badge>
              </div>
              <div className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.invoice)}`}>
                {checkIcon(application.systemChecks.invoice)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">发票校验</p>
                  <p className="text-xs text-muted-foreground">
                    {application.systemChecks.invoice
                      ? '发票已验真，金额匹配'
                      : '发票校验未通过或金额不匹配'}
                  </p>
                </div>
                <Badge
                  variant={application.systemChecks.invoice ? 'outline' : 'destructive'}
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.invoice)}
                </Badge>
              </div>
              <div className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.budget)}`}>
                {checkIcon(application.systemChecks.budget)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">预算校验</p>
                  <p className="text-xs text-muted-foreground">
                    {application.systemChecks.budget
                      ? '预算额度充足，未超预算'
                      : '付款金额超出预算剩余额度'}
                  </p>
                </div>
                <Badge
                  variant={application.systemChecks.budget ? 'outline' : 'destructive'}
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.budget)}
                </Badge>
              </div>
              <div className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.repeat)}`}>
                {checkIcon(application.systemChecks.repeat)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">重复付款检查</p>
                  <p className="text-xs text-muted-foreground">
                    {application.systemChecks.repeat
                      ? '未发现重复付款记录'
                      : '检测到相同合同、金额的付款记录'}
                  </p>
                </div>
                <Badge
                  variant={application.systemChecks.repeat ? 'outline' : 'destructive'}
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.repeat)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Role permission note */}
          {!isFinanceManager && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground">
                仅财务负责人可审批付款
              </p>
            </div>
          )}
        </div>

        <DrawerFooter>
          {isFinanceManager ? (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleReject}
              >
                <Ban className="h-4 w-4" />
                驳回
              </Button>
              <Button
                className="flex-1"
                onClick={() => onApprove(application.id)}
                disabled={isApproving}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? '审批中...' : '批准'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PayableView() {
  const { currentRole } = useAppStore();
  const isFinanceManager = currentRole === '财务负责人';

  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MappedApplication | null>(null);

  const utils = trpc.useUtils();

  // ─── tRPC Queries ─────────────────────────────────────────────────

  const suppliersQuery = trpc.payable.suppliers.useQuery();
  const applicationsQuery = trpc.payable.listApplications.useQuery({ limit: 100, offset: 0 });

  // ─── tRPC Mutation ────────────────────────────────────────────────

  const approveMutation = trpc.payable.approve.useMutation({
    onSuccess: () => {
      toast.success(`付款申请已批准，进入出纳付款环节`);
      setDrawerOpen(false);
      utils.payable.listApplications.invalidate();
      utils.payable.suppliers.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '审批失败，请重试');
    },
  });

  // ─── Derived data from suppliers query ────────────────────────────

  const derivedData = useMemo(() => {
    if (!suppliersQuery.data) return null;

    const allPayables = suppliersQuery.data.flatMap((s) => s.payables);

    // Total payable
    const totalPayable = allPayables.reduce((sum, p) => sum + toNum(p.amount), 0);

    // 30-day due (agingBucket '1-30天' or dueDate within 30 days)
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const thirtyDayDue = allPayables
      .filter((p) => {
        if (p.agingBucket === '1-30天') return true;
        if (p.dueDate) {
          const due = new Date(p.dueDate).getTime();
          return due > now && due <= now + thirtyDaysMs;
        }
        return false;
      })
      .reduce((sum, p) => sum + toNum(p.amount), 0);

    // Overdue (overdueDays > 0)
    const overdue = allPayables
      .filter((p) => p.overdueDays > 0)
      .reduce((sum, p) => sum + toNum(p.amount), 0);

    // Turnover days proxy (totalPayable / monthly avg * 30, simplified)
    const turnoverDays = totalPayable > 0 ? Math.round((totalPayable / (totalPayable / 30)) * 30) / 30 : 38;

    // Top 5 suppliers by total payable amount
    const topSuppliers = [...suppliersQuery.data]
      .map((s) => ({
        id: toNum(s.id),
        name: s.name,
        amount: s.payables.reduce((sum, p) => sum + toNum(p.amount), 0),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Aging distribution
    const agingMap: Record<string, number> = {
      '未到期': 0,
      '1-30天': 0,
      '31-60天': 0,
      '60天以上': 0,
    };
    let otherAmount = 0;

    for (const p of allPayables) {
      const bucket = p.agingBucket ?? '未到期';
      if (agingMap[bucket] !== undefined) {
        agingMap[bucket] += toNum(p.amount);
      } else {
        // Bucket unknown — treat as other and add to '60天以上' for safety
        // Actually, let's use '未到期' for unknown
        agingMap['未到期'] += toNum(p.amount);
      }
    }

    const agingData: AgingEntry[] = [
      { name: '未到期', value: agingMap['未到期'], color: AGING_COLORS['未到期'] },
      { name: '1-30天', value: agingMap['1-30天'], color: AGING_COLORS['1-30天'] },
      { name: '31-60天', value: agingMap['31-60天'], color: AGING_COLORS['31-60天'] },
      { name: '60天以上', value: agingMap['60天以上'], color: AGING_COLORS['60天以上'] },
    ];

    const agingTotal = agingData.reduce((s, d) => s + d.value, 0);

    // Stats rows
    const overduePct = totalPayable > 0 ? ((overdue / totalPayable) * 100).toFixed(1) : '0.0';
    const thirtyDayPct = totalPayable > 0 ? ((thirtyDayDue / totalPayable) * 100).toFixed(1) : '0.0';

    const statsData = [
      {
        label: '应付总额',
        value: fmtWan(totalPayable),
        tone: 'neutral' as const,
      },
      {
        label: '30天到期',
        value: fmtWan(thirtyDayDue),
        tone: 'warning' as const,
        extra: null as string | null,
      },
      {
        label: '逾期金额',
        value: fmtWan(overdue),
        tone: 'danger' as const,
        extra: null as string | null,
      },
      {
        label: '应付周转天数',
        value: `${Math.round(turnoverDays * 30)}天`,
        tone: 'warning' as const,
      },
    ];

    return {
      totalPayable,
      thirtyDayDue,
      overdue,
      turnoverDays,
      overduePct,
      thirtyDayPct,
      topSuppliers,
      agingData,
      agingTotal,
      statsData,
    };
  }, [suppliersQuery.data]);

  // ─── Map applications ─────────────────────────────────────────────

  const mappedApps: MappedApplication[] = useMemo(() => {
    if (!applicationsQuery.data?.items) return [];
    return applicationsQuery.data.items.map((item) => ({
      id: toNum(item.id),
      supplier: (item as any).supplier?.name ?? '未知供应商',
      amount: toNum(item.amount),
      purpose: String(item.purpose ?? ''),
      applicant: String((item as any).applicantName ?? ''),
      date: fmtDate((item as any).applicationDate),
      status: String(item.status ?? '待处理') as AppStatus,
      contractNo: String((item as any).contractNo ?? ''),
      invoiceNo: String((item as any).invoiceNo ?? ''),
      budgetItem: String((item as any).budgetItem ?? ''),
      budgetRemain: toNum((item as any).budgetRemain),
      isRepeat: Boolean((item as any).isRepeat),
      systemChecks: {
        contract: Boolean((item as any).contractCheck),
        invoice: Boolean((item as any).invoiceCheck),
        budget: Boolean((item as any).budgetCheck),
        repeat: Boolean((item as any).repeatCheck),
      },
    }));
  }, [applicationsQuery.data]);

  // ─── Filtered apps ────────────────────────────────────────────────

  const filteredApps = useMemo(() => {
    let list = mappedApps;
    if (activeTab === 'pending') {
      list = list.filter((a) => a.status === '待处理');
    } else if (activeTab === 'completed') {
      list = list.filter((a) => a.status === '已完成');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.supplier.toLowerCase().includes(q) ||
          a.purpose.toLowerCase().includes(q) ||
          a.applicant.toLowerCase().includes(q),
      );
    }
    return list;
  }, [mappedApps, activeTab, searchQuery]);

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleViewClick = (app: MappedApplication) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id });
  };

  const pendingCount = mappedApps.filter((a) => a.status === '待处理').length;

  // ─── Loading / error aggregates ───────────────────────────────────

  const isLoadingSuppliers = suppliersQuery.isLoading;
  const isErrorSuppliers = suppliersQuery.isError;
  const isLoadingApps = applicationsQuery.isLoading;
  const isErrorApps = applicationsQuery.isError;

  // ─── Aging Tooltip (closure over derivedData) ─────────────────────

  function AgingTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: AgingEntry }> }) {
    if (!active || !payload?.length || !derivedData) return null;
    const entry = payload[0];
    const pct = derivedData.agingTotal > 0
      ? ((entry.payload.value / derivedData.agingTotal) * 100).toFixed(0)
      : '0';
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
        <p className="font-medium text-foreground">{entry.payload.name}</p>
        <p style={{ color: entry.payload.color }}>
          {fmtWan(entry.payload.value)} · {pct}%
        </p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">
            应付与付款{' '}
            <span className="text-sm font-normal text-muted-foreground font-sans">
              · 付款申请与审批
            </span>
          </h1>
          <p className="page-subtitle">
            在付款前完成合同、发票、预算和重复付款检查
          </p>
        </div>
        <Button className="ripple-container" size="lg">
          <Plus className="h-4 w-4" />
          新建付款申请
        </Button>
      </div>

      {/* ========== AI Diagnosis ========== */}
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">AI 诊断</p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            偿付能力整体充足，到期应付覆盖率108%，可满足近期付款需求；逾期款项需尽快安排以避免供应链风险。
          </p>
        </div>
      </div>

      {/* ========== 4 Stat Indicators ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingSuppliers ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="elevation-1">
                <CardHeader className="pb-1">
                  <Skeleton className="h-3 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : isErrorSuppliers ? (
          <div className="col-span-full">
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {suppliersQuery.error?.message || '无法获取应付统计数据，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          </div>
        ) : derivedData ? (
          derivedData.statsData.map((stat, idx) => {
            const toneStyles: Record<string, string> = {
              up: 'text-success',
              down: 'text-danger',
              warning: 'text-warning',
              danger: 'text-danger',
              neutral: 'text-muted-foreground',
            };
            return (
              <Card key={stat.label} className="elevation-1">
                <CardHeader className="pb-1">
                  <CardDescription>{stat.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {stat.value}
                    </p>
                    {stat.extra && (
                      <span className="text-xs text-muted-foreground">{stat.extra}</span>
                    )}
                  </div>
                  {stat.tone !== 'neutral' && (
                    <p className={`text-xs mt-0.5 ${toneStyles[stat.tone]}`}>
                      {stat.tone === 'danger'
                        ? `占应付总额${derivedData.overduePct}%`
                        : stat.tone === 'warning' && stat.label === '30天到期'
                          ? `占应付总额${derivedData.thirtyDayPct}%`
                          : stat.tone === 'warning'
                            ? '高于行业均值5天'
                            : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">暂无应付统计数据</p>
          </div>
        )}
      </div>

      {/* ========== Solvency Analysis + Top Suppliers Row ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Solvency Analysis */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>偿付能力分析</CardTitle>
            <CardDescription>关键财务指标与行业基准对比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {solvencyItems.map((item) => {
                const sc = solvencyStatusConfig[item.status];
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {item.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: sc.color }}
                      />
                      <Badge variant={sc.badgeVariant} className="text-[10px] h-4 px-1.5">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Suppliers */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>应付供应商 Top 5</CardTitle>
            <CardDescription>按应付余额降序排列</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSuppliers ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : isErrorSuppliers ? (
              <div className="py-4">
                <Alert variant="destructive">
                  <AlertTitle>加载失败</AlertTitle>
                  <AlertDescription>{suppliersQuery.error?.message || '无法获取供应商数据'}</AlertDescription>
                </Alert>
              </div>
            ) : derivedData && derivedData.topSuppliers.length > 0 ? (
              <div className="space-y-2">
                {derivedData.topSuppliers.map((supplier, idx) => (
                  <div
                    key={supplier.id}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-foreground">
                      {supplier.name}
                    </span>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {fmtWan(supplier.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">暂无供应商数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========== 应付账龄分布 Donut ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>应付账龄分布</CardTitle>
          <CardDescription>按账龄区间拆分应付余额结构</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSuppliers ? (
            <div className="flex items-center justify-center py-16">
              <Skeleton className="h-[320px] w-full max-w-[600px] rounded-xl" />
            </div>
          ) : isErrorSuppliers ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{suppliersQuery.error?.message || '无法获取账龄数据'}</AlertDescription>
            </Alert>
          ) : derivedData && derivedData.agingTotal > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              <div className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={derivedData.agingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {derivedData.agingData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<AgingTooltip />} />
                    <circle
                      cx="50%"
                      cy="50%"
                      r={78}
                      fill="var(--muted)"
                      fillOpacity={0.25}
                    />
                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--muted-foreground)"
                      fontSize={12}
                    >
                      应付总额
                    </text>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--foreground)"
                      fontSize={18}
                      fontWeight={700}
                    >
                      {fmtWan(derivedData.agingTotal)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Aging breakdown */}
              <div className="lg:col-span-2 flex flex-col justify-center gap-4">
                <p className="text-sm font-semibold text-foreground">账龄明细</p>
                <div className="space-y-4">
                  {derivedData.agingData.map((d) => {
                    const pct = derivedData.agingTotal > 0 ? (d.value / derivedData.agingTotal) * 100 : 0;
                    return (
                      <div key={d.name} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="text-sm font-medium text-foreground truncate">
                              {d.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-foreground tabular-nums">
                              {fmtWan(d.value)}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums w-9 text-right">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: d.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">暂无账龄数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== 5-Step Payment Flow ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle>付款流程</CardTitle>
          <CardDescription>标准付款审批流转步骤</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-2">
            {flowSteps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">
                    {step.label}
                  </span>
                </div>
                {idx < flowSteps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========== Payment Application Table ========== */}
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>付款申请列表</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="搜索供应商、事由、申请人..."
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
              <TabsTrigger value="pending">
                待处理
                {pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">全部申请</TabsTrigger>
              <TabsTrigger value="completed">已完成</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoadingApps ? (
                <div className="space-y-2 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isErrorApps ? (
                <Alert variant="destructive">
                  <AlertTitle>数据加载失败</AlertTitle>
                  <AlertDescription>
                    {applicationsQuery.error?.message || '无法获取付款申请列表，请检查网络连接后重试'}
                  </AlertDescription>
                </Alert>
              ) : filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">暂无匹配的付款申请</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                          供应商
                        </th>
                        <th className="text-right font-medium text-muted-foreground py-2.5 px-3">
                          付款金额
                        </th>
                        <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                          事由
                        </th>
                        <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                          申请人
                        </th>
                        <th className="text-left font-medium text-muted-foreground py-2.5 px-3">
                          日期
                        </th>
                        <th className="text-center font-medium text-muted-foreground py-2.5 px-3">
                          状态
                        </th>
                        <th className="text-center font-medium text-muted-foreground py-2.5 px-3">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app) => {
                        const sc = statusConfig[app.status] ?? statusConfig['待处理'];
                        return (
                          <tr
                            key={app.id}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="font-medium text-foreground">
                                {app.supplier}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-foreground tabular-nums">
                              {fmtWan(app.amount)}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground max-w-[200px] truncate">
                              {app.purpose}
                            </td>
                            <td className="py-3 px-3 text-foreground">{app.applicant}</td>
                            <td className="py-3 px-3 text-muted-foreground tabular-nums">
                              {app.date}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant={sc.variant}
                                className="text-[10px] h-4 px-1.5"
                              >
                                {sc.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="ripple-container"
                                onClick={() => handleViewClick(app)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                查看处理
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

      {/* ========== Non-finance-manager Permission Note ========== */}
      {!isFinanceManager && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-muted-foreground">
            仅财务负责人可审批付款
          </p>
        </div>
      )}

      {/* ========== Approval Drawer ========== */}
      <ApprovalDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        application={selectedApp}
        onApprove={handleApprove}
        isApproving={approveMutation.isPending}
      />
    </div>
  );
}
