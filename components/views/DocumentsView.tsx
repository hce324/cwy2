'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ArrowRight, Search } from 'lucide-react';

const documents = [
  { name: '数电专票 246120…5281', sub: '上海云启科技有限公司 · 2026-07-13', category: '发票', company: '杭州星芒供应链', source: '税务数字账户', amount: '¥113,000.00', result: '票面字段完整 · 查验通过' },
  { name: '天猫结算单 TM-202607-A19', sub: '销售、退款、佣金及运费险 · 486笔', category: '平台结算', company: '上海星芒电商', source: '天猫接口', amount: '¥428,631.42', result: '订单及到账全部匹配' },
  { name: '招商银行电子回单 755901', sub: '交易日期 2026-07-12 · 单笔', category: '银行回单', company: '广州星芒贸易', source: '银企直联', amount: '¥86,392.18', result: '与结算单差异 ¥186.40' },
  { name: '数电专票 246120…7196', sub: '成都星芒科技有限公司 · 2026-07-11', category: '发票', company: '成都星芒科技', source: '手工上传', amount: '¥22,600.00', result: '识别为固定资产采购 · 94%' },
  { name: '抖音结算单 DY-20260712-0831', sub: '佣金、退款及运费险 · 132笔', category: '平台结算', company: '上海星芒电商', source: '抖音接口', amount: '¥86,578.58', result: '定位补贴差异 ¥186.40' },
  { name: '工商银行电子回单 3196', sub: '交易日期 2026-07-11 · 单笔', category: '银行回单', company: '上海星芒电商', source: '网银导入', amount: '¥186.40', result: '银行已付、企业未付' },
  { name: '差旅电子普票 2456…1048', sub: '张晓明 · 2026-07-10', category: '发票', company: '杭州星芒供应链', source: '移动端拍照', amount: '¥3,842.50', result: '8张票据，缺少主管审批单' },
  { name: '采购订单 PO-202607-1842', sub: '杭州星芒供应链 · 2026-07-09', category: '采购订单', company: '杭州星芒供应链', source: '采购系统', amount: '¥113,000.00', result: '与发票、入库单一致' },
  { name: '商品入库单 RK-202607-0918', sub: '2026-07-09', category: '入库单', company: '杭州星芒供应链', source: 'WMS接口', amount: '¥100,000.00', result: '数量及规格与订单一致' },
  { name: '付款申请 FK-202607-0138', sub: '2026-07-08', category: '付款审批', company: '杭州星芒供应链', source: 'OA审批', amount: '¥113,000.00', result: '申请、合同及收款账户一致' },
  { name: '员工费用报销单 BX-202607-0124', sub: '广州星芒贸易 · 2026-07-08', category: '报销单', company: '广州星芒贸易', source: '费控系统', amount: '¥3,260.00', result: '预算、标准及发票均通过' },
  { name: '京东结算单 JD-202607-0715', sub: '佣金、退款及运费险 · 215笔', category: '平台结算', company: '广州星芒贸易', source: '京东接口', amount: '¥196,820.30', result: '订单、退款及银行到账匹配' },
];

const flowSteps = ['资料上传', 'AI识别', '原始凭证', '批量制证'];

function resultTone(result: string): string {
  if (result.includes('差异') || result.includes('缺少') || result.includes('未付')) {
    return 'text-warning';
  }
  if (result.includes('完整') || result.includes('匹配') || result.includes('一致') || result.includes('通过')) {
    return 'text-success';
  }
  return 'text-muted-foreground';
}

function isAbnormal(result: string): boolean {
  return result.includes('差异') || result.includes('缺少') || result.includes('未付');
}

interface TabConfig {
  key: string;
  label: string;
  filter: (doc: typeof documents[0]) => boolean;
}

const tabs: TabConfig[] = [
  { key: '全部', label: '全部', filter: () => true },
  { key: '发票', label: '发票', filter: (doc) => doc.category === '发票' },
  { key: '平台结算单', label: '平台结算单', filter: (doc) => doc.category === '平台结算' },
  { key: '银行回单', label: '银行回单', filter: (doc) => doc.category === '银行回单' },
  { key: '异常', label: '异常', filter: (doc) => isAbnormal(doc.result) },
];

const tabLabels = tabs.map((tab) => ({
  ...tab,
  count: documents.filter(tab.filter).length,
}));

export function DocumentsView() {
  const { setView } = useAppStore();
  const [activeTab, setActiveTab] = useState('全部');

  const activeFilter = tabs.find((t) => t.key === activeTab)?.filter ?? (() => true);
  const filteredDocuments = documents.filter(activeFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            智能采集 <span className="text-xs text-muted-foreground font-sans font-normal uppercase tracking-wider">SMART CAPTURE</span>
          </h1>
          <p className="page-subtitle">
            扫描原始单据，导入发票、平台账单、银行流水和业务附件。
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setView('import')}>
          <Plus className="h-4 w-4" /> 扫描或导入
        </Button>
      </div>

      <Separator />

      {/* Flow Steps: 资料上传 → AI识别 → 原始凭证 → 批量制证 */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {flowSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {i + 1}
              </span>
              {step}
            </span>
            {i < flowSteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Tabs and Search */}
      <div className="flex items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabLabels.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                {tab.label} {tab.count.toLocaleString()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="搜索单号、供应商、平台或金额" className="h-8 pl-7 text-xs" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {activeTab === '全部'
          ? '全部采集资料 — 除发票、平台结算单和银行回单外，还包括订单、入库单、报销单及付款审批资料。'
          : activeTab === '异常'
            ? '识别或匹配结果存在异常的资料，需人工复核或补充附件。'
            : `${activeTab}类采集资料 — 点击「查看原件」可进入原始凭证详情。`}
      </p>

      {/* Table */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>资料名称</TableHead>
                <TableHead>资料类别</TableHead>
                <TableHead>所属公司</TableHead>
                <TableHead>采集来源</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>识别·匹配结果</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell>
                    <div className="font-medium text-foreground">{doc.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{doc.sub}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                  </TableCell>
                  <TableCell>{doc.company}</TableCell>
                  <TableCell>{doc.source}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{doc.amount}</TableCell>
                  <TableCell>
                    <span className={resultTone(doc.result)}>{doc.result}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setView('hz-sourcevoucher')}>
                      查看原件
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
