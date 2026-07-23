'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, HelpCircle, Printer, ArrowRight } from 'lucide-react';

const covered = [
  '财务负责人管理看板', '资金、应收、应付、预算概览',
  '催收、付款、月结和异常处理流程', '三类财务角色及基础权限思路',
  '模拟数据和数据导入入口', '未来向老板驾驶舱输出汇总接口',
];

const notCovered = [
  '凭证、科目、总账和法定报表核算', '真实网银支付和银企直连',
  '税务申报、电子发票验真', '真实ERP/OA/WorkBuddy接口',
  '完整预算编制和成本核算', '多公司合并报表与抵销',
];

const mustConfirm = [
  '实际岗位、权限和职责分工', '真实审批节点、金额阈值和例外',
  '指标定义及财务统计口径', '现有报表、字段质量和责任人',
  '系统接口、部署和安全边界', '预警阈值及异常升级机制',
];

const fiveSteps = ['01 看组织', '02 跟流程', '03 收单据', '04 定口径', '05 回放验证'];
const fiveStepDesc = [
  '确认岗位、职责、审批权和协作对象',
  '选择一笔真实业务，从发生到入账完整走查',
  '收集表格、报表、合同、申请单和系统截图',
  '逐项确认指标公式、字段、责任人与更新时间',
  '用真实案例在原型中演示，确认异常和例外',
];

export function BoundaryView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">验收重点 03 · 系统边界</div>
          <h1 className="page-title mt-1">Demo边界与驻场业务分析</h1>
          <p className="page-subtitle">
            明确当前版本解决什么、暂不解决什么，以及真实落地时如何把未知问题逐步明晰。
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Printer className="h-4 w-4" /> 打印驻场提问清单
        </Button>
      </div>

      <Separator />

      {/* Conclusion */}
      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-base">03 汇报结论</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            当前版本验证信息架构、角色协同、关键流程和数据接口思路，不承担法定会计核算。真实落地需要驻场确认岗位职责、业务口径、现有单据、系统接口、权限和异常规则，再把原型配置成企业实际流程。
          </p>
        </CardContent>
      </Card>

      {/* Three-column boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="elevation-1 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" /> 本 Demo 已覆盖
            </CardTitle>
            <CardDescription>用于验证方向和交互</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {covered.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="elevation-1 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" /> 明确不在当前范围
            </CardTitle>
            <CardDescription>不以Demo代替专业财务软件</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {notCovered.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="elevation-1 border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <HelpCircle className="h-4 w-4" /> 必须驻场确认
            </CardTitle>
            <CardDescription>决定系统最终如何配置</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {mustConfirm.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-warning mt-0.5 flex-shrink-0">?</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Five-step method */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">驻场业务分析五步法</CardTitle>
          <CardDescription>不是直接问"想要什么功能"，而是从真实工作还原系统</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-wrap gap-2">
            {fiveSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-accent rounded-lg p-2 min-w-[100px] text-center">
                  <div className="text-sm font-medium">{step}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{fiveStepDesc[i]}</div>
                </div>
                {i < fiveSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview questions */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">驻场提问清单</CardTitle>
          <CardDescription>按主题展开，访谈时记录"现状—问题—规则—证据"</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {[
              {
                title: '1. 组织与职责',
                items: ['财务部门实际有哪些岗位，每个岗位负责哪些账套和业务？', '负责人每天、每周、每月分别看什么报表？', '谁有权审批付款、调整预算和关闭异常？'],
              },
              {
                title: '2. 流程与单据',
                items: ['付款申请从谁发起，经过哪些节点，什么金额需要升级审批？', '应收逾期后由财务还是业务催收，如何记录承诺回款？', '月结有哪些固定任务、截止时间、前后依赖和复核要求？'],
              },
              {
                title: '3. 指标与口径',
                items: ['可用资金是否排除受限账户和保证金？', '收入、费用和利润按开票、收付还是权责发生制统计？', '应收账龄以开票日、确认收入日还是合同到期日计算？'],
              },
              {
                title: '4. 系统与数据',
                items: ['当前使用哪些财务、ERP、OA、银行和表格系统？', '每张现有报表由谁生成、何时生成、字段是否稳定？', '系统有无API；WorkBuddy能否发起任务、上传文件和调用Webhook？'],
              },
              {
                title: '5. 权限与安全',
                items: ['哪些账户、工资、客户和员工数据属于敏感数据？', '是否需要内网或本地部署，数据允许保存在哪里？', '操作日志、附件和财务数据需要保留多久？'],
              },
            ].map((section, i) => (
              <AccordionItem key={i} value={`item-${i + 1}`}>
                <AccordionTrigger className="text-sm font-medium">{section.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {section.items.map((q, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="text-primary">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">每次访谈应形成的证据</CardTitle>
          <CardDescription>避免只记录口头愿望</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {['流程图', '单据样本', '指标卡片', '问题清单', '确认记录'].map((item, i) => (
              <div key={i} className="border rounded-lg p-2 text-center text-muted-foreground">
                <div className="font-medium text-foreground mb-0.5">{i + 1}. {item}</div>
                <span className="text-[10px]">
                  {['参与角色、节点、输入输出', '脱敏Excel、表单、截图', '定义、公式、字段、频率', '耗时、错误、重复、风险', '待定问题、责任人、日期'][i]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
