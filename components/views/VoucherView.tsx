'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText } from 'lucide-react';

const queue = [
  { num: 1, voucher: 'YSPZ-00128', date: '2026-07-13', item: '采购蓝牙耳机入库', docs: '发票+采购订单+入库单', amount: '¥113,000.00', risk: '资料完整', status: '待填制' },
  { num: 2, voucher: 'YSPZ-00129', date: '2026-07-12', item: '收到抖音平台结算款', docs: '平台结算单+银行回单', amount: '¥86,392.18', risk: '补贴待确认', status: '待填制' },
  { num: 3, voucher: 'YSPZ-00130', date: '2026-07-11', item: '仓储配送服务', docs: '发票+对账单', amount: '¥4,280.00', risk: '无异常', status: '可生成' },
  { num: 4, voucher: 'YSPZ-00131', date: '2026-07-11', item: '购入办公电脑', docs: '发票+采购订单+验收单', amount: '¥22,600.00', risk: '无异常', status: '可生成' },
  { num: 5, voucher: 'YSPZ-00132', date: '2026-07-10', item: '员工差旅报销', docs: '报销单+行程单+8张票据', amount: '¥3,842.50', risk: '缺主管审批', status: '待填制' },
];

const signTasks = [
  { voucher: '收字128号', date: '2026-07-12', summary: '收到抖音平台结算款', entry: '借：100201 银行存款 / 贷：112202 应收抖音平台款', amount: '¥86,392.18', audit: '已审核', status: '已到账', sign: '出纳签字' },
  { voucher: '付字138号', date: '2026-07-13', summary: '支付上海云仓采购货款', entry: '借：220201 应付商品供应商 / 贷：100201 银行存款', amount: '¥113,000.00', audit: '已审核', status: '已支付', sign: '出纳签字' },
  { voucher: '付字021号', date: '2026-07-10', summary: '支付零星办公费用', entry: '借：660201 管理费用—办公费 / 贷：100101 库存现金', amount: '¥860.00', audit: '已审核', status: '已支付', sign: '出纳签字' },
];

export function VoucherView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER PREPARATION</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">凭证填制</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI先形成全部凭证信息；会计专员查看、修改并确认后，才生成正式凭证编号。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-4 w-4" /> 增加凭证</Button>
          <Button size="sm" variant="outline">批量生成</Button>
          <Button size="sm">生成凭证</Button>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: '待填制', value: '6张' }, { label: '填制中', value: '1张' }, { label: '退回修改', value: '2张' }, { label: '本月已生成', value: '1,105张' }].map(s => (
          <Card key={s.label} className="elevation-1"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-lg font-bold mt-1">{s.value}</div></CardContent></Card>
        ))}
      </div>

      {/* Work queue */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base">会计专员制证工作队列</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead className="w-8">#</TableHead><TableHead>原始凭证号</TableHead><TableHead>业务日期</TableHead><TableHead>业务事项</TableHead><TableHead>原始资料</TableHead><TableHead className="text-right">金额</TableHead><TableHead>风险</TableHead><TableHead>状态</TableHead><TableHead className="text-center">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {queue.map((row) => (
                <TableRow key={row.num} className="text-xs">
                  <TableCell>{row.num}</TableCell><TableCell className="font-mono">{row.voucher}</TableCell><TableCell>{row.date}</TableCell><TableCell>{row.item}</TableCell><TableCell>{row.docs}</TableCell><TableCell className="text-right font-mono">{row.amount}</TableCell>
                  <TableCell><Badge className={row.risk === '资料完整' || row.risk === '无异常' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'} variant="outline">{row.risk}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={row.status === '可生成' ? 'text-success' : 'text-warning'}>{row.status}</Badge></TableCell>
                  <TableCell className="text-center"><Button variant="outline" size="sm" className="h-7 text-xs">填制</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 出纳签字范围 */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> 出纳签字范围</CardTitle><CardDescription>仅显示含1001库存现金或1002银行存款科目的收款、付款记账凭证</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead>凭证字号</TableHead><TableHead>日期</TableHead><TableHead>摘要</TableHead><TableHead>资金分录</TableHead><TableHead className="text-right">金额</TableHead><TableHead>审核</TableHead><TableHead>收付状态</TableHead><TableHead className="text-center">签字</TableHead></TableRow></TableHeader>
            <TableBody>
              {signTasks.map((row, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-medium">{row.voucher}</TableCell><TableCell>{row.date}</TableCell><TableCell>{row.summary}</TableCell><TableCell>{row.entry}</TableCell><TableCell className="text-right font-mono">{row.amount}</TableCell>
                  <TableCell><Badge className="bg-success/10 text-success">{row.audit}</Badge></TableCell><TableCell><Badge className="bg-success/10 text-success">{row.status}</Badge></TableCell>
                  <TableCell className="text-center"><Button variant="outline" size="sm" className="h-7 text-xs">{row.sign}</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
