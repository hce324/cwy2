'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

export function VoucherOrganizeView() {
  const handleExecute = () => {
    toast('整理完成：相关数据已写入共享账务数据');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER ARRANGEMENT</div>
        <h1 className="text-2xl font-heading font-bold text-foreground mt-1">整理凭证</h1>
        <p className="text-sm text-muted-foreground mt-1">
          按用友U8的处理逻辑，删除当前期间已作废、未审核且未记账的凭证，并可将剩余未记账凭证重新连续编号。
        </p>
      </div>

      <Separator />

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            会计期间与整理选项
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">会计期间：</span>
            <span className="font-medium">2026年7月</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">整理选项：</p>
            <RadioGroup defaultValue="delete-and-reorder">
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="delete-and-reorder" id="r1" />
                <Label htmlFor="r1" className="text-sm">删除作废凭证并整理断号</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="delete-only" id="r2" />
                <Label htmlFor="r2" className="text-sm">仅删除作废凭证，不整理断号</Label>
              </div>
            </RadioGroup>
          </div>

          <Button size="sm" className="mt-2" onClick={handleExecute}>
            执行凭证整理
          </Button>
          <p className="text-xs text-muted-foreground mt-1">仅会计专员可操作</p>
        </CardContent>
      </Card>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">作废凭证清单</CardTitle>
          <CardDescription>
            仅显示已作废、未审核、未记账的凭证；整理后将从当前期间凭证库移除。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">选择</TableHead>
                <TableHead>原凭证字号</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>摘要</TableHead>
                <TableHead>作废状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Checkbox /></TableCell>
                <TableCell className="font-medium">记字138号</TableCell>
                <TableCell>2026-07-13</TableCell>
                <TableCell>采购蓝牙耳机入库</TableCell>
                <TableCell>
                  <span className="text-[10px] bg-danger/10 text-danger rounded px-1.5 py-0.5">已作废 · 等待凭证整理</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Checkbox /></TableCell>
                <TableCell className="font-medium">转字066号</TableCell>
                <TableCell>2026-07-12</TableCell>
                <TableCell>平台服务费暂估</TableCell>
                <TableCell>
                  <span className="text-[10px] bg-danger/10 text-danger rounded px-1.5 py-0.5">已作废 · 等待凭证整理</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
