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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, FileText, Search } from 'lucide-react';

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
          <Button size="sm" variant="outline">批量生成</Button>
          <Button size="sm">生成凭证</Button>
        </div>
      </div>

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
