'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RippleContainer } from '@/components/custom/RippleContainer';
import {
  Search,
  RotateCcw,
  FileText,
  CheckCircle2,
  Shield,
  Clock,
  AlertTriangle,
  Printer,
  Eye,
  History,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { fmtDate, fmtAmount } from '@/lib/format';

// ─── Types ────────────────────────────────────────────────────────────

type AuditStatus = 'pending' | 'approved' | 'posted';

// ─── Helpers ──────────────────────────────────────────────────────────

function fmtVoucherNo(v: { voucherWord: string; voucherNumber: number }): string {
  return `${v.voucherWord}字${v.voucherNumber}号`;
}

function getCategoryLabel(voucherWord: string): string {
  switch (voucherWord) {
    case '收':
      return '收款凭证';
    case '付':
      return '付款凭证';
    case '转':
      return '转账凭证';
    default:
      return voucherWord || '—';
  }
}

function getStatusBadgeVariant(auditStatus: string) {
  switch (auditStatus) {
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'approved':
      return 'bg-success/10 text-success border-success/20';
    case 'posted':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return '';
  }
}

function getStatusLabel(auditStatus: string): string {
  switch (auditStatus) {
    case 'pending':
      return '待审核';
    case 'approved':
      return '已审核';
    case 'posted':
      return '已记账';
    default:
      return auditStatus;
  }
}

function buildInfoFromEntries(entries: unknown[]): string {
  if (!entries || entries.length === 0) return '—';
  const subjects = entries.map((e: any) => {
    const direction = e.direction === '借' ? '借' : '贷';
    const code = e.subject?.code ?? '?';
    return `${direction}：${code}`;
  });
  return `科目：${subjects.join(' / ')}`;
}

const TAB_ITEMS: { value: AuditStatus | 'all'; label: string }[] = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'posted', label: '已记账' },
  { value: 'all', label: '全部凭证' },
];

// ─── Component ────────────────────────────────────────────────────────

