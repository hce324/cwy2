'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, ChevronLeft, Search, FileImage } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

function fmtAmount(amount: unknown): string {
  return `¥${Number(amount ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function riskBadgeLabel(riskStatus: string | undefined): { label: string; cls: string } {
  if (!riskStatus) return { label: '—', cls: 'bg-muted/10 text-muted-foreground' };
  switch (riskStatus) {
    case '资料完整':
      return { label: riskStatus, cls: 'bg-success/10 text-success' };
    default:
      return { label: riskStatus, cls: 'bg-warning/10 text-warning' };
  }
}

/** 从 fileUrl 提取文件名（去掉路径和查询参数） */
function fileNameFromUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop() ?? '';
    return decodeURIComponent(base);
  } catch {
    // 不是完整 URL，当作路径处理
    return url.split(/[\\/]/).pop() ?? url;
  }
}

/** 根据扩展名判断是否为图片（弹窗内可内联预览） */
function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const name = fileNameFromUrl(url).toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|avif|svg)$/.test(name);
}

// ─── Component ──────────────────────────────────────────────────────

export function SourceVoucherView() {
  // --- filter state ---
  const [status, setStatus] = useState<string>('all');
  const [riskStatus, setRiskStatus] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  // --- detail state ---
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 原图预览弹窗：点击列表「原始单据」文件名时打开
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const setView = useAppStore((s) => s.setView);

  // ─── Queries ─────────────────────────────────────────────────────

  const listQuery = trpc.sourceVoucher.list.useQuery({
    status: status !== 'all' ? status : undefined,
    riskStatus: riskStatus !== 'all' ? riskStatus : undefined,
    keyword: appliedKeyword || undefined,
    limit: 20,
    offset: 0,
  });

  const detailQuery = trpc.sourceVoucher.byId.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null },
  );

  // ─── Mutations ───────────────────────────────────────────────────

  const verifyMutation = trpc.sourceVoucher.verify.useMutation({
    onSuccess: () => {
      toast.success('校验完成');
      utils.sourceVoucher.list.invalidate();
      if (selectedId !== null) utils.sourceVoucher.byId.invalidate({ id: selectedId });
    },
    onError: (err) => {
      toast.error(err.message || '校验失败，请重试');
    },
  });

  const revertMutation = trpc.sourceVoucher.revert.useMutation({
    onSuccess: () => {
      toast.success('已退回，原始凭证恢复待制证');
      utils.sourceVoucher.list.invalidate();
      if (selectedId !== null) utils.sourceVoucher.byId.invalidate({ id: selectedId });
    },
    onError: (err) => {
      toast.error(err.message || '退回失败，请重试');
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────

  const handleSearch = () => setAppliedKeyword(keyword);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleVerify = (id: number) => {
    verifyMutation.mutate({
      id,
      results: [{ checkItem: '资料完整，所有单据核对一致', isPassed: true }],
    });
  };

  const handleRevert = (id: number) => {
    revertMutation.mutate({ id });
  };

  // ─── Derived data ────────────────────────────────────────────────

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  const detail = detailQuery.data;
  const detailLoading = detailQuery.isLoading;
  const detailError = detailQuery.isError;

  // ─── KPI stats ──────────────────────────────────────────────────

  const stats = useMemo(() => {
    const pending = items.filter((v) => v.status === '待制证').length;
    const made = items.filter((v) => v.status === '已制证').length;
    const missingDocs = items.filter(
      (v) => !v.includedDocuments || v.includedDocuments.trim() === '',
    ).length;
    return { pending, made, missingDocs };
  }, [items]);

  // ═══════════════════════════════════════════════════════════════
  //  Detail View
  // ═══════════════════════════════════════════════════════════════

  if (selectedId !== null) {
    if (detailLoading) {
      return (
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
          <Separator />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (detailError || !detail) {
      return (
        <div className="p-6 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedId(null)}
            className="gap-1 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" /> 返回原始凭证列表
          </Button>
          <Alert variant="destructive">
            <AlertTitle>数据加载失败</AlertTitle>
            <AlertDescription>
              {detailQuery.error?.message || '无法获取原始凭证详情，请检查网络连接后重试'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    const facts = detail.businessFacts ?? [];
    const verifications = detail.verificationResults ?? [];
    const firstFact = facts.length > 0 ? facts[0] : null;

    const docList = detail.includedDocuments
      ? detail.includedDocuments.split('＋').map((d) => d.trim()).filter(Boolean)
      : [];

    return (
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedId(null)}
          className="gap-1 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" /> 返回原始凭证列表
        </Button>
        <p className="text-xs text-muted-foreground">
          展示业务事实、实际原始单据和复核记录，不包含会计科目及借贷分录
        </p>

        {/* Status banner */}
        {detail.voucherId ? (
          <div className="bg-success/10 rounded-lg p-3 text-sm flex items-center justify-between">
            <span className="font-medium text-success">
              状态：已制证（关联记账凭证 #{String(detail.voucherId)}）
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setView('hz-voucher')}>
              查看凭证
            </Button>
          </div>
        ) : detail.riskStatus === '资料完整' ? (
          <div className="bg-success/10 rounded-lg p-3 text-sm">
            <span className="font-medium text-success">状态：资料完整，可提交制证</span>
          </div>
        ) : (
          <div className="bg-warning/10 rounded-lg p-3 text-sm">
            <span className="font-medium text-warning">状态：待制证</span>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">业务日期</span>
            <p className="font-medium">{fmtDate(detail.businessDate)}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">业务主体</span>
            <p className="font-medium">{detail.businessEntity || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">交易对方</span>
            <p className="font-medium">{detail.counterparty || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">金额</span>
            <p className="font-medium">{fmtAmount(detail.amount)} {detail.currency || 'CNY'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">经办人</span>
            <p className="font-medium">
              {detail.handlerName
                ? `${detail.handlerName}${detail.handlerDepartment ? ` · ${detail.handlerDepartment}` : ''}`
                : '—'}
            </p>
          </div>
        </div>

        {detail.fileUrl && (
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">原始凭证原图</CardTitle>
            </CardHeader>
            <CardContent>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.fileUrl}
                alt="原始凭证原图"
                className="w-full rounded-lg border border-border object-contain bg-muted/30"
              />
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Business facts */}
        {firstFact && (
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">业务事实与关键字段</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              {firstFact.purchaseContent && (
                <p>
                  <span className="text-muted-foreground">采购内容：</span>
                  {firstFact.purchaseContent}
                  {firstFact.quantity ? ` ${firstFact.quantity}` : ''}
                </p>
              )}
              {firstFact.deliveryLocation && (
                <p>
                  <span className="text-muted-foreground">交货地点：</span>
                  {firstFact.deliveryLocation}
                </p>
              )}
              {firstFact.contractOrderNo && (
                <p>
                  <span className="text-muted-foreground">合同/订单：</span>
                  {firstFact.contractOrderNo}
                </p>
              )}
              {firstFact.inspectionReceiptNo && (
                <p>
                  <span className="text-muted-foreground">验收入库：</span>
                  {firstFact.inspectionReceiptNo}
                </p>
              )}
              {firstFact.invoiceNo && (
                <p>
                  <span className="text-muted-foreground">发票号码：</span>
                  {firstFact.invoiceNo}
                </p>
              )}
              {firstFact.taxTotal != null && (
                <p>
                  <span className="text-muted-foreground">价税合计：</span>
                  {fmtAmount(firstFact.taxTotal)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verification results */}
        {verifications.length > 0 && (
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">单据之间的核对结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {verifications.map((vr, i) => (
                <p key={i} className={cn(vr.isPassed ? 'text-success' : 'text-danger')}>
                  {vr.isPassed ? '✓' : '✗'} {vr.checkItem}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Risk / todo */}
        {detail.riskStatus && detail.riskStatus !== '资料完整' ? (
          <div className="bg-warning/10 rounded-lg p-3 text-sm text-warning">
            风险/待办：{detail.riskStatus}
          </div>
        ) : (
          <div className="bg-success/10 rounded-lg p-3 text-sm text-success">
            风险/待办：未发现重复单据或关键字段差异
          </div>
        )}

        {/* Attached documents */}
        {docList.length > 0 && (
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                所附原始单据（{docList.length} 份）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {docList.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm border-b pb-1 last:border-0"
                >
                  <span>{doc}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    查看原件
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {!detail.voucherId && detail.status === '待制证' && (
            <Button
              size="sm"
              onClick={() => handleVerify(Number(detail.id))}
              disabled={verifyMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {verifyMutation.isPending ? '校验中...' : '校验通过'}
            </Button>
          )}
          {detail.voucherId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRevert(Number(detail.id))}
              disabled={revertMutation.isPending}
            >
              {revertMutation.isPending ? '退回中...' : '退回重制'}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground italic">
          提示：本页不形成会计分录 — 复核通过后，系统仅把这些业务事实和原始单据传递到"凭证填制"模块，由会计专员确定摘要、会计科目和借贷金额。
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  List View
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            SOURCE VOUCHERS
          </div>
          <h1 className="page-title mt-1">原始凭证</h1>
          <p className="page-subtitle">
            查看原始凭证及附件证据，重点复核异常、大额和高风险业务，不代替会计专员日常制证。
          </p>
        </div>
      </div>

      <Separator />

      {/* ── KPI Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: '本期待处理',
            value: isLoading ? '...' : `${stats.pending}`,
            sub: '原始凭证',
          },
          {
            label: '识别准确率',
            value: '97.8%',
            sub: '关键金额100%',
          },
          {
            label: '待补充附件',
            value: isLoading ? '...' : `${stats.missingDocs}`,
            sub: '审批单或回单',
          },
          {
            label: '待人工复核',
            value: isLoading ? '...' : `${stats.pending}`,
            sub: '核对业务事实与原件',
          },
        ].map((s) => (
          <Card key={s.label} className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold mt-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Info banner ─────────────────────────────────────────── */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        本页只呈现业务发生时形成或取得的原始单据及其扫描识别结果，不显示会计科目、借贷方向或会计分录。会计处理在复核通过后的"凭证填制"模块完成。
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="待制证">待制证</SelectItem>
            <SelectItem value="已制证">已制证</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskStatus} onValueChange={(v) => setRiskStatus(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="风险" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="资料完整">资料完整</SelectItem>
            <SelectItem value="待确认">待确认</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="搜索凭证号/事项..."
            className="w-48 h-7 text-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={handleSearch}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          共 {isLoading ? '...' : total} 条
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {errorMsg || '无法获取原始凭证列表，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无原始凭证数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>原始凭证号</TableHead>
                  <TableHead>资料包/事项</TableHead>
                  <TableHead>业务日期</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>原始单据</TableHead>
                  <TableHead>风险</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((v) => {
                  const risk = riskBadgeLabel(v.riskStatus);
                  return (
                    <TableRow key={String(v.id)} className="text-xs">
                      <TableCell className="font-mono">{v.voucherNo}</TableCell>
                      <TableCell>{v.itemDescription}</TableCell>
                      <TableCell>{fmtDate(v.businessDate)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAmount(v.amount)}
                      </TableCell>
                      <TableCell>
                        {v.fileUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(v.fileUrl!)}
                            className="text-primary hover:underline inline-flex items-center gap-1 max-w-[160px] truncate"
                            title={`查看原件：${fileNameFromUrl(v.fileUrl)}`}
                          >
                            <FileImage className="h-3.5 w-3.5 shrink-0" />
                            {fileNameFromUrl(v.fileUrl)}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={risk.cls}>{risk.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedId(Number(v.id))}
                        >
                          查看详情
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

      {/* 原图预览弹窗：点列表「原始单据」文件名打开，内联查看而非下载 */}
      <Dialog open={previewUrl !== null} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent
          className="max-h-[90vh]"
          style={{ maxWidth: '92vw', width: '92vw' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              {previewUrl ? fileNameFromUrl(previewUrl) : '原始凭证原图'}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-auto rounded-lg border border-border bg-muted/30 flex items-center justify-center p-2">
            {previewUrl && isImageUrl(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={fileNameFromUrl(previewUrl)}
                className="max-w-full max-h-[75vh] object-contain"
              />
            ) : previewUrl ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                该单据为 PDF 格式，弹窗暂不支持预览。
                <br />
                请在「查看详情」中查看原件，或
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  在新标签页打开
                </a>
                。
              </div>
            ) : null}
          </div>
          <Button variant="outline" className="w-full" onClick={() => setPreviewUrl(null)}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
