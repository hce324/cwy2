'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, ChevronLeft, FileText } from 'lucide-react';

const vouchers = [
  { id: 'YSPZ-202607-00128', item: '供应商采购业务资料包：采购蓝牙耳机并验收入库', date: '2026-07-13', amount: '¥113,000.00', docs: '数电专票＋采购订单＋入库单', risk: '资料完整' },
  { id: 'YSPZ-202607-00129', item: '平台结算收款资料包：收到抖音平台结算款', date: '2026-07-12', amount: '¥86,392.18', docs: '平台结算单＋银行电子回单', risk: '补贴待确认' },
  { id: 'YSPZ-202607-00130', item: '物流服务费资料包：电商订单仓储配送服务', date: '2026-07-11', amount: '¥4,280.00', docs: '数电发票＋物流服务对账单', risk: '资料完整' },
  { id: 'YSPZ-202607-00131', item: '办公设备采购资料包：购入办公电脑并完成验收', date: '2026-07-11', amount: '¥22,600.00', docs: '数电专票＋采购订单＋验收单', risk: '资料完整' },
  { id: 'YSPZ-202607-00132', item: '员工差旅报销资料包：员工参加平台招商会议差旅', date: '2026-07-10', amount: '¥3,842.50', docs: '报销单＋行程单＋8张票据', risk: '缺主管审批' },
];

export function SourceVoucherView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="gap-1 -ml-2">
          <ChevronLeft className="h-4 w-4" /> 返回原始凭证列表
        </Button>
        <p className="text-xs text-muted-foreground">展示业务事实、实际原始单据和复核记录，不包含会计科目及借贷分录</p>

        <div className="bg-success/10 rounded-lg p-3 text-sm">
          <span className="font-medium text-success">状态：资料完整，可提交复核</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div><span className="text-xs text-muted-foreground">业务日期</span><p className="font-medium">2026-07-13</p></div>
          <div><span className="text-xs text-muted-foreground">业务主体</span><p className="font-medium">杭州星芒供应链有限公司</p></div>
          <div><span className="text-xs text-muted-foreground">交易对方</span><p className="font-medium">上海云仓科技有限公司</p></div>
          <div><span className="text-xs text-muted-foreground">经办人</span><p className="font-medium">王采购 · 采购部</p></div>
        </div>

        <Separator />

        <Card className="elevation-1">
          <CardHeader className="pb-3"><CardTitle className="text-base">业务事实与关键字段</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">采购内容：</span>X1蓝牙耳机 1,000件</p>
            <p><span className="text-muted-foreground">交货地点：</span>杭州云仓</p>
            <p><span className="text-muted-foreground">合同/订单：</span>PO-202607-1842</p>
            <p><span className="text-muted-foreground">验收入库：</span>RK-202607-0918 · 实收1,000件</p>
            <p><span className="text-muted-foreground">发票号码：</span>246120…5281</p>
            <p><span className="text-muted-foreground">价税合计：</span>¥113,000.00</p>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardHeader className="pb-3"><CardTitle className="text-base">单据之间的核对结果</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-success">✓ 发票购销双方与订单一致</p>
            <p className="text-success">✓ 发票货物名称、数量与入库单一致</p>
            <p className="text-success">✓ 订单含税金额与发票价税合计一致</p>
            <p className="text-success">✓ 入库单由仓管员和验收人签字</p>
          </CardContent>
        </Card>

        <div className="bg-success/10 rounded-lg p-3 text-sm text-success">风险/待办：未发现重复单据或关键字段差异</div>

        <Card className="elevation-1">
          <CardHeader className="pb-3"><CardTitle className="text-base">所附原始单据（3 份）</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['增值税专用发票（税务数字账户下载·OFD/XML/PDF，已查验）', '采购系统原始订单（已审批）', '商品入库单（WMS原始入库记录，已验收）'].map((doc, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-1 last:border-0">
                <span>{doc}</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">查看原件</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground italic">
          提示：本页不形成会计分录 — 复核通过后，系统仅把这些业务事实和原始单据传递到"凭证填制"模块，由会计专员确定摘要、会计科目和借贷金额。
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">SOURCE VOUCHERS</div>
          <h1 className="page-title mt-1">原始凭证</h1>
          <p className="page-subtitle">
            查看原始凭证及附件证据，重点复核异常、大额和高风险业务，不代替会计专员日常制证。
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: '本期待处理', value: '6', sub: '原始凭证' }, { label: '识别准确率', value: '97.8%', sub: '关键金额100%' }, { label: '待补充附件', value: '2', sub: '审批单或回单' }, { label: '待人工复核', value: '6', sub: '核对业务事实与原件' }].map(s => (
          <Card key={s.label} className="elevation-1"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-lg font-bold mt-1">{s.value}</div><div className="text-[10px] text-muted-foreground">{s.sub}</div></CardContent></Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        本页只呈现业务发生时形成或取得的原始单据及其扫描识别结果，不显示会计科目、借贷方向或会计分录。会计处理在复核通过后的"凭证填制"模块完成。
      </div>

      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead>原始凭证号</TableHead><TableHead>资料包/事项</TableHead><TableHead>业务日期</TableHead><TableHead className="text-right">金额</TableHead><TableHead>所含原始单据</TableHead><TableHead>风险</TableHead><TableHead className="text-center">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id} className="text-xs">
                  <TableCell className="font-mono">{v.id}</TableCell><TableCell>{v.item}</TableCell><TableCell>{v.date}</TableCell><TableCell className="text-right font-mono">{v.amount}</TableCell><TableCell>{v.docs}</TableCell>
                  <TableCell><Badge className={v.risk === '资料完整' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{v.risk}</Badge></TableCell>
                  <TableCell className="text-center"><Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedId(v.id)}>查看详情</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
