'use client';

import { useAppStore } from '@/lib/store';
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
  ProgressLabel,
  ProgressValue,
} from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: '12张',
      label: '待复核凭证',
      sub: 'AI 已预填',
      extra: '原始凭证与分录',
    },
    {
      icon: <Clock className="h-5 w-5 text-warning" />,
      value: '5项',
      label: '待审批事项',
      sub: '2项今天到期',
      extra: '付款与期末结转',
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-danger" />,
      value: '6项',
      label: '待处理风险',
      sub: '3项高优先级',
      extra: '资金、账税与经营',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      value: '98.6%',
      label: '账税一致率',
      sub: (
        <span className="text-success font-medium">+1.2%</span>
      ),
      extra: '本期核算质量',
    },
  ];

  const todoItems = [
    {
      priority: '高' as const,
      title: '复核 12 张待审核凭证及 AI 分录建议',
      module: '原始凭证 / 凭证填制',
      deadline: '今日 11:30',
    },
    {
      priority: '高' as const,
      title: '审批迅达物流 ¥28.64 万付款申请',
      module: '资金收付 · 已完成合规校验',
      deadline: '今日 14:00',
    },
    {
      priority: '中' as const,
      title: '复核 3 项平台结算与银行对账差异',
      module: '平台结算 / 银行对账',
      deadline: '今日 16:00',
    },
    {
      priority: '中' as const,
      title: '复核本期会计报表口径与关键勾稽关系',
      module: '会计报表',
      deadline: '今日 18:00',
    },
  ];

  const aiDomains = [
    {
      title: '智能采集与原始凭证',
      description: '4 份平台结算单已识别，12 张凭证等待复核',
    },
    {
      title: '资金收付与银行对账',
      description: '5 笔未匹配流水，3 项调节事项待确认',
    },
    {
      title: '凭证、账簿与报表',
      description: '账税一致率 98.6%，重点关注报表勾稽与列报口径',
    },
    {
      title: '风险、税务与经营分析',
      description: '6 项 AI 诊断需要负责人决策与闭环',
    },
  ];

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
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
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
              <Clock className="h-4 w-4 text-warning" />
              待办事项
            </CardTitle>
            <CardDescription>需要复核、审批和决策的事项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoItems.map((item, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-start gap-3">
                  <Badge
                    variant={item.priority === '高' ? 'destructive' : 'secondary'}
                    className="mt-0.5 shrink-0 text-[11px]"
                  >
                    {item.priority}
                  </Badge>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{item.module}</span>
                      <span className="text-border">·</span>
                      <Clock className="h-3 w-3" />
                      <span>{item.deadline}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            ))}
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
            {aiDomains.map((domain, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">账</span>
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// 财务专员 Workbench
// ============================================================

function SpecialistWorkbench() {
  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: '12张',
      label: '待审核原始凭证',
      sub: 'AI已完成识别与归类',
    },
    {
      icon: <FileText className="h-5 w-5 text-warning" />,
      value: '8张',
      label: '待填制凭证',
      sub: '待确认会计科目与税率',
    },
    {
      icon: <Wallet className="h-5 w-5 text-primary" />,
      value: '3份',
      label: '平台账单待对账',
      sub: '佣金、退款与运费险待核',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      value: '2/5',
      label: '期末结转任务',
      sub: '待提交负责人复核',
    },
  ];

  const tasks = [
    { label: '应收催收', done: 4, total: 6, color: 'var(--primary)' },
    { label: '付款复核', done: 3, total: 4, color: 'var(--success)' },
    { label: '月结任务', done: 2, total: 5, color: 'var(--warning)' },
    { label: '数据修正', done: 1, total: 3, color: 'var(--danger)' },
  ];

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
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task progress section */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            任务进度
          </CardTitle>
          <CardDescription>当前分配给我的各项任务完成情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task, i) => {
            const pct = Math.round((task.done / task.total) * 100);
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// 出纳 (Cashier) Workbench
// ============================================================

function CashierWorkbench() {
  const statCards = [
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      value: '2份',
      label: '待导入银行流水',
      sub: '中国银行法人账户',
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      value: '5笔',
      label: '未匹配银行流水',
      sub: '待手工关联业务单据',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      value: '2/3',
      label: '银行对账进度',
      sub: '法人账户对账中',
    },
  ];

  const todoItems = [
    {
      title: '导入中国银行法人账户银行流水',
      module: '银行流水导入',
      deadline: '今日',
    },
    {
      title: '处理 5 笔已审批付款并完成银行付款',
      module: '资金收付',
      deadline: '今日 15:00',
    },
    {
      title: '登记迅达物流等 4 家客户回款',
      module: '回款登记',
      deadline: '今日 17:00',
    },
    {
      title: '完成本月银行对账调节表',
      module: '银行对账',
      deadline: '本周',
    },
  ];

  const paymentSummary = {
    income: { amount: '¥128,500.00', count: 4 },
    expense: { amount: '¥357,200.00', count: 5 },
  };

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
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
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
              <Clock className="h-4 w-4 text-warning" />
              待办事项
            </CardTitle>
            <CardDescription>当前需要处理的资金相关任务</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoItems.map((item, i) => (
              <div key={i}>
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
                      <span>{item.module}</span>
                      <span className="text-border">·</span>
                      <Clock className="h-3 w-3" />
                      <span>{item.deadline}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            ))}
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
                  {paymentSummary.income.count} 笔
                </p>
              </div>
              <p className="text-lg font-bold text-success font-heading tabular-nums">
                {paymentSummary.income.amount}
              </p>
            </div>

            <Separator />

            {/* Expense */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">今日支出</p>
                <p className="text-xs text-muted-foreground">
                  {paymentSummary.expense.count} 笔
                </p>
              </div>
              <p className="text-lg font-bold text-danger font-heading tabular-nums">
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
                <Badge variant="outline" className="text-[11px]">
                  中国银行
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground">
                法人账户 · 6222 **** **** 3829
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>账户余额</span>
                <span className="font-medium text-foreground tabular-nums">
                  ¥2,847,350.62
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
