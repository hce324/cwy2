'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';

const balanceRows = [
  {
    code: '1001',
    name: '库存现金',
    obD: '84,200.00',
    obC: '',
    cbD: '12,000.00',
    cbC: '8,600.00',
    acD: '152,400.00',
    acC: '148,800.00',
    ebD: '87,600.00',
    ebC: '',
  },
  {
    code: '1002',
    name: '银行存款',
    obD: '1,286,420.35',
    obC: '',
    cbD: '2,846,392.18',
    cbC: '1,735,600.00',
    acD: '18,624,820.40',
    acC: '17,514,028.22',
    ebD: '2,397,212.53',
    ebC: '',
    isParent: true,
  },
  {
    code: '100201',
    name: '招商银行杭州分行',
    obD: '786,420.35',
    obC: '',
    cbD: '1,086,392.18',
    cbC: '735,600.00',
    acD: '7,624,820.40',
    acC: '7,014,028.22',
    ebD: '1,137,212.53',
    ebC: '',
    indent: true,
  },
  {
    code: '100202',
    name: '支付宝企业账户',
    obD: '500,000.00',
    obC: '',
    cbD: '1,760,000.00',
    cbC: '1,000,000.00',
    acD: '11,000,000.00',
    acC: '10,500,000.00',
    ebD: '1,260,000.00',
    ebC: '',
    indent: true,
  },
  {
    code: '1122',
    name: '应收账款',
    obD: '986,240.00',
    obC: '',
    cbD: '428,631.42',
    cbC: '128,471.42',
    acD: '2,686,420.00',
    acC: '2,386,260.00',
    ebD: '1,286,400.00',
    ebC: '',
  },
  {
    code: '1405',
    name: '库存商品',
    obD: '1,875,600.00',
    obC: '',
    cbD: '113,000.00',
    cbC: '',
    acD: '1,248,600.00',
    acC: '998,200.00',
    ebD: '2,126,000.00',
    ebC: '',
  },
  {
    code: '1601',
    name: '固定资产',
    obD: '544,000.00',
    obC: '',
    cbD: '22,600.00',
    cbC: '',
    acD: '186,200.00',
    acC: '',
    ebD: '566,600.00',
    ebC: '',
  },
  {
    code: '2202',
    name: '应付账款',
    obD: '',
    obC: '1,520,000.00',
    cbD: '210,000.00',
    cbC: '535,600.00',
    acD: '1,420,000.00',
    acC: '1,745,600.00',
    ebD: '',
    ebC: '1,845,600.00',
  },
  {
    code: '2221',
    name: '应交税费',
    obD: '',
    obC: '326,280.00',
    cbD: '428,360.00',
    cbC: '530,440.00',
    acD: '2,958,420.00',
    acC: '3,060,500.00',
    ebD: '',
    ebC: '428,360.00',
  },
  {
    code: '4001',
    name: '实收资本',
    obD: '',
    obC: '3,000,000.00',
    cbD: '',
    cbC: '',
    acD: '',
    acC: '',
    ebD: '',
    ebC: '3,000,000.00',
  },
];

export function BalanceView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">TRIAL BALANCE</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">科目余额表</h1>
          <p className="text-sm text-muted-foreground mt-1">
            由已记账凭证实时汇总，支持逐级展开并联查明细账。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Scale className="h-4 w-4" /> 试算平衡检查
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast('已导出当前账簿')}>
            <Download className="h-4 w-4" /> 导出Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Trial balance check badge */}
      <div className="flex items-center gap-2 bg-success/10 rounded-lg p-3">
        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
        <span className="text-sm text-success">
          ✓ 试算平衡 — 期初借方＝期初贷方；本期借方＝本期贷方；期末借方＝期末贷方（本期发生额 ¥3,218,442.18）
        </span>
      </div>

      {/* Balance table */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>编码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="text-right">期初借方</TableHead>
                <TableHead className="text-right">期初贷方</TableHead>
                <TableHead className="text-right">本期借方</TableHead>
                <TableHead className="text-right">本期贷方</TableHead>
                <TableHead className="text-right">累计借方</TableHead>
                <TableHead className="text-right">累计贷方</TableHead>
                <TableHead className="text-right">期末借方</TableHead>
                <TableHead className="text-right">期末贷方</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceRows.map((row, i) => (
                <TableRow
                  key={i}
                  className={
                    row.isParent
                      ? 'bg-muted/30 font-medium text-xs'
                      : 'text-xs'
                  }
                >
                  <TableCell className={row.indent ? 'pl-6' : ''}>{row.code}</TableCell>
                  <TableCell className={row.indent ? 'pl-6' : ''}>{row.name}</TableCell>
                  <TableCell className="text-right font-mono">{row.obD}</TableCell>
                  <TableCell className="text-right font-mono">{row.obC}</TableCell>
                  <TableCell className="text-right font-mono">{row.cbD}</TableCell>
                  <TableCell className="text-right font-mono">{row.cbC}</TableCell>
                  <TableCell className="text-right font-mono">{row.acD}</TableCell>
                  <TableCell className="text-right font-mono">{row.acC}</TableCell>
                  <TableCell className="text-right font-mono">{row.ebD}</TableCell>
                  <TableCell className="text-right font-mono">{row.ebC}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
