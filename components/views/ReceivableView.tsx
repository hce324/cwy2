'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import { formatDelta, type DeltaResult } from '@/lib/kpi';
import { RISK_LEVELS, type RiskLevel } from '@/lib/risk';

// ============================================================================
// Inline Data
// ============================================================================

interface StatItem {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  delta?: DeltaResult;
}

const statsData: StatItem[] = [
  { label: '应收总额', value: '¥384.26万' },
  { label: '逾期金额', value: '¥161.43万', sub: '占应收总额 42.0%', subClass: 'risk-text--high' },
  { label: '本月已回款', value: '¥286.00万', delta: formatDelta({ value: 12.3, unit: '%', period: '较上月', good: true }) },
  { label: '应收周转天数', value: '52天', sub: '高于目标 4天', subClass: 'risk-text--mid' },
];

const agingData = [
  { name: '未到期', value: 161.38, color: 'var(--chart-3)' },
  { name: '1-30天', value: 99.90, color: 'var(--chart-4)' },
  { name: '31-60天', value: 73.00, color: 'var(--chart-5)' },
  { name: '60天以上', value: 49.98, color: 'var(--destructive)' },
];

const turnoverTrendData = [
  { month: '2026.02', days: 48 },
  { month: '2026.03', days: 50 },
  { month: '2026.04', days: 47 },
  { month: '2026.05', days: 51 },
  { month: '2026.06', days: 53 },
  { month: '2026.07', days: 52 },
];

const TARGET_DAYS = 48;

interface CustomerReceivable {
  id: number;
  name: string;
  amount: number;
  days: number;
  risk: RiskLevel;
  contact: string;
  collector: string;
  tags: string[];
}

const allCustomers: CustomerReceivable[] = [
  {
    id: 1,
    name: '华东优选',
    amount: 68.00,
    days: 32,
    risk: 'high',
    contact: '张总 138****6789',
    collector: '王思雨',
    tags: ['逾期', '本周到期'],
  },
  {
    id: 2,
    name: '星禾电商',
    amount: 41.68,
    days: 18,
    risk: 'high',
    contact: '李经理 139****8901',
    collector: '王思雨',
    tags: ['逾期'],
  },
  {
    id: 3,
    name: '锦程物流',
    amount: 55.20,
    days: 45,
    risk: 'mid',
    contact: '王总 137****2345',
    collector: '李晓雯',
    tags: ['逾期'],
  },
  {
    id: 4,
    name: '蓝海科技',
    amount: 32.15,
    days: 28,
    risk: 'mid',
    contact: '赵经理 136****5678',
    collector: '陈洁',
    tags: ['逾期', '本周到期'],
  },
  {
    id: 5,
    name: '朝阳贸易',
    amount: 88.50,
    days: 10,
    risk: 'low',
    contact: '陈总 135****9012',
    collector: '周文昊',
    tags: ['未到期'],
  },
  {
    id: 6,
    name: '绿源食品',
    amount: 19.73,
    days: 5,
    risk: 'low',
    contact: '钱经理 133****3456',
    collector: '李晓雯',
    tags: ['未到期', '本周到期'],
  },
  {
    id: 7,
    name: '远航工贸',
    amount: 73.00,
    days: 58,
    risk: 'high',
    contact: '孙总 132****7890',
    collector: '王思雨',
    tags: ['逾期'],
  },
];

interface CollectorKPI {
  name: string;
  managedAmount: number;
  overdueAmount: number;
  recoveryRate: number;
}

const collectorKPIs: CollectorKPI[] = [
  { name: '李晓雯', managedAmount: 74.93, overdueAmount: 8.52, recoveryRate: 88.6 },
  { name: '王思雨', managedAmount: 182.68, overdueAmount: 62.40, recoveryRate: 65.8 },
  { name: '周文昊', managedAmount: 88.50, overdueAmount: 12.30, recoveryRate: 86.1 },
  { name: '陈洁', managedAmount: 32.15, overdueAmount: 5.60, recoveryRate: 82.6 },
];

type CollectionResult = '客户已承诺回款' | '客户暂时无法回款' | '未联系上客户' | '存在账款争议';

