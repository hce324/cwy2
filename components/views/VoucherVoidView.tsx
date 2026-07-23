'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

interface VoidableVoucher {
  id: string;
  date: string;
  summary: string;
  amount: string;
  status: string;
}

// 覆盖多个月份的样本数据，便于切换会计期间时真实过滤
const VOIDABLE_VOUCHERS: VoidableVoucher[] = [
  { id: '记字138号', date: '2026-07-13', summary: '采购蓝牙耳机入库', amount: '¥113,000.00', status: '待审核' },
  { id: '转字066号', date: '2026-07-12', summary: '平台服务费暂估', amount: '¥6,800.00', status: '待审核' },
  { id: '记字121号', date: '2026-06-28', summary: '支付 6 月办公租金', amount: '¥24,000.00', status: '待审核' },
  { id: '转字059号', date: '2026-06-25', summary: '计提 6 月固定资产折旧', amount: '¥9,420.00', status: '待审核' },
  { id: '付字098号', date: '2026-05-20', summary: '预付二季度宽带费', amount: '¥3,600.00', status: '待审核' },
];

const YEARS = ['2026'];
const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

export function VoucherVoidView() {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('07');

  const filtered = useMemo(
    () => VOIDABLE_VOUCHERS.filter(v => v.date.startsWith(`${year}-${month}`)),
    [year, month]
  );

  const handleReset = () => {
    setYear('2026');
    setMonth('07');
    toast.info('已重置为当前会计期间');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER VOID</div>
        <h1 className="page-title mt-1">作废凭证</h1>
        <p className="text-sm text-muted-foreground mt-1">
          仅可作废未记账且未结账期间的凭证。作废不删除原始记录，须保留作废原因、操作人和审计轨迹。
        </p>
      </div>

      <Separator />

      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">会计期间：</span>
              <Select value={year} onValueChange={(v) => setYear(v ?? year)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={month} onValueChange={(v) => setMonth(v ?? month)}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => (
                    <SelectItem key={m} value={m}>{m}月</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">凭证状态：</span>
              <span className="font-medium">待审核</span>
            </div>
            <RippleContainer className="ripple-container rounded-md ml-auto">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" /> 重置期间
              </Button>
            </RippleContainer>
          </div>
          <p className="text-xs text-muted-foreground">
            已审核凭证须先由财务负责人反审核
          </p>
        </CardContent>
      </Card>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">可作废凭证</CardTitle>
          <CardDescription>
            {year}年{month}月 · 选择一张待审核凭证执行作废；已作废凭证不再参与记账、报表和审核。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>凭证字号</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>摘要</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.summary}</TableCell>
                  <TableCell className="text-right font-mono">{item.amount}</TableCell>
                  <TableCell>
                    <span className="text-[10px] bg-warning/10 text-warning rounded px-1.5 py-0.5">{item.status}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-danger">
                          <Trash2 className="h-3 w-3 mr-1" /> 作废此凭证
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-danger" />
                            确认作废凭证
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            作废后凭证将不再参与记账、报表和审核。作废原因和操作人将被记录在审计轨迹中。此操作不可撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toast('作废完成：相关数据已写入共享账务数据')}
                            className="bg-danger hover:brightness-90"
                          >
                            确认作废
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                    {year}年{month}月 暂无可作废的待审核凭证
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
