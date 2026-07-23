'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Legend,
  Cell,
  LabelList,
} from 'recharts';

// ============================================================
// Inline data
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

const BANK_ACCOUNTS = [
  {
    name: '基本户·招商银行',
    account: '6225****7812',
    balance: 528.64,
    status: '正常' as const,
  },
  {
    name: '一般户·工商银行',
    account: '6212****3390',
    balance: 274.02,
    status: '正常' as const,
  },
  {
    name: '支付宝企业账户',
    account: 'yd-finance@demo.cn',
    balance: 40.0,
    status: '正常' as const,
  },
];

const FUND_GAP_ITEMS = [
  { date: '07-14', label: '客户回款', amount: 68.0, type: 'inflow' as const },
  { date: '07-15', label: '供应商集中付款', amount: -126.0, type: 'outflow' as const },
  { date: '07-18', label: '预计资金缺口', amount: -42.0, type: 'deficit' as const },
  { date: '07-22', label: '计划回款', amount: 184.0, type: 'inflow' as const },
  { date: '07-28', label: '月度付款', amount: -86.0, type: 'outflow' as const },
  { date: '08-02', label: '大客户回款', amount: 126.0, type: 'inflow' as const },
  { date: '08-08', label: '税费缴纳', amount: -52.0, type: 'outflow' as const },
];

const TODAY_ACTIVITY = [
  { name: '华东优选', amount: 32.0, incoming: true },
  { name: '迅达物流', amount: -18.64, incoming: false },
  { name: '华南贸易', amount: 26.0, incoming: true },
  { name: '天润物业', amount: -8.8, incoming: false },
];

const BUSINESS_FINANCE_ITEMS = [
  { label: '业务回款穿透', value: '86%', desc: '订单到回款的自动化覆盖率' },
  { label: '业务付款穿透', value: '92%', desc: '采购到付款的流程贯通率' },
  { label: '费用管控穿透', value: '78%', desc: '费用预算与实际执行偏差' },
  { label: '利润穿透', value: '91%', desc: '收入与成本匹配的自动化程度' },
];

// ============================================================
// Helpers
// ============================================================

function amountColor(type: 'inflow' | 'outflow' | 'deficit'): string {
  switch (type) {
    case 'inflow':
      return 'text-success';
    case 'outflow':
      return 'text-foreground';
    case 'deficit':
      return 'text-destructive';
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

  // 还原为经营 / 投资 / 筹资的固定顺序
  const order = ['经营', '投资', '筹资'];
  const ordered = order
    .map((k) => payload.find((p) => p.dataKey === k))
    .filter((p): p is CashFlowTooltipPayloadItem => Boolean(p));
  const total = ordered.reduce((sum, p) => sum + p.value, 0);

  const labelMap: Record<string, { color: string; dot: string }> = {
    经营: { color: 'var(--chart-1)', dot: 'bg-[--chart-1]' },
    投资: { color: 'var(--chart-3)', dot: 'bg-[--chart-3]' },
    筹资: { color: 'var(--chart-4)', dot: 'bg-[--chart-4]' },
  };

  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg elevation-3 px-3.5 py-3 min-w-[200px]">
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
    <Card size="sm" className="hover:shadow-md transition-shadow duration-200">
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
              className={`text-xs font-medium inline-flex items-center gap-0.5 ${
                trend === 'up'
                  ? 'text-success'
                  : trend === 'down'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}
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
// CashView
// ============================================================

export function CashView() {
  const { currentRole } = useAppStore();
  const isCashier = currentRole === '出纳';

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
                现金流整体健康，但7月18日存在短期缺口需提前安排。
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard
            title="可用资金"
            value="¥842.66万"
            sub="+3.2%"
            trend="up"
            icon={Wallet}
          />
          <StatCard
            title="7日资金缺口"
            value="¥42.00万"
            sub="7月18日"
            trend="down"
            icon={AlertTriangle}
          />
          <StatCard
            title="本月净流入"
            value="+¥54.36万"
            sub="+18.4%"
            trend="up"
            icon={ArrowUpRight}
          />
          <StatCard
            title="现金周转天数"
            value="24天"
            sub="-2天"
            trend="down"
            icon={Calendar}
          />
          <StatCard
            title="现金收入比"
            value="1.28"
            sub="+0.04"
            trend="up"
            icon={TrendingUp}
          />
        </div>

        {/* ================================================================ */}
        {/* Bank Accounts                                                    */}
        {/* ================================================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground font-heading">
              银行账户
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {BANK_ACCOUNTS.length}个账户
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BANK_ACCOUNTS.map((account) => (
              <Card key={account.account} size="sm" className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {account.name}
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
                        {account.account}
                      </p>
                      <span className="text-lg font-bold text-foreground font-heading">
                        ¥{account.balance.toFixed(2)}万
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
        </div>

        {/* ================================================================ */}
        {/* Charts                                                           */}
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
                近6个月余额变化（单位：万元）
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
                经营 / 投资 / 筹资活动现金流（单位：万元）
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
                    <defs>
                      {/* 经营 — 主色实心 */}
                      <linearGradient
                        id="cashFlow-operating"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.92} />
                      </linearGradient>
                      {/* 投资 — 成功色（绿）实心 */}
                      <linearGradient
                        id="cashFlow-investing"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.92} />
                      </linearGradient>
                      {/* 筹资 — 警告色（橙）实心 */}
                      <linearGradient
                        id="cashFlow-financing"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.92} />
                      </linearGradient>
                    </defs>
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
                      fill="url(#cashFlow-operating)"
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
                      fill="url(#cashFlow-investing)"
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
                          fill: '#FFFFFF',
                        }}
                        formatter={(v: any) => (Number(v) >= 50 ? v : '')}
                      />
                    </Bar>
                    {/* 筹资（顶）—— 仅顶部圆角 */}
                    <Bar
                      dataKey="筹资"
                      stackId="cash"
                      fill="url(#cashFlow-financing)"
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
                          fill: '#FFFFFF',
                        }}
                        formatter={(v: any) => (Number(v) >= 50 ? v : '')}
                      />
                      {/* 月度合计标签 —— 柱顶 */}
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
        {/* Fund Gap Predictions                                             */}
        {/* ================================================================ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              资金缺口预测
            </CardTitle>
            <CardDescription className="text-xs">
              未来30天预计资金流入与流出节点
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Header */}
                <div className="grid grid-cols-[100px_1fr_120px] gap-3 px-2 py-1.5 text-xs text-muted-foreground font-medium border-b pb-2">
                  <span>日期</span>
                  <span>事项</span>
                  <span className="text-right">金额</span>
                </div>
                {/* Items */}
                <div className="divide-y divide-border/50">
                  {FUND_GAP_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[100px_1fr_120px] gap-3 px-2 py-2.5 text-sm items-center hover:bg-muted/40 rounded transition-colors"
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.date}
                      </span>
                      <span className="text-foreground">{item.label}</span>
                      <span
                        className={`text-right font-medium tabular-nums ${amountColor(item.type)}`}
                      >
                        {item.amount > 0 ? '+' : ''}
                        ¥{Math.abs(item.amount).toFixed(2)}万
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* Today's Account Activity                                        */}
        {/* ================================================================ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              今日账户变动
            </CardTitle>
            <CardDescription className="text-xs">
              今日最新流水记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TODAY_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                      item.incoming ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                  >
                    {item.incoming ? (
                      <Download className="h-3.5 w-3.5 text-success rotate-180" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        item.incoming ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {item.incoming ? '+' : '-'}¥{Math.abs(item.amount).toFixed(2)}万
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
