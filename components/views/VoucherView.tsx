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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, FileText, Search, Trash2, Link2, Eye } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────

function fmtVoucherNo(v: { voucherWord: string; voucherNumber: number }): string {
  return `${v.voucherWord}字${v.voucherNumber}号`;
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

function fmtAmount(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function statusBadge(s: string | undefined): { label: string; cls: string } {
  switch (s) {
    case 'pending':
      return { label: '待审核', cls: 'text-warning' };
    case 'approved':
      return { label: '已审核', cls: 'text-success' };
    case 'posted':
      return { label: '已过账', cls: 'text-success' };
    case 'voided':
      return { label: '已作废', cls: 'text-muted-foreground' };
    default:
      return { label: s ?? '—', cls: 'text-warning' };
  }
}

function riskBadge(auditStatus: string | undefined): { label: string; cls: string } {
  switch (auditStatus) {
    case 'approved':
    case 'posted':
      return { label: '资料完整', cls: 'text-success' };
    default:
      return { label: '待审核', cls: 'text-warning' };
  }
}

// 汇总生成所用的分录编辑器类型
interface VEntry {
  subjectId: number | '';
  dir: '借' | '贷';
  amount: number | '';
}

// ─── Component ──────────────────────────────────────────────────────

export function VoucherView() {
  // --- filter state ---
  const [auditStatus, setAuditStatus] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  // --- dialog state ---
  const [createOpen, setCreateOpen] = useState(false);

  // --- detail dialog state ---
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  // --- create form state ---
  const [formVoucherWord, setFormVoucherWord] = useState<string>('转');
  const [formDate, setFormDate] = useState('');
  const [formSummary, setFormSummary] = useState('');

  const utils = trpc.useUtils();

  // ─── Queries ─────────────────────────────────────────────────────

  const listQuery = trpc.voucher.list.useQuery({
    auditStatus: auditStatus as 'pending' | 'approved' | 'posted' | 'all' | undefined,
    keyword: appliedKeyword || undefined,
    year: year || undefined,
    month: month || undefined,
    limit: 50,
    offset: 0,
  });

  // ─── Mutations ───────────────────────────────────────────────────

  const createMutation = trpc.voucher.create.useMutation({
    onSuccess: () => {
      toast.success('凭证创建成功');
      setCreateOpen(false);
      resetForm();
      utils.voucher.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '创建失败，请重试');
    },
  });

  const approveMutation = trpc.voucher.approve.useMutation({
    onSuccess: () => {
      toast.success('凭证审核通过');
      utils.voucher.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '审核失败，请重试');
    },
  });

  const voidMutation = trpc.voucher.void.useMutation({
    onSuccess: () => {
      toast.success('凭证已作废');
      utils.voucher.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '作废失败，请重试');
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────

  const resetForm = () => {
    setFormVoucherWord('转');
    setFormDate('');
    setFormSummary('');
  };

  const handleSearch = () => setAppliedKeyword(keyword);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleCreate = () => {
    if (!formDate || !formSummary) {
      toast.error('请填写日期和摘要');
      return;
    }
    // Demo entries with placeholder subject IDs — in production a full entry builder is needed
    createMutation.mutate({
      voucherWord: formVoucherWord as '收' | '付' | '转',
      voucherDate: formDate,
      summary: formSummary,
      entries: [
        { subjectId: 1, debitAmount: 1000, creditAmount: 0, summary: formSummary },
        { subjectId: 2, debitAmount: 0, creditAmount: 1000, summary: formSummary },
      ],
    });
  };

  const handleApprove = (id: bigint | number) => approveMutation.mutate({ id: Number(id) });
  const handleVoid = (id: bigint | number) => voidMutation.mutate({ id: Number(id), reason: '用户主动作废' });

  // ─── 查看详情 ───────────────────────────────────────────────
  const detailQuery = trpc.voucher.byId.useQuery(
    { id: detailId! },
    { enabled: detailOpen && detailId !== null },
  );
  const openDetail = (id: bigint | number) => {
    setDetailId(Number(id));
    setDetailOpen(true);
  };

  // ─── 从原始凭证汇总生成记账凭证 ──────────────────────────────────
  const [genOpen, setGenOpen] = useState(false);
  const [genSelected, setGenSelected] = useState<Set<number>>(new Set());
  const [genWord, setGenWord] = useState<'收' | '付' | '转'>('转');
  const [genDate, setGenDate] = useState('');
  const [genSummary, setGenSummary] = useState('');
  const [genEntries, setGenEntries] = useState<VEntry[]>([]);

  const pendingSrcQuery = trpc.sourceVoucher.list.useQuery(
    { status: '待制证', limit: 100, offset: 0 },
    { enabled: genOpen },
  );
  const subjectsQuery = trpc.subject.list.useQuery(undefined, { enabled: genOpen });
  const subjects = (subjectsQuery.data ?? []) as Array<{ id: bigint | number; code: string; name: string }>;

  const genBatchMutation = trpc.voucher.batchCreate.useMutation({
    onSuccess: () => {
      toast.success(`已生成 1 张记账凭证（汇总 ${genSelected.size} 张原始凭证）`);
      setGenOpen(false);
      resetGen();
      utils.voucher.list.invalidate();
    },
    onError: (e) => toast.error(`生成失败：${e.message}`),
  });

  const resetGen = () => {
    setGenSelected(new Set());
    setGenWord('转');
    setGenDate(new Date().toISOString().slice(0, 10));
    setGenSummary('');
    setGenEntries([]);
  };

  const toggleSrc = (id: number) => {
    setGenSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateGenEntry = (idx: number, patch: Partial<VEntry>) => {
    setGenEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };
  const addGenEntry = () => setGenEntries((p) => [...p, { subjectId: '', dir: '借', amount: '' }]);
  const removeGenEntry = (idx: number) =>
    setGenEntries((p) => (p.length <= 2 ? p : p.filter((_, i) => i !== idx)));

  const genDebit = genEntries.filter((e) => e.dir === '借').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const genCredit = genEntries.filter((e) => e.dir === '贷').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const genBalanced = Math.abs(genDebit - genCredit) < 0.01;
  const genComplete = genEntries.length >= 2 && genEntries.every((e) => e.subjectId !== '' && e.amount !== '');
  const genValid = genSelected.size >= 1 && genComplete && genBalanced;

  const handleOpenGen = () => {
    resetGen();
    setGenOpen(true);
  };

  const handleConfirmGen = () => {
    if (!genValid) return;
    genBatchMutation.mutate({
      sourceVoucherIds: Array.from(genSelected),
      voucherWord: genWord,
      voucherDate: genDate || new Date().toISOString().slice(0, 10),
      summary: genSummary || genDefaultSummary || `汇总${selectedSrc.length}张原始凭证`,
      entries: genEntries.map((e) => ({
        subjectId: Number(e.subjectId),
        summary: undefined,
        debitAmount: e.dir === '借' ? Number(e.amount) || 0 : 0,
        creditAmount: e.dir === '贷' ? Number(e.amount) || 0 : 0,
      })),
    });
  };

  // 已选原始凭证对象（用于汇总金额、自动填充分录）
  const selectedSrc =
    pendingSrcQuery.data?.items.filter((v) => genSelected.has(Number(v.id))) ?? [];

  // 从所选原始凭证的货物名称拼接默认摘要（用户可手动覆盖）
  const genDefaultSummary = selectedSrc
    .map((v) => v.itemDescription)
    .filter(Boolean)
    .join('；') || undefined;

  // 按所选原始凭证金额合计，快捷填充「借/贷」两条等额分录（科目留空待选）
  const autoFillEntries = () => {
    const sum = selectedSrc.reduce((s, v) => s + (Number(v.amount) || 0), 0);
    if (sum <= 0) {
      toast.error('所选原始凭证金额合计为 0，无法自动填充');
      return;
    }
    setGenEntries([
      { subjectId: '', dir: '借', amount: sum },
      { subjectId: '', dir: '贷', amount: sum },
    ]);
  };

  // ─── Derived data ────────────────────────────────────────────────

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const signItems = items.filter((v) => v.voucherWord === '收' || v.voucherWord === '付');
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            VOUCHER PREPARATION
          </div>
          <h1 className="page-title mt-1">凭证填制</h1>
          <p className="page-subtitle">
            AI先形成全部凭证信息；会计专员查看、修改并确认后，才生成正式凭证编号。
          </p>
        </div>
        <div className="flex gap-2">
          {/* 增加凭证 dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              <Plus className="h-4 w-4" /> 增加凭证
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新增凭证</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>凭证字</Label>
                  <Select value={formVoucherWord} onValueChange={(v) => setFormVoucherWord(v ?? '转')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="收">收</SelectItem>
                      <SelectItem value="付">付</SelectItem>
                      <SelectItem value="转">转</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>日期</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>摘要</Label>
                  <Textarea
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="请输入业务摘要"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                  取消
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? '创建中...' : '确认创建'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" onClick={handleOpenGen}>
            <Link2 className="h-4 w-4 mr-1" /> 从原始凭证生成
          </Button>
        </div>
      </div>

      {/* ── 从原始凭证生成记账凭证 Dialog ─────────────────────── */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>从原始凭证生成记账凭证</DialogTitle>
            <DialogDescription>
              多选「待制证」原始凭证，编辑借贷分录（自动校验借贷平衡），一键生成一张汇总记账凭证。
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左：原始凭证多选 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">
                  待制证原始凭证（{pendingSrcQuery.data?.items.length ?? 0}）
                </Label>
                {genSelected.size > 0 && (
                  <span className="text-xs text-muted-foreground">
                    已选 {genSelected.size} 张 · 合计{' '}
                    {fmtAmount(selectedSrc.reduce((s, v) => s + (Number(v.amount) || 0), 0))}
                  </span>
                )}
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto divide-y">
                {pendingSrcQuery.isLoading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : (pendingSrcQuery.data?.items.length ?? 0) === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    暂无待制证的原始凭证，请先到「智能采集」录入
                  </div>
                ) : (
                  pendingSrcQuery.data!.items.map((v) => (
                    <label
                      key={String(v.id)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={genSelected.has(Number(v.id))}
                        onCheckedChange={() => toggleSrc(Number(v.id))}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono">{v.voucherNo}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.itemDescription}
                        </div>
                      </div>
                      <div className="text-xs font-mono tabular-nums whitespace-nowrap">
                        {fmtAmount(v.amount)}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* 右：凭证信息 + 分录 */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">凭证字</Label>
                  <Select value={genWord} onValueChange={(v) => setGenWord((v as '收' | '付' | '转') ?? '转')}>
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="收">收</SelectItem>
                      <SelectItem value="付">付</SelectItem>
                      <SelectItem value="转">转</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">凭证日期</Label>
                  <Input type="date" className="h-7 text-xs" value={genDate} onChange={(e) => setGenDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">摘要</Label>
                <Input
                  className="h-7 text-xs"
                  value={genSummary}
                  onChange={(e) => setGenSummary(e.target.value)}
                  placeholder={
                    genDefaultSummary
                      ? `自动：${genDefaultSummary}`
                      : genSelected.size > 0
                        ? `汇总 ${genSelected.size} 张原始凭证`
                        : '请输入凭证摘要'
                  }
                />
              </div>

              {/* 分录编辑器 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">借贷分录</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onClick={autoFillEntries}
                      disabled={genSelected.size === 0}
                    >
                      快捷填充
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onClick={addGenEntry}
                    >
                      <Plus className="h-3 w-3 mr-1" /> 添加分录
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {genEntries.map((e, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_60px_120px_28px] gap-1.5 items-center">
                      <Select
                        value={e.subjectId === '' ? null : String(e.subjectId)}
                        onValueChange={(v) => updateGenEntry(idx, { subjectId: v ? Number(v) : '' })}
                      >
                        <SelectTrigger size="sm" className="h-7 text-xs">
                          <SelectValue placeholder="选择科目" />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          {subjects.map((s) => (
                            <SelectItem key={String(s.id)} value={String(s.id)}>
                              {s.code} {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={e.dir}
                        onValueChange={(v) => updateGenEntry(idx, { dir: (v as '借' | '贷') ?? '借' })}
                      >
                        <SelectTrigger size="sm" className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="借">借</SelectItem>
                          <SelectItem value="贷">贷</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        className="h-7 text-xs tabular-nums"
                        value={e.amount === '' ? '' : String(e.amount)}
                        onChange={(ev) =>
                          updateGenEntry(idx, {
                            amount: ev.target.value === '' ? '' : Number(ev.target.value),
                          })
                        }
                        placeholder="金额"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => removeGenEntry(idx)}
                        disabled={genEntries.length <= 2}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* 平衡校验 */}
                <div className="flex items-center justify-between text-xs rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-muted-foreground">
                    借 {fmtAmount(genDebit)} · 贷 {fmtAmount(genCredit)}
                  </span>
                  <Badge variant="outline" className={genBalanced ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}>
                    {genBalanced ? '借贷平衡' : '借贷不平衡'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setGenOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmGen}
              disabled={!genValid || genBatchMutation.isPending}
            >
              {genBatchMutation.isPending ? '生成中...' : `确认生成（${genSelected.size} 张）`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 记账凭证详情 Dialog ─────────────────────────────── */}
      <Dialog
        open={detailOpen}
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) setDetailId(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>记账凭证详情</DialogTitle>
            {detailQuery.data && (
              <DialogDescription>
                {fmtVoucherNo(detailQuery.data)} · {fmtDate(detailQuery.data.voucherDate)}
              </DialogDescription>
            )}
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !detailQuery.data ? (
            <Alert variant="destructive">
              <AlertTitle>未找到凭证</AlertTitle>
              <AlertDescription>该凭证可能已删除或无权限访问</AlertDescription>
            </Alert>
          ) : (() => {
              const d = detailQuery.data as unknown as {
                voucherWord: string;
                voucherNumber: number;
                voucherDate: any;
                summary: string | null;
                debitAmount: number;
                creditAmount: number;
                auditStatus: string;
                status: string;
                entries: Array<{
                  subject?: { code?: string | null; name?: string | null };
                  direction: string;
                  debitAmount: number;
                  creditAmount: number;
                  summary?: string | null;
                }>;
                signatures: Array<{ role?: string | null; signerName?: string | null; signedAt?: any }>;
                sourceVouchers: Array<{
                  id: bigint | number;
                  voucherNo: string;
                  itemDescription?: string | null;
                  amount: number;
                  status: string;
                }>;
              };
              const ast = statusBadge(d.auditStatus);
              const balanced = Math.abs(Number(d.debitAmount) - Number(d.creditAmount)) < 0.01;
              return (
                <div className="space-y-5">
                  {/* 凭证头 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">凭证字号</div>
                      <div className="font-mono font-medium">{fmtVoucherNo(d)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">业务日期</div>
                      <div className="font-mono">{fmtDate(d.voucherDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">状态</div>
                      <Badge variant="outline" className={ast.cls}>{ast.label}</Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">摘要</div>
                      <div>{d.summary || '—'}</div>
                    </div>
                  </div>

                  {/* 借贷分录 */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">借贷分录</div>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px]">
                          <TableHead>科目编码</TableHead>
                          <TableHead>科目名称</TableHead>
                          <TableHead>方向</TableHead>
                          <TableHead className="text-right">金额</TableHead>
                          <TableHead>行摘要</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {d.entries.map((e, i) => (
                          <TableRow key={i} className="text-xs">
                            <TableCell className="font-mono">{e.subject?.code ?? '—'}</TableCell>
                            <TableCell>{e.subject?.name ?? '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={e.direction === '借' ? 'text-success' : 'text-warning'}>
                                {e.direction}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtAmount(e.direction === '借' ? e.debitAmount : e.creditAmount)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{e.summary || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between text-xs rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">借 {fmtAmount(d.debitAmount)} · 贷 {fmtAmount(d.creditAmount)}</span>
                      <Badge variant="outline" className={balanced ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}>
                        {balanced ? '借贷平衡' : '借贷不平衡'}
                      </Badge>
                    </div>
                  </div>

                  {/* 来源原始凭证清单 */}
                  {d.sourceVouchers.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        来源原始凭证（{d.sourceVouchers.length} 张）
                      </div>
                      <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                        {d.sourceVouchers.map((s) => (
                          <div key={String(s.id)} className="flex items-center gap-3 px-3 py-2 text-xs">
                            <span className="font-mono">{s.voucherNo}</span>
                            <span className="flex-1 min-w-0 truncate text-muted-foreground">{s.itemDescription ?? '—'}</span>
                            <span className="font-mono tabular-nums whitespace-nowrap">{fmtAmount(s.amount)}</span>
                            <Badge variant="outline" className="text-muted-foreground">{s.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 签字记录 */}
                  {d.signatures.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">签字记录</div>
                      <div className="space-y-1">
                        {d.signatures.map((sg, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{sg.role ?? '签字'}</Badge>
                            <span>{sg.signerName ?? '—'}</span>
                            {sg.signedAt && <span className="ml-auto">{fmtDate(sg.signedAt)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator />

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={auditStatus} onValueChange={(v) => setAuditStatus(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="审核状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已审核</SelectItem>
            <SelectItem value="posted">已过账</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="搜索凭证号/摘要..."
            className="w-48 h-7 text-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={handleSearch}>
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="年份"
            className="w-20 h-7 text-xs"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Input
            placeholder="月份"
            className="w-16 h-7 text-xs"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">共 {isLoading ? '...' : total} 条</span>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: '待审核',
            value: isLoading ? '...' : `${items.filter((v) => v.auditStatus === 'pending').length}张`,
          },
          {
            label: '已审核',
            value: isLoading ? '...' : `${items.filter((v) => v.auditStatus === 'approved').length}张`,
          },
          {
            label: '已过账',
            value: isLoading ? '...' : `${items.filter((v) => v.auditStatus === 'posted').length}张`,
          },
          { label: '本月凭证', value: isLoading ? '...' : `${total}张` },
        ].map((s) => (
          <Card key={s.label} className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold mt-1">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Work queue ──────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">会计专员制证工作队列</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
              暂无凭证数据，点击"增加凭证"创建第一张凭证
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>原始凭证号</TableHead>
                  <TableHead>业务日期</TableHead>
                  <TableHead>业务事项</TableHead>
                  <TableHead>原始资料</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>风险</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, i) => {
                  const ast = statusBadge(row.auditStatus);
                  const risk = riskBadge(row.auditStatus);
                  return (
                    <TableRow key={String(row.id)} className="text-xs">
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono">{fmtVoucherNo(row)}</TableCell>
                      <TableCell>{fmtDate(row.voucherDate)}</TableCell>
                      <TableCell>{row.summary}</TableCell>
                      <TableCell>
                        {row.attachmentCount > 0
                          ? `附件${row.attachmentCount}张`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAmount(row.debitAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('bg-success/10', risk.cls)}
                        >
                          {risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ast.cls}>
                          {ast.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => openDetail(row.id)}
                          >
                            <Eye className="h-3.5 w-3.5" /> 查看
                          </Button>
                          {row.auditStatus === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleApprove(row.id)}
                              disabled={approveMutation.isPending}
                            >
                              审核
                            </Button>
                          )}
                          {row.status !== 'voided' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleVoid(row.id)}
                              disabled={voidMutation.isPending}
                            >
                              作废
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── 出纳签字范围 ────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> 出纳签字范围
          </CardTitle>
          <CardDescription>
            仅显示含库存现金或银行存款科目的收款、付款记账凭证
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {errorMsg || '无法获取签字范围数据'}
              </AlertDescription>
            </Alert>
          ) : signItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无需要签字的收/付款凭证
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>凭证字号</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead>资金分录</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>审核</TableHead>
                  <TableHead>收付状态</TableHead>
                  <TableHead className="text-center">签字</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signItems.map((row) => {
                  const ast = statusBadge(row.auditStatus);
                  const entriesText =
                    row.entries && row.entries.length > 0
                      ? row.entries
                          .map(
                            (e) =>
                              `${e.direction === '借' ? '借' : '贷'}：${e.subject?.code ?? ''} ${e.subject?.name ?? ''}`,
                          )
                          .join(' / ')
                      : '—';
                  return (
                    <TableRow key={String(row.id)} className="text-xs">
                      <TableCell className="font-medium">
                        {fmtVoucherNo(row)}
                      </TableCell>
                      <TableCell>{fmtDate(row.voucherDate)}</TableCell>
                      <TableCell>{row.summary}</TableCell>
                      <TableCell>{entriesText}</TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAmount(row.debitAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success/10 text-success">
                          {ast.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            row.status === 'approved'
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {row.status === 'approved' ? '已到账' : row.status === 'voided' ? '已作废' : row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          出纳签字
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
    </div>
  );
}
