'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
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
} from 'lucide-react';

// ============================================================================
// Inline Data
// ============================================================================

const statsData = [
  { label: '应付总额', value: '¥584.23万', tone: 'neutral' as const },
  { label: '30天到期', value: '¥276.08万', tone: 'warning' as const, extra: '(8笔)' },
  { label: '逾期金额', value: '¥82.64万', tone: 'danger' as const, extra: '(2笔)' },
  { label: '应付周转天数', value: '38天', tone: 'warning' as const },
];

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

interface Supplier {
  id: number;
  name: string;
  amount: number;
}

const topSuppliers: Supplier[] = [
  { id: 1, name: '迅达物流', amount: 148.60 },
  { id: 2, name: '天润物业', amount: 96.35 },
  { id: 3, name: '四海包装', amount: 82.40 },
  { id: 4, name: '华东优选', amount: 68.00 },
  { id: 5, name: '锦程物流', amount: 55.20 },
];

const agingData = [
  { name: '未到期', value: 308.15, color: 'var(--chart-3)' },
  { name: '1-30天', value: 138.34, color: 'var(--chart-4)' },
  { name: '31-60天', value: 55.10, color: 'var(--chart-5)' },
  { name: '60天以上', value: 82.64, color: 'var(--destructive)' },
];

const agingTotal = agingData.reduce((s, d) => s + d.value, 0);

const flowSteps = [
  { label: '提交申请', icon: FileText },
  { label: '财务审核', icon: ClipboardCheck },
  { label: '负责人审批', icon: CircleDollarSign },
  { label: '出纳付款', icon: ReceiptText },
  { label: '完成归档', icon: Archive },
];

type AppStatus = '待处理' | '审核中' | '已批准' | '已驳回' | '已完成';

interface PaymentApp {
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

const paymentApps: PaymentApp[] = [
  {
    id: 1,
    supplier: '迅达物流',
    amount: 48.60,
    purpose: '2026年6月物流运费结算',
    applicant: '张伟',
    date: '2026-07-10',
    status: '待处理',
    contractNo: 'HT-2026-0089',
    invoiceNo: 'FP-2026-0742',
    budgetItem: '物流费用',
    budgetRemain: 31.40,
    isRepeat: false,
    systemChecks: {
      contract: true,
      invoice: true,
      budget: false,
      repeat: true,
    },
  },
  {
    id: 2,
    supplier: '天润物业',
    amount: 24.00,
    purpose: '2026年Q2办公场地物业费',
    applicant: '李芳',
    date: '2026-07-12',
    status: '待处理',
    contractNo: 'HT-2026-0012',
    invoiceNo: 'FP-2026-0781',
    budgetItem: '物业费用',
    budgetRemain: 56.00,
    isRepeat: false,
    systemChecks: {
      contract: true,
      invoice: true,
      budget: true,
      repeat: true,
    },
  },
  {
    id: 3,
    supplier: '四海包装',
    amount: 32.40,
    purpose: '2026年Q2包装材料采购尾款',
    applicant: '王磊',
    date: '2026-07-08',
    status: '审核中',
    contractNo: 'HT-2026-0056',
    invoiceNo: 'FP-2026-0698',
    budgetItem: '材料采购',
    budgetRemain: 17.60,
    isRepeat: false,
    systemChecks: {
      contract: true,
      invoice: true,
      budget: true,
      repeat: true,
    },
  },
  {
    id: 4,
    supplier: '锦程物流',
    amount: 18.20,
    purpose: '2026年5月区域配送费补结',
    applicant: '张伟',
    date: '2026-07-05',
    status: '已完成',
    contractNo: 'HT-2026-0034',
    invoiceNo: 'FP-2026-0655',
    budgetItem: '物流费用',
    budgetRemain: 12.80,
    isRepeat: false,
    systemChecks: {
      contract: true,
      invoice: true,
      budget: true,
      repeat: true,
    },
  },
  {
    id: 5,
    supplier: '华东优选',
    amount: 28.00,
    purpose: '2026年6月供应商代垫费用报销',
    applicant: '陈洁',
    date: '2026-07-15',
    status: '待处理',
    contractNo: 'HT-2026-0078',
    invoiceNo: 'FP-2026-0812',
    budgetItem: '代垫费用',
    budgetRemain: 2.00,
    isRepeat: true,
    systemChecks: {
      contract: true,
      invoice: false,
      budget: true,
      repeat: false,
    },
  },
];

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function AgingTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = agingData.reduce((sum, d) => sum + d.value, 0);
  const pct = ((entry.payload.value / total) * 100).toFixed(0);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs elevation-3">
      <p className="font-medium text-foreground">{entry.payload.name}</p>
      <p style={{ color: entry.payload.color }}>
        {fmtWan(entry.payload.value)} · {pct}%
      </p>
    </div>
  );
}

