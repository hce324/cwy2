'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Download, Calendar, Building2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function LedgerView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">ACCOUNTING BOOKS</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">会计账簿</h1>
          <p className="text-sm text-muted-foreground mt-1">
            按日记账、分类账簿和备查账簿组织，并根据科目性质自动选择适用账页格式。
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast('已导出当前账簿')}>
          <Download className="h-4 w-4" /> 导出当前账簿
        </Button>
      </div>

      <Separator />

      {/* Rules */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">日记账：</strong>逐日逐笔登记库存现金和银行存款。</p>
        <p><strong className="text-foreground">分类账簿：</strong>包括总分类账及适用不同账页格式的明细分类账。</p>
        <p><strong className="text-foreground">备查账簿：</strong>补充登记辅助核算和需查考事项。</p>
      </div>

      {/* Book type tabs */}
      <div className="flex gap-2">
        {[
          { label: '日记账', sub: '日', desc: '库存现金、银行存款' },
          { label: '分类账簿', sub: '分', desc: '总分类账、明细分类账' },
          { label: '备查账簿', sub: '备', desc: '辅助核算、固定资产等' },
        ].map((book, i) => (
          <Button key={i} variant={i === 1 ? 'default' : 'outline'} size="sm" className="gap-1.5">
            <Badge className="text-[10px] px-1 h-4">{book.sub}</Badge>
            <span className="text-xs">{book.label}</span>
          </Button>
        ))}
      </div>

      {/* Query area */}
      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general" className="text-xs">总分类账（一级科目）</TabsTrigger>
                <TabsTrigger value="detail" className="text-xs">明细分类账（二/三级科目）</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计期间：</span>
              <span className="font-medium">2026-07</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计科目：</span>
              <span className="font-medium">1002 银行存款 | 资产类</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">核算主体：</span>
              <span className="font-medium">杭州星芒供应链有限公司</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            适用账页格式：银行日记账（三栏式）
          </div>
          <Button size="sm" className="gap-1.5">
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
        </CardContent>
      </Card>

      {/* Three-column ledger */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">三栏式总分类账</CardTitle>
          <CardDescription>
            科目：1002 银行存款　期间：2026年7月　单位：元
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>日期</TableHead>
                <TableHead>凭证字号</TableHead>
                <TableHead>明细科目</TableHead>
                <TableHead>摘要</TableHead>
                <TableHead className="text-right">借方发生额</TableHead>
                <TableHead className="text-right">贷方发生额</TableHead>
                <TableHead className="text-center">方向</TableHead>
                <TableHead className="text-right">余额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { date: '期初', voucher: '—', sub: '—', summary: '上期结转', debit: '', credit: '', direction: '借', balance: '1,286,420.35', isHeader: true },
                { date: '07-08', voucher: '转字096号', sub: '100201 银行存款—招商银行杭州分行', summary: '收到平台结算款', debit: '1,309,340.40', credit: '', direction: '借', balance: '2,595,760.75' },
                { date: '07-12', voucher: '转字128号', sub: '100202 银行存款—工商银行上海分行', summary: '支付采购或费用款', debit: '1,072,188.00', credit: '', direction: '借', balance: '1,523,572.75' },
                { date: '07-18', voucher: '转字162号', sub: '100203 银行存款—美元账户', summary: '补充登记银行存款业务', debit: '1,537,051.78', credit: '', direction: '借', balance: '3,060,624.53' },
                { date: '07-26', voucher: '转字186号', sub: '100202 银行存款—工商银行上海分行', summary: '结转或支付银行存款', debit: '776,412.00', credit: '', direction: '借', balance: '2,284,212.53' },
                { date: '07-31', voucher: '—', sub: '—', summary: '本期发生额合计', debit: '2,846,392.18', credit: '1,848,600.00', direction: '借', balance: '2,284,212.53', isTotal: true },
                { date: '07-31', voucher: '—', sub: '—', summary: '期末余额', debit: '', credit: '', direction: '借', balance: '2,284,212.53', isFooter: true },
              ].map((row, i) => (
                <TableRow key={i} className={row.isHeader || row.isTotal || row.isFooter ? 'bg-muted/30 font-medium text-xs' : 'text-xs'}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.voucher}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{row.sub}</TableCell>
                  <TableCell>{row.summary}</TableCell>
                  <TableCell className="text-right font-mono">{row.debit}</TableCell>
                  <TableCell className="text-right font-mono">{row.credit}</TableCell>
                  <TableCell className="text-center">{row.direction}</TableCell>
                  <TableCell className="text-right font-mono">{row.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
