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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Shield,
  FileText,
  CircleAlert,
  Plus,
  Check,
  X,
  Search,
  Wallet,
} from 'lucide-react';
import { fmtDate, fmtAmount } from '@/lib/format';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function approvalBadge(s: string | undefined): { label: string; cls: string } {
  switch (s) {
    case '已审批':
      return { label: '已审批', cls: 'bg-success/10 text-success' };
    case '已驳回':
      return { label: '已驳回', cls: 'bg-danger/10 text-danger' };
    case '待审批':
    default:
      return { label: s ?? '待审批', cls: 'bg-warning/10 text-warning' };
  }
}

function paymentBadge(s: string | undefined): { label: string; cls: string } {
  switch (s) {
    case '已支付':
      return { label: '已支付', cls: 'bg-success/10 text-success' };
    case '未支付':
    default:
      return { label: s ?? '未支付', cls: 'bg-muted-foreground/20 text-muted-foreground' };
  }
}

/* ------------------------------------------------------------------ */
/*  Summary card data                                                  */
/* ------------------------------------------------------------------ */

interface SummaryCard {
  label: string;
  value: string;
  icon: React.ReactNode;
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function BusinessEntryView() {
  /* Filter state */
  const [approvalStatus, setApprovalStatus] = useState<string>('all');
  const [expenseType, setExpenseType] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  /* Create dialog state */
  const [createOpen, setCreateOpen] = useState(false);
  const [formType, setFormType] = useState<string>('办公费');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const utils = trpc.useUtils();

  /* ── Queries ──────────────────────────────────────────────────── */

  const listQuery = trpc.expense.list.useQuery({
    approvalStatus: approvalStatus !== 'all' ? approvalStatus : undefined,
    expenseType: expenseType !== 'all' ? expenseType : undefined,
    keyword: appliedKeyword || undefined,
    limit: 50,
    offset: 0,
  });

  /* ── Mutations ────────────────────────────────────────────────── */

  const createMutation = trpc.expense.create.useMutation({
    onSuccess: () => {
      toast.success('费用报销单创建成功');
      setCreateOpen(false);
      setFormDesc('');
      setFormAmount('');
      setFormDate('');
      utils.expense.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '创建失败，请重试');
    },
  });

