'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { fmtDate, fmtAmount } from '@/lib/format';

// ─── Helpers ────────────────────────────────────────────────────────

const YEARS = ['2026'];
const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function fmtVoucherNo(v: { voucherWord: string; voucherNumber: number }): string {
  return `${v.voucherWord}字${v.voucherNumber}号`;
}

// ─── Component ──────────────────────────────────────────────────────

export function VoucherVoidView() {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('07');
  const [voidingId, setVoidingId] = useState<number | null>(null);

  // ─── tRPC query: fetch pending vouchers that can be voided ─────
  const listQuery = trpc.voucher.list.useQuery({
    auditStatus: 'pending',
    year,
    month,
    limit: 100,
    offset: 0,
  });

  // Client-side: only show vouchers that haven't been voided yet
  const items = (listQuery.data?.items ?? []).filter(
    (v) => v.status !== 'voided' && !v.isVoided,
  );

  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── tRPC mutation: void a voucher ────────────────────────────────

  const utils = trpc.useUtils();
  const voidMutation = trpc.voucher.void.useMutation({
    onSuccess: () => {
      toast.success('作废完成：相关数据已写入共享账务数据');
      setVoidingId(null);
      utils.voucher.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '作废失败，请重试');
      setVoidingId(null);
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleVoid = (id: bigint | number) => {
    const numId = Number(id);
    setVoidingId(numId);
    voidMutation.mutate({
      id: numId,
      reason: '用户主动作废',
    });
  };

  const handleReset = () => {
    setYear('2026');
    setMonth('07');
    toast.info('已重置为当前会计期间');
  };

  // ─── Render ───────────────────────────────────────────────────────

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

      {/* Filter bar */}
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
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={month} onValueChange={(v) => setMonth(v ?? month)}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
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

      {/* Voidable voucher table */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">可作废凭证</CardTitle>
          <CardDescription>
            {year}年{month}月 · 选择一张待审核凭证执行作废；已作废凭证不再参与记账、报表和审核。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{errorMsg || '无法获取凭证列表，请检查网络连接后重试'}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {year}年{month}月 暂无可作废的待审核凭证
            </div>
          ) : (
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
                {items.map((item) => (
                  <TableRow key={String(item.id)}>
                    <TableCell className="font-medium">
                      {fmtVoucherNo({ voucherWord: item.voucherWord, voucherNumber: item.voucherNumber })}
                    </TableCell>
                    <TableCell>{fmtDate(item.voucherDate)}</TableCell>
                    <TableCell>{item.summary}</TableCell>
                    <TableCell className="text-right font-mono">
                      {fmtAmount(item.debitAmount)}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] bg-warning/10 text-warning rounded px-1.5 py-0.5">
                        待审核
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              'h-7 text-xs',
                              'text-danger hover:bg-danger/10',
                            )}
                            disabled={voidMutation.isPending}
                          >
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
                              onClick={() => handleVoid(item.id)}
                              className="bg-danger hover:brightness-90"
                              disabled={voidMutation.isPending}
                            >
                              {voidingId === Number(item.id) ? '作废中...' : '确认作废'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
