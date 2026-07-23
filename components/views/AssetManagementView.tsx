'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Calculator, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export function AssetManagementView() {
  const [showNewCard, setShowNewCard] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">固定资产管理</h1>
          <p className="page-subtitle">
            维护固定资产卡片、折旧与变动记录；折旧计提与处置统一生成凭证草稿。
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast('盘点调整凭证草稿已进入待制证队列')}>
            生成折旧/盘点处理
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '资产原值', value: '¥276,600.00', sub: '3 张在用卡片' },
          { label: '累计折旧', value: '¥100,596.39', sub: '仅供资产净值查询' },
          { label: '资产净值', value: '¥176,003.61', sub: '无减值待处理' },
        ].map((s, i) => (
          <Card key={i} className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-xl font-bold font-mono mt-1">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset cards table */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">资产卡片台账</CardTitle>
              <CardDescription>一物一卡，购置、变更、调拨和处置均留痕</CardDescription>
            </div>
            <Dialog open={showNewCard} onOpenChange={setShowNewCard}>
              <DialogTrigger>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> 新增资产卡片
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增资产卡片</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div>
                    <Label>资产名称</Label>
                    <Input placeholder="输入资产名称" />
                  </div>
                  <div>
                    <Label>使用部门</Label>
                    <Input placeholder="输入使用部门" />
                  </div>
                  <div>
                    <Label>资产原值</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>使用年限</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>使用状态</Label>
                    <Select defaultValue="在用">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="在用">在用</SelectItem>
                        <SelectItem value="闲置">闲置</SelectItem>
                        <SelectItem value="报废">报废</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={() => { setShowNewCard(false); toast('资产卡片已保存，变更记录已留痕'); }}>
                    保存
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>卡片编号</TableHead>
                <TableHead>资产名称 / 部门</TableHead>
                <TableHead className="text-right">原值</TableHead>
                <TableHead className="text-right">累计折旧</TableHead>
                <TableHead className="text-right">净值</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'FA-2026-0188', name: '办公笔记本电脑', dept: '财务部', orig: '¥22,600.00', dep: '¥596.39', net: '¥22,003.61' },
                { id: 'FA-2025-0038', name: '仓储分拣设备', dept: '仓储运营部', orig: '¥186,000.00', dep: '¥55,800.00', net: '¥130,200.00' },
                { id: 'FA-2024-0016', name: '直播间摄影设备', dept: '直播运营部', orig: '¥68,000.00', dep: '¥44,200.00', net: '¥23,800.00' },
              ].map((a, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell>
                    <div className="text-sm">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.dept}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{a.orig}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{a.dep}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{a.net}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Pencil className="h-3 w-3 mr-1" /> 查看修改
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
