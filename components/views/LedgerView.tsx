'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { cn } from '@/lib/utils';
import { BookOpen, Download, Calendar, Building2, Search } from 'lucide-react';
import { toast } from 'sonner';

type BookType = 'journal' | 'ledger' | 'memorandum';
type LedgerTab = 'general' | 'detail';

interface LedgerRow {
  date: string;
  voucher: string;
  sub: string;
  summary: string;
  debit: string;
  credit: string;
  direction: string;
  balance: string;
  isHeader?: boolean;
  isTotal?: boolean;
  isFooter?: boolean;
}

const bookTypes: { key: BookType; label: string; sub: string; desc: string }[] = [
  { key: 'journal', label: '日记账', sub: '日', desc: '库存现金、银行存款' },
  { key: 'ledger', label: '分类账簿', sub: '分', desc: '总分类账、明细分类账' },
  { key: 'memorandum', label: '备查账簿', sub: '备', desc: '辅助核算、固定资产等' },
];

const generalLedgerRows: LedgerRow[] = [
  { date: '期初', voucher: '—', sub: '—', summary: '上期结转', debit: '', credit: '', direction: '借', balance: '1,286,420.35', isHeader: true },
  { date: '07-08', voucher: '转字096号', sub: '100201 银行存款—招商银行杭州分行', summary: '收到平台结算款', debit: '1,309,340.40', credit: '', direction: '借', balance: '2,595,760.75' },
  { date: '07-12', voucher: '转字128号', sub: '100202 银行存款—工商银行上海分行', summary: '支付采购或费用款', debit: '1,072,188.00', credit: '', direction: '借', balance: '1,523,572.75' },
  { date: '07-18', voucher: '转字162号', sub: '100203 银行存款—美元账户', summary: '补充登记银行存款业务', debit: '1,537,051.78', credit: '', direction: '借', balance: '3,060,624.53' },
  { date: '07-26', voucher: '转字186号', sub: '100202 银行存款—工商银行上海分行', summary: '结转或支付银行存款', debit: '776,412.00', credit: '', direction: '借', balance: '2,284,212.53' },
  { date: '07-31', voucher: '—', sub: '—', summary: '本期发生额合计', debit: '2,846,392.18', credit: '1,848,600.00', direction: '借', balance: '2,284,212.53', isTotal: true },
  { date: '07-31', voucher: '—', sub: '—', summary: '期末余额', debit: '', credit: '', direction: '借', balance: '2,284,212.53', isFooter: true },
];

const detailLedgerRows: LedgerRow[] = [
  { date: '期初', voucher: '—', sub: '—', summary: '上期结转', debit: '', credit: '', direction: '借', balance: '642,420.35', isHeader: true },
  { date: '07-08', voucher: '转字096号', sub: '10020101 招商银行杭州分行基本户', summary: '抖音平台结算到账', debit: '86,392.18', credit: '', direction: '借', balance: '728,812.53' },
  { date: '07-10', voucher: '转字103号', sub: '10020102 招商银行杭州分行收入户', summary: '客户来款·杭州远海贸易', debit: '48,200.00', credit: '', direction: '借', balance: '777,012.53' },
  { date: '07-15', voucher: '转字118号', sub: '10020101 招商银行杭州分行基本户', summary: '支付供应商货款', debit: '', credit: '113,000.00', direction: '借', balance: '664,012.53' },
  { date: '07-22', voucher: '转字145号', sub: '10020102 招商银行杭州分行收入户', summary: '银行结息收入', debit: '1,268.40', credit: '', direction: '借', balance: '665,280.93' },
  { date: '07-31', voucher: '—', sub: '—', summary: '本期发生额合计', debit: '135,860.58', credit: '113,000.00', direction: '借', balance: '665,280.93', isTotal: true },
  { date: '07-31', voucher: '—', sub: '—', summary: '期末余额', debit: '', credit: '', direction: '借', balance: '665,280.93', isFooter: true },
];

const journalRows: LedgerRow[] = [
  { date: '07-01', voucher: '现收001号', sub: '1001 库存现金', summary: '零星销售收入', debit: '2,400.00', credit: '', direction: '借', balance: '5,600.00' },
  { date: '07-05', voucher: '现付003号', sub: '1001 库存现金', summary: '报销办公用品', debit: '', credit: '860.00', direction: '借', balance: '4,740.00' },
  { date: '07-12', voucher: '银付128号', sub: '1002 银行存款', summary: '支付采购款', debit: '', credit: '113,000.00', direction: '借', balance: '1,523,572.75' },
  { date: '07-18', voucher: '银收162号', sub: '1002 银行存款', summary: '收到客户回款', debit: '1,537,051.78', credit: '', direction: '借', balance: '3,060,624.53' },
];

