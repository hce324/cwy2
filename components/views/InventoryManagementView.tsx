'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Download,
  Package,
  AlertTriangle,
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Truck,
  ShoppingCart,
  RefreshCw,
  FileText,
  Calculator,
  PenLine,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type DocStatus = '已完成' | '待审批' | '待执行' | '已完成' | '调拨中' | '已收货';

function statusVariant(s: string | undefined): { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' } {
  switch (s) {
    case '已完成':
      return { label: '已完成', variant: 'default' };
    case '已审核':
      return { label: '已审核', variant: 'default' };
    case '已收货':
      return { label: '已收货', variant: 'default' };
    case '待审批':
      return { label: '待审批', variant: 'secondary' };
    case '调拨中':
      return { label: '调拨中', variant: 'secondary' };
    case '待执行':
      return { label: '待执行', variant: 'outline' };
    default:
      return { label: s ?? '—', variant: 'outline' };
  }
}

function stockStatusLabel(qty: number, safety: number): { label: string; variant: 'destructive' | 'secondary' | 'outline' } {
  if (qty <= safety) return { label: '库存不足', variant: 'destructive' };
  if (qty < safety + 80) return { label: '低库存', variant: 'secondary' };
  return { label: '正常', variant: 'outline' };
}

const INBOUND_TYPE_ICON: Record<string, React.ReactNode> = {
  '采购入库': <Truck className="h-4 w-4 text-success" />,
  '退货入库': <RefreshCw className="h-4 w-4 text-warning" />,
  '盘盈入库': <TrendingUp className="h-4 w-4 text-primary" />,
};

const OUTBOUND_TYPE_ICON: Record<string, React.ReactNode> = {
  '销售出库': <ShoppingCart className="h-4 w-4 text-primary" />,
  '领料出库': <ClipboardList className="h-4 w-4 text-warning" />,
  '报废出库': <TrendingDown className="h-4 w-4 text-destructive" />,
};

