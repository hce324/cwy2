'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Building2, Calculator, Pencil } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtCurrency(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function fmtAssetCode(asset: { id: bigint | number; assetCode?: string | null; category: string }): string {
  if (asset.assetCode) return asset.assetCode;
  const prefix: Record<string, string> = {
    '电子设备': 'FA-ED',
    '运输设备': 'FA-TR',
    '机械设备': 'FA-MC',
    '办公设备': 'FA-OF',
    '房屋建筑': 'FA-BD',
  };
  const pfx = prefix[asset.category] ?? 'FA';
  return `${pfx}-${String(asset.id).padStart(4, '0')}`;
}

// ============================================================================
// Main Component
// ============================================================================

export function AssetManagementView() {
  const [showNewCard, setShowNewCard] = useState(false);

  // ─── Create form state ─────────────────────────────────────────────
  const [formAssetName, setFormAssetName] = useState('');
  const [formCategory, setFormCategory] = useState('电子设备');
  const [formDept, setFormDept] = useState('');
  const [formOrigValue, setFormOrigValue] = useState('');
  const [formLifeYears, setFormLifeYears] = useState('');
  const [formStatus, setFormStatus] = useState('在用');

  // ─── Queries ───────────────────────────────────────────────────────
  const utils = trpc.useUtils();

  const listQuery = trpc.asset.list.useQuery();
  const statsQuery = trpc.asset.stats.useQuery();

  const assets = listQuery.data ?? [];
  const stats = statsQuery.data;

  const isListLoading = listQuery.isLoading;
  const isStatsLoading = statsQuery.isLoading;
  const isListError = listQuery.isError;
  const isStatsError = statsQuery.isError;
  const listErrorMsg = listQuery.error?.message;
  const statsErrorMsg = statsQuery.error?.message;

  const isLoading = isListLoading || isStatsLoading;
  const isError = (!isListLoading && isListError) || (!isStatsLoading && isStatsError);
  const errorMsg = listErrorMsg || statsErrorMsg || '数据加载失败';

  // ─── Mutation ──────────────────────────────────────────────────────
  const createMutation = trpc.asset.create.useMutation({
    onSuccess: () => {
      toast.success('资产卡片已保存，变更记录已留痕');
      setShowNewCard(false);
      resetForm();
      utils.asset.list.invalidate();
      utils.asset.stats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '保存失败，请重试');
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────
  const resetForm = () => {
    setFormAssetName('');
    setFormCategory('电子设备');
    setFormDept('');
    setFormOrigValue('');
    setFormLifeYears('');
    setFormStatus('在用');
  };

  const handleCreate = () => {
    if (!formAssetName || !formOrigValue || !formLifeYears) {
      toast.error('请填写资产名称、原值和使用年限');
      return;
    }
    const origVal = parseFloat(formOrigValue);
    const lifeYears = parseInt(formLifeYears, 10);
    if (isNaN(origVal) || origVal <= 0) {
      toast.error('请输入有效的资产原值');
      return;
    }
    if (isNaN(lifeYears) || lifeYears <= 0) {
      toast.error('请输入有效的使用年限');
      return;
    }
    createMutation.mutate({
      assetName: formAssetName,
      category: formCategory,
      departmentName: formDept || undefined,
      originalValue: origVal,
      usefulLifeYears: lifeYears,
      status: formStatus,
    });
  };

  // ─── Render helpers ────────────────────────────────────────────────

  const renderSkeletonStatCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="elevation-1">
          <CardContent className="pt-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-36 mt-1" />
            <Skeleton className="h-3 w-28 mt-0.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSkeletonTable = (rows: number = 3) => (
    <Card className="elevation-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-28 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ====================================================================
  // Render
  // ====================================================================

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
      {isLoading ? (
        renderSkeletonStatCards()
      ) : isStatsError ? (
        <Alert variant="destructive">
          <AlertTitle>统计数据加载失败</AlertTitle>
          <AlertDescription>{statsErrorMsg || '无法获取资产统计数据'}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">资产原值</div>
              <div className="text-xl font-bold font-mono mt-1">
                {stats ? fmtCurrency(stats.originalValue) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {stats ? `${stats.count} 张在用卡片` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">累计折旧</div>
              <div className="text-xl font-bold font-mono mt-1">
                {stats ? fmtCurrency(stats.accumulatedDepreciation) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">仅供资产净值查询</div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">资产净值</div>
              <div className="text-xl font-bold font-mono mt-1">
                {stats ? fmtCurrency(stats.netValue) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">无减值待处理</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Asset cards table */}
      {isLoading ? (
        renderSkeletonTable()
      ) : isListError ? (
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">资产卡片台账</CardTitle>
                <CardDescription>一物一卡，购置、变更、调拨和处置均留痕</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>资产列表加载失败</AlertTitle>
              <AlertDescription>{listErrorMsg || '无法获取资产卡片数据'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : assets.length === 0 ? (
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
                      <Input
                        placeholder="输入资产名称"
                        value={formAssetName}
                        onChange={(e) => setFormAssetName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用部门</Label>
                      <Input
                        placeholder="输入使用部门"
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>资产原值</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formOrigValue}
                        onChange={(e) => setFormOrigValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用年限</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formLifeYears}
                        onChange={(e) => setFormLifeYears(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用状态</Label>
                      <Select value={formStatus} onValueChange={(v) => setFormStatus(v ?? '在用')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="在用">在用</SelectItem>
                          <SelectItem value="闲置">闲置</SelectItem>
                          <SelectItem value="报废">报废</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" disabled={createMutation.isPending} onClick={handleCreate}>
                      {createMutation.isPending ? '保存中...' : '保存'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无资产卡片，点击"新增资产卡片"添加第一条记录
            </div>
          </CardContent>
        </Card>
      ) : (
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
                      <Input
                        placeholder="输入资产名称"
                        value={formAssetName}
                        onChange={(e) => setFormAssetName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用部门</Label>
                      <Input
                        placeholder="输入使用部门"
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>资产原值</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formOrigValue}
                        onChange={(e) => setFormOrigValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用年限</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formLifeYears}
                        onChange={(e) => setFormLifeYears(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>使用状态</Label>
                      <Select value={formStatus} onValueChange={(v) => setFormStatus(v ?? '在用')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="在用">在用</SelectItem>
                          <SelectItem value="闲置">闲置</SelectItem>
                          <SelectItem value="报废">报废</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" disabled={createMutation.isPending} onClick={handleCreate}>
                      {createMutation.isPending ? '保存中...' : '保存'}
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
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-xs">
                      {fmtAssetCode(asset)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{asset.assetName}</div>
                      <div className="text-xs text-muted-foreground">
                        {asset.departmentName ?? '未分配'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmtCurrency(asset.originalValue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmtCurrency(asset.accumulatedDepreciation)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmtCurrency(asset.netValue ?? Number(asset.originalValue) - Number(asset.accumulatedDepreciation))}
                    </TableCell>
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
      )}
    </div>
  );
}
