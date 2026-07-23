'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, Database, Workflow } from 'lucide-react';

const dictData = [
  { module: '财务总览', indicator: '可用资金、本月收支、利润、风险数', fields: '公司、日期、账户余额、收入、成本、费用、风险等级', source: '财务日报、银行流水、应收应付表', person: '财务负责人', freq: '每日 10:00', method: '系统汇总' },
  { module: '资金管理', indicator: '账户余额、净现金流、7/30天资金缺口', fields: '账户、交易日期、摘要、收支方向、金额、余额、计划日期', source: '银行流水、资金计划表', person: '出纳', freq: '每日 / 流水准实时', method: 'WorkBuddy上传' },
  { module: '应收管理', indicator: '应收余额、逾期金额、账龄、回款率', fields: '客户、单据号、应收日、到期日、应收额、已收额、责任人', source: '销售/ERP、应收台账、回款流水', person: '应收会计', freq: '每日', method: '接口或模板' },
  { module: '应付付款', indicator: '应付余额、近7日应付、待审批、大额异常', fields: '供应商、合同、发票、申请人、金额、预算项、状态、支付日', source: '采购/ERP、OA审批、付款计划', person: '应付会计', freq: '提交时 / 每日', method: '流程同步' },
  { module: '预算执行', indicator: '预算执行率、剩余预算、费用环比、超预算', fields: '部门、项目、预算科目、年度预算、已用、占用、申请金额', source: '预算表、费用报销、付款申请', person: '预算负责人', freq: '每周 / 申请时', method: '模板+流程' },
  { module: '库存管理', indicator: '存货总额、周转天数、AI预警、库存状态分布', fields: '存货名称、分类、数量、金额、周转天数、库存状态、预警等级', source: 'ERP/WMS、采购入库、生产领料', person: '仓储负责人', freq: '每日 / 实时', method: '系统同步' },
  { module: '月结任务', indicator: '完成率、逾期任务、平均耗时、异常数', fields: '期间、任务、负责人、截止时间、状态、附件、复核人', source: '月结任务清单', person: '任务负责人', freq: '状态变化时', method: '系统录入' },
  { module: '风险异常', indicator: '待处理、高风险、本周关闭、处理时长', fields: '规则、对象、触发值、阈值、责任人、状态、处理记录', source: '各模块计算结果', person: '系统+负责人', freq: '数据更新时', method: '规则自动生成' },
];

export function DataView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">验收重点 02 · 数据需求</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">指标、字段、来源与更新责任</h1>
          <p className="text-sm text-muted-foreground mt-1">
            从页面指标反推数据字段和归集机制，形成后续接入的数据台账。
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" /> 导出数据需求清单
        </Button>
      </div>

      <Separator />

      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-base">02 汇报结论</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Demo数据采用模拟数据，但每个指标都应能追溯到字段、来源系统、数据责任人与更新时间。真实项目先建立数据台账和标准模板，再根据接口条件逐步从人工上传切换为自动同步。
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Tabs defaultValue="全部模块">
          <TabsList>
            {['全部模块', '财务总览', '资金管理', '应收管理', '应付付款', '预算执行', '库存管理', '月结任务', '风险异常'].map(t => (
              <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">数据字典 V0.1</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>模块</TableHead>
                <TableHead>核心指标</TableHead>
                <TableHead>关键字段（示意）</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>责任人</TableHead>
                <TableHead>频率</TableHead>
                <TableHead>归集方式</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dictData.map((row, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-medium">{row.module}</TableCell>
                  <TableCell>{row.indicator}</TableCell>
                  <TableCell>{row.fields}</TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.person}</TableCell>
                  <TableCell>{row.freq}</TableCell>
                  <TableCell>{row.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* WorkBuddy section */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" /> 通过 WorkBuddy 向财务系统传递数据
          </CardTitle>
          <CardDescription>Demo展示通用可落地方案；接口能力、身份认证和触发方式需驻场确认</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">方案接口预留（5 步）：</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>1 系统发布数据任务 → 2 员工在 WorkBuddy 提交 → 3 调用系统接收接口 → 4 暂存与规则校验 → 5 入库并反馈结果</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium text-foreground">接收数据至少携带：</p>
            <p>company_id 公司主体 | period 数据期间 | data_type 数据类型 | submitter_id 提交员工 | file_url / records 文件或数据 | submitted_at 提交时间</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