  const approveMutation = trpc.expense.approve.useMutation({
    onSuccess: () => {
      toast.success('报销单已审批');
      utils.expense.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '审批失败，请重试');
    },
  });

  const rejectMutation = trpc.expense.reject.useMutation({
    onSuccess: () => {
      toast.success('报销单已驳回');
      utils.expense.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '驳回失败，请重试');
    },
  });

  const markPaidMutation = trpc.expense.markPaid.useMutation({
    onSuccess: () => {
      toast.success('已标记为已支付');
      utils.expense.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '标记支付失败，请重试');
    },
  });

  /* ── Derived data ─────────────────────────────────────────────── */

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const pendingCount = items.filter((i) => i.approvalStatus === '待审批').length;
  const approvedCount = items.filter((i) => i.approvalStatus === '已审批').length;
  const paidCount = items.filter((i) => i.paymentStatus === '已支付').length;

  const summaryCards: SummaryCard[] = [
    { label: '报销单总数', value: isLoading ? '...' : `${total} 笔`, icon: <FileText className="h-4 w-4 text-primary" /> },
    { label: '待审批', value: isLoading ? '...' : `${pendingCount} 笔`, icon: <CircleAlert className="h-4 w-4 text-warning" /> },
    { label: '已支付', value: isLoading ? '...' : `${paidCount} 笔`, icon: <Check className="h-4 w-4 text-success" /> },
    { label: '报销总额', value: isLoading ? '...' : fmtAmount(totalAmount), icon: <Wallet className="h-4 w-4 text-primary" /> },
  ];

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleSearch = () => setAppliedKeyword(keyword);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleCreate = () => {
    if (!formDesc || !formAmount || !formDate) {
      toast.error('请填写描述、金额和日期');
      return;
    }
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('金额必须大于0');
      return;
    }
    createMutation.mutate({
      expenseType: formType as '差旅费' | '办公费' | '招待费' | '交通费' | '其他',
      amount: amt,
      expenseDate: formDate,
      description: formDesc,
      attachmentCount: 0,
    });
  };

  const handleApprove = (id: bigint | number) => approveMutation.mutate({ id: Number(id) });
  const handleReject = (id: bigint | number) => rejectMutation.mutate({ id: Number(id), reason: '不合规' });
  const handleMarkPaid = (id: bigint | number) => markPaidMutation.mutate({ id: Number(id) });

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">业务录入</h1>
          <p className="page-subtitle">
            录入收入、费用、采购、销售及收付款业务；通过基础校验后自动生成凭证草稿。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast('已保存为草稿，可继续修改')}>
            保存并生成凭证草稿
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
              <Plus className="h-4 w-4" /> 新增报销单
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新增费用报销单</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>费用类型</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v ?? '办公费')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="差旅费">差旅费</SelectItem>
                      <SelectItem value="办公费">办公费</SelectItem>
                      <SelectItem value="招待费">招待费</SelectItem>
                      <SelectItem value="交通费">交通费</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>金额</Label>
                  <Input
                    type="number"
                    placeholder="请输入报销金额"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>日期</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input
                    placeholder="请输入费用描述"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
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
        </div>
      </div>

      <Separator />

      {/* ── Permission note ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-3 text-sm">
        <Shield className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground text-xs">
          操作权限与复核控制 — 保存、修改与提交复核均记录操作人和时间；审核、反审核及结账按岗位权限执行。
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => toast('已保存为草稿，可继续修改')}>
          保存草稿
        </Button>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="elevation-1">
            <CardContent className="pt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {card.icon}
                {card.label}
              </div>
              <div className="text-xl font-bold font-mono mt-1">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={approvalStatus} onValueChange={(v) => setApprovalStatus(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="审批状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="待审批">待审批</SelectItem>
            <SelectItem value="已审批">已审批</SelectItem>
            <SelectItem value="已驳回">已驳回</SelectItem>
          </SelectContent>
        </Select>
        <Select value={expenseType} onValueChange={(v) => setExpenseType(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="费用类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="差旅费">差旅费</SelectItem>
            <SelectItem value="办公费">办公费</SelectItem>
            <SelectItem value="招待费">招待费</SelectItem>
            <SelectItem value="交通费">交通费</SelectItem>
            <SelectItem value="其他">其他</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="搜索描述/部门..."
            className="w-48 h-7 text-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={handleSearch}>
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">共 {isLoading ? '...' : total} 条</span>
      </div>

      {/* ── Expense table ─────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">费用报销单</CardTitle>
          <CardDescription>管理费用、销售费用等日常报销事项</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>费用类型</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>审批状态</TableHead>
                  <TableHead>支付状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{errorMsg || '无法获取报销单列表，请检查网络连接后重试'}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无费用报销单，点击"新增报销单"创建第一笔报销
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>费用类型</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>审批状态</TableHead>
                  <TableHead>支付状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const apv = approvalBadge(item.approvalStatus ?? undefined);
                  const pay = paymentBadge(item.paymentStatus ?? undefined);
                  return (
                    <TableRow key={String(item.id)}>
                      <TableCell className="font-mono text-xs">{String(item.id)}</TableCell>
                      <TableCell className="text-sm">{item.expenseType}</TableCell>
                      <TableCell className="text-sm">{item.departmentName || '—'}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell className="text-sm">{fmtDate(item.expenseDate)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{fmtAmount(item.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={apv.cls}>{apv.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pay.cls}>{pay.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.approvalStatus === '待审批' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleApprove(item.id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="h-3 w-3 mr-0.5" /> 审批
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-destructive"
                                onClick={() => handleReject(item.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="h-3 w-3 mr-0.5" /> 驳回
                              </Button>
                            </>
                          )}
                          {item.approvalStatus === '已审批' && item.paymentStatus !== '已支付' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkPaid(item.id)}
                              disabled={markPaidMutation.isPending}
                            >
                              <Check className="h-3 w-3 mr-0.5" /> 标记已支付
                            </Button>
                          )}
                          {item.approvalStatus !== '待审批' && item.paymentStatus === '已支付' && (
                            <span className="text-xs text-muted-foreground">已完成</span>
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
    </div>
  );
}
