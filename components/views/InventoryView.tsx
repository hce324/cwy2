'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Eye,
  Zap,
  Package,
  ShoppingCart,
  BarChart3,
  DollarSign,
  Warehouse,
  ShieldAlert,
  Radio,
  Play,
  Store,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// ============================================================
// Type helpers for tRPC responses (Decimal / bigint → primitives)
// Superjson serializes Prisma Decimal to Decimal.js objects and
// bigint to BigInt, so we convert everything to number/string.
// ============================================================

type InboundRaw = {
  id: unknown;
  docNo: string;
  type: string;
  inboundDate: Date | string;
  warehouse: string;
  itemCount: number;
  totalAmount: unknown;
  status: string;
};

type OutboundRaw = {
  id: unknown;
  docNo: string;
  type: string;
  outboundDate: Date | string;
  warehouse: string;
  itemCount: number;
  totalAmount: unknown;
  status: string;
};

type InvRaw = {
  id: unknown;
  skuCode: string;
  skuName: string;
  warehouse: string;
  quantity: number;
  safetyStock: number;
  unitCost: unknown;
  category: string;
  turnoverDays: unknown;
};

type InboundItem = {
  id: string;
  docNo: string;
  type: string;
  inboundDate: string;
  warehouse: string;
  itemCount: number;
  totalAmount: number;
  status: string;
};

type OutboundItem = {
  id: string;
  docNo: string;
  type: string;
  outboundDate: string;
  warehouse: string;
  itemCount: number;
  totalAmount: number;
  status: string;
};

type InvItem = {
  id: string;
  skuCode: string;
  skuName: string;
  warehouse: string;
  quantity: number;
  safetyStock: number;
  unitCost: number;
  category: string;
  turnoverDays: number | null;
};

function normalizeItem(raw: InvRaw): InvItem {
  return {
    id: String(raw.id),
    skuCode: raw.skuCode,
    skuName: raw.skuName,
    warehouse: raw.warehouse,
    quantity: raw.quantity,
    safetyStock: raw.safetyStock,
    unitCost: n(raw.unitCost),
    category: raw.category,
    turnoverDays: raw.turnoverDays != null ? n(raw.turnoverDays) : null,
  };
}

function normalizeInbound(raw: InboundRaw): InboundItem {
  return {
    id: String(raw.id),
    docNo: raw.docNo,
    type: raw.type,
    inboundDate: raw.inboundDate instanceof Date ? raw.inboundDate.toISOString().slice(0, 10) : String(raw.inboundDate).slice(0, 10),
    warehouse: raw.warehouse,
    itemCount: raw.itemCount,
    totalAmount: n(raw.totalAmount),
    status: raw.status,
  };
}

function normalizeOutbound(raw: OutboundRaw): OutboundItem {
  return {
    id: String(raw.id),
    docNo: raw.docNo,
    type: raw.type,
    outboundDate: raw.outboundDate instanceof Date ? raw.outboundDate.toISOString().slice(0, 10) : String(raw.outboundDate).slice(0, 10),
    warehouse: raw.warehouse,
    itemCount: raw.itemCount,
    totalAmount: n(raw.totalAmount),
    status: raw.status,
  };
}

