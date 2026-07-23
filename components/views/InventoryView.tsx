'use client';

import { useState } from 'react';
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
// Inline Data — Tab 1: 产销经营总览
// ============================================================

const MONTHLY_STATS = [
  {
    title: '本月销售额',
    value: '¥1,286.4万',
    sub: '同比 +12.6%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    title: '本月净利润',
    value: '¥214.7万',
    sub: '同比 +6.2%',
    trend: 'up' as const,
    icon: TrendingUp,
  },
  {
    title: '自播ROI',
    value: '3.2',
    sub: '环比 +0.3',
    trend: 'up' as const,
    icon: Radio,
  },
  {
    title: '达播ROI',
    value: '2.8',
    sub: '环比 +0.1',
    trend: 'up' as const,
    icon: Play,
  },
  {
    title: 'SKU毛利率',
    value: '38.5%',
    sub: '同比 +1.2pp',
    trend: 'up' as const,
    icon: BarChart3,
  },
  {
    title: '库存周转天数',
    value: '28天',
    sub: '环比 ↓ 3天',
    trend: 'down' as const,
    icon: Warehouse,
  },
];

const SALES_PRODUCTION_TREND = [
  { month: '1月', sales: 1086, production: 1120, forecast: 1150 },
  { month: '2月', sales: 1024, production: 1060, forecast: 1080 },
  { month: '3月', sales: 1146, production: 1180, forecast: 1160 },
  { month: '4月', sales: 1198, production: 1210, forecast: 1200 },
  { month: '5月', sales: 1234, production: 1260, forecast: 1240 },
  { month: '6月', sales: 1286, production: 1300, forecast: 1280 },
  { month: '7月', sales: 1320, production: 1340, forecast: 1320 },
  { month: '8月*', sales: null, production: 1380, forecast: 1360 },
];

const CHANNEL_DATA = [
  { name: '抖音自播', value: 28.4, color: 'var(--chart-1)' },
  { name: '天猫旗舰店', value: 22.6, color: 'var(--chart-2)' },
  { name: '拼多多直营', value: 18.2, color: 'var(--chart-3)' },
  { name: '京东官方店', value: 16.8, color: 'var(--chart-4)' },
  { name: '社区团购', value: 8.5, color: 'var(--chart-5)' },
  { name: '其他渠道', value: 5.5, color: 'var(--muted-foreground)' },
];

const BIZ_ATTENTION = [
  {
    title: '自播投放成本上升',
    desc: '近 3 个月自播 ROI 从 3.5 降至 3.2，千次展现成本上涨 18%，建议调整投放策略并优化直播间转化。',
    severity: 'warning' as const,
  },
  {
    title: '供应链库存周转改善',
    desc: '库存周转天数从 31 天降至 28 天，但畅销 SKU 占比仍达 12%，需加强滞销清理。',
    severity: 'info' as const,
  },
  {
    title: 'SKU利润结构分化',
    desc: '头部 3 款爆品占毛利润 42%，尾部 40% SKU 亏损，建议优化产品组合并淘汰亏损 SKU。',
    severity: 'danger' as const,
  },
];

const PRODUCT_CATEGORIES = [
  {
    category: '家居百货',
    skuCount: 48,
    sales: 514.56,
    cost: 321.60,
    grossProfit: 192.96,
    margin: 37.5,
    inventory: 824.0,
    turnoverDays: 22,
    status: 'healthy' as const,
  },
  {
    category: '厨房小电器',
    skuCount: 32,
    sales: 386.40,
    cost: 224.11,
    grossProfit: 162.29,
    margin: 42.0,
    inventory: 628.0,
    turnoverDays: 28,
    status: 'healthy' as const,
  },
  {
    category: '个护化妆',
    skuCount: 56,
    sales: 257.28,
    cost: 164.66,
    grossProfit: 92.62,
    margin: 36.0,
    inventory: 386.0,
    turnoverDays: 35,
    status: 'warning' as const,
  },
  {
    category: '户外运动',
    skuCount: 24,
    sales: 128.16,
    cost: 92.28,
    grossProfit: 35.88,
    margin: 28.0,
    inventory: 312.0,
    turnoverDays: 42,
    status: 'danger' as const,
  },
];

