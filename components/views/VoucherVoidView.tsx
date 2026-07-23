'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function VoucherVoidView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER VOID</div>
        <h1 className="text-2xl font-heading font-bold text-foreground mt-1">作废凭证</h1>
        <p className="text-sm text-muted-foreground mt-1">
          仅可作废未记账且未结账期间的凭证。作废不删除原始记录，须保留作废原因、操作人和审计轨迹。
        </p>
      </div>

      <Separator />

      <Card className="elevation-1">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">会计期间：</span>
              <span className="font-medium">2026年7月</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">凭证状态：</span>
              <span className="font-medium">待审核</span>
            </div>
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
            选择一张待审核凭证执行作废；已作废凭证不再参与记账、报表和审核。
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
              {[
                { id: '记字138号', date: '2026-07-13', summary: '采购蓝牙耳机入库', amount: '¥113,000.00', status: '待审核' },
                { id: '转字066号', date: '2026-07-12', summary: '平台服务费暂估', amount: '¥6,800.00', status: '待审核' },
              ].map((item, i) => (
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
