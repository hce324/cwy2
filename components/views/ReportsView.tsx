'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { FileText, CheckCircle2, Download, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsView() {
  const [activeReport, setActiveReport] = useState('bs');

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">FINANCIAL STATEMENTS</div>
          <h1 className="page-title mt-1">报表管理</h1>
          <p className="page-subtitle">
            依据科目余额和报表公式生成财务报表与管理报表。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast('报表勾稽检查通过')}>
            <CheckCircle2 className="h-4 w-4" /> 报表勾稽检查
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> 导出检查报表
          </Button>
        </div>
      </div>

      <Separator />

      {/* ========== Period Tabs ========== */}
      <Tabs defaultValue="月度报表">
        <TabsList>
          <TabsTrigger value="月度报表" className="text-xs">月度报表</TabsTrigger>
          <TabsTrigger value="季度报表" className="text-xs">季度报表</TabsTrigger>
          <TabsTrigger value="年度报表" className="text-xs">年度报表</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ========== Report Type Buttons ========== */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">财务报表</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bs', name: '资产负债表' },
              { id: 'pl', name: '利润表' },
              { id: 'cf', name: '现金流量表' },
              { id: 'oe', name: '所有者权益变动表' },
            ].map(r => (
              <Button
                key={r.id}
                variant={activeReport === r.id ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-sm"
                onClick={() => setActiveReport(r.id)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">管理报表</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'dept', name: '部门损益表' },
              { id: 'prod', name: '产品线利润表' },
              { id: 'expense', name: '费用明细表' },
              { id: 'budget', name: '预算执行表' },
            ].map(r => (
              <Button
                key={r.id}
                variant={activeReport === r.id ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-sm"
                onClick={() => setActiveReport(r.id)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== Balance Check Banner ========== */}
      <div className="flex items-center gap-2 bg-success/10 rounded-lg p-2 text-xs text-success">
        <CheckCircle2 className="h-4 w-4" />
        <span>资产合计=负债及所有者权益总计校验通过 √</span>
      </div>

      {/* ========== Reports Accordion ========== */}
      <>
        {/* ---------- 资产负债表 ---------- */}
        {activeReport === 'bs' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">辅助单位：上海星芒　ZQ0　　企业1表　单位：元</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 资产 */}
                  <div>
                    <h5 className="text-sm font-semibold mb-2">资产</h5>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px]">
                          <TableHead className="w-8">序号</TableHead>
                          <TableHead>资产</TableHead>
                          <TableHead className="text-right">年初数</TableHead>
                          <TableHead className="text-right">年末数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>1</TableCell>
                          <TableCell>流动资产：</TableCell>
                          <TableCell className="text-right font-mono" />
                          <TableCell className="text-right font-mono" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>2</TableCell>
                          <TableCell>货币资金</TableCell>
                          <TableCell className="text-right font-mono">1,854,320.10</TableCell>
                          <TableCell className="text-right font-mono">2,397,212.53</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>3</TableCell>
                          <TableCell>短期投资</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>4</TableCell>
                          <TableCell>应收票据</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>5</TableCell>
                          <TableCell>应收账款</TableCell>
                          <TableCell className="text-right font-mono">986,240.00</TableCell>
                          <TableCell className="text-right font-mono">1,286,400.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>6</TableCell>
                          <TableCell>应收股利</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>7</TableCell>
                          <TableCell>其他应收款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>8</TableCell>
                          <TableCell>预付账款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>9</TableCell>
                          <TableCell>存货</TableCell>
                          <TableCell className="text-right font-mono">1,200,350.00</TableCell>
                          <TableCell className="text-right font-mono">1,432,800.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>10</TableCell>
                          <TableCell>待摊费用</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/30">
                          <TableCell />
                          <TableCell>流动资产合计</TableCell>
                          <TableCell className="text-right font-mono">4,040,910.10</TableCell>
                          <TableCell className="text-right font-mono">5,116,412.53</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>11</TableCell>
                          <TableCell>非流动资产：</TableCell>
                          <TableCell className="text-right font-mono" />
                          <TableCell className="text-right font-mono" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>12</TableCell>
                          <TableCell>长期投资</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>13</TableCell>
                          <TableCell>固定资产原值</TableCell>
                          <TableCell className="text-right font-mono">980,000.00</TableCell>
                          <TableCell className="text-right font-mono">1,120,000.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>14</TableCell>
                          <TableCell>减：累计折旧</TableCell>
                          <TableCell className="text-right font-mono">320,000.00</TableCell>
                          <TableCell className="text-right font-mono">460,000.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>15</TableCell>
                          <TableCell>无形资产</TableCell>
                          <TableCell className="text-right font-mono">120,000.00</TableCell>
                          <TableCell className="text-right font-mono">96,000.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/30">
                          <TableCell />
                          <TableCell>非流动资产合计</TableCell>
                          <TableCell className="text-right font-mono">780,000.00</TableCell>
                          <TableCell className="text-right font-mono">756,000.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-bold bg-muted/40">
                          <TableCell />
                          <TableCell>资产总计</TableCell>
                          <TableCell className="text-right font-mono">4,820,910.10</TableCell>
                          <TableCell className="text-right font-mono">5,872,412.53</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 负债及所有者权益 */}
                  <div>
                    <h5 className="text-sm font-semibold mb-2">负债及所有者权益</h5>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px]">
                          <TableHead className="w-8">序号</TableHead>
                          <TableHead>负债及所有者权益</TableHead>
                          <TableHead className="text-right">年初数</TableHead>
                          <TableHead className="text-right">年末数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>1</TableCell>
                          <TableCell>流动负债：</TableCell>
                          <TableCell className="text-right font-mono" />
                          <TableCell className="text-right font-mono" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>2</TableCell>
                          <TableCell>短期借款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>3</TableCell>
                          <TableCell>应付票据</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>4</TableCell>
                          <TableCell>应付账款</TableCell>
                          <TableCell className="text-right font-mono">1,520,000.00</TableCell>
                          <TableCell className="text-right font-mono">1,845,600.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>5</TableCell>
                          <TableCell>预收账款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>6</TableCell>
                          <TableCell>应付工资</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>7</TableCell>
                          <TableCell>应交税金</TableCell>
                          <TableCell className="text-right font-mono">326,280.00</TableCell>
                          <TableCell className="text-right font-mono">428,360.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>8</TableCell>
                          <TableCell>其他应交款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>9</TableCell>
                          <TableCell>其他应付款</TableCell>
                          <TableCell className="text-right font-mono">48,600.00</TableCell>
                          <TableCell className="text-right font-mono">62,400.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/30">
                          <TableCell />
                          <TableCell>流动负债合计</TableCell>
                          <TableCell className="text-right font-mono">1,894,880.00</TableCell>
                          <TableCell className="text-right font-mono">2,336,360.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>10</TableCell>
                          <TableCell>长期负债：</TableCell>
                          <TableCell className="text-right font-mono" />
                          <TableCell className="text-right font-mono" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>11</TableCell>
                          <TableCell>长期借款</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                          <TableCell className="text-right font-mono">0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/30">
                          <TableCell />
                          <TableCell>负债合计</TableCell>
                          <TableCell className="text-right font-mono">1,894,880.00</TableCell>
                          <TableCell className="text-right font-mono">2,336,360.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>12</TableCell>
                          <TableCell>所有者权益：</TableCell>
                          <TableCell className="text-right font-mono" />
                          <TableCell className="text-right font-mono" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>13</TableCell>
                          <TableCell>实收资本</TableCell>
                          <TableCell className="text-right font-mono">2,000,000.00</TableCell>
                          <TableCell className="text-right font-mono">2,000,000.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>14</TableCell>
                          <TableCell>未分配利润</TableCell>
                          <TableCell className="text-right font-mono">926,030.10</TableCell>
                          <TableCell className="text-right font-mono">1,536,052.53</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/30">
                          <TableCell />
                          <TableCell>所有者权益合计</TableCell>
                          <TableCell className="text-right font-mono">2,926,030.10</TableCell>
                          <TableCell className="text-right font-mono">3,536,052.53</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-bold bg-muted/40">
                          <TableCell />
                          <TableCell>负债及所有者权益总计</TableCell>
                          <TableCell className="text-right font-mono">4,820,910.10</TableCell>
                          <TableCell className="text-right font-mono">5,872,412.53</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-3">企业负责人：林主管 ｜ 财务负责人：周会计 ｜ 制表人：陈会计</div>
              </CardContent>
            </Card>
        )}

        {/* ---------- 利润表 ---------- */}
        {activeReport === 'pl' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务有限公司　会企02表</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>项目</TableHead>
                      <TableHead className="text-right">本期金额</TableHead>
                      <TableHead className="text-right">上期金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>一、营业收入</TableCell>
                      <TableCell className="text-right font-mono">¥1,268.04万</TableCell>
                      <TableCell className="text-right font-mono">¥1,168.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：营业成本</TableCell>
                      <TableCell className="text-right font-mono">¥761.00万</TableCell>
                      <TableCell className="text-right font-mono">¥698.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：营业税金及附加</TableCell>
                      <TableCell className="text-right font-mono">¥18.20万</TableCell>
                      <TableCell className="text-right font-mono">¥16.80万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：销售费用</TableCell>
                      <TableCell className="text-right font-mono">¥146.40万</TableCell>
                      <TableCell className="text-right font-mono">¥168.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：管理费用</TableCell>
                      <TableCell className="text-right font-mono">¥89.76万</TableCell>
                      <TableCell className="text-right font-mono">¥93.96万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>二、营业利润</TableCell>
                      <TableCell className="text-right font-mono">¥252.68万</TableCell>
                      <TableCell className="text-right font-mono">¥191.24万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>加：营业外收入</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：营业外支出</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>三、利润总额</TableCell>
                      <TableCell className="text-right font-mono">¥252.68万</TableCell>
                      <TableCell className="text-right font-mono">¥191.24万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>减：所得税费用</TableCell>
                      <TableCell className="text-right font-mono">¥38.00万</TableCell>
                      <TableCell className="text-right font-mono">¥30.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-bold bg-muted/40">
                      <TableCell>四、净利润</TableCell>
                      <TableCell className="text-right font-mono">¥214.68万</TableCell>
                      <TableCell className="text-right font-mono">¥161.24万</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="text-[11px] text-muted-foreground mt-3">企业负责人：林王萱</div>
              </CardContent>
            </Card>
        )}

        {/* ---------- 现金流量表 ---------- */}
        {activeReport === 'cf' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务　会企03表</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>项目</TableHead>
                      <TableHead className="text-right">本期金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>一、经营活动产生的现金流量：</TableCell>
                      <TableCell className="text-right" />
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">销售商品、提供劳务收到的现金</TableCell>
                      <TableCell className="text-right font-mono">¥1,186.40万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">收到的税费返还</TableCell>
                      <TableCell className="text-right font-mono">¥12.60万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold">
                      <TableCell className="pl-4">经营活动现金流入小计</TableCell>
                      <TableCell className="text-right font-mono">¥1,199.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">购买商品、接受劳务支付的现金</TableCell>
                      <TableCell className="text-right font-mono">¥896.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">支付给职工以及为职工支付的现金</TableCell>
                      <TableCell className="text-right font-mono">¥148.36万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">支付的各项税费</TableCell>
                      <TableCell className="text-right font-mono">¥56.20万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">支付的其他与经营活动有关的现金</TableCell>
                      <TableCell className="text-right font-mono">¥44.08万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>经营活动产生的现金流量净额</TableCell>
                      <TableCell className="text-right font-mono">¥54.36万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20 mt-2">
                      <TableCell>二、投资活动产生的现金流量：</TableCell>
                      <TableCell className="text-right" />
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">购建固定资产、无形资产支付的现金</TableCell>
                      <TableCell className="text-right font-mono">¥140.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>投资活动产生的现金流量净额</TableCell>
                      <TableCell className="text-right font-mono">-¥140.00万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>三、筹资活动产生的现金流量：</TableCell>
                      <TableCell className="text-right" />
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">取得借款收到的现金</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>筹资活动产生的现金流量净额</TableCell>
                      <TableCell className="text-right font-mono">¥0.00</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>四、汇率变动对现金的影响</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>五、现金及现金等价物净增加额</TableCell>
                      <TableCell className="text-right font-mono">-¥85.64万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>加：期初现金及现金等价物余额</TableCell>
                      <TableCell className="text-right font-mono">¥928.30万</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-bold bg-muted/40">
                      <TableCell>六、期末现金及现金等价物余额</TableCell>
                      <TableCell className="text-right font-mono">¥842.66万</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        )}

        {/* ---------- 所有者权益变动表 ---------- */}
        {activeReport === 'oe' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务有限公司　2026年7月</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>项目</TableHead>
                      <TableHead className="text-right">实收资本</TableHead>
                      <TableHead className="text-right">资本公积</TableHead>
                      <TableHead className="text-right">盈余公积</TableHead>
                      <TableHead className="text-right">未分配利润</TableHead>
                      <TableHead className="text-right">合计</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>一、上年年末余额</TableCell>
                      <TableCell className="text-right font-mono">2,000,000.00</TableCell>
                      <TableCell className="text-right font-mono">0.00</TableCell>
                      <TableCell className="text-right font-mono">186,430.00</TableCell>
                      <TableCell className="text-right font-mono">926,030.10</TableCell>
                      <TableCell className="text-right font-mono">3,112,460.10</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>加：会计政策变更</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-semibold bg-muted/20">
                      <TableCell>二、本年年初余额</TableCell>
                      <TableCell className="text-right font-mono">2,000,000.00</TableCell>
                      <TableCell className="text-right font-mono">0.00</TableCell>
                      <TableCell className="text-right font-mono">186,430.00</TableCell>
                      <TableCell className="text-right font-mono">926,030.10</TableCell>
                      <TableCell className="text-right font-mono">3,112,460.10</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell>三、本期增减变动金额</TableCell>
                      <TableCell className="text-right font-mono" />
                      <TableCell className="text-right font-mono" />
                      <TableCell className="text-right font-mono" />
                      <TableCell className="text-right font-mono" />
                      <TableCell className="text-right font-mono" />
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">（一）净利润</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">610,022.43</TableCell>
                      <TableCell className="text-right font-mono">610,022.43</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">（二）利润分配</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-4">（三）所有者投入资本</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow className="text-xs font-bold bg-muted/40">
                      <TableCell>四、本期期末余额</TableCell>
                      <TableCell className="text-right font-mono">2,000,000.00</TableCell>
                      <TableCell className="text-right font-mono">0.00</TableCell>
                      <TableCell className="text-right font-mono">186,430.00</TableCell>
                      <TableCell className="text-right font-mono">1,536,052.53</TableCell>
                      <TableCell className="text-right font-mono">3,722,482.53</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        )}

        {/* ---------- 部门损益表 ---------- */}
        {activeReport === 'dept' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">2026年7月　管理报表口径</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>部门</TableHead>
                      <TableHead className="text-right">营业收入</TableHead>
                      <TableHead className="text-right">边际贡献</TableHead>
                      <TableHead className="text-right">部门利润</TableHead>
                      <TableHead className="text-right">利润率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ['直播运营部', '¥486.20万', '¥186.00万', '¥124.00万', '25.5%'],
                      ['达人分销部', '¥420.00万', '¥162.00万', '¥86.00万', '20.5%'],
                      ['平台店铺部', '¥300.04万', '¥112.00万', '¥48.00万', '16.0%'],
                      ['供应链部', '—', '—', '¥18.00万', '—'],
                      ['职能管理部（费用中心）', '—', '—', '-¥61.32万', '—'],
                      ['合计', '¥1,268.04万', '¥460.00万', '¥214.68万', '16.9%'],
                    ].map((row, i) => (
                      <TableRow key={i} className={`text-xs ${i === 5 ? 'font-semibold bg-muted/20' : ''}`}>
                        <TableCell>{row[0]}</TableCell>
                        <TableCell className="text-right font-mono">{row[1]}</TableCell>
                        <TableCell className="text-right font-mono">{row[2]}</TableCell>
                        <TableCell className="text-right font-mono">{row[3]}</TableCell>
                        <TableCell className="text-right">{row[4]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 经营解读：各部门收入合计与营业收入一致；直播运营部与达人分销部贡献主要利润，职能管理部为费用中心。</span>
                </div>
              </CardContent>
            </Card>
        )}

        {/* ---------- 产品线利润表 ---------- */}
        {activeReport === 'prod' && (
          <Card className="elevation-1 mt-2">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>产品线</TableHead>
                      <TableHead className="text-right">收入</TableHead>
                      <TableHead className="text-right">成本</TableHead>
                      <TableHead className="text-right">毛利</TableHead>
                      <TableHead className="text-right">毛利率</TableHead>
                      <TableHead className="text-right w-12">趋势</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: '蓝牙耳机', revenue: '¥486.20万', cost: '¥316.03万', profit: '¥170.17万', margin: '35.0%', trend: 'up' },
                      { name: '智能手环', revenue: '¥248.00万', cost: '¥161.20万', profit: '¥86.80万', margin: '35.0%', trend: 'up' },
                      { name: '充电配件', revenue: '¥218.60万', cost: '¥142.09万', profit: '¥76.51万', margin: '35.0%', trend: 'down' },
                      { name: '家居小电', revenue: '¥315.24万', cost: '¥228.55万', profit: '¥86.69万', margin: '27.5%', trend: 'down' },
                    ].map((row, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-right font-mono">{row.revenue}</TableCell>
                        <TableCell className="text-right font-mono">{row.cost}</TableCell>
                        <TableCell className="text-right font-mono">{row.profit}</TableCell>
                        <TableCell className="text-right">{row.margin}</TableCell>
                        <TableCell className="text-right">
                          {row.trend === 'up' ? (
                            <TrendingUp className="h-3.5 w-3.5 text-success inline" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-warning inline" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 解读：蓝牙耳机与智能手环毛利率最高（35%）；充电配件与家居小电毛利率有所下滑，需关注成本控制与定价策略。</span>
                </div>
              </CardContent>
            </Card>
        )}

        {/* ---------- 费用明细表 ---------- */}
        {activeReport === 'expense' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">2026年7月　管理报表口径　单位：万元</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>费用项目</TableHead>
                      <TableHead className="text-right">本期发生额</TableHead>
                      <TableHead className="text-right">预算金额</TableHead>
                      <TableHead className="text-right">差异金额</TableHead>
                      <TableHead className="text-right">差异率</TableHead>
                      <TableHead className="text-right w-12">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { item: '平台佣金', actual: '¥92.00万', budget: '¥96.00万', diff: '-¥4.00万', rate: '-4.2%', over: false },
                      { item: '广告投流费', actual: '¥76.00万', budget: '¥70.00万', diff: '+¥6.00万', rate: '+8.6%', over: true },
                      { item: '物流运费', actual: '¥28.00万', budget: '¥30.00万', diff: '-¥2.00万', rate: '-6.7%', over: false },
                      { item: '仓储费', actual: '¥10.00万', budget: '¥12.00万', diff: '-¥2.00万', rate: '-16.7%', over: false },
                      { item: '职工薪酬', actual: '¥86.40万', budget: '¥82.00万', diff: '+¥4.40万', rate: '+5.4%', over: true },
                      { item: '办公费', actual: '¥3.76万', budget: '¥4.50万', diff: '-¥0.74万', rate: '-16.4%', over: false },
                      { item: '差旅费', actual: '¥2.48万', budget: '¥3.00万', diff: '-¥0.52万', rate: '-17.3%', over: false },
                      { item: '折旧费', actual: '¥11.67万', budget: '¥11.67万', diff: '¥0.00', rate: '0.0%', over: false },
                      { item: '其他费用', actual: '¥5.93万', budget: '¥6.50万', diff: '-¥0.57万', rate: '-8.8%', over: false },
                      { item: '费用合计', actual: '¥316.24万', budget: '¥315.67万', diff: '+¥0.57万', rate: '+0.2%', over: false },
                    ].map((row, i) => {
                      const isTotal = row.item === '费用合计';
                      return (
                        <TableRow key={i} className={`text-xs ${isTotal ? 'font-bold bg-muted/40' : ''}`}>
                          <TableCell>{row.item}</TableCell>
                          <TableCell className="text-right font-mono">{row.actual}</TableCell>
                          <TableCell className="text-right font-mono">{row.budget}</TableCell>
                          <TableCell className={`text-right font-mono ${row.diff.startsWith('+') ? 'text-warning' : row.diff.startsWith('-') ? 'text-success' : ''}`}>
                            {row.diff}
                          </TableCell>
                          <TableCell className={`text-right ${row.rate.startsWith('+') ? 'text-warning' : ''}`}>
                            {row.rate}
                          </TableCell>
                          <TableCell className="text-right">
                            {isTotal ? null : row.over ? (
                              <Badge variant="secondary" className="h-4 text-[10px] px-1 font-mono">超支</Badge>
                            ) : (
                              <Badge variant="outline" className="h-4 text-[10px] px-1 font-mono text-success border-success/30">节约</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 解读：费用总额基本持平预算（+0.2%）；广告投流费超支¥6.00万（+8.6%），职工薪酬超支¥4.40万（+5.4%），需关注这两项费用控制。</span>
                </div>
              </CardContent>
            </Card>
        )}

        {/* ---------- 预算执行表 ---------- */}
        {activeReport === 'budget' && (
          <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">2026年7月　管理报表口径　单位：万元</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px]">
                      <TableHead>预算项目</TableHead>
                      <TableHead className="text-right">年度预算</TableHead>
                      <TableHead className="text-right">本月实际</TableHead>
                      <TableHead className="text-right">累计实际</TableHead>
                      <TableHead className="text-right">执行率</TableHead>
                      <TableHead className="text-right">剩余预算</TableHead>
                      <TableHead className="text-right w-16">进度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { project: '营业收入', annual: '¥14,500.00万', month: '¥1,268.04万', cum: '¥8,654.32万', rate: '59.7%', remain: '¥5,845.68万', warn: false },
                      { project: '营业成本', annual: '¥8,800.00万', month: '¥761.00万', cum: '¥5,192.59万', rate: '59.0%', remain: '¥3,607.41万', warn: false },
                      { project: '销售费用', annual: '¥1,800.00万', month: '¥146.40万', cum: '¥1,026.00万', rate: '57.0%', remain: '¥774.00万', warn: false },
                      { project: '管理费用', annual: '¥1,100.00万', month: '¥89.76万', cum: '¥634.80万', rate: '57.7%', remain: '¥465.20万', warn: false },
                      { project: '净利润', annual: '¥2,800.00万', month: '¥214.68万', cum: '¥1,800.93万', rate: '64.3%', remain: '¥999.07万', warn: false },
                      { project: '广告投流费', annual: '¥860.00万', month: '¥76.00万', cum: '¥594.80万', rate: '69.2%', remain: '¥265.20万', warn: true },
                      { project: '职工薪酬', annual: '¥1,020.00万', month: '¥86.40万', cum: '¥624.50万', rate: '61.2%', remain: '¥395.50万', warn: false },
                      { project: '物流仓储', annual: '¥480.00万', month: '¥38.00万', cum: '¥290.80万', rate: '60.6%', remain: '¥189.20万', warn: false },
                    ].map((row, i) => {
                      const pct = parseFloat(row.rate);
                      const isProfit = row.project === '净利润';
                      const isCost = row.project === '营业成本';
                      return (
                        <TableRow key={i} className={`text-xs ${isProfit ? 'font-semibold bg-muted/20' : ''}`}>
                          <TableCell>{row.project}</TableCell>
                          <TableCell className="text-right font-mono">{row.annual}</TableCell>
                          <TableCell className="text-right font-mono">{row.month}</TableCell>
                          <TableCell className="text-right font-mono">{row.cum}</TableCell>
                          <TableCell className={`text-right font-mono ${row.warn ? 'text-warning font-semibold' : ''}`}>
                            {row.rate}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">{row.remain}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <div className="relative h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`absolute inset-y-0 left-0 rounded-full ${row.warn ? 'bg-warning' : isProfit ? 'bg-success' : 'bg-primary'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-mono ${row.warn ? 'text-warning' : 'text-muted-foreground'}`}>
                                {row.rate}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 解读：净利润执行率64.3%高于时间进度58.3%，盈利表现良好；广告投流费执行率69.2%偏高，建议控制下半年投放节奏以避免年度预算超支。</span>
                </div>
              </CardContent>
            </Card>
        )}
      </>

      {/* ========== Balance Check Banner ========== */}
      <div className="flex items-center gap-2 bg-success/10 rounded-lg p-2 text-xs text-success">
        <CheckCircle2 className="h-4 w-4" />
        <span>所有报表勾稽校验通过：资产负债表平衡 √ | 利润表与所有者权益表勾稽 √ | 现金流量表与资产负债表衔接 √</span>
      </div>
    </div>
  );
}