function fmtAmount(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function InventoryManagementView() {
  /* 盘点流程 step state */
  const [checkStep, setCheckStep] = useState(1);
  const TOTAL_CHECK_STEPS = 5;

  /* Simple doc dialog state */
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docDialogType, setDocDialogType] = useState<'inbound' | 'outbound' | 'transfer'>('inbound');

  /* Filter state */
  const [ledgerWarehouse, setLedgerWarehouse] = useState<string>('all');
  const [inboundWarehouse, setInboundWarehouse] = useState<string>('all');
  const [outboundWarehouse, setOutboundWarehouse] = useState<string>('all');

  /* ── Queries ──────────────────────────────────────────────────── */

  const itemsQuery = trpc.inventory.listItems.useQuery({
    warehouse: ledgerWarehouse !== 'all' ? ledgerWarehouse : undefined,
    limit: 50,
    offset: 0,
  });

  const inboundsQuery = trpc.inventory.listInbounds.useQuery({
    warehouse: inboundWarehouse !== 'all' ? inboundWarehouse : undefined,
    limit: 50,
    offset: 0,
  });

  const outboundsQuery = trpc.inventory.listOutbounds.useQuery({
    warehouse: outboundWarehouse !== 'all' ? outboundWarehouse : undefined,
    limit: 50,
    offset: 0,
  });

  const statsQuery = trpc.inventory.stockSummary.useQuery();

  /* ── Derived data ─────────────────────────────────────────────── */

  const ledgerItems = itemsQuery.data?.items ?? [];
  const inboundDocs = inboundsQuery.data?.items ?? [];
  const outboundDocs = outboundsQuery.data?.items ?? [];
  const stats = statsQuery.data;

  const stockAlerts = ledgerItems.filter((i) => i.quantity <= i.safetyStock + 50);

  const isLedgerLoading = itemsQuery.isLoading;
  const isLedgerError = itemsQuery.isError;
  const ledgerErrorMsg = itemsQuery.error?.message;

  const isInboundsLoading = inboundsQuery.isLoading;
  const isInboundsError = inboundsQuery.isError;
  const inboundsErrorMsg = inboundsQuery.error?.message;

  const isOutboundsLoading = outboundsQuery.isLoading;
  const isOutboundsError = outboundsQuery.isError;
  const outboundsErrorMsg = outboundsQuery.error?.message;

  const isStatsLoading = statsQuery.isLoading;

  /* TODO: 盘点单 & 调拨单暂用静态数据 */
  const CHECK_DOCS = [
    { id: 'PD-20260731-01', type: '月度库存盘点', date: '2026-07-31', warehouse: '杭州主仓', scope: '全仓', status: '待执行' as const },
    { id: 'PD-20260731-02', type: '月度库存盘点', date: '2026-07-31', warehouse: '上海前置仓', scope: '全仓', status: '待执行' as const },
    { id: 'PD-20260715-03', type: '临时抽盘', date: '2026-07-15', warehouse: '杭州主仓', scope: '电子品类', status: '已完成' as const },
  ];

  const TRANSFER_DOCS = [
    { id: 'DB-20260714-01', type: '仓间调拨', date: '2026-07-14', from: '杭州主仓', to: '上海前置仓', items: 3, status: '调拨中' as const },
    { id: 'TZ-20260712-02', type: '库存调整', date: '2026-07-12', from: '—', to: '—', items: 1, status: '已审核' as const },
    { id: 'DB-20260710-03', type: '仓间调拨', date: '2026-07-10', from: '上海前置仓', to: '杭州主仓', items: 2, status: '已收货' as const },
  ];

  /* ── Skeleton rows for loading ────────────────────────────────── */

  const renderSkeletonRows = (cols: number, rows = 5) =>
    Array.from({ length: rows }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        {Array.from({ length: cols }).map((_, j) => (
          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
        ))}
      </TableRow>
    ));

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="p-6 space-y-6">
      {/* ================================================================ */}
      {/* Header                                                           */}
      {/* ================================================================ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">库存管理</h1>
          <p className="page-subtitle">
            记录入库、出库、调拨与盘点；实时查询收发存汇总与安全库存预警。
          </p>
        </div>
        <div className="flex gap-2">
          {stockAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-warning/30 bg-warning/5 text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              安全库存预警 {stockAlerts.length} 项
            </div>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast('已导出当前库存台账')}>
            <Download className="h-4 w-4" /> 导出台账
          </Button>
        </div>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/* Tabs                                                             */}
      {/* ================================================================ */}
      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger" className="text-xs">库存台账</TabsTrigger>
          <TabsTrigger value="inbound" className="text-xs">入库单</TabsTrigger>
          <TabsTrigger value="outbound" className="text-xs">出库单</TabsTrigger>
          <TabsTrigger value="check" className="text-xs">盘点单</TabsTrigger>
          <TabsTrigger value="transfer" className="text-xs">调拨与调整</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs">收发存汇总</TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* 库存台账                                                         */}
        {/* ============================================================== */}
        <TabsContent value="ledger">
          <Card className="elevation-1 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">库存台账</CardTitle>
                  <CardDescription>反映存货实时数量与价值；出入库变动逐笔更新</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={ledgerWarehouse} onValueChange={(v) => setLedgerWarehouse(v ?? 'all')}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                      <SelectValue placeholder="全部仓库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部仓库</SelectItem>
                      <SelectItem value="杭州主仓">杭州主仓</SelectItem>
                      <SelectItem value="上海前置仓">上海前置仓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLedgerLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>存货编码</TableHead>
                      <TableHead>存货名称</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">现存数量</TableHead>
                      <TableHead className="text-right">安全库存</TableHead>
                      <TableHead className="text-right">单位成本</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderSkeletonRows(8)}</TableBody>
                </Table>
              ) : isLedgerError ? (
                <Alert variant="destructive">
                  <AlertTitle>数据加载失败</AlertTitle>
                  <AlertDescription>{ledgerErrorMsg || '无法获取库存台账，请检查网络连接后重试'}</AlertDescription>
                </Alert>
              ) : ledgerItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  暂无库存数据，请先录入存货信息
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>存货编码</TableHead>
                      <TableHead>存货名称</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">现存数量</TableHead>
                      <TableHead className="text-right">安全库存</TableHead>
                      <TableHead className="text-right">单位成本</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerItems.map((item) => {
                      const ss = stockStatusLabel(item.quantity, item.safetyStock);
                      return (
                        <TableRow key={String(item.id)}>
                          <TableCell className="font-mono text-xs">{item.skuCode}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{item.skuName}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </TableCell>
                          <TableCell className="text-sm">{item.warehouse}</TableCell>
                          <TableCell className="text-right">
                            <span className={item.quantity <= item.safetyStock ? 'text-destructive font-semibold' : ''}>
                              {item.quantity.toLocaleString()} 件
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm">{item.safetyStock} 件</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmtAmount(item.unitCost)}</TableCell>
                          <TableCell>
                            <Badge variant={ss.variant}>{ss.label}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast(`查看 ${item.skuName} 明细账`)}>
                              查看明细
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 安全库存预警卡片 */}
          {stockAlerts.length > 0 && (
            <Card className="elevation-1 mt-4 border-l-[3px] border-l-warning">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">安全库存预警</span>
                </div>
                <div className="space-y-2">
                  {stockAlerts.map((item) => (
                    <div key={String(item.id)} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        {item.skuName}（{item.skuCode}）
                      </span>
                      <span className="text-destructive font-medium">
                        {item.quantity} / {item.safetyStock} 件
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============================================================== */}
        {/* 入库单                                                          */}
        {/* ============================================================== */}
        <TabsContent value="inbound">
          <Card className="elevation-1 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">入库单</CardTitle>
                  <CardDescription>采购入库、退货入库、盘盈入库等增加库存的业务单据</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={inboundWarehouse} onValueChange={(v) => setInboundWarehouse(v ?? 'all')}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                      <SelectValue placeholder="全部仓库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部仓库</SelectItem>
                      <SelectItem value="杭州主仓">杭州主仓</SelectItem>
                      <SelectItem value="上海前置仓">上海前置仓</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { setDocDialogType('inbound'); setDocDialogOpen(true); }}
                  >
                    <Plus className="h-4 w-4" /> 新增入库单
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isInboundsLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>单据编号</TableHead>
                      <TableHead>业务类型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">行数</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderSkeletonRows(8)}</TableBody>
                </Table>
              ) : isInboundsError ? (
                <Alert variant="destructive">
                  <AlertTitle>数据加载失败</AlertTitle>
                  <AlertDescription>{inboundsErrorMsg || '无法获取入库单列表，请检查网络连接后重试'}</AlertDescription>
                </Alert>
              ) : inboundDocs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  暂无入库单，点击"新增入库单"创建第一张入库单
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>单据编号</TableHead>
                      <TableHead>业务类型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">行数</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inboundDocs.map((doc) => {
                      const s = statusVariant(doc.status);
                      const docDate = doc.inboundDate instanceof Date
                        ? doc.inboundDate.toISOString().slice(0, 10)
                        : String(doc.inboundDate ?? '').slice(0, 10);
                      return (
                        <TableRow key={String(doc.id)}>
                          <TableCell className="font-mono text-xs">{doc.docNo}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm">
                              {INBOUND_TYPE_ICON[doc.type] ?? <Package className="h-4 w-4 text-muted-foreground" />}
                              {doc.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{docDate}</TableCell>
                          <TableCell className="text-sm">{doc.warehouse}</TableCell>
                          <TableCell className="text-right text-sm">{doc.itemCount}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmtAmount(doc.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast(`查看 ${doc.docNo} 详情`)}>
                              查看
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> 采购入库</span>
                <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> 退货入库</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> 盘盈入库</span>
                <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> 其他入库</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* 出库单                                                          */}
        {/* ============================================================== */}
        <TabsContent value="outbound">
          <Card className="elevation-1 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">出库单</CardTitle>
                  <CardDescription>销售出库、领料出库、报废出库等减少库存的业务单据</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={outboundWarehouse} onValueChange={(v) => setOutboundWarehouse(v ?? 'all')}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                      <SelectValue placeholder="全部仓库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部仓库</SelectItem>
                      <SelectItem value="杭州主仓">杭州主仓</SelectItem>
                      <SelectItem value="上海前置仓">上海前置仓</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { setDocDialogType('outbound'); setDocDialogOpen(true); }}
                  >
                    <Plus className="h-4 w-4" /> 新增出库单
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isOutboundsLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>单据编号</TableHead>
                      <TableHead>业务类型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">行数</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderSkeletonRows(8)}</TableBody>
                </Table>
              ) : isOutboundsError ? (
                <Alert variant="destructive">
                  <AlertTitle>数据加载失败</AlertTitle>
                  <AlertDescription>{outboundsErrorMsg || '无法获取出库单列表，请检查网络连接后重试'}</AlertDescription>
                </Alert>
              ) : outboundDocs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  暂无出库单，点击"新增出库单"创建第一张出库单
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>单据编号</TableHead>
                      <TableHead>业务类型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead className="text-right">行数</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outboundDocs.map((doc) => {
                      const s = statusVariant(doc.status);
                      const docDate = doc.outboundDate instanceof Date
                        ? doc.outboundDate.toISOString().slice(0, 10)
                        : String(doc.outboundDate ?? '').slice(0, 10);
                      return (
                        <TableRow key={String(doc.id)}>
                          <TableCell className="font-mono text-xs">{doc.docNo}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm">
                              {OUTBOUND_TYPE_ICON[doc.type] ?? <Package className="h-4 w-4 text-muted-foreground" />}
                              {doc.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{docDate}</TableCell>
                          <TableCell className="text-sm">{doc.warehouse}</TableCell>
                          <TableCell className="text-right text-sm">{doc.itemCount}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmtAmount(doc.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast(`查看 ${doc.docNo} 详情`)}>
                              查看
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> 销售出库</span>
                <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> 领料出库</span>
                <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> 报废出库</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> 其他出库</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* 盘点单 — 交互式盘点流程                                          */}
        {/* ============================================================== */}
        <TabsContent value="check">
          {/* 步骤指示器 */}
          <Card className="elevation-1 mt-4">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                {[
                  { step: 1, label: '制定盘点计划', icon: <PenLine className="h-4 w-4" /> },
                  { step: 2, label: '下发盘点任务', icon: <FileText className="h-4 w-4" /> },
                  { step: 3, label: '录入实盘数量', icon: <Calculator className="h-4 w-4" /> },
                  { step: 4, label: '差异分析', icon: <Search className="h-4 w-4" /> },
                  { step: 5, label: '生成调整单', icon: <Check className="h-4 w-4" /> },
                ].map((s) => {
                  const isActive = checkStep === s.step;
                  const isDone = checkStep > s.step;
                  return (
                    <div key={s.step} className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => setCheckStep(s.step)}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all',
                          isActive && 'bg-primary text-primary-foreground font-medium',
                          isDone && 'bg-primary/10 text-primary',
                          !isActive && !isDone && 'text-muted-foreground hover:bg-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                            isActive && 'bg-primary-foreground/20',
                            isDone && 'bg-primary text-primary-foreground',
                            !isActive && !isDone && 'bg-muted text-muted-foreground',
                          )}
                        >
                          {isDone ? <Check className="h-3 w-3" /> : s.step}
                        </span>
                        {s.label}
                      </button>
                      {s.step < 5 && <Separator className="flex-1" orientation="horizontal" />}
                    </div>
                  );
                })}
              </div>
              <Progress value={((checkStep - 1) / (TOTAL_CHECK_STEPS - 1)) * 100} className="mt-3">
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </CardContent>
          </Card>

          {/* 步骤内容 */}
          <Card className="elevation-1 mt-4">
            <CardContent className="pt-4">
              {/* ---- Step 1: 制定盘点计划 ---- */}
              {checkStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-semibold">制定盘点计划</h3>
                  <p className="text-sm text-muted-foreground">选择盘点范围、日期与参与人员，创建盘点计划。</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">盘点类型</Label>
                      <Select defaultValue="monthly">
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">月度库存盘点</SelectItem>
                          <SelectItem value="spot">临时抽盘</SelectItem>
                          <SelectItem value="yearly">年度全面盘点</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">目标仓库</Label>
                      <Select defaultValue="hz">
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hz">杭州主仓</SelectItem>
                          <SelectItem value="sh">上海前置仓</SelectItem>
                          <SelectItem value="all">全部仓库</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">盘点日期</Label>
                      <Input type="date" defaultValue="2026-07-31" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">盘点范围</Label>
                      <Select defaultValue="full">
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">全仓</SelectItem>
                          <SelectItem value="category">按品类</SelectItem>
                          <SelectItem value="abc">ABC 分类</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" className="gap-1.5" onClick={() => { setCheckStep(2); toast('盘点计划已保存'); }}>
                      保存并继续 <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- Step 2: 下发盘点任务 ---- */}
              {checkStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-semibold">下发盘点任务</h3>
                  <p className="text-sm text-muted-foreground">生成盘点表单并下发至对应的仓储管理人员。</p>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>盘点单号</TableHead>
                        <TableHead>盘点类型</TableHead>
                        <TableHead>仓库</TableHead>
                        <TableHead>范围</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CHECK_DOCS.filter((d) => d.status === '待执行').map((doc) => {
                        const s = statusVariant(doc.status);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                            <TableCell className="text-sm">{doc.type}</TableCell>
                            <TableCell className="text-sm">{doc.warehouse}</TableCell>
                            <TableCell className="text-sm">{doc.scope}</TableCell>
                            <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setCheckStep(1)}>
                      <ArrowLeft className="h-3.5 w-3.5" /> 上一步
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { setCheckStep(3); toast('盘点任务已下发至仓库管理员'); }}>
                      下发任务并继续 <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- Step 3: 录入实盘数量 ---- */}
              {checkStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-semibold">录入实盘数量</h3>
                  <p className="text-sm text-muted-foreground">逐项录入实物清点数量，参考系统账面数进行比对。</p>

                  {isLedgerLoading ? (
                    <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>存货编码</TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead className="text-right">账面数</TableHead>
                          <TableHead className="text-right">实盘数</TableHead>
                          <TableHead className="text-right">差异</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerItems.map((item) => {
                          const actual = item.quantity + (item.skuCode === 'SKU-HP-001' ? -12 : item.skuCode === 'SKU-BT-018' ? 3 : -5);
                          const diff = actual - item.quantity;
                          return (
                            <TableRow key={String(item.id)}>
                              <TableCell className="font-mono text-xs">{item.skuCode}</TableCell>
                              <TableCell className="text-sm">{item.skuName}</TableCell>
                              <TableCell className="text-right text-sm">{item.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  defaultValue={actual}
                                  className="w-24 h-7 inline-block text-right text-sm"
                                />
                              </TableCell>
                              <TableCell className={cn('text-right text-sm font-medium', diff !== 0 ? 'text-destructive' : 'text-success')}>
                                {diff > 0 ? `+${diff}` : diff}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}

                  <div className="flex justify-between">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setCheckStep(2)}>
                      <ArrowLeft className="h-3.5 w-3.5" /> 上一步
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { setCheckStep(4); toast('实盘数据已保存'); }}>
                      保存并分析差异 <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- Step 4: 差异分析 ---- */}
              {checkStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-semibold">差异分析</h3>
                  <p className="text-sm text-muted-foreground">查看盘点差异明细，逐项确认是否需要复查或生成调整。</p>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>存货编码</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead className="text-right">账面数</TableHead>
                        <TableHead className="text-right">实盘数</TableHead>
                        <TableHead className="text-right">差异</TableHead>
                        <TableHead className="text-right">差异金额</TableHead>
                        <TableHead>原因分析</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { code: 'SKU-HP-001', name: '蓝牙耳机', book: 1260, actual: 1248, diff: -12, amount: '-¥1,542.00', reason: '待确认' },
                        { code: 'SKU-BT-018', name: '保温杯', book: 486, actual: 489, diff: 3, amount: '+¥140.40', reason: '待确认' },
                        { code: 'SKU-SK-036', name: '精华液', book: 208, actual: 203, diff: -5, amount: '-¥446.00', reason: '待确认' },
                      ].map((row) => (
                        <TableRow key={row.code}>
                          <TableCell className="font-mono text-xs">{row.code}</TableCell>
                          <TableCell className="text-sm">{row.name}</TableCell>
                          <TableCell className="text-right text-sm">{row.book.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm">{row.actual.toLocaleString()}</TableCell>
                          <TableCell className={cn('text-right text-sm font-medium', row.diff !== 0 ? 'text-destructive' : 'text-success')}>
                            {row.diff > 0 ? `+${row.diff}` : row.diff}
                          </TableCell>
                          <TableCell className={cn('text-right font-mono text-sm', row.diff !== 0 && 'text-destructive')}>
                            {row.amount}
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="pending">
                              <SelectTrigger className="h-7 w-[100px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">待确认</SelectItem>
                                <SelectItem value="counting_error">清点误差</SelectItem>
                                <SelectItem value="damage">破损报废</SelectItem>
                                <SelectItem value="missing">丢失短少</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setCheckStep(3)}>
                      <ArrowLeft className="h-3.5 w-3.5" /> 上一步
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { setCheckStep(5); toast('差异分析已完成'); }}>
                      确认差异并继续 <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- Step 5: 生成调整单 ---- */}
              {checkStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-semibold">生成调整单</h3>
                  <p className="text-sm text-muted-foreground">根据差异审核结果，生成盘盈/盘亏调整单并推送至凭证。</p>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>盘点单号</span>
                      <span className="font-mono text-xs">PD-20260731-01</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>盘盈项</span>
                      <span className="text-success font-medium">1 项 / +¥140.40</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>盘亏项</span>
                      <span className="text-destructive font-medium">2 项 / -¥1,988.00</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold pt-1 border-t">
                      <span>净差异</span>
                      <span className="text-destructive">-¥1,847.60</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setCheckStep(4)}>
                      <ArrowLeft className="h-3.5 w-3.5" /> 上一步
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setCheckStep(1);
                        toast('盘点调整凭证草稿已进入待制证队列');
                      }}
                    >
                      <Check className="h-4 w-4" /> 确认差异并生成调整草稿
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* 调拨与调整                                                      */}
        {/* ============================================================== */}
        <TabsContent value="transfer">
          <Card className="elevation-1 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">调拨与调整</CardTitle>
                  <CardDescription>仓库间调拨流转与库存数调整</CardDescription>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => { setDocDialogType('transfer'); setDocDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4" /> 新增调拨单
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* TODO: 调拨单暂用静态数据，后续接入 tRPC transfer router */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>单据编号</TableHead>
                    <TableHead>业务类型</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>调出仓库</TableHead>
                    <TableHead>调入仓库</TableHead>
                    <TableHead className="text-right">行数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRANSFER_DOCS.map((doc) => {
                    const s = statusVariant(doc.status);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                        <TableCell className="text-sm">{doc.type}</TableCell>
                        <TableCell className="text-sm">{doc.date}</TableCell>
                        <TableCell className="text-sm">{doc.from}</TableCell>
                        <TableCell className="text-sm">{doc.to}</TableCell>
                        <TableCell className="text-right text-sm">{doc.items}</TableCell>
                        <TableCell>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast(`查看 ${doc.id} 详情`)}>
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                <p className="flex items-center gap-1 font-medium text-foreground mb-1"><AlertTriangle className="h-3.5 w-3.5" /> 调拨状态说明</p>
                <p>调拨中 — 已创建调拨单, 待出库确认; 已发货 — 调出方已出库, 待收货; 已收货 — 调入方已确认收货, 库存已更新。</p>
                <p>库存调整 — 经审批的直接库存数修正 (盘盈/盘亏/损耗)，不涉及实物移动。</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* 收发存汇总                                                      */}
        {/* ============================================================== */}
        <TabsContent value="summary">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {isStatsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="elevation-1">
                  <CardContent className="pt-4">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-6 w-20 mt-1" />
                    <Skeleton className="h-3 w-12 mt-0.5" />
                  </CardContent>
                </Card>
              ))
            ) : (
              [
                { label: 'SKU 总数', value: `${stats?.totalItems ?? 0} 种`, sub: `${stats?.lowStockCount ?? 0} 项低库存`, icon: <Package className="h-4 w-4 text-primary" /> },
                { label: '总库存量', value: `${(stats?.totalQuantity ?? 0).toLocaleString()} 件`, sub: `${stats?.byWarehouse?.length ?? 0} 个仓库`, icon: <TrendingUp className="h-4 w-4 text-success" /> },
                { label: '低库存预警', value: `${stats?.lowStockCount ?? 0} 项`, sub: '需及时补货', icon: <AlertTriangle className="h-4 w-4 text-warning" /> },
                { label: '品类覆盖', value: `${stats?.byCategory?.length ?? 0} 类`, sub: '已分类管理', icon: <ShoppingCart className="h-4 w-4 text-primary" /> },
              ].map((stat, i) => (
                <Card key={i} className="elevation-1">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {stat.icon}
                      {stat.label}
                    </div>
                    <div className="text-xl font-bold font-mono mt-1">{stat.value}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 按品类汇总 */}
          <Card className="elevation-1 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">收发存汇总表</CardTitle>
                  <CardDescription>按仓库与存货类别汇总收发存变动</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => statsQuery.refetch()}>
                    <RefreshCw className="h-3 w-3" /> 刷新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>存货类别</TableHead>
                      <TableHead className="text-right">SKU 数</TableHead>
                      <TableHead className="text-right">库存数量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderSkeletonRows(3, 3)}</TableBody>
                </Table>
              ) : statsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>数据加载失败</AlertTitle>
                  <AlertDescription>{statsQuery.error?.message || '无法获取汇总数据'}</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>存货类别</TableHead>
                      <TableHead className="text-right">SKU 数</TableHead>
                      <TableHead className="text-right">库存数量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.byCategory ?? []).map((c) => (
                      <TableRow key={c.category}>
                        <TableCell className="text-sm">{c.category}</TableCell>
                        <TableCell className="text-right text-sm">{c.count}</TableCell>
                        <TableCell className="text-right text-sm">{c.totalQuantity.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell>合计</TableCell>
                      <TableCell className="text-right">{stats?.totalItems ?? 0}</TableCell>
                      <TableCell className="text-right">{(stats?.totalQuantity ?? 0).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 收发存控制规则 */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">收发存控制规则</p>
            <p>采购入库、销售出库、调拨和盘点以单据留痕；出库数量不得超过可用库存，成本按移动加权平均法核算。</p>
            <p>单据经审核后自动更新库存台账，会计影响按预设流程进入对应凭证。</p>
            <p>安全库存预警阈值按 SKU 独立设置，低于阈值时在台账首页提醒。</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ================================================================ */}
      {/* 新增单据 Dialog (通用)                                           */}
      {/* ================================================================ */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {docDialogType === 'inbound' ? '新增入库单' : docDialogType === 'outbound' ? '新增出库单' : '新增调拨单'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>{docDialogType === 'transfer' ? '调拨类型' : '业务类型'}</Label>
              <Select defaultValue={docDialogType === 'inbound' ? 'purchase' : docDialogType === 'outbound' ? 'sale' : 'warehouse'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {docDialogType === 'inbound' && (
                    <>
                      <SelectItem value="purchase">采购入库</SelectItem>
                      <SelectItem value="return">退货入库</SelectItem>
                      <SelectItem value="gain">盘盈入库</SelectItem>
                      <SelectItem value="other">其他入库</SelectItem>
                    </>
                  )}
                  {docDialogType === 'outbound' && (
                    <>
                      <SelectItem value="sale">销售出库</SelectItem>
                      <SelectItem value="picking">领料出库</SelectItem>
                      <SelectItem value="scrap">报废出库</SelectItem>
                      <SelectItem value="other">其他出库</SelectItem>
                    </>
                  )}
                  {docDialogType === 'transfer' && (
                    <>
                      <SelectItem value="warehouse">仓间调拨</SelectItem>
                      <SelectItem value="adjust">库存调整</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>仓库</Label>
              <Select defaultValue="hz">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hz">杭州主仓</SelectItem>
                  <SelectItem value="sh">上海前置仓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {docDialogType === 'transfer' && (
              <div>
                <Label>目标仓库</Label>
                <Select defaultValue="sh">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sh">上海前置仓</SelectItem>
                    <SelectItem value="hz">杭州主仓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>日期</Label>
              <Input type="date" defaultValue="2026-07-15" />
            </div>
            <div>
              <Label>备注</Label>
              <Input placeholder="输入单据备注（选填）" />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setDocDialogOpen(false);
                toast(`${docDialogType === 'inbound' ? '入库单' : docDialogType === 'outbound' ? '出库单' : '调拨单'}已创建，待审核`);
              }}
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