// ============================================================
// Inline Data — Tab 2: 渠道销售分析
// ============================================================

const CHANNEL_SALES_TREND = [
  { month: '1月', '抖音': 286, '天猫': 224, '拼多多': 178, '京东': 168 },
  { month: '2月', '抖音': 272, '天猫': 218, '拼多多': 170, '京东': 156 },
  { month: '3月', '抖音': 312, '天猫': 248, '拼多多': 196, '京东': 182 },
  { month: '4月', '抖音': 338, '天猫': 266, '拼多多': 214, '京东': 198 },
  { month: '5月', '抖音': 348, '天猫': 278, '拼多多': 228, '京东': 206 },
  { month: '6月', '抖音': 366, '天猫': 290, '拼多多': 234, '京东': 216 },
];

const CHANNEL_DETAIL = [
  { channel: '抖音自播', sales: 366.2, share: 28.4, orders: 48600, aov: 75.3, roi: 3.2, trend: 'up' },
  { channel: '天猫旗舰店', sales: 290.4, share: 22.6, orders: 35400, aov: 82.0, roi: 4.8, trend: 'up' },
  { channel: '拼多多直营', sales: 234.1, share: 18.2, orders: 51200, aov: 45.7, roi: 3.6, trend: 'stable' },
  { channel: '京东官方店', sales: 216.2, share: 16.8, orders: 19800, aov: 109.2, roi: 5.2, trend: 'up' },
  { channel: '社区团购', sales: 109.3, share: 8.5, orders: 28400, aov: 38.5, roi: 2.4, trend: 'down' },
  { channel: '其他渠道', sales: 70.8, share: 5.5, orders: 12600, aov: 56.2, roi: 2.1, trend: 'stable' },
];

// ============================================================
// Inline Data — Tab 3: 自播ROI分析
// ============================================================

const SELF_LIVE_ROI_TREND = [
  { date: '07-01', roi: 3.5, gpm: 42, uv: 18600, conversion: 3.8 },
  { date: '07-04', roi: 3.3, gpm: 41, uv: 19200, conversion: 3.6 },
  { date: '07-07', roi: 3.6, gpm: 43, uv: 20400, conversion: 3.9 },
  { date: '07-10', roi: 3.2, gpm: 40, uv: 17800, conversion: 3.5 },
  { date: '07-13', roi: 3.4, gpm: 42, uv: 19600, conversion: 3.7 },
  { date: '07-16', roi: 3.1, gpm: 39, uv: 18200, conversion: 3.4 },
  { date: '07-19', roi: 3.3, gpm: 41, uv: 18800, conversion: 3.6 },
  { date: '07-22', roi: 3.2, gpm: 40, uv: 19400, conversion: 3.5 },
];

const SELF_LIVE_STATS = [
  { label: '本月自播GMV', value: '¥386.4万', sub: '环比 +8.2%' },
  { label: '本月投放花费', value: '¥120.8万', sub: '环比 +14.6%' },
  { label: '自播实收ROI', value: '3.2', sub: '环比 -0.3' },
  { label: '单场平均GMV', value: '¥8.6万', sub: '环比 +5.1%' },
];

// ============================================================
// Inline Data — Tab 4: 达播ROI分析
// ============================================================

const AFFILIATE_LIVE_ROI_TREND = [
  { date: '07-01', roi: 2.6, gmv: 86, commission: 28.7 },
  { date: '07-04', roi: 2.9, gmv: 94, commission: 28.4 },
  { date: '07-07', roi: 2.7, gmv: 82, commission: 26.8 },
  { date: '07-10', roi: 3.1, gmv: 102, commission: 29.2 },
  { date: '07-13', roi: 2.8, gmv: 96, commission: 30.6 },
  { date: '07-16', roi: 3.0, gmv: 108, commission: 32.0 },
  { date: '07-19', roi: 2.7, gmv: 92, commission: 30.4 },
  { date: '07-22', roi: 2.8, gmv: 98, commission: 31.2 },
];

const AFFILIATE_LIVE_STATS = [
  { label: '本月达播GMV', value: '¥758.4万', sub: '环比 +12.4%' },
  { label: '本月佣金支出', value: '¥270.9万', sub: '环比 +10.2%' },
  { label: '达播实收ROI', value: '2.8', sub: '环比 +0.1' },
  { label: '合作达人数', value: '86人', sub: '新增 6 人' },
];

