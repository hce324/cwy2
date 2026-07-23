'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, FileText, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

export function BusinessEntryView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">业务录入</h1>
          <p className="page-subtitle">
            录入收入、费用、采购、销售及收付款业务；通过基础校验后自动生成凭证草稿。
          </p>
        </div>
        <Button size="sm" onClick={() => toast('已保存为草稿，可继续修改')}>
          保存并生成凭证草稿
        </Button>
      </div>

      <Separator />

      <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-3 text-sm">
        <Shield className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground text-xs">
          ✓ 操作权限与复核控制 — 保存、修改与提交复核均记录操作人和时间；审核、反审核及结账按岗位权限执行。
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => toast('已保存为草稿，可继续修改')}>
          保存草稿
        </Button>
      </div>

      <Card className="elevation-1">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>业务</TableHead>
                <TableHead>借贷方向</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: '销售结算', direction: '确认收入 / 应收账款', amount: '¥86,392.18' },
                { name: '采购入库', direction: '库存商品 / 应付账款', amount: '¥113,000.00' },
                { name: '费用报销', direction: '管理费用 / 银行存款', amount: '¥860.00' },
                { name: '客户收款', direction: '银行存款 / 应收账款', amount: '¥180,000.00' },
                { name: '供应商付款', direction: '应付账款 / 银行存款', amount: '¥76,800.00' },
              ].map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm">{item.direction}</TableCell>
                  <TableCell className="text-right font-mono">{item.amount}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">查看</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">修改</Button>
                    </div>
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
