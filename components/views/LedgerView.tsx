'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Download, Calendar, Building2, Search, type LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type BookType = 'journal' | 'classify' | 'memo';

type RowFlag = 'header' | 'total' | 'footer' | undefined;

interface LedgerColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
}

interface LedgerRow {
  cells: string[];
  flag?: RowFlag;
}

interface BookMeta {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface BookConfig {
  id: BookType;
  label: string;
  sub: string;
  desc: string;
  pageFormat: string;
  tableTitle: string;
  tableDesc: string;
  columns: LedgerColumn[];
  meta: BookMeta[];
  rows: LedgerRow[];
}

const books: Record<BookType, BookConfig> = {
  journal: {
    id: 'journal',
    label: '日记账',
    sub: '日',
    desc: '库存现金、银行存款',
    pageFormat: '银行存款日记账（三栏式）',
    tableTitle: '三栏式银行存款日记账',
    tableDesc: '科目：1002 银行存款　期间：2026年7月　单位：元',
    columns: [
      { key: 'date', label: '日期' },
      { key: 'voucher', label: '凭证字号' },
      { key: 'summary', label: '摘要' },
      { key: 'debit', label: '借方发生额', align: 'right', mono: true },
      { key: 'credit', label: '贷方发生额', align: 'right', mono: true },
      { key: 'direction', label: '方向', align: 'center' },
      { key: 'balance', label: '余额', align: 'right', mono: true },
    ],
    meta: [
      { icon: Calendar, label: '会计期间', value: '2026-07' },
      { icon: BookOpen, label: '会计科目', value: '1001/1002 库存现金、银行存款' },
      { icon: Building2, label: '核算主体', value: '杭州星芒供应链有限公司' },
    ],
    rows: [
      { cells: ['期初', '—', '上期结转', '', '', '借', '1,286,420.35'], flag: 'header' },
      { cells: ['07-08', '转字096号', '收到平台结算款', '1,309,340.40', '', '借', '2,595,760.75'] },
      { cells: ['07-12', '转字128号', '支付采购或费用款', '1,072,188.00', '', '借', '1,523,572.75'] },
      { cells: ['07-18', '转字162号', '补充登记银行存款业务', '1,537,051.78', '', '借', '3,060,624.53'] },
      { cells: ['07-26', '转字186号', '结转或支付银行存款', '776,412.00', '', '借', '2,284,212.53'] },
      { cells: ['07-31', '—', '本期发生额合计', '2,846,392.18', '1,848,600.00', '借', '2,284,212.53'], flag: 'total' },
      { cells: ['07-31', '—', '期末余额', '', '', '借', '2,284,212.53'], flag: 'footer' },
    ],
  },
  classify: {
    id: 'classify',
    label: '分类账簿',
    sub: '分',
    desc: '总分类账、明细分类账',
    pageFormat: '总分类账（三栏式）',
    tableTitle: '三栏式总分类账',
    tableDesc: '科目：1002 银行存款　期间：2026年7月　单位：元',
    columns: [
      { key: 'date', label: '日期' },
      { key: 'voucher', label: '凭证字号' },
      { key: 'sub', label: '明细科目' },
      { key: 'summary', label: '摘要' },
      { key: 'debit', label: '借方发生额', align: 'right', mono: true },
      { key: 'credit', label: '贷方发生额', align: 'right', mono: true },
      { key: 'direction', label: '方向', align: 'center' },
      { key: 'balance', label: '余额', align: 'right', mono: true },
    ],
    meta: [
      { icon: Calendar, label: '会计期间', value: '2026-07' },
      { icon: BookOpen, label: '会计科目', value: '1002 银行存款 | 资产类' },
      { icon: Building2, label: '核算主体', value: '杭州星芒供应链有限公司' },
    ],
    rows: [
      { cells: ['期初', '—', '—', '上期结转', '', '', '借', '1,286,420.35'], flag: 'header' },
      { cells: ['07-08', '转字096号', '100201 银行存款—招商银行杭州分行', '收到平台结算款', '1,309,340.40', '', '借', '2,595,760.75'] },
      { cells: ['07-12', '转字128号', '100202 银行存款—工商银行上海分行', '支付采购或费用款', '1,072,188.00', '', '借', '1,523,572.75'] },
      { cells: ['07-18', '转字162号', '100203 银行存款—美元账户', '补充登记银行存款业务', '1,537,051.78', '', '借', '3,060,624.53'] },
      { cells: ['07-26', '转字186号', '100202 银行存款—工商银行上海分行', '结转或支付银行存款', '776,412.00', '', '借', '2,284,212.53'] },
      { cells: ['07-31', '—', '—', '本期发生额合计', '2,846,392.18', '1,848,600.00', '借', '2,284,212.53'], flag: 'total' },
      { cells: ['07-31', '—', '—', '期末余额', '', '', '借', '2,284,212.53'], flag: 'footer' },
    ],
  },
  memo: {
    id: 'memo',
    label: '备查账簿',
    sub: '备',
    desc: '辅助核算、固定资产等',
    pageFormat: '备查账簿（多栏式）',
    tableTitle: '备查账簿 · 租入固定资产登记簿',
    tableDesc: '登记主体：杭州星芒供应链有限公司　期间：2026年7月',
    columns: [
      { key: 'date', label: '登记日期' },
      { key: 'event', label: '业务事项' },
      { key: 'counterparty', label: '对方单位' },
      { key: 'summary', label: '摘要' },
      { key: 'amount', label: '数量/金额', align: 'right', mono: true },
      { key: 'keeper', label: '保管人' },
      { key: 'note', label: '备注' },
    ],
    meta: [
      { icon: Calendar, label: '会计期间', value: '2026-07' },
      { icon: BookOpen, label: '备查类型', value: '辅助核算 / 固定资产登记' },
      { icon: Building2, label: '核算主体', value: '杭州星芒供应链有限公司' },
    ],
    rows: [
      { cells: ['07-03', '租入设备', '杭州云栖科技', '融资租赁设备一台', '1台·¥360,000', '张敏', '租期24个月'] },
      { cells: ['07-10', '收到票据', '华东优选商贸', '收到商业承兑汇票', '1张·¥680,000', '王思雨', '到期2026-10-12'] },
      { cells: ['07-15', '股权质押', '星芒控股', '质押股份登记', '5%', '李娜', '期限12个月'] },
      { cells: ['07-22', '委托加工', '宁波智造', '发出材料委托加工', '2批·¥142,000', '赵磊', '收回在制'] },
      { cells: ['07-29', '保函担保', '招商银行', '借款保函担保', '¥500,000', '周涛', '连带责任'] },
    ],
  },
};

export function LedgerView() {
  const [bookType, setBookType] = useState<BookType>('classify');
  const book = books[bookType];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">ACCOUNTING BOOKS</div>
          <h1 className="page-title mt-1">会计账簿</h1>
          <p className="page-subtitle">
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
        {(Object.keys(books) as BookType[]).map((id) => {
          const b = books[id];
          return (
            <Button
              key={id}
              variant={bookType === id ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setBookType(id)}
              aria-pressed={bookType === id}
            >
              <Badge className="text-[10px] px-1 h-4">{b.sub}</Badge>
              <span className="text-xs">{b.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Query area */}
      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          {bookType === 'classify' && (
            <div className="flex items-center gap-2">
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general" className="text-xs">总分类账（一级科目）</TabsTrigger>
                  <TabsTrigger value="detail" className="text-xs">明细分类账（二/三级科目）</TabsTrigger>
                </TabsList>
                <TabsContent value="general" />
                <TabsContent value="detail" />
              </Tabs>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {book.meta.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{m.label}：</span>
                  <span className="font-medium">{m.value}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            适用账页格式：{book.pageFormat}
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => toast('已按当前条件查询账簿')}>
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
        </CardContent>
      </Card>

      {/* Three-column ledger */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{book.tableTitle}</CardTitle>
          <CardDescription>
            {book.tableDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                {book.columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {book.rows.map((row, i) => (
                <TableRow
                  key={i}
                  className={row.flag ? 'bg-muted/30 font-medium text-xs' : 'text-xs'}
                >
                  {row.cells.map((cell, j) => {
                    const col = book.columns[j];
                    return (
                      <TableCell
                        key={j}
                        className={cn(
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.mono && 'font-mono'
                        )}
                      >
                        {cell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