// ============================================================
// Inline Data — Tab 5: SKU经营分析
// ============================================================

const SKU_PERFORMANCE = [
  { sku: '纳米蒸烤一体锅', category: '厨房小电器', sales: 186.4, margin: 46.2, roi: 4.8, rank: 1 },
  { sku: '智能洗地机', category: '厨房小电器', sales: 148.2, margin: 42.0, roi: 3.9, rank: 2 },
  { sku: '氮化镓智能水杯', category: '家居百货', sales: 132.8, margin: 38.5, roi: 4.2, rank: 3 },
  { sku: '免安装智能门锁', category: '家居百货', sales: 108.6, margin: 35.2, roi: 3.6, rank: 4 },
  { sku: '三合一充电站', category: '家居百货', sales: 96.4, margin: 32.8, roi: 2.8, rank: 5 },
  { sku: '便携式颈部按摩仪', category: '个护化妆', sales: 78.2, margin: 48.6, roi: 5.6, rank: 6 },
  { sku: '户外充气床垫', category: '户外运动', sales: 62.4, margin: 22.0, roi: 1.6, rank: 7 },
  { sku: '智能除蚨仪', category: '个护化妆', sales: 56.8, margin: 44.2, roi: 3.8, rank: 8 },
];

const SKU_PROFIT_MATRIX = [
  { name: '纳米蒸烤锅', margin: 46.2, share: 18.6 },
  { name: '洗地机', margin: 42.0, share: 14.8 },
  { name: '智能水杯', margin: 38.5, share: 13.2 },
  { name: '智能门锁', margin: 35.2, share: 10.8 },
  { name: '充电站', margin: 32.8, share: 9.6 },
  { name: '颈部按摩仪', margin: 48.6, share: 7.8 },
  { name: '充气床垫', margin: 22.0, share: 6.2 },
  { name: '除蚨仪', margin: 44.2, share: 5.6 },
];

// ============================================================
// Inline Data — Tab 6: 供应链采购分析
// ============================================================

const PROCUREMENT_STATS = [
  { label: '本月采购金额', value: '¥682.4万', sub: '环比 +6.2%' },
  { label: '采购订单履约率', value: '94.2%', sub: '环比 +1.8pp' },
  { label: '供应商交期准时率', value: '88.6%', sub: '环比 -2.4pp' },
  { label: '采购成本节约', value: '¥28.4万', sub: '达成率 86%' },
];

const SUPPLIER_PERFORMANCE = [
  { supplier: '华东智能制造', orders: 48, onTime: 94.2, quality: 98.6, score: 96.4 },
  { supplier: '珠海家电生态', orders: 36, onTime: 91.4, quality: 97.2, score: 94.3 },
  { supplier: '深圳新材料科技', orders: 28, onTime: 86.8, quality: 95.4, score: 91.1 },
  { supplier: '义乌小商品城', orders: 52, onTime: 82.4, quality: 93.8, score: 88.1 },
];

const PROCUREMENT_TREND = [
  { month: '1月', amount: 586, planned: 600 },
  { month: '2月', amount: 524, planned: 540 },
  { month: '3月', amount: 612, planned: 620 },
  { month: '4月', amount: 648, planned: 660 },
  { month: '5月', amount: 662, planned: 670 },
  { month: '6月', amount: 682, planned: 690 },
];

// ============================================================
// Inline Data — Tab 7: 库存健康分析
// ============================================================

const INVENTORY_STATS = [
  { label: '库存总额', value: '¥2,150.4万', sub: '环比 -4.2%' },
  { label: '周转天数', value: '28天', sub: '目标 ≤ 30天' },
  { label: '滞销占比', value: '12.4%', sub: '环比 -1.8pp' },
  { label: '缺货率', value: '3.2%', sub: '环比 -0.6pp' },
];

const INVENTORY_STRUCTURE = [
  { category: '厨房小电器', value: 628, turnover: 28 },
  { category: '家居百货', value: 824, turnover: 22 },
  { category: '个护化妆', value: 386, turnover: 35 },
  { category: '户外运动', value: 312, turnover: 42 },
];