// ============================================================================
// Approval Drawer
// ============================================================================

function ApprovalDrawer({
  open,
  onOpenChange,
  application,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: PaymentApp | null;
}) {
  const { currentRole } = useAppStore();
  const isFinanceManager = currentRole === '财务负责人';

  const handleApprove = () => {
    toast.success(`付款申请 #${application?.id} 已批准，进入出纳付款环节`);
    onOpenChange(false);
  };

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
                {application.contractNo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">发票编号</span>
              <span className="text-sm font-mono text-muted-foreground">
                {application.invoiceNo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">预算科目</span>
              <span className="text-sm text-foreground">
                {application.budgetItem}{' '}
                <span className="text-xs text-muted-foreground">
                  (剩余 {fmtWan(application.budgetRemain)})
                </span>
              </span>
            </div>
          </div>

          {/* System Checks */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2.5">系统校验结果</p>
            <div className="space-y-2">
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.contract)}`}
              >
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
                  variant={
                    application.systemChecks.contract ? 'outline' : 'destructive'
                  }
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.contract)}
                </Badge>
              </div>
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.invoice)}`}
              >
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
                  variant={
                    application.systemChecks.invoice ? 'outline' : 'destructive'
                  }
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.invoice)}
                </Badge>
              </div>
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.budget)}`}
              >
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
                  variant={
                    application.systemChecks.budget ? 'outline' : 'destructive'
                  }
                  className="text-[10px] h-4 px-1.5"
                >
                  {checkLabel(application.systemChecks.budget)}
                </Badge>
              </div>
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 ${checkBg(application.systemChecks.repeat)}`}
              >
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
                  variant={
                    application.systemChecks.repeat ? 'outline' : 'destructive'
                  }
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
              <Button className="flex-1" onClick={handleApprove}>
                <CheckCircle2 className="h-4 w-4" />
                批准
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
  const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);

  const filteredApps = useMemo(() => {
    let list = paymentApps;
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
  }, [activeTab, searchQuery]);

  const handleViewClick = (app: PaymentApp) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const pendingCount = paymentApps.filter((a) => a.status === '待处理').length;

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
            偿付能力整体充足，到期应付覆盖率108%，可满足近期付款需求；2笔逾期需尽快安排付款以避免供应链风险。
          </p>
        </div>
      </div>

      {/* ========== 4 Stat Indicators ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
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
                      ? '占应付总额14.1%'
                      : stat.tone === 'warning' && stat.label === '30天到期'
                        ? '占应付总额47.2%'
                        : stat.tone === 'warning'
                          ? '高于行业均值5天'
                          : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
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
            <div className="space-y-2">
              {topSuppliers.map((supplier, idx) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={agingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={78}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {agingData.map((entry, idx) => (
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
                    {fmtWan(agingTotal)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Aging breakdown */}
            <div className="lg:col-span-2 flex flex-col justify-center gap-4">
              <p className="text-sm font-semibold text-foreground">账龄明细</p>
              <div className="space-y-4">
                {agingData.map((d) => {
                  const pct = (d.value / agingTotal) * 100;
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
              {filteredApps.length === 0 ? (
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
                        const sc = statusConfig[app.status];
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
      />
    </div>
  );
}