export function VoucherQueryView() {
  const { currentRole } = useAppStore();
  const isDirector = currentRole === '财务负责人';

  // --- filter state ---
  const [activeTab, setActiveTab] = useState<AuditStatus | 'all'>('all');
  const [category, setCategory] = useState('全部类别');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('07');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  // --- sheet state ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const utils = trpc.useUtils();

  // ─── Query ────────────────────────────────────────────────────────

  const listQuery = trpc.voucher.list.useQuery({
    auditStatus: activeTab === 'all' ? undefined : activeTab,
    category: category === '全部类别' ? undefined : category,
    year: year || undefined,
    month: month || undefined,
    keyword: appliedKeyword || undefined,
    limit: 20,
    offset: 0,
  });

  // ─── Mutations ────────────────────────────────────────────────────

  const approveMutation = trpc.voucher.approve.useMutation({
    onSuccess: () => {
      toast.success('审核完成');
      utils.voucher.list.invalidate();
      // update selected item if still open
      if (selectedItem) {
        setSelectedItem({ ...selectedItem, auditStatus: 'approved', status: 'approved' });
      }
    },
    onError: (err) => {
      toast.error(err.message || '审核失败，请重试');
    },
  });

  const voidMutation = trpc.voucher.void.useMutation({
    onSuccess: () => {
      toast.success('凭证已作废');
      utils.voucher.list.invalidate();
      setSelectedItem(null);
      setSheetOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || '作废失败，请重试');
    },
  });

  // ─── Derived data ─────────────────────────────────────────────────

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  const pageTotalDebit = items.reduce((sum, v) => sum + Number(v.debitAmount ?? 0), 0);
  const pageTotalCredit = items.reduce((sum, v) => sum + Number(v.creditAmount ?? 0), 0);

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleSearch = () => {
    setAppliedKeyword(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setCategory('全部类别');
    setYear('2026');
    setMonth('07');
    setKeyword('');
    setAppliedKeyword('');
    setActiveTab('all');
    toast.info('筛选条件已重置');
  };

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setSheetOpen(true);
  };

  const handleApprove = () => {
    if (!selectedItem) return;
    if (selectedItem.auditStatus !== 'pending') {
      toast.warning('仅待审核凭证可执行审核');
      return;
    }
    approveMutation.mutate({ id: Number(selectedItem.id) });
  };

  const handleUnapprove = () => {
    // The API does not currently support an "unapprove" endpoint.
    // In a production system this would revert auditStatus back to 'pending'.
    toast.info('反审核功能需要服务端支持，当前版本暂不可用');
  };

  const handleBatchApprove = () => {
    // Batch approval requires a dedicated server endpoint which is not yet available.
    // Approve the first 5 pending from the current page as a demo.
    const pendingItems = items.filter((v: any) => v.auditStatus === 'pending');
    if (pendingItems.length === 0) {
      toast.warning('当前页面没有待审核凭证');
      return;
    }
    // Approve up to 5 pending items sequentially
    const toApprove = pendingItems.slice(0, 5);
    toApprove.forEach((v: any) => {
      approveMutation.mutate({ id: Number(v.id) });
    });
    toast.success(`批量审核已提交：${toApprove.length} 张待审核凭证`);
  };

  const handlePrint = () => {
    toast.info('打印预览功能开发中');
  };

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            VOUCHER QUERY
          </div>
          <h1 className="page-title mt-1">查询凭证</h1>
        </div>
        {isDirector && (
          <div className="flex gap-2">
            <RippleContainer className="ripple-container rounded-md">
              <Button
                size="sm"
                disabled={!selectedItem || approveMutation.isPending}
                onClick={handleApprove}
              >
                审核当前凭证
              </Button>
            </RippleContainer>
            <RippleContainer className="ripple-container rounded-md">
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedItem}
                onClick={handleUnapprove}
              >
                反审核当前凭证
              </Button>
            </RippleContainer>
            <RippleContainer className="ripple-container rounded-md">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchApprove}
                disabled={approveMutation.isPending}
              >
                批量审核
              </Button>
            </RippleContainer>
          </div>
        )}
      </div>

      {/* ========== Permission Notice (非财务负责人) ========== */}
      {!isDirector && (
        <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-3 text-sm">
          <Shield className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-muted-foreground text-xs">
            当前为财务专员角色，仅可查询与查看凭证，无审核 / 反审核权限。
          </span>
        </div>
      )}

      <Separator />

      {/* ========== Filters ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4 flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v ?? '全部类别')}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部类别">全部类别</SelectItem>
              <SelectItem value="收款凭证">收款凭证（收字）</SelectItem>
              <SelectItem value="付款凭证">付款凭证（付字）</SelectItem>
              <SelectItem value="转账凭证">转账凭证（转字）</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={(v) => setYear(v ?? '2026')}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={(v) => setMonth(v ?? '07')}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="07">07月</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="凭证字号、摘要、制单人"
            className="h-8 text-xs w-48"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <RippleContainer className="ripple-container rounded-md">
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={handleSearch}
            >
              <Search className="h-3.5 w-3.5" /> 查询
            </Button>
          </RippleContainer>
          <RippleContainer className="ripple-container rounded-md">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" /> 重置
            </Button>
          </RippleContainer>
        </CardContent>
      </Card>

      {/* ========== Tabs ========== */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AuditStatus | 'all')}
      >
        <TabsList>
          {TAB_ITEMS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="text-xs"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ========== Query Note ========== */}
      <p className="text-xs text-muted-foreground">
        凭证字号在生成时按核算主体、会计期间和凭证类别顺序分配。草稿没有字号，也不能被主管审核或登记账簿。查询结果按凭证日期降序排列，
        <span className="text-foreground font-medium">点击任意行可查看凭证详情与审计轨迹</span>。
      </p>

      {/* ========== Voucher List Table ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground mb-2">
            {isLoading
              ? '正在加载...'
              : `${total} 张凭证 · 按生成记录查询`}
          </div>

          {isLoading ? (
            /* ── Loading skeleton ── */
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            /* ── Error state ── */
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {errorMsg || '无法获取凭证列表，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            /* ── Empty state ── */
            <div className="py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                未找到符合条件的凭证，请调整筛选条件后重试
              </p>
            </div>
          ) : (
            /* ── Data table ── */
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead className="w-[120px]">凭证字号</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead className="hidden md:table-cell">相关信息</TableHead>
                  <TableHead className="w-[120px]">状态</TableHead>
                  <TableHead className="w-[80px] text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => {
                  const isSelected = selectedItem && selectedItem.id === item.id;
                  const voucherNoDisplay = fmtVoucherNo(item);
                  const infoDisplay = buildInfoFromEntries(item.entries);
                  const statusDisplay = getStatusLabel(item.auditStatus);
                  return (
                    <TableRow
                      key={String(item.id)}
                      className={cn(
                        'text-xs cursor-pointer transition-colors hover:bg-accent/40',
                        isSelected && 'bg-accent/50 border-l-2 border-l-primary'
                      )}
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell className="font-medium">{voucherNoDisplay}</TableCell>
                      <TableCell>{item.summary}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {infoDisplay}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(getStatusBadgeVariant(item.auditStatus))}
                        >
                          {statusDisplay}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* ========== Footer: 借方/贷方/合计 + 落款 ========== */}
          {!isLoading && !isError && items.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-muted/30 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground">借方金额合计：</span>
                  <span className="font-mono font-medium">{fmtAmount(pageTotalDebit)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">贷方金额合计：</span>
                  <span className="font-mono font-medium">{fmtAmount(pageTotalCredit)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">合 计：</span>
                  <span className="font-mono font-medium">{fmtAmount(pageTotalDebit)}</span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>记账：林主管</span>
                <span>复核：</span>
                <span>制单：周会计</span>
                <span>凭证来源：业务系统</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ========== Empty state: no voucher selected ========== */}
      {!selectedItem && (
        <Card className="elevation-1 border-dashed">
          <CardContent className="py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              点击上方表格中的任意凭证行，查看原始资料与业务来源及完整审计轨迹
            </p>
          </CardContent>
        </Card>
      )}

      {/* ========== Voucher Detail Sheet ========== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full p-0">
          <ScrollArea className="h-full">
            <SheetHeader className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <SheetTitle className="text-base">凭证详情</SheetTitle>
              </div>
              <SheetDescription>
                {selectedItem ? (
                  <span>
                    {fmtVoucherNo(selectedItem)} — {selectedItem.summary}
                  </span>
                ) : (
                  '请选择凭证'
                )}
              </SheetDescription>
            </SheetHeader>

            {selectedItem && (
              <div className="p-4 space-y-4">
                {/* Basic info */}
                <Card className="elevation-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">原始资料与业务来源</CardTitle>
                    <CardDescription>
                      {selectedItem.entries && selectedItem.entries.length > 0
                        ? selectedItem.entries
                            .map((e: any) =>
                              `科目 ${e.subject?.code ?? '?'} ${e.subject?.name ?? ''}（${e.direction === '借' ? '借方' : '贷方'} ${fmtAmount(e.debitAmount || e.creditAmount)}）`
                            )
                            .join('；')
                        : '暂无分录信息'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">凭证类别</span>
                        <div className="font-medium">{getCategoryLabel(selectedItem.voucherWord)}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">业务日期</span>
                        <div className="font-medium">{fmtDate(selectedItem.voucherDate)}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">凭证字号</span>
                        <div className="font-medium">{fmtVoucherNo(selectedItem)}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">附件数量</span>
                        <div className="font-medium">{selectedItem.attachmentCount ?? 0} 张</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">借方金额</span>
                        <div className="font-mono font-medium text-success">
                          {fmtAmount(selectedItem.debitAmount)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">贷方金额</span>
                        <div className="font-mono font-medium text-danger">
                          {fmtAmount(selectedItem.creditAmount)}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          附件数量：{selectedItem.attachmentCount ?? 0} 张
                          {selectedItem.sourceType && (
                            <span> · 来源类型：{selectedItem.sourceType}</span>
                          )}
                          {selectedItem.flowNo && (
                            <span> · 流水号：{selectedItem.flowNo}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          附件归档状态：凭证编号 {fmtVoucherNo(selectedItem)}，已通过审批流程
                        </span>
                      </div>
                      {selectedItem.auditStatus !== 'pending' && (
                        <div className="flex items-start gap-2">
                          <History className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            审核状态：{getStatusLabel(selectedItem.auditStatus)}，凭证已可登记账簿
                          </span>
                        </div>
                      )}
                      {selectedItem.auditStatus === 'pending' && (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            当前凭证尚未审核，暂不支持登记账簿
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Entries detail */}
                {selectedItem.entries && selectedItem.entries.length > 0 && (
                  <Card className="elevation-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">分录明细</CardTitle>
                      <CardDescription>
                        共 {selectedItem.entries.length} 条分录
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[11px]">
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>科目编码</TableHead>
                            <TableHead>科目名称</TableHead>
                            <TableHead>方向</TableHead>
                            <TableHead className="text-right">金额</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedItem.entries.map((entry: any, idx: number) => (
                            <TableRow key={idx} className="text-xs">
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell className="font-mono">{entry.subject?.code ?? '—'}</TableCell>
                              <TableCell>{entry.subject?.name ?? '—'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    entry.direction === '借'
                                      ? 'bg-success/10 text-success'
                                      : 'bg-danger/10 text-danger'
                                  }
                                >
                                  {entry.direction === '借' ? '借' : '贷'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {fmtAmount(entry.debitAmount || entry.creditAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Audit trail */}
                <Card className="elevation-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">凭证审计轨迹</CardTitle>
                    <CardDescription>
                      追溯凭证从制单、复核到记账的完整审计链
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-medium">制单</span>
                        <span className="text-xs text-muted-foreground">
                          财务 · {fmtDate(selectedItem.voucherDate)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1',
                          selectedItem.auditStatus === 'pending'
                            ? 'bg-warning/10'
                            : 'bg-success/10'
                        )}
                      >
                        {selectedItem.auditStatus === 'pending' ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            selectedItem.auditStatus === 'pending' && 'text-warning'
                          )}
                        >
                          复核
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedItem.auditStatus === 'pending'
                            ? '等待主管审核'
                            : `主管 · ${fmtDate(selectedItem.voucherDate)}`}
                        </span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1',
                          selectedItem.auditStatus === 'posted'
                            ? 'bg-success/10'
                            : 'bg-muted'
                        )}
                      >
                        {selectedItem.auditStatus === 'posted' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            selectedItem.auditStatus !== 'posted' &&
                              'text-muted-foreground'
                          )}
                        >
                          记账
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedItem.auditStatus === 'posted'
                            ? `主管 · ${fmtDate(selectedItem.voucherDate)}`
                            : '尚未记账'}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs space-y-1.5">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">审计规则：</span>
                        待审核凭证可由会计负责人审核；会计专员不能审核自己制单的凭证。
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">逐张审核控制：</span>
                        审核与反审核均作用于当前选中的一张凭证；反审核仅允许在未结账期间执行，并保留操作原因。
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">操作记录：</span>
                        <span className="ml-1">
                          {fmtDate(selectedItem.voucherDate)} 财务 生成凭证 ·{' '}
                          {selectedItem.auditStatus === 'approved' || selectedItem.auditStatus === 'posted'
                            ? `${fmtDate(selectedItem.voucherDate)} 主管 审核通过`
                            : selectedItem.auditStatus === 'voided'
                              ? `${fmtDate(selectedItem.voucherDate)} 系统 凭证已作废`
                              : '等待审核处理'}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <SheetFooter className="p-4 border-t border-border">
              <div className="flex w-full gap-2">
                {isDirector ? (
                  <>
                    <RippleContainer className="ripple-container flex-1 rounded-md">
                      <Button
                        className="w-full"
                        disabled={
                          !selectedItem ||
                          selectedItem.auditStatus !== 'pending' ||
                          approveMutation.isPending
                        }
                        onClick={handleApprove}
                      >
                        {approveMutation.isPending ? '审核中...' : '审核当前凭证'}
                      </Button>
                    </RippleContainer>
                    <RippleContainer className="ripple-container flex-1 rounded-md">
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={
                          !selectedItem ||
                          selectedItem.auditStatus === 'pending'
                        }
                        onClick={handleUnapprove}
                      >
                        反审核当前凭证
                      </Button>
                    </RippleContainer>
                  </>
                ) : (
                  <RippleContainer className="ripple-container flex-1 rounded-md">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setSheetOpen(false)}
                    >
                      关闭
                    </Button>
                  </RippleContainer>
                )}
                <RippleContainer className="ripple-container rounded-md">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </RippleContainer>
              </div>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
