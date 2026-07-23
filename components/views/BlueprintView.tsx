'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  FileText,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

// ==============================================================================
// Data
// ==============================================================================

const flows = [
  {
    title: '应收催收',
    steps: [
      '1 系统识别逾期',
      '2 专员领取任务',
      '3 联系客户并记录',
      '4 承诺日期提醒',
      '5 回款匹配核销',
      '6 负责人看关闭结果',
    ],
  },
  {
    title: '付款控制',
    steps: [
      '1 员工提交申请',
      '2 财务检查资料',
      '3 预算与重复检查',
      '4 负责人审批',
      '5 出纳执行付款',
      '6 回单与凭证归档',
    ],
  },
  {
    title: '月结协同',
    steps: [
      '1 生成月结清单',
      '2 分配责任人',
      '3 员工完成任务',
      '4 异常自动升级',
      '5 负责人复核',
      '6 锁定并沉淀报表',
    ],
  },
];

const dashboardItems = [
  { label: '1 资金安全', desc: '账户余额、现金流、资金缺口', icon: <Wallet className="h-5 w-5" /> },
  { label: '2 经营结果', desc: '收入、支出、利润及趋势', icon: <TrendingUp className="h-5 w-5" /> },
  { label: '3 债权债务', desc: '应收、逾期、应付、近期付款', icon: <FileText className="h-5 w-5" /> },
  { label: '4 预算费用', desc: '预算执行、费用结构、超预算', icon: <BarChart3 className="h-5 w-5" /> },
  { label: '5 风险异常', desc: '高风险事项、责任人、处理进度', icon: <Shield className="h-5 w-5" /> },
  { label: '6 部门执行', desc: '审批待办、月结进度、数据迟报', icon: <ClipboardCheck className="h-5 w-5" /> },
];

// ==============================================================================
// BlueprintView
// ==============================================================================

export function BlueprintView() {
  const { togglePresentationMode } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      {/* ======== Page Header ======== */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground tracking-wide">
            验收重点 01 · 用户与场景
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1 tracking-tight">
            角色、工作流程与系统承载
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            明确谁在什么场景使用系统，以及看板和工作流如何支持其工作。
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={togglePresentationMode}>
          返回业务原型
        </Button>
      </div>

      <Separator />

      {/* ======== 01 汇报结论 ======== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">01 汇报结论</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本 Demo 服务单家公司财务部门，核心用户为财务负责人、财务专员和出纳；
            负责人通过看板发现和决策，员工通过任务与流程完成执行，
            所有异常最终回到负责人可监督的闭环。
          </p>
        </CardContent>
      </Card>

      {/* ======== 3 Role Cards ======== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 财务负责人 · 管理与决策 */}
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold">
                林
              </span>
              <CardTitle className="text-sm">财务负责人 · 管理与决策</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">
              &ldquo;快速判断财务是否安全、哪些事项需要决策&rdquo;
            </p>
            <p className="font-medium text-foreground">典型工作：</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>查看资金、应收、预算与风险</li>
              <li>审批大额或异常付款</li>
              <li>分派风险并监督处理</li>
              <li>复核会计报表和管理报告</li>
            </ul>
            <p className="font-medium text-foreground mt-1">系统承载页面：</p>
            <p>财务总览 · 风险中心 · 付款审批 · 会计报表</p>
          </CardContent>
        </Card>

        {/* 财务专员 · 核算与协同 */}
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-success text-white text-xs font-bold">
                财
              </span>
              <CardTitle className="text-sm">财务专员 · 核算与协同</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">
              &ldquo;减少手工汇总，让应收与月结有明确闭环&rdquo;
            </p>
            <p className="font-medium text-foreground">典型工作：</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>维护应收与凭证台账</li>
              <li>催收逾期账款并记录结果</li>
              <li>完成对账和数据质量检查</li>
              <li>执行期末结转与月结任务</li>
            </ul>
            <p className="font-medium text-foreground mt-1">系统承载页面：</p>
            <p>应收管理 · 记账凭证 · 月结任务 · 数据导入</p>
          </CardContent>
        </Card>

        {/* 出纳 · 资金与收付 */}
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-warning text-white text-xs font-bold">
                出
              </span>
              <CardTitle className="text-sm">出纳 · 资金与收付</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">
              &ldquo;确保每笔收付款有依据、可追溯并及时对账&rdquo;
            </p>
            <p className="font-medium text-foreground">典型工作：</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>维护银行账户和资金流水</li>
              <li>执行已审批付款并上传回单</li>
              <li>登记客户回款并匹配应收</li>
              <li>处理银行未达账项</li>
            </ul>
            <p className="font-medium text-foreground mt-1">系统承载页面：</p>
            <p>资金管理 · 待付款清单 · 银行流水 · 对账任务</p>
          </CardContent>
        </Card>
      </div>

      {/* ======== 三条核心业务闭环 ======== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">三条核心业务闭环</CardTitle>
          <CardDescription>均已在原型中体现，展开查看步骤</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {flows.map((flow, fi) => (
              <AccordionItem key={fi}>
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  {flow.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1.5 pt-1">
                    {flow.steps.map((step, si) => (
                      <div
                        key={si}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ======== 负责人看板的六个方面 ======== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">负责人看板的六个方面</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboardItems.map((item, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-start gap-3 h-auto py-3 ripple-container"
              >
                <span className="text-primary">{item.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ======== 权限设计原则 ======== */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            权限设计原则
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1.5">
            <p>
              <strong className="text-foreground">负责人：</strong>
              查看全量汇总与明细；审批、分派、复核；不直接修改业务原始数据。
            </p>
            <p>
              <strong className="text-foreground">财务专员：</strong>
              维护职责范围内台账和任务；不能审批自己的付款申请。
            </p>
            <p>
              <strong className="text-foreground">出纳：</strong>
              查看账户及已审批付款；不能修改审批意见和预算。
            </p>
            <p>
              <strong className="text-foreground">共同原则：</strong>
              敏感金额按角色授权，关键修改留操作日志，查看范围遵循最小必要。
            </p>
            <p className="text-xs mt-2">
              Demo 展示角色差异，真实权限需驻场确认。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