const INVENTORY_ALERTS = [
  { sku: '充气床垫', category: '户外运动', stock: 186, days: 68, status: '高滞销' as const },
  { sku: '纳米蒸烤锅', category: '厨房小电器', stock: 24, days: 4, status: '即将缺货' as const },
  { sku: '智能洗地机', category: '厨房小电器', stock: 42, days: 8, status: '低库存' as const },
  { sku: '防晒霜 SPF50', category: '个护化妆', stock: 320, days: 86, status: '高滞销' as const },
];

// ============================================================
// Helpers
// ============================================================

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
// Main Component
// ============================================================

export function InventoryView() {
  const [tabValue, setTabValue] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            产销管理 · 财务经营视角 — 产销经营总览
          </h1>
          <p className="page-subtitle">
            打通销售、直播投放、SKU利润、采购供应与库存周转，实现从销售到供应链的经营闭环管理。
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Download className="h-4 w-4" />
          导出经营报表
        </Button>
      </div>

      {/* ---- Tabs ---- */}
      {/* shadcn Tabs wrapper (built on @base-ui/react/tabs) */}
      <Tabs
        className="w-full"
        value={tabValue}
        onValueChange={(val) => {
          if (typeof val === 'string') setTabValue(val);
        }}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">产销经营总览</TabsTrigger>
          <TabsTrigger value="channel">渠道销售分析</TabsTrigger>
          <TabsTrigger value="self-live">自播ROI分析</TabsTrigger>
          <TabsTrigger value="affiliate-live">达播ROI分析</TabsTrigger>
          <TabsTrigger value="sku">SKU经营分析</TabsTrigger>
          <TabsTrigger value="procurement">供应链采购分析</TabsTrigger>
          <TabsTrigger value="inventory">库存健康分析</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* Tab 1: 产销经营总览 */}
        {/* ================================================================ */}
        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* ---- Stat Row ---- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MONTHLY_STATS.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* ---- Charts Row ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Sales & Production Trend */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-heading">销售与排产趋势</CardTitle>
                <CardDescription>单位：万元 · 近 8 个月趋势，* 为预估值</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={SALES_PRODUCTION_TREND}>
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
                    />
                    <Legend />
                    <Bar dataKey="sales" name="实际销售" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="production"
                      name="实际排产"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="预估排产"
                      stroke="var(--chart-4)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Pie */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-heading">销售渠道结构</CardTitle>
                <CardDescription>本月各渠道销售占比</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <RPieChart>
                    <Pie
                      data={CHANNEL_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {CHANNEL_DATA.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: 13,
                      }}
                      formatter={(val) => `${val}%`}
                    />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {CHANNEL_DATA.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name} {c.value}%
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---- 经营关注 + 产销协同 Row ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 经营关注 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  经营关注
                </CardTitle>
                <CardDescription>本月需重点关注的经营风险与机会</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {BIZ_ATTENTION.map((item) => {
                  const SevIcon =
                    item.severity === 'danger'
                      ? ShieldAlert
                      : item.severity === 'warning'
                        ? AlertTriangle
                        : Eye;
                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-lg border p-4"
                      style={{ borderColor: severityColor(item.severity), borderLeftWidth: 4 }}
                    >
                      <SevIcon
                        className="h-5 w-5 mt-0.5 shrink-0"
                        style={{ color: severityColor(item.severity) }}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 产销协同达成 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  产销协同达成
                </CardTitle>
                <CardDescription>本月产销协同指标完成情况</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">销售达成率</span>
                    <span className="font-semibold text-foreground">96.2%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: '96.2%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">排产达成率</span>
                    <span className="font-semibold text-foreground">98.8%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: '98.8%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">产销匹配度</span>
                    <span className="font-semibold text-foreground">92.4%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-warning" style={{ width: '92.4%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">交期准时率</span>
                    <span className="font-semibold text-foreground">94.6%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[--chart-1]" style={{ width: '94.6%' }} />
                  </div>
                </div>
                <div className="mt-2 rounded-lg bg-accent p-3 text-center">
                  <p className="text-xs text-accent-foreground font-medium">
                    综合协同得分 <span className="text-lg font-bold">95.5</span> / 100
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">同比 +2.1 分，较上月 +0.8 分</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---- Detailed Table ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                产品类目经营明细
              </CardTitle>
              <CardDescription>四大产品类目本月销售、利润、库存综合数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品类目</TableHead>
                    <TableHead className="text-right">SKU数</TableHead>
                    <TableHead className="text-right">销售额(万)</TableHead>
                    <TableHead className="text-right">成本(万)</TableHead>
                    <TableHead className="text-right">毛利(万)</TableHead>
                    <TableHead className="text-right">毛利率</TableHead>
                    <TableHead className="text-right">库存额(万)</TableHead>
                    <TableHead className="text-right">周转天数</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRODUCT_CATEGORIES.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-right">{row.skuCount}</TableCell>
                      <TableCell className="text-right">{row.sales.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row.cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{row.grossProfit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span style={{ color: row.margin >= 35 ? 'var(--success)' : row.margin >= 28 ? 'var(--warning)' : 'var(--destructive)' }}>
                          {row.margin}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{row.inventory.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            row.turnoverDays <= 30
                              ? 'text-success'
                              : row.turnoverDays <= 40
                                ? 'text-warning'
                                : 'text-destructive'
                          }
                        >
                          {row.turnoverDays}天
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>
                          {row.status === 'healthy'
                            ? '健康'
                            : row.status === 'warning'
                              ? '警戒'
                              : '危险'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 2: 渠道销售分析 */}
        {/* ================================================================ */}
        <TabsContent value="channel" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="全渠道销售额" value="¥1,286.4万" sub="同比 +12.6%" trend="up" icon={Store} />
            <StatCard title="抖音占比" value="28.4%" sub="第一大渠道" trend="up" icon={Radio} />
            <StatCard title="京东客单价" value="¥109.2" sub="各渠道最高" trend="up" icon={DollarSign} />
            <StatCard title="拼多多订单数" value="51,200" sub="各渠道最多" trend="up" icon={ShoppingCart} />
          </div>

          {/* Channel Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">渠道销售趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={CHANNEL_SALES_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="抖音" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="天猫" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="拼多多" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="京东" stackId="1" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">渠道明细</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>渠道</TableHead>
                    <TableHead className="text-right">销售额(万)</TableHead>
                    <TableHead className="text-right">占比</TableHead>
                    <TableHead className="text-right">订单数</TableHead>
                    <TableHead className="text-right">客单价(元)</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead>趋势</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CHANNEL_DETAIL.map((r) => (
                    <TableRow key={r.channel}>
                      <TableCell className="font-medium">{r.channel}</TableCell>
                      <TableCell className="text-right">{r.sales.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{r.share}%</TableCell>
                      <TableCell className="text-right">{r.orders.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.aov}</TableCell>
                      <TableCell className="text-right font-medium">{r.roi}</TableCell>
                      <TableCell>
                        {r.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : r.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        ) : (
                          <span className="text-xs text-muted-foreground">平稳</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 3: 自播ROI分析 */}
        {/* ================================================================ */}
        <TabsContent value="self-live" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SELF_LIVE_STATS.map((s) => (
              <Card key={s.label} size="sm">
                <CardHeader className="pb-1">
                  <CardDescription className="text-xs text-muted-foreground">{s.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-heading text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ROI Trend + Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">自播ROI趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={SELF_LIVE_ROI_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      name="自播ROI"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: 'var(--chart-1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gpm"
                      name="GPM(万)"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">UV 与 转化率</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={SELF_LIVE_ROI_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
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
                      dataKey="uv"
                      name="UV"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      name="转化率(%)"
                      stroke="var(--chart-3)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: 'var(--chart-3)' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 4: 达播ROI分析 */}
        {/* ================================================================ */}
        <TabsContent value="affiliate-live" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AFFILIATE_LIVE_STATS.map((s) => (
              <Card key={s.label} size="sm">
                <CardHeader className="pb-1">
                  <CardDescription className="text-xs text-muted-foreground">{s.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-heading text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">达播ROI趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={AFFILIATE_LIVE_ROI_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="roi" name="ROI" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commission" name="佣金(万)" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">达播GMV趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={AFFILIATE_LIVE_ROI_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
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
                      dataKey="gmv"
                      name="达播GMV(万)"
                      stroke="var(--chart-3)"
                      fill="var(--chart-3)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 5: SKU经营分析 */}
        {/* ================================================================ */}
        <TabsContent value="sku" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="活跃SKU数" value="160" sub="上月 164" trend="down" icon={Package} />
            <StatCard title="平均毛利率" value="38.5%" sub="同比 +1.2pp" trend="up" icon={TrendingUp} />
            <StatCard title="爆品SKU数" value="12" sub="占毛利润 42%" trend="up" icon={Zap} />
            <StatCard title="亏损SKU数" value="64" sub="占总SKU 40%" trend="down" icon={AlertTriangle} />
          </div>

          {/* SKU Profit Scatter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">SKU利润矩阵</CardTitle>
                <CardDescription>毛利率 vs 毛利润占比，气泡大小 = 销售额</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={SKU_PROFIT_MATRIX}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="margin"
                      tick={{ fontSize: 12 }}
                      stroke="var(--muted-foreground)"
                      label={{ value: '毛利率(%)', position: 'bottom', style: { fontSize: 12 } }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="var(--muted-foreground)"
                      label={{ value: '毛利润占比(%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="share" name="毛利润占比" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SKU Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">TOP 8 SKU表现</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">销售(万)</TableHead>
                      <TableHead className="text-right">毛利率</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SKU_PERFORMANCE.map((r) => (
                      <TableRow key={r.sku}>
                        <TableCell className="font-medium text-muted-foreground">{r.rank}</TableCell>
                        <TableCell className="font-medium max-w-32 truncate">{r.sku}</TableCell>
                        <TableCell className="text-right">{r.sales}</TableCell>
                        <TableCell className="text-right">
                          <span style={{ color: r.margin >= 40 ? 'var(--success)' : r.margin >= 30 ? 'var(--warning)' : 'var(--destructive)' }}>
                            {r.margin}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">{r.roi}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 6: 供应链采购分析 */}
        {/* ================================================================ */}
        <TabsContent value="procurement" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PROCUREMENT_STATS.map((s) => (
              <Card key={s.label} size="sm">
                <CardHeader className="pb-1">
                  <CardDescription className="text-xs text-muted-foreground">{s.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-heading text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Procurement Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">采购金额趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={PROCUREMENT_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="实际采购" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      name="计划采购"
                      stroke="var(--chart-4)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Supplier Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">供应商绩效</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>供应商</TableHead>
                      <TableHead className="text-right">订单</TableHead>
                      <TableHead className="text-right">准时率</TableHead>
                      <TableHead className="text-right">评分</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SUPPLIER_PERFORMANCE.map((r) => (
                      <TableRow key={r.supplier}>
                        <TableCell className="font-medium max-w-32 truncate">{r.supplier}</TableCell>
                        <TableCell className="text-right">{r.orders}</TableCell>
                        <TableCell className="text-right">
                          <span style={{ color: r.onTime >= 90 ? 'var(--success)' : r.onTime >= 85 ? 'var(--warning)' : 'var(--destructive)' }}>
                            {r.onTime}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">{r.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tab 7: 库存健康分析 */}
        {/* ================================================================ */}
        <TabsContent value="inventory" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {INVENTORY_STATS.map((s) => (
              <Card key={s.label} size="sm">
                <CardHeader className="pb-1">
                  <CardDescription className="text-xs text-muted-foreground">{s.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-heading text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">库存结构</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={INVENTORY_STRUCTURE} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                      formatter={(val, name) => [
                        name === 'value' ? `¥${val}万` : `${val}天`,
                        name === 'value' ? '库存额' : '周转天数',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="value" name="库存额(万)" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">库存</TableHead>
                      <TableHead className="text-right">可售天数</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INVENTORY_ALERTS.map((r) => (
                      <TableRow key={r.sku}>
                        <TableCell className="font-medium max-w-32 truncate">{r.sku}</TableCell>
                        <TableCell className="text-right">{r.stock}</TableCell>
                        <TableCell className="text-right">
                          <span style={{ color: r.days <= 10 ? 'var(--destructive)' : r.days >= 60 ? 'var(--destructive)' : r.days >= 30 ? 'var(--warning)' : 'var(--success)' }}>
                            {r.days}天
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.status === '高滞销' ? 'destructive' : r.status === '即将缺货' ? 'destructive' : 'secondary'}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