const collectionResultOptions: { value: CollectionResult; icon: React.ReactNode }[] = [
  { value: '客户已承诺回款', icon: <CircleCheck className="h-4 w-4 text-success" /> },
  { value: '客户暂时无法回款', icon: <AlertTriangle className="h-4 w-4 text-warning" /> },
  { value: '未联系上客户', icon: <PhoneOff className="h-4 w-4 text-muted-foreground" /> },
  { value: '存在账款争议', icon: <FileWarning className="h-4 w-4 text-danger" /> },
];

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtWan(v: number): string {
  return `¥${v.toFixed(2)}万`;
}

// ============================================================================
// Custom Tooltips
// ============================================================================

function AgingTooltip({ active, payload }: any) {
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
// Collection Sheet
// ============================================================================

function CollectionSheet({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerReceivable | null;
}) {
  const [result, setResult] = useState<CollectionResult>('客户已承诺回款');
  const [promiseDate, setPromiseDate] = useState('');
  const [notes, setNotes] = useState('已与客户财务负责人电话沟通，了解回款进度及后续付款安排。');

  const handleSave = () => {
    toast.success('处理记录已保存，状态已更新');
    onOpenChange(false);
    // Reset form
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
              <span className="text-sm font-semibold text-foreground">{fmtWan(customer.amount)}</span>
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
              {collectionResultOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    result === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
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
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      result === opt.value
                        ? 'border-primary'
                        : 'border-muted-foreground/40'
                    }`}
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
          <Button onClick={handleSave}>
            保存记录
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ReceivableView() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerReceivable | null>(null);

  const filteredCustomers = useMemo(() => {
    let list = allCustomers;
    // Tab filter
    if (activeTab === 'overdue') {
      list = list.filter((c) => c.tags.includes('逾期'));
    } else if (activeTab === 'dueThisWeek') {
      list = list.filter((c) => c.tags.includes('本周到期'));
    }
    // Search filter
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
  }, [activeTab, searchQuery]);

  const handleCollectionClick = (customer: CustomerReceivable) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

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
          <p className="page-subtitle">
            关注回款进度、账龄结构与逾期催收闭环
          </p>
        </div>
        <Button className="ripple-container" size="lg">
          <Plus className="h-4 w-4" />
          新建应收记录
        </Button>
      </div>

      {/* ========== AI Diagnosis ========== */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">AI 诊断</p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            逾期占比较高，2位客户超15天，回款压力集中在王思雨名下。
          </p>
        </div>
      </div>

      {/* ========== 4 Stat Indicators ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.label} className="elevation-1">
            <CardHeader className="pb-1">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-heading text-foreground tracking-tight">
                {stat.value}
              </p>
              {stat.delta ? (
                <p className={cn('mt-0.5 flex items-center gap-0.5', stat.delta.className)}>
                  <span className="kpi-delta__symbol">{stat.delta.symbol}</span>
                  {stat.delta.text}
                </p>
              ) : stat.sub ? (
                <p className={cn('text-xs mt-0.5', stat.subClass ?? 'text-muted-foreground')}>
                  {stat.sub}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Charts Row ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 应收账龄分布 — Donut */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>应收账龄分布</CardTitle>
            <CardDescription>
              按账龄区间拆分应收余额结构
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={agingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {agingData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<AgingTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value: string, _entry: any, _index: number) => {
                    const item = agingData.find((d) => d.name === value);
                    const total = agingData.reduce((s, d) => s + d.value, 0);
                    const pct = item ? ((item.value / total) * 100).toFixed(0) : '';
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
              {agingData.map((d) => {
                const total = agingData.reduce((s, item) => s + item.value, 0);
                const pct = ((d.value / total) * 100).toFixed(0);
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
          </CardContent>
        </Card>

        {/* 应收周转趋势 — Line chart */}
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
                  domain={[40, 60]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}天`}
                />
                <Tooltip content={<TurnoverTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
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
              {filteredCustomers.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collectorKPIs.map((kpi) => {
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
                            width: `${kpi.recoveryRate}%`,
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
        </CardContent>
      </Card>

      {/* ========== Collection Sheet ========== */}
      <CollectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customer={selectedCustomer}
      />
    </div>
  );
}