const memorandumRows: LedgerRow[] = [
  { date: '07-01', voucher: '—', sub: '固定资产登记', summary: '购入办公电脑 5 台', debit: '—', credit: '—', direction: '—', balance: '—' },
  { date: '07-15', voucher: '—', sub: '租赁合同备查', summary: '杭州云仓仓库租赁 2026.07-2027.06', debit: '—', credit: '—', direction: '—', balance: '—' },
  { date: '07-20', voucher: '—', sub: '票据备查', summary: '银行承兑汇票 50,000 元到期托收', debit: '—', credit: '—', direction: '—', balance: '—' },
];

export function LedgerView() {
  const [bookType, setBookType] = useState<BookType>('ledger');
  const [activeTab, setActiveTab] = useState<LedgerTab>('general');
  const [loading, setLoading] = useState(false);

  const bookMeta = bookTypes.find((b) => b.key === bookType)!;

  const { title, description, rows, pageFormat } = useMemo(() => {
    if (bookType === 'journal') {
      return {
        title: '银行存款日记账',
        description: '科目：1002 银行存款　期间：2026年7月　单位：元',
        rows: journalRows,
        pageFormat: '三栏式日记账',
      };
    }
    if (bookType === 'memorandum') {
      return {
        title: '备查账簿',
        description: '期间：2026年7月　核算主体：杭州星芒供应链有限公司',
        rows: memorandumRows,
        pageFormat: '辅助核算账页',
      };
    }
    if (activeTab === 'detail') {
      return {
        title: '明细分类账（100201 银行存款—招商银行杭州分行）',
        description: '科目：100201 银行存款—招商银行杭州分行　期间：2026年7月　单位：元',
        rows: detailLedgerRows,
        pageFormat: '三栏式明细分类账',
      };
    }
    return {
      title: '三栏式总分类账',
      description: '科目：1002 银行存款　期间：2026年7月　单位：元',
      rows: generalLedgerRows,
      pageFormat: '三栏式总分类账',
    };
  }, [bookType, activeTab]);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('账簿数据已按当前条件刷新');
    }, 400);
  };

  const handleExport = () => {
    toast.success('已导出当前账簿（PDF）');
  };

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
        <RippleContainer>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" /> 导出当前账簿
          </Button>
        </RippleContainer>
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
        {bookTypes.map((book) => (
          <RippleContainer key={book.key}>
            <Button
              variant={bookType === book.key ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setBookType(book.key)}
            >
              <Badge className="text-[10px] px-1 h-4">{book.sub}</Badge>
              <span className="text-xs">{book.label}</span>
            </Button>
          </RippleContainer>
        ))}
      </div>

      {/* Query area */}
      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          {bookType === 'ledger' && (
            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LedgerTab)}>
                <TabsList>
                  <TabsTrigger value="general" className="text-xs">总分类账（一级科目）</TabsTrigger>
                  <TabsTrigger value="detail" className="text-xs">明细分类账（二/三级科目）</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计期间：</span>
              <span className="font-medium">2026-07</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">会计科目：</span>
              <span className="font-medium">{bookType === 'journal' ? '1002 银行存款' : activeTab === 'detail' ? '100201 银行存款—招商银行杭州分行' : '1002 银行存款'} | 资产类</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">核算主体：</span>
              <span className="font-medium">杭州星芒供应链有限公司</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            适用账页格式：{pageFormat}
            {bookType !== 'ledger' && ` · 当前账簿：${bookMeta.label}`}
          </div>
          <RippleContainer>
            <Button size="sm" className="gap-1.5" onClick={handleSearch} disabled={loading}>
              <Search className="h-3.5 w-3.5" /> {loading ? '查询中…' : '查询'}
            </Button>
          </RippleContainer>
        </CardContent>
      </Card>

      {/* Ledger table */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  className={cn(
                    (row.isHeader || row.isTotal || row.isFooter) && 'bg-muted/30 font-medium',
                    'text-xs'
                  )}
                >
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