// ============================================================
// Helpers
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function n(v: any): number {
  return Number(v ?? 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtCurrency(v: any): string {
  const val = n(v);
  return `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCurrencyWan(v: number): string {
  return `¥${(v / 10000).toFixed(1)}万`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function fmtDate(d: Date | string | undefined | null): string {
  if (!d) return '—';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function fmtMonth(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getMonth() + 1}月`;
}

function fmtShortDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function getMonthKey(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function severityColor(s: 'warning' | 'info' | 'danger' | 'healthy'): string {
  switch (s) {
    case 'warning':
      return 'var(--warning)';
    case 'info':
      return 'var(--primary)';
    case 'danger':
      return 'var(--destructive)';
    case 'healthy':
      return 'var(--success)';
    default:
      return 'var(--primary)';
  }
}

function statusVariant(s: 'healthy' | 'warning' | 'danger'): 'default' | 'secondary' | 'destructive' {
  switch (s) {
    case 'healthy':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'danger':
      return 'destructive';
  }
}

function itemStatus(item: InvItem): 'healthy' | 'warning' | 'danger' {
  if (item.quantity === 0) return 'danger';
  if (item.quantity <= item.safetyStock) return 'warning';
  return 'healthy';
}

// ============================================================
// Chart colors — defined via chart CSS variables
// ============================================================

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

// ============================================================
// Stat Card (shared)
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
  const TrendIcon =
    trend === 'up'
      ? TrendingUp
      : trend === 'down'
        ? TrendingDown
        : null;

  const trendColor =
    trend === 'up'
      ? 'var(--success)'
      : trend === 'down'
        ? 'var(--destructive)'
        : 'var(--muted-foreground)';

  return (
    <Card size="sm" className="card-hover">
      <CardHeader className="pb-1">
        <CardDescription className="text-xs flex items-center gap-1.5 text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight font-heading text-foreground">
            {value}
          </span>
          {TrendIcon && (
            <span
              className="text-xs font-medium inline-flex items-center gap-0.5"
              style={{ color: trendColor }}
            >
              <TrendIcon className="h-3 w-3" />
              {sub}
            </span>
          )}
          {!TrendIcon && sub && (
            <span className="text-xs text-muted-foreground">{sub}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Skeleton presets
// ============================================================

function StatCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-20 mt-1" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-60 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full rounded-md" style={{ height }} />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function InventoryView() {
  const [tabValue, setTabValue] = useState('overview');

  // ── tRPC Queries ──────────────────────────────────────────────

  const stockSummaryQuery = trpc.inventory.stockSummary.useQuery();
  const itemsQuery = trpc.inventory.listItems.useQuery({ limit: 100, offset: 0 });
  const inboundsQuery = trpc.inventory.listInbounds.useQuery({ limit: 100, offset: 0 });
  const outboundsQuery = trpc.inventory.listOutbounds.useQuery({ limit: 100, offset: 0 });

  // ── Loading / error flags ─────────────────────────────────────

  const isLoading =
    stockSummaryQuery.isLoading ||
    itemsQuery.isLoading ||
    inboundsQuery.isLoading ||
    outboundsQuery.isLoading;

  const isError =
    stockSummaryQuery.isError ||
    itemsQuery.isError ||
    inboundsQuery.isError ||
    outboundsQuery.isError;

  const errorMsg =
    stockSummaryQuery.error?.message ??
    itemsQuery.error?.message ??
    inboundsQuery.error?.message ??
    outboundsQuery.error?.message ??
    '数据加载失败，请稍后重试';

  // ── Derived data ──────────────────────────────────────────────

  const stockSummary = stockSummaryQuery.data;
  const items: InvItem[] = useMemo(
    () => (itemsQuery.data?.items ?? []).map((raw: unknown) => normalizeItem(raw as InvRaw)),
    [itemsQuery.data?.items],
  );
  const inbounds: InboundItem[] = useMemo(
    () => (inboundsQuery.data?.items ?? []).map((raw: unknown) => normalizeInbound(raw as InboundRaw)),
    [inboundsQuery.data?.items],
  );
  const outbounds: OutboundItem[] = useMemo(
    () => (outboundsQuery.data?.items ?? []).map((raw: unknown) => normalizeOutbound(raw as OutboundRaw)),
    [outboundsQuery.data?.items],
  );

  // Category aggregate helpers
  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const categoryAgg = useMemo(() => {
    const map = new Map<string, { count: number; totalQty: number; totalValue: number; totalTurnover: number; turnoverCount: number }>();
    items.forEach((item) => {
      const entry = map.get(item.category) ?? { count: 0, totalQty: 0, totalValue: 0, totalTurnover: 0, turnoverCount: 0 };
      entry.count++;
      entry.totalQty += item.quantity;
      entry.totalValue += n(item.unitCost) * item.quantity;
      if (item.turnoverDays !== null && item.turnoverDays !== undefined) {
        entry.totalTurnover += n(item.turnoverDays);
        entry.turnoverCount++;
      }
      map.set(item.category, entry);
    });
    return map;
  }, [items]);

  // Monthly inbound aggregation for chart
  const inboundMonthly = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    inbounds.forEach((ib) => {
      const key = getMonthKey(ib.inboundDate);
      const entry = map.get(key) ?? { amount: 0, count: 0 };
      entry.amount += n(ib.totalAmount);
      entry.count++;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.slice(5) + '月',
        amount: data.amount,
        count: data.count,
      }));
  }, [inbounds]);

  // Monthly outbound aggregation for chart
  const outboundMonthly = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    outbounds.forEach((ob) => {
      const key = getMonthKey(ob.outboundDate);
      const entry = map.get(key) ?? { amount: 0, count: 0 };
      entry.amount += n(ob.totalAmount);
      entry.count++;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.slice(5) + '月',
        amount: data.amount,
        count: data.count,
      }));
  }, [outbounds]);

  // Outbound by type (channel proxy)
  const outboundByType = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    outbounds.forEach((ob) => {
      const entry = map.get(ob.type) ?? { amount: 0, count: 0 };
      entry.amount += n(ob.totalAmount);
      entry.count++;
      map.set(ob.type, entry);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0) || 1;
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([type, data], idx) => ({
        name: type,
        value: total > 0 ? +(data.amount / total * 100).toFixed(1) : 0,
        amount: data.amount,
        count: data.count,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }));
  }, [outbounds]);

  // Inbound by type
  const inboundByType = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    inbounds.forEach((ib) => {
      const entry = map.get(ib.type) ?? { amount: 0, count: 0 };
      entry.amount += n(ib.totalAmount);
      entry.count++;
      map.set(ib.type, entry);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0) || 1;
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([type, data], idx) => ({
        name: type,
        value: total > 0 ? +(data.amount / total * 100).toFixed(1) : 0,
        amount: data.amount,
        count: data.count,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }));
  }, [inbounds]);

  // Inventory structure by category for charts
  const inventoryByCategory = useMemo(() => {
    return Array.from(categoryAgg.entries())
      .sort(([, a], [, b]) => b.totalQty - a.totalQty)
      .map(([category, data]) => ({
        category,
        value: data.totalQty,
        turnover: data.turnoverCount > 0 ? +(data.totalTurnover / data.turnoverCount).toFixed(1) : 0,
      }));
  }, [categoryAgg]);

  // Low stock alerts
  const lowStockItems = useMemo(() => {
    return items
      .filter((item) => item.quantity <= item.safetyStock || item.quantity === 0)
      .slice(0, 8);
  }, [items]);

  // High stock items (high quantity, for滞销 analysis)
  const highStockItems = useMemo(() => {
    return items
      .filter((item) => item.quantity > item.safetyStock * 3 && item.quantity > 50)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  }, [items]);

  // Total aggregates
  const totalInboundAmount = useMemo(() => inbounds.reduce((s, ib) => s + n(ib.totalAmount), 0), [inbounds]);
  const totalOutboundAmount = useMemo(() => outbounds.reduce((s, ob) => s + n(ob.totalAmount), 0), [outbounds]);
  const totalItemQty = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalItemValue = useMemo(() => Array.from(categoryAgg.values()).reduce((s, c) => s + c.totalValue, 0), [categoryAgg]);
  const avgTurnoverDays =
    items.length > 0
      ? +(items.reduce((s, i) => s + n(i.turnoverDays), 0) / items.length).toFixed(1)
      : 0;

  // For the combined trend chart
  const combinedTrend = useMemo(() => {
    const map = new Map<string, { inboundAmount: number; outboundAmount: number; inboundCount: number; outboundCount: number }>();
    inbounds.forEach((ib) => {
      const key = getMonthKey(ib.inboundDate);
      const entry = map.get(key) ?? { inboundAmount: 0, outboundAmount: 0, inboundCount: 0, outboundCount: 0 };
      entry.inboundAmount += n(ib.totalAmount);
      entry.inboundCount++;
      map.set(key, entry);
    });
    outbounds.forEach((ob) => {
      const key = getMonthKey(ob.outboundDate);
      const entry = map.get(key) ?? { inboundAmount: 0, outboundAmount: 0, inboundCount: 0, outboundCount: 0 };
      entry.outboundAmount += n(ob.totalAmount);
      entry.outboundCount++;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.slice(5) + '月',
        inbound: +(data.inboundAmount / 10000).toFixed(1),
        outbound: +(data.outboundAmount / 10000).toFixed(1),
      }));
  }, [inbounds, outbounds]);

  // Outbound by type for channel analysis
  const outboundMonthlyByType = useMemo(() => {
    const types = [...new Set(outbounds.map((o) => o.type))].slice(0, 4);
    const map = new Map<string, Record<string, number>>();
    outbounds.forEach((ob) => {
      if (!types.includes(ob.type)) return;
      const key = getMonthKey(ob.outboundDate);
      const entry = map.get(key) ?? {};
      entry[ob.type] = (entry[ob.type] ?? 0) + n(ob.totalAmount) / 10000;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.slice(5) + '月',
        ...data,
      }));
  }, [outbounds]);

  // ============================================================
  // Empty state helper
  // ============================================================

  const isEmpty = !isLoading && !isError && items.length === 0 && inbounds.length === 0 && outbounds.length === 0;

  // ============================================================
  // Render: Loading state (full page)
  // ============================================================

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3"><ChartSkeleton /></div>
          <div className="lg:col-span-2"><ChartSkeleton height={280} /></div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Error state
  // ============================================================

  if (isError) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="page-title">产销管理 · 库存与出入库</h1>
          <p className="page-subtitle">库存管理、采购入库与销售出库数据分析。</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            stockSummaryQuery.refetch();
            itemsQuery.refetch();
            inboundsQuery.refetch();
            outboundsQuery.refetch();
          }}
        >
          重试
        </Button>
      </div>
    );
  }

  // ============================================================
  // Render: Empty state
  // ============================================================

  if (isEmpty) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">产销管理 · 库存与出入库</h1>
            <p className="page-subtitle">库存管理、采购入库与销售出库数据分析。</p>
          </div>
        </div>
        <Alert>
          <Package className="h-4 w-4" />
          <AlertTitle>暂无数据</AlertTitle>
          <AlertDescription>
            当前租户下暂无库存商品、入库或出库记录。请先创建商品并录入出入库单据。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================
  // Render: Main content
  // ============================================================

  return (
    <div className="p-6 space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            产销管理 · 库存与出入库
          </h1>
          <p className="page-subtitle">
            实时监控库存水平、出入库流水与类目结构，支持采购入库与销售出库全链路追踪。
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Download className="h-4 w-4" />
          导出库存报表
        </Button>
      </div>

      {/* ---- Tabs ---- */}
      <Tabs
        className="w-full"
        value={tabValue}
        onValueChange={(val) => {
          if (typeof val === 'string') setTabValue(val);
        }}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">出入库总览</TabsTrigger>
          <TabsTrigger value="channel">出库类型分析</TabsTrigger>
          <TabsTrigger value="self-live">出库趋势</TabsTrigger>
          <TabsTrigger value="affiliate-live">入库趋势</TabsTrigger>
          <TabsTrigger value="sku">商品SKU分析</TabsTrigger>
          <TabsTrigger value="procurement">采购入库明细</TabsTrigger>
          <TabsTrigger value="inventory">库存健康分析</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* Tab 1: 出入库总览 */}
        {/* ================================================================ */}
        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* ---- Stat Row ---- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="库存商品数"
              value={String(stockSummary?.totalItems ?? 0)}
              sub="SKU总数"
              trend="neutral"
              icon={Package}
            />
            <StatCard
              title="库存总量"
              value={String(stockSummary?.totalQuantity ?? 0)}
              sub="单位：件"
              trend="neutral"
              icon={Warehouse}
            />
            <StatCard
              title="库存总值"
              value={fmtCurrencyWan(totalItemValue)}
              sub={`低库存预警 ${stockSummary?.lowStockCount ?? 0} 项`}
              trend={stockSummary?.lowStockCount && stockSummary.lowStockCount > 0 ? 'down' : 'up'}
              icon={DollarSign}
            />
            <StatCard
              title="入库总额"
              value={fmtCurrencyWan(totalInboundAmount)}
              sub={`${inbounds.length} 笔`}
              trend="up"
              icon={ShoppingCart}
            />
            <StatCard
              title="出库总额"
              value={fmtCurrencyWan(totalOutboundAmount)}
              sub={`${outbounds.length} 笔`}
              trend="up"
              icon={Store}
            />
            <StatCard
              title="平均周转天数"
              value={`${avgTurnoverDays}天`}
              sub={avgTurnoverDays <= 30 ? '健康' : '偏慢'}
              trend={avgTurnoverDays <= 30 ? 'up' : 'down'}
              icon={BarChart3}
            />
          </div>

          {/* ---- Charts Row ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Combined Trend */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-heading">出入库金额趋势</CardTitle>
                <CardDescription>单位：万元 · 按月统计</CardDescription>
              </CardHeader>
              <CardContent>
                {combinedTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
                    暂无出入库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={combinedTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                        }}
                        formatter={(val: unknown) => `${Number(val)}万`}
                      />
                      <Legend />
                      <Bar dataKey="inbound" name="入库金额" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="outbound"
                        name="出库金额"
                        stroke="var(--chart-3)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution Pie */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-heading">商品类目结构</CardTitle>
                <CardDescription>按库存数量分布</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {categoryNames.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无商品数据
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <RPieChart>
                        <Pie
                          data={inventoryByCategory.map((c, idx) => ({
                            name: c.category,
                            value: c.value,
                            color: CHART_COLORS[idx % CHART_COLORS.length],
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {inventoryByCategory.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'var(--popover)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontSize: 13,
                          }}
                          formatter={(val: unknown) => `${Number(val)}件`}
                        />
                      </RPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {inventoryByCategory.map((c, idx) => (
                        <div key={c.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          {c.category} {c.value}件
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ---- 库存预警 + 出入库统计 Row ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 库存预警 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  库存预警
                </CardTitle>
                <CardDescription>低库存与高库存商品关注列表</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {lowStockItems.length === 0 && highStockItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    当前无库存预警，所有商品库存正常。
                  </div>
                ) : (
                  <>
                    {lowStockItems.map((item) => (
                      <div
                        key={`low-${item.id}`}
                        className="flex gap-3 rounded-lg border p-4"
                        style={{ borderColor: 'var(--destructive)', borderLeftWidth: 4 }}
                      >
                        <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--destructive)' }} />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">低库存: {item.skuName}</span>
                          <span className="text-xs text-muted-foreground leading-relaxed">
                            当前库存 {item.quantity}，安全库存 {item.safetyStock}，{item.warehouse} · {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                    {highStockItems.slice(0, 3).map((item) => (
                      <div
                        key={`high-${item.id}`}
                        className="flex gap-3 rounded-lg border p-4"
                        style={{ borderColor: 'var(--warning)', borderLeftWidth: 4 }}
                      >
                        <Eye className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">高库存: {item.skuName}</span>
                          <span className="text-xs text-muted-foreground leading-relaxed">
                            库存 {item.quantity}，建议关注周转 · {item.warehouse}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 出入库达成 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  出入库指标
                </CardTitle>
                <CardDescription>本月库存管理核心指标</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">入库单据数</span>
                    <span className="font-semibold text-foreground">{inbounds.length} 笔</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">出库单据数</span>
                    <span className="font-semibold text-foreground">{outbounds.length} 笔</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">商品健康率</span>
                    <span className="font-semibold text-foreground">
                      {items.length > 0 ? fmtPct((items.filter((i) => i.quantity > i.safetyStock).length / items.length) * 100) : '—'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-warning"
                      style={{
                        width: items.length > 0
                          ? `${((items.filter((i) => i.quantity > i.safetyStock).length / items.length) * 100).toFixed(0)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">低库存占比</span>
                    <span className="font-semibold text-foreground">
                      {items.length > 0 ? fmtPct((lowStockItems.length / items.length) * 100) : '—'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[--chart-1]" style={{ width: `${items.length > 0 ? Math.min((lowStockItems.length / items.length) * 100, 100) : 0}%` }} />
                  </div>
                </div>
                <div className="mt-2 rounded-lg bg-accent p-3 text-center">
                  <p className="text-xs text-accent-foreground font-medium">
                    库存总值 <span className="text-lg font-bold">{fmtCurrencyWan(totalItemValue)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stockSummary?.totalItems ?? 0} 个SKU，{categoryNames.length} 个类目
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---- Category Detail Table ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                商品类目明细
              </CardTitle>
              <CardDescription>各类目库存数量、估值与周转分析</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryNames.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">暂无商品数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>类目</TableHead>
                      <TableHead className="text-right">SKU数</TableHead>
                      <TableHead className="text-right">库存量</TableHead>
                      <TableHead className="text-right">估值(万)</TableHead>
                      <TableHead className="text-right">周转天数</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryByCategory.map((cat) => {
                      const agg = categoryAgg.get(cat.category);
                      const count = agg?.count ?? 0;
                      const value = agg?.totalValue ?? 0;
                      const turnover = cat.turnover;
                      const status: 'healthy' | 'warning' | 'danger' =
                        turnover === 0 ? 'danger' : turnover <= 30 ? 'healthy' : turnover <= 45 ? 'warning' : 'danger';
                      return (
                        <TableRow key={cat.category}>
                          <TableCell className="font-medium">{cat.category}</TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                          <TableCell className="text-right">{cat.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{fmtCurrencyWan(value)}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                turnover === 0
                                  ? 'text-destructive'
                                  : turnover <= 30
                                    ? 'text-success'
                                    : turnover <= 45
                                      ? 'text-warning'
                                      : 'text-destructive'
                              }
                            >
                              {turnover === 0 ? '—' : `${turnover}天`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(status)}>
                              {status === 'healthy' ? '健康' : status === 'warning' ? '警戒' : '危险'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 2: 出库类型分析 */}
        {/* ================================================================ */}
        <TabsContent value="channel" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="出库总额" value={fmtCurrencyWan(totalOutboundAmount)} sub={`${outbounds.length} 笔`} trend="up" icon={Store} />
            <StatCard title="出库类型数" value={String(outboundByType.length)} sub="按类型分布" trend="neutral" icon={ShoppingCart} />
            <StatCard
              title="平均单笔金额"
              value={outbounds.length > 0 ? fmtCurrency(totalOutboundAmount / outbounds.length) : '—'}
              sub="按出库单据"
              trend="neutral"
              icon={DollarSign}
            />
            <StatCard
              title="最大类型占比"
              value={outboundByType.length > 0 ? `${outboundByType[0].value}%` : '—'}
              sub={outboundByType.length > 0 ? outboundByType[0].name : '—'}
              trend="up"
              icon={BarChart3}
            />
          </div>

          {/* Outbound Type Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">出库类型趋势</CardTitle>
              <CardDescription>单位：万元 · 主要出库类型月度趋势</CardDescription>
            </CardHeader>
            <CardContent>
              {outboundMonthlyByType.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
                  暂无出库数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={outboundMonthlyByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                      formatter={(val: unknown) => `${Number(val).toFixed(1)}万`}
                    />
                    <Legend />
                    {Object.keys(outboundMonthlyByType[0] ?? {})
                      .filter((k) => k !== 'month')
                      .map((type, idx) => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          stackId="1"
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Outbound Type Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">出库类型明细</CardTitle>
            </CardHeader>
            <CardContent>
              {outboundByType.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">暂无出库数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>出库类型</TableHead>
                      <TableHead className="text-right">金额(万)</TableHead>
                      <TableHead className="text-right">占比</TableHead>
                      <TableHead className="text-right">单据数</TableHead>
                      <TableHead className="text-right">平均单笔(元)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outboundByType.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right">{fmtCurrencyWan(r.amount)}</TableCell>
                        <TableCell className="text-right">{r.value}%</TableCell>
                        <TableCell className="text-right">{r.count}</TableCell>
                        <TableCell className="text-right">
                          {r.count > 0 ? fmtCurrency(r.amount / r.count) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 3: 出库趋势分析 */}
        {/* ================================================================ */}
        <TabsContent value="self-live" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">出库总额</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{fmtCurrencyWan(totalOutboundAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{outbounds.length} 笔</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">出库类型数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{outboundByType.length}</div>
                <div className="text-xs text-muted-foreground mt-1">种类型</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">已完成出库</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {outbounds.filter((o) => o.status === 'completed').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">笔</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">最近出库</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {outbounds.length > 0 ? fmtShortDate(outbounds[0].outboundDate) : '—'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">最近日期</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">出库金额趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {outboundMonthly.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无出库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={outboundMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                        formatter={(val) => fmtCurrency(val as any)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="出库金额"
                        stroke="var(--chart-1)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--chart-1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="出库笔数"
                        stroke="var(--chart-3)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">出库类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                {outboundByType.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无出库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={outboundByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="amount"
                        name="金额"
                        fill="var(--chart-1)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="count"
                        name="单据数"
                        stroke="var(--chart-3)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--chart-3)' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 4: 入库趋势分析 */}
        {/* ================================================================ */}
        <TabsContent value="affiliate-live" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">入库总额</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{fmtCurrencyWan(totalInboundAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{inbounds.length} 笔</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">入库类型数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{inboundByType.length}</div>
                <div className="text-xs text-muted-foreground mt-1">种类型</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">已完成入库</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {inbounds.filter((ib) => ib.status === 'completed').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">笔</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">最近入库</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {inbounds.length > 0 ? fmtShortDate(inbounds[0].inboundDate) : '—'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">最近日期</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">入库金额趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {inboundMonthly.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无入库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inboundMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                        formatter={(val) => fmtCurrency(val as any)}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="入库金额" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="count" name="入库笔数" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">入库类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                {inboundByType.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无入库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={inboundByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        name="入库金额"
                        stroke="var(--chart-3)"
                        fill="var(--chart-3)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 5: 商品SKU分析 */}
        {/* ================================================================ */}
        <TabsContent value="sku" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="SKU总数" value={String(items.length)} sub={`${categoryNames.length} 个类目`} trend="neutral" icon={Package} />
            <StatCard
              title="健康SKU"
              value={String(items.filter((i) => i.quantity > i.safetyStock).length)}
              sub={items.length > 0 ? fmtPct((items.filter((i) => i.quantity > i.safetyStock).length / items.length) * 100) : '—'}
              trend="up"
              icon={TrendingUp}
            />
            <StatCard title="低库存SKU" value={String(lowStockItems.length)} sub="需补货" trend={lowStockItems.length > 0 ? 'down' : 'up'} icon={Zap} />
            <StatCard title="缺货SKU" value={String(items.filter((i) => i.quantity === 0).length)} sub="库存为零" trend="down" icon={AlertTriangle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">类目库存分布</CardTitle>
                <CardDescription>各类目库存量 vs SKU数</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无商品数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={inventoryByCategory.map((c) => ({
                      ...c,
                      count: categoryAgg.get(c.category)?.count ?? 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="var(--muted-foreground)"
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey="value" name="库存量" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* SKU Detail Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">商品明细列表</CardTitle>
                <CardDescription>按入库时间倒序，最多显示 20 条</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">暂无商品数据</div>
                ) : (
                  <div className="max-h-80 overflow-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU名称</TableHead>
                          <TableHead className="text-right">库存</TableHead>
                          <TableHead className="text-right">安全库存</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.slice(0, 20).map((item) => {
                          const status = itemStatus(item);
                          return (
                            <TableRow key={String(item.id)}>
                              <TableCell className="font-medium max-w-40 truncate" title={item.skuName}>
                                {item.skuName}
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  style={{
                                    color:
                                      item.quantity === 0
                                        ? 'var(--destructive)'
                                        : item.quantity <= item.safetyStock
                                          ? 'var(--warning)'
                                          : 'var(--success)',
                                  }}
                                >
                                  {item.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">{item.safetyStock}</TableCell>
                              <TableCell>
                                <Badge variant={statusVariant(status)}>
                                  {status === 'healthy' ? '正常' : status === 'warning' ? '低库存' : '缺货'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 6: 采购入库明细 */}
        {/* ================================================================ */}
        <TabsContent value="procurement" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">入库总额</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{fmtCurrencyWan(totalInboundAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{inbounds.length} 笔入库</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">入库单据数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{inbounds.length}</div>
                <div className="text-xs text-muted-foreground mt-1">已完成 {inbounds.filter((ib) => ib.status === 'completed').length} 笔</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">涉及仓库</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {new Set(inbounds.map((ib) => ib.warehouse)).size}
                </div>
                <div className="text-xs text-muted-foreground mt-1">个仓库</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">入库商品总件数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">
                  {inbounds.reduce((s, ib) => s + ib.itemCount, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">件</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inbound Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">入库金额趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {inboundMonthly.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无入库数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={inboundMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                        formatter={(val) => fmtCurrency(val as any)}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="入库金额" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="入库笔数"
                        stroke="var(--chart-4)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Inbound by Warehouse */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">入库仓库分布</CardTitle>
              </CardHeader>
              <CardContent>
                {inbounds.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">暂无入库数据</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>仓库</TableHead>
                        <TableHead className="text-right">单据数</TableHead>
                        <TableHead className="text-right">金额(万)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const byWarehouse = new Map<string, { count: number; amount: number }>();
                        inbounds.forEach((ib) => {
                          const entry = byWarehouse.get(ib.warehouse) ?? { count: 0, amount: 0 };
                          entry.count++;
                          entry.amount += n(ib.totalAmount);
                          byWarehouse.set(ib.warehouse, entry);
                        });
                        return Array.from(byWarehouse.entries())
                          .sort(([, a], [, b]) => b.amount - a.amount)
                          .map(([wh, data]) => (
                            <TableRow key={wh}>
                              <TableCell className="font-medium max-w-32 truncate">{wh}</TableCell>
                              <TableCell className="text-right">{data.count}</TableCell>
                              <TableCell className="text-right font-medium">{fmtCurrencyWan(data.amount)}</TableCell>
                            </TableRow>
                          ));
                      })()}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 7: 库存健康分析 */}
        {/* ================================================================ */}
        <TabsContent value="inventory" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">库存SKU数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{stockSummary?.totalItems ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">{categoryNames.length} 个类目</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">库存总量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{stockSummary?.totalQuantity?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">件</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">低库存预警</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{stockSummary?.lowStockCount ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stockSummary?.lowStockCount && stockSummary.lowStockCount > 0 ? '需关注' : '正常'}
                </div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="text-xs text-muted-foreground">库存估值</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-heading text-foreground">{fmtCurrencyWan(totalItemValue)}</div>
                <div className="text-xs text-muted-foreground mt-1">基于成本价</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Structure by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">库存类目结构</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                    暂无库存数据
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inventoryByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                        formatter={(val: unknown) => `${Number(val)}件`}
                      />
                      <Legend />
                      <Bar dataKey="value" name="库存量" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  库存预警
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    所有商品库存充足，无预警项。
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">库存</TableHead>
                        <TableHead className="text-right">安全库存</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => {
                        const alertStatus = item.quantity === 0 ? '缺货' : '低库存';
                        return (
                          <TableRow key={String(item.id)}>
                            <TableCell className="font-medium max-w-32 truncate" title={item.skuName}>
                              {item.skuName}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                style={{
                                  color:
                                    item.quantity === 0
                                      ? 'var(--destructive)'
                                      : 'var(--warning)',
                                }}
                              >
                                {item.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.safetyStock}</TableCell>
                            <TableCell>
                              <Badge
                                variant={item.quantity === 0 ? 'destructive' : 'secondary'}
                              >
                                {alertStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
