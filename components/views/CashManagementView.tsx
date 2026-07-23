'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export function CashManagementView() {
  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            CASH & PAYMENT OPERATIONS
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">
            资金收付
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            监管大额及异常资金支付授权、查看付款证据和审计轨迹；会计主管不代替出纳执行网银付款。
          </p>
        </div>
        <RippleContainer>
          <Button size="sm">查核大额支付授权</Button>
        </RippleContainer>
      </div>

      <Separator />

      {/* ========== Role Boundaries Note Block ========== */}
      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">岗位边界：</p>
        <p>
          <strong>业务部门/审批人：</strong>确认业务发生、预算和付款授权{' '}
          | <strong>出纳：</strong>核对支付指令、收款账户、金额、审批链和资金余额并执行收付{' '}
          | <strong>会计专员：</strong>根据回单及原始凭证制证{' '}
          | <strong>会计主管：</strong>监督授权与异常资金事项
        </p>
      </div>

      {/* ========== 4 Stat Cards ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">可用银行余额</div>
            <div className="text-lg font-bold font-mono mt-1">¥2,397,212.53</div>
            <div className="text-[10px] text-muted-foreground">3个账户 · 已扣除冻结资金</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">待付款任务</div>
            <div className="text-lg font-bold mt-1">3 笔</div>
            <div className="text-[10px] text-muted-foreground">合计 ¥129,642.50</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">待确认收款</div>
            <div className="text-lg font-bold mt-1">2 笔</div>
            <div className="text-[10px] text-muted-foreground">合计 ¥134,592.18</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">待移交回单</div>
            <div className="text-lg font-bold mt-1">1 笔</div>
            <div className="text-[10px] text-muted-foreground">付款后当日移交</div>
          </CardContent>
        </Card>
      </div>

      {/* ========== 5-Step Flow ========== */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {['1 接收已审批任务', '2 付款前核验', '3 执行付款', '4 回单与移交', '5 资金凭证签字'].map(
          (step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                {step}
              </span>
              {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ),
        )}
      </div>

      {/* ========== Payment Tasks Table ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">付款任务</CardTitle>
          <CardDescription>
            任务来自费控/采购/OA审批，不以扫描发票本身作为付款指令
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="待处理">
            <TabsList>
              <TabsTrigger value="待处理" className="text-xs">
                待处理 3
              </TabsTrigger>
              <TabsTrigger value="处理中" className="text-xs">
                处理中 1
              </TabsTrigger>
              <TabsTrigger value="已完成" className="text-xs">
                已完成 42
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Table className="mt-3">
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>付款凭证号</TableHead>
                <TableHead>收款单位·客户</TableHead>
                <TableHead>付款账户</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>审批与资料</TableHead>
                <TableHead>资金检查</TableHead>
                <TableHead>付款状态</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 'FK-202607-0138',
                  to: '上海云仓科技',
                  acct: '招行基本户 8888',
                  amount: '¥113,000.00',
                  approval: '三级审批齐全/合同订单发票可查',
                  check: '余额充足/本单中需要支付',
                  status: '待付款',
                  statusKind: 'warning' as const,
                },
                {
                  id: 'FK-202607-0142',
                  to: '周晓敏',
                  acct: '工行一般户 6621',
                  amount: '¥3,842.50',
                  approval: '缺主管审批/系统已阻断支付',
                  check: '余额充足',
                  status: '禁止付款',
                  statusKind: 'destructive' as const,
                },
                {
                  id: 'FK-202607-0145',
                  to: '迅捷物流有限公司',
                  acct: '招行基本户 8888',
                  amount: '¥12,800.00',
                  approval: '审批齐全/余额及对账单完整',
                  check: '接近单日限额',
                  status: '待审批提醒',
                  statusKind: 'warning' as const,
                },
              ].map((row, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-mono">{row.id}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.acct}</TableCell>
                  <TableCell className="text-right font-mono">{row.amount}</TableCell>
                  <TableCell>{row.approval}</TableCell>
                  <TableCell>{row.check}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        row.statusKind === 'destructive'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <RippleContainer>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        查看依据
                      </Button>
                    </RippleContainer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========== Receipt Confirmation Table ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">收款确认与回单归集</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>银行流水号</TableHead>
                <TableHead>付款方·业务来源</TableHead>
                <TableHead>收款客户</TableHead>
                <TableHead className="text-right">到账金额</TableHead>
                <TableHead>自动匹配</TableHead>
                <TableHead>处理状态</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-xs">
                <TableCell className="font-mono">755901 · 07-12</TableCell>
                <TableCell>抖音支付科技·平台结算批次</TableCell>
                <TableCell>招行基本户 8888</TableCell>
                <TableCell className="text-right font-mono">¥86,392.18</TableCell>
                <TableCell>
                  <Badge className="bg-success/10 text-success">
                    已匹配结算单
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">待确认入账</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <RippleContainer>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      查看流水
                    </Button>
                  </RippleContainer>
                </TableCell>
              </TableRow>
              <TableRow className="text-xs">
                <TableCell className="font-mono">IN2026071506 · 07-15</TableCell>
                <TableCell>客户来款·销售订单</TableCell>
                <TableCell>杭州远海贸易·工行一般户 6621</TableCell>
                <TableCell className="text-right font-mono">¥48,200.00</TableCell>
                <TableCell>
                  <Badge className="bg-warning/10 text-warning">
                    待核对客户
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">待确认入账</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <RippleContainer>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      查看流水
                    </Button>
                  </RippleContainer>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========== Rules Block ========== */}
      <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-warning space-y-1">
          <p className="font-medium">票据控制：</p>
          <p>
            章款不完整、收款账户不一致、重复付、金额不足或超额度权限时禁止付款；付款完成后必须保留银行交易流水号或电子回单，并形成不可删除的移交记录。
          </p>
        </div>
      </div>
    </div>
  );
}
