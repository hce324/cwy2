'use client';

/**
 * 智能采集 (DocumentsView) — 原始凭证电子化录入台
 * ───────────────────────────────────────────────────────────────
 * 设计（2026-07-27 /grill-me 烤定）：
 *  - 智能采集是原始凭证的「唯一」录入入口；录入即原始凭证电子版，直写 sourceVoucher。
 *  - 原图经 OSS / 本地上传落 fileUrl；结构化字段存 rawDataJson；状态置「待制证」。
 *  - 批量制证不在本页：由「记账凭证」页从原始凭证汇总生成（见 VoucherView）。
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Eye, ScanLine, FileText, Link2, CheckCheck, PencilLine } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────

interface SrcVoucher {
  id: bigint | number;
  voucherNo: string;
  itemDescription: string;
  businessDate: string | Date;
  amount: number;
  currency?: string | null;
  category?: string | null;
  source?: string | null;
  fileUrl?: string | null;
  rawDataJson: any;
  recognitionStatus?: string | null;
  status?: string | null;
  counterparty?: string | null;
  voucherId?: bigint | number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────

function fmtAmount(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

function statusInfo(status?: string | null): { text: string; cls: string } {
  if (status === '已制证') return { text: '已制证', cls: 'text-success' };
  return { text: '待制证', cls: 'text-warning' };
}

// 根据 fileUrl 判断是否为 PDF：<img> 无法渲染 PDF，需改用 <iframe>
function isPdfUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.pdf(\?|#|$)/i.test(url.split('?')[0]);
}

// 将 PDF 首页渲染为图片 dataUrl：上传时把 PDF 转图存储，规避 OSS 公开读无法内联预览 PDF 的问题
async function pdfToImageDataUrl(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const data = await file.arrayBuffer();
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 canvas 上下文');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
  } finally {
    void task.destroy();
  }
}

function recogInfo(status?: string | null): { text: string; cls: string } {
  switch (status) {
    case '待核对': return { text: '待核对', cls: 'text-warning' };
    case '已确认': return { text: '已识别', cls: 'text-success' };
    case '待识别': return { text: '待识别', cls: 'text-primary' };
    case 'recognized': return { text: '已录入', cls: 'text-muted-foreground' };
    default: return { text: '', cls: '' };
  }
}

// ─── Component ────────────────────────────────────────────────────

export function DocumentsView() {
  const setView = useAppStore((s) => s.setView);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  // 查看原件
  const [viewOpen, setViewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SrcVoucher | null>(null);

  // 导入 Dialog
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [importFileData, setImportFileData] = useState('');
  const [importConverting, setImportConverting] = useState(false);
  const [importName, setImportName] = useState('');

  // ─── Query & mutations ───────────────────────────────────────
  const listQuery = trpc.sourceVoucher.list.useQuery(
    { keyword: appliedKeyword || undefined, limit: 100, offset: 0 },
    { staleTime: 30_000 },
  );
  const utils = trpc.useUtils();
  const invalidate = () => utils.sourceVoucher.list.invalidate();

  const createMutation = trpc.sourceVoucher.create.useMutation({
    onSuccess: () => {
      toast.success('已录入原始凭证');
      setImportOpen(false);
      resetImportForm();
      invalidate();
    },
    onError: (e) => toast.error(`录入失败：${e.message}`),
  });

  // AI 识别 + 核对确认
  const recognizeMutation = trpc.sourceVoucher.recognize.useMutation({
    onSuccess: (data) => {
      toast.success('AI 识别完成，请核对字段');
      openReviewFromRecognized(data as any);
      invalidate();
    },
    onError: (e) => toast.error(`识别失败：${e.message}`),
  });

  const updateMutation = trpc.sourceVoucher.update.useMutation({
    onSuccess: () => {
      toast.success('已确认识别结果');
      setReviewOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(`保存失败：${e.message}`),
  });

  // 识别结果核对弹窗状态
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState<null | {
    id: bigint | number | string;
    voucherNo: string;
    itemDescription: string;
    businessDate: string;
    amount: string;
    counterparty: string;
    category: string;
    recognitionStatus: string;
    rawDataJson: any;
    fileUrl?: string | null;
  }>(null);

  const openReviewFromRecognized = (data: any) => {
    const r = data.recognized;
    setReview({
      id: data.voucher.id,
      voucherNo: r.invoiceNo ?? '',
      itemDescription: r.itemName ?? '',
      businessDate: r.invoiceDate ?? new Date().toISOString().slice(0, 10),
      amount: r.amount != null ? String(r.amount) : '',
      counterparty: r.sellerName ?? '',
      category: (data.voucher?.category as string) ?? '',
      recognitionStatus: '待核对',
      rawDataJson: r.raw ?? {},
      fileUrl: data.voucher.fileUrl,
    });
    setReviewOpen(true);
  };

  const openReviewFromDoc = (doc: SrcVoucher) => {
    setReview({
      id: doc.id,
      voucherNo: doc.voucherNo ?? '',
      itemDescription: doc.itemDescription ?? '',
      businessDate: fmtDate(doc.businessDate),
      amount: String(doc.amount ?? ''),
      counterparty: doc.counterparty ?? '',
      category: doc.category ?? '',
      recognitionStatus: doc.recognitionStatus ?? '待核对',
      rawDataJson: doc.rawDataJson ?? {},
      fileUrl: doc.fileUrl,
    });
    setReviewOpen(true);
  };

  const handleConfirmReview = () => {
    if (!review) return;
    if (!review.amount || Number(review.amount) <= 0) { toast.error('请输入有效金额'); return; }
    updateMutation.mutate({
      id: Number(review.id),
      voucherNo: review.voucherNo,
      itemDescription: review.itemDescription,
      businessDate: review.businessDate,
      amount: Number(review.amount),
      counterparty: review.counterparty,
      category: review.category || undefined,
      recognitionStatus: '已确认',
      rawDataJson: review.rawDataJson,
    });
  };

  const items = (listQuery.data?.items ?? []) as unknown as SrcVoucher[];
  const total = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── Search handlers ────────────────────────────────────────
  const handleSearch = () => setAppliedKeyword(keyword);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleView = (doc: SrcVoucher) => { setPreviewDoc(doc); setViewOpen(true); };

  const resetImportForm = () => {
    setImportFile('');
    setImportFileData('');
    setImportName('');
  };

  const handleImport = () => {
    if (!importName.trim()) { toast.error('请填写单据名称'); return; }
    createMutation.mutate({
      itemDescription: importName.trim(),
      source: 'smart',
      fileData: importFileData || undefined,
      recognitionStatus: '待识别',
      status: '待制证',
      rawDataJson: {
        单据编号: importName.trim(),
        来源: '智能采集·待AI识别',
      },
    });
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            智能采集{' '}
            <span className="text-xs text-muted-foreground font-sans font-normal uppercase tracking-wider">
              SMART CAPTURE
            </span>
          </h1>
          <p className="page-subtitle">
            上传原始单据（发票、银行回单、审批单），录入关键信息后成为电子版原始凭证，进入原始凭证库待制证。
          </p>
        </div>
        <Button size="sm" className="gap-1.5 ripple-container elevation-1" onClick={() => { resetImportForm(); setImportOpen(true); }}>
          <Plus className="h-4 w-4" /> 扫描或导入
        </Button>
      </div>

      <Separator />

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索凭证号、事项或对方单位"
            className="h-8 pl-7 text-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        共 {total.toLocaleString()} 份已录入的原始凭证（电子版）。录入后可在「原始凭证」页查看与校验，并在「记账凭证」页汇总生成凭证。
      </p>

      {/* ── Table ────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-10 w-full" />))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{errorMsg || '无法获取原始凭证列表，请检查网络连接后重试'}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              暂无录入资料，点击「扫描或导入」添加第一份原始凭证
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>原始凭证号</TableHead>
                  <TableHead>事项</TableHead>
                  <TableHead>对方单位</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((doc) => {
                  const st = statusInfo(doc.status);
                  return (
                    <TableRow key={String(doc.id)} className="text-xs">
                      <TableCell className="font-mono">{doc.voucherNo}</TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{doc.itemDescription}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(doc.businessDate)}</div>
                      </TableCell>
                      <TableCell>{doc.counterparty || '—'}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{fmtAmount(doc.amount)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {doc.recognitionStatus ? (
                            <span className={cn('text-[10px] font-medium', recogInfo(doc.recognitionStatus).cls)}>
                              {recogInfo(doc.recognitionStatus).text}
                            </span>
                          ) : null}
                          {doc.status === '已制证' && doc.voucherId ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-success hover:underline cursor-pointer"
                              onClick={() => setView('hz-voucher')}
                            >
                              <Link2 className="h-3.5 w-3.5" /> 已制证
                            </button>
                          ) : (
                            <span className={cn('inline-flex items-center gap-1', st.cls)}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {st.text}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" className="h-7 w-7 ripple-container">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(doc)}>
                                <Eye className="h-4 w-4" /> 查看原件
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => recognizeMutation.mutate({ id: Number(doc.id) })}>
                                <ScanLine className="h-4 w-4" /> AI 识别
                              </DropdownMenuItem>
                              {doc.recognitionStatus ? (
                                <DropdownMenuItem onClick={() => openReviewFromDoc(doc)}>
                                  <PencilLine className="h-4 w-4" /> 核对识别结果
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem onClick={() => setView('hz-sourcevoucher')}>
                                <FileText className="h-4 w-4" /> 去原始凭证库
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── 查看原件 Sheet ───────────────────────────────────── */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          {previewDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> 查看原件
                </SheetTitle>
                <SheetDescription>{previewDoc.itemDescription}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4">
                {previewDoc.fileUrl ? (
                  isPdfUrl(previewDoc.fileUrl) ? (
                    <iframe
                      src={previewDoc.fileUrl}
                      title="单据原件"
                      className="h-[70vh] w-full rounded-lg border border-border bg-white"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewDoc.fileUrl}
                      alt="单据原件"
                      className="w-full rounded-lg border border-border object-contain bg-muted/30"
                    />
                  )
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    暂无原图（导入时未上传文件）
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Field label="金额" value={fmtAmount(previewDoc.amount)} />
                  <Field label="日期" value={fmtDate(previewDoc.businessDate)} />
                  <Field label="对方单位" value={previewDoc.counterparty || '—'} />
                  <Field label="状态" value={statusInfo(previewDoc.status).text} />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">录入字段</span>
                    {!(previewDoc.rawDataJson && Object.keys(previewDoc.rawDataJson).length) && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">未录入</Badge>
                    )}
                  </div>
                  {previewDoc.rawDataJson && Object.keys(previewDoc.rawDataJson).length ? (
                    <ExtractedFields data={previewDoc.rawDataJson} />
                  ) : (
                    <p className="text-[11px] text-muted-foreground">尚未录入结构化字段。</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full ripple-container"
                    onClick={() => recognizeMutation.mutate({ id: Number(previewDoc.id) })}
                    disabled={recognizeMutation.isPending}
                  >
                    <ScanLine className="h-4 w-4" /> {recognizeMutation.isPending ? '识别中…' : 'AI 识别'}
                  </Button>
                  {previewDoc.recognitionStatus ? (
                    <Button size="sm" variant="outline" className="w-full ripple-container" onClick={() => openReviewFromDoc(previewDoc)}>
                      <PencilLine className="h-4 w-4" /> 核对识别结果
                    </Button>
                  ) : null}
                </div>

                {previewDoc.status === '已制证' && previewDoc.voucherId && (
                  <Button size="sm" variant="outline" className="w-full ripple-container" onClick={() => { setView('hz-voucher'); setViewOpen(false); }}>
                    <Link2 className="h-4 w-4" /> 查看关联记账凭证
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── 导入 Dialog ──────────────────────────────────────── */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> 扫描或导入原始凭证
            </DialogTitle>
            <DialogDescription>选择原图并填写关键信息，提交后原图上传至存储（OSS / 本地），单据成为电子版原始凭证，进入待制证状态。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label text="原图（可选）" />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  id="import-file"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImportFile(f.name);
                    if (!importName) setImportName(f.name);
                    try {
                      if (f.type === 'application/pdf') {
                        setImportConverting(true);
                        const img = await pdfToImageDataUrl(f);
                        setImportFileData(img);
                      } else {
                        const reader = new FileReader();
                        reader.onload = () => setImportFileData(String(reader.result));
                        reader.readAsDataURL(f);
                      }
                    } catch (err) {
                      console.error('PDF 转图失败', err);
                      toast.error('PDF 转图失败，请重试或改用图片上传');
                      setImportFile('');
                      setImportFileData('');
                    } finally {
                      setImportConverting(false);
                    }
                  }}
                />
                <label
                  htmlFor="import-file"
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 text-xs hover:bg-muted/50"
                >
                  <ScanLine className="h-3.5 w-3.5" /> 选择文件
                </label>
                <span className="text-xs text-muted-foreground truncate">{importFile || '未选择'}</span>
                {importConverting && <span className="text-xs text-primary">PDF 转图中…</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label text="单据名称" />
              <Input className="h-8 text-xs" placeholder="自动取文件名，可修改" value={importName} onChange={(e) => setImportName(e.target.value)} />
            </div>

            <p className="text-xs text-muted-foreground">
              图片直接上传；PDF 会自动转成首页图片存储，便于查看与识别。金额、日期、对方单位等由 AI 识别自动补全；如暂不识别，可稍后在列表中点「AI 识别」。
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
            <Button className="ripple-container" onClick={handleImport} disabled={createMutation.isPending || importConverting}>
              {createMutation.isPending ? '录入中…' : importConverting ? '转换中…' : '录入为原始凭证'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 识别结果核对 Dialog（C1：人逐字段核对后确认）──────────── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" /> 核对 AI 识别结果
            </DialogTitle>
            <DialogDescription>
              请逐字段核对原图，确认无误后点「确认」；识别状态将标记为已识别并进入待制证。
            </DialogDescription>
          </DialogHeader>

          {review && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {review.fileUrl ? (
                  isPdfUrl(review.fileUrl) ? (
                    <iframe
                      src={review.fileUrl}
                      title="单据原件"
                      className="h-80 w-full rounded-lg border border-border bg-white"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.fileUrl}
                      alt="单据原件"
                      className="w-full rounded-lg border border-border object-contain bg-muted/30 max-h-80"
                    />
                  )
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    暂无原图
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label text="发票号码 / 凭证号" />
                  <Input className="h-8 text-xs" value={review.voucherNo} onChange={(e) => setReview({ ...review, voucherNo: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label text="事项 / 货物名称" />
                  <Input className="h-8 text-xs" value={review.itemDescription} onChange={(e) => setReview({ ...review, itemDescription: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label text="开票日期" />
                    <Input type="date" className="h-8 text-xs" value={review.businessDate} onChange={(e) => setReview({ ...review, businessDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label text="价税合计" />
                    <Input type="number" className="h-8 text-xs" value={review.amount} onChange={(e) => setReview({ ...review, amount: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label text="销售方（对方单位）" />
                  <Input className="h-8 text-xs" value={review.counterparty} onChange={(e) => setReview({ ...review, counterparty: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label text="类目（可选，AI 不识别，请手动填写）" />
                  <Input className="h-8 text-xs" value={review.category} onChange={(e) => setReview({ ...review, category: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {review && review.rawDataJson && Object.keys(review.rawDataJson).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">原始识别字段（只读，供核对）</span>
              <ExtractedFields data={review.rawDataJson} />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>取消</Button>
            <Button className="ripple-container" onClick={handleConfirmReview} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '保存中…' : (<><CheckCheck className="h-4 w-4" /> 确认</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Small presentational helpers ────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground mb-0.5">{label}</div>
      <div className="text-foreground font-medium">{value}</div>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <div className="text-[11px] text-muted-foreground">{text}</div>;
}

// 纯技术元数据字段（对用户无意义），在原始识别字段区隐藏
const RAW_FIELDS_HIDE = new Set([
  'algo_version', 'angle', 'ftype', 'height', 'width',
  'orgHeight', 'orgWidth', 'sliceRect',
]);

/** 将任意值转为适合展示的字符串；对象/数组用缩进 JSON */
function fmtRawValue(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    try {
      const s = JSON.stringify(v, null, 2);
      // 超长截断
      return s.length > 300 ? s.slice(0, 300) + '…' : s;
    } catch { return String(v); }
  }
  return String(v);
}

function ExtractedFields({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([k]) => !RAW_FIELDS_HIDE.has(k));
  if (!entries.length) return null;
  return (
    <div className="rounded-lg border border-border divide-y divide-border max-h-[280px] overflow-y-auto">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-3 px-3 py-1.5 text-xs">
          <span className="text-muted-foreground shrink-0 w-[140px]">{k}</span>
          <span className="text-foreground font-medium tabular-nums break-all whitespace-pre-wrap">
            {fmtRawValue(v)}
          </span>
        </div>
      ))}
    </div>
  );
}
