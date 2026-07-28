'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, CheckCircle2, FileCheck, ShieldAlert } from 'lucide-react';
import { fmtDate } from '@/lib/format';

// ─── Helpers ────────────────────────────────────────────────────────────

function fmtCurrency(n: number | string | undefined | null): string {
  const v = Number(n ?? 0);
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtShortDate(d: Date | string | undefined | null): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function formatPeriod(year: number, month: number): string {
  return `${year}年${String(month).padStart(2, '0')}月`;
}

// ─── Constants ──────────────────────────────────────────────────────────

const ITEM_TYPE_LABELS: Record<string, string> = {
  bank_received: '银行已收、企业未收',
  bank_paid: '银行已付、企业未付',
  enterprise_received: '企业已收、银行未收',
  enterprise_paid: '企业已付、银行未付',
};

function getMatchResultLabel(item: { isMatched: boolean; type: string }): string {
  if (item.isMatched) return '自动勾对·金额日期流水号一致';
  return ITEM_TYPE_LABELS[item.type] ?? (item.type || '待处理');
}

function getResponsibility(item: { isMatched: boolean }): string {
  return item.isMatched ? '系统' : '出纳';
}

function getActionLabel(item: { isMatched: boolean }): string {
  return item.isMatched ? '查看' : '待处理';
}

// ─── Component ──────────────────────────────────────────────────────────

export function BankReconView() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('全部');

  // ── Bank accounts ─────────────────────────────────────────────────
  const accountsQuery = trpc.bank.listAccounts.useQuery();
  const accounts = accountsQuery.data ?? [];
  const accountsLoading = accountsQuery.isLoading;
  const accountsError = accountsQuery.isError;

  // Auto-select first account when data loads and no selection yet
  const effectiveAccountId = selectedAccountId ?? (accounts.length > 0 ? Number(accounts[0].id) : null);

  // ── Balance / reconciliation data ─────────────────────────────────
  const balanceQuery = trpc.reconciliation.bankReconBalance.useQuery(
    { bankAccountId: Number(effectiveAccountId) },
    { enabled: !!effectiveAccountId },
  );

  const balance = balanceQuery.data;
  const isBalanceLoading = !!effectiveAccountId && balanceQuery.isLoading;
  const isBalanceError = balanceQuery.isError;
  const balanceErrorMsg = balanceQuery.error?.message;

  const isLoading = accountsLoading || isBalanceLoading;
  const isError = accountsError || isBalanceError;
  const errorMsg = balanceErrorMsg || accountsQuery.error?.message || '数据加载失败';

  // ── Derived data ──────────────────────────────────────────────────
  const selectedAccount = balance?.account;
  const selectedAccountName = selectedAccount
    ? `${selectedAccount.bankName} ${selectedAccount.accountNo ?? ''}`
    : '';
  const statements = balance?.statements ?? [];
  const allItems = balance?.items ?? [];
  const matchedItems = useMemo(() => allItems.filter((i) => i.isMatched), [allItems]);
  const unmatchedItems = useMemo(() => allItems.filter((i) => !i.isMatched), [allItems]);

  const displayItems =
    activeTab === '已勾对' ? matchedItems
    : activeTab === '未达' ? unmatchedItems
    : allItems;

  const stats = balance?.summary;

  // Latest statement for period display
  const latestStatement = statements.length > 0 ? statements[0] : null;
  const periodLabel = latestStatement?.fiscalPeriodId
    ? `会计期间 #${String(latestStatement.fiscalPeriodId)}`
    : '';

  // ── Balance sheet calculations ────────────────────────────────────
  const bookBalance = useMemo(() => {
    // Enterprise book balance: use account balance if available
    if (selectedAccount) return Number(selectedAccount.balance ?? 0);
    return 0;
  }, [selectedAccount]);

  const bankBalance = useMemo(() => {
    // Bank statement balance: sum of statement totals
    return statements.reduce((sum, s) => sum + Number(s.totalDebit ?? 0) - Number(s.totalCredit ?? 0), 0);
  }, [statements]);

  // Group unmatched items by reconciliation direction
  const unmatchedByType = useMemo(() => {
    const groups: Record<string, { bankAmount: number; bookAmount: number; items: typeof unmatchedItems }> = {};
    for (const item of unmatchedItems) {
      const t = item.type || 'unknown';
      if (!groups[t]) groups[t] = { bankAmount: 0, bookAmount: 0, items: [] };
      groups[t].bankAmount += Number(item.bankAmount ?? 0);
      groups[t].bookAmount += Number(item.bookAmount ?? 0);
      groups[t].items.push(item);
    }
    return groups;
  }, [unmatchedItems]);

  // Enterprise-side adjustments
  const bankReceivedEnterpriseNot = useMemo(() => {
    return Object.entries(unmatchedByType)
      .filter(([t]) => t.includes('银行已收') || t.includes('bank_received'))
      .reduce((sum, [, g]) => sum + g.bankAmount, 0);
  }, [unmatchedByType]);

  const bankPaidEnterpriseNot = useMemo(() => {
    return Object.entries(unmatchedByType)
      .filter(([t]) => t.includes('银行已付') || t.includes('bank_paid'))
      .reduce((sum, [, g]) => sum + g.bankAmount, 0);
  }, [unmatchedByType]);

  // Bank-side adjustments
  const enterprisePaidBankNot = useMemo(() => {
    return Object.entries(unmatchedByType)
      .filter(([t]) => t.includes('企业已付') || t.includes('enterprise_paid'))
      .reduce((sum, [, g]) => sum + g.bookAmount, 0);
  }, [unmatchedByType]);

  const enterpriseReceivedBankNot = useMemo(() => {
    return Object.entries(unmatchedByType)
      .filter(([t]) => t.includes('企业已收') || t.includes('enterprise_received'))
      .reduce((sum, [, g]) => sum + g.bookAmount, 0);
  }, [unmatchedByType]);

  const adjustedBookBalance = bookBalance + bankReceivedEnterpriseNot - bankPaidEnterpriseNot;
  const adjustedBankBalance = bankBalance + enterprisePaidBankNot - enterpriseReceivedBankNot;
  const balanceDiff = Math.abs(adjustedBookBalance - adjustedBankBalance);

  // Long-term outstanding (> 30 days, unmatched)
  const longTermItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return unmatchedItems.filter(
      (i) => new Date(i.entryDate) < thirtyDaysAgo,
    );
  }, [unmatchedItems]);

  // ── Available periods from statements ─────────────────────────────
  const availablePeriods = useMemo(() => {
    const seen = new Set<bigint>();
    const periods: { year: number; month: number; label: string }[] = [];
    for (const s of statements) {
      if (s.fiscalPeriodId && !seen.has(s.fiscalPeriodId)) {
        seen.add(s.fiscalPeriodId);
        periods.push({
          year: 2026,
          month: 7,
          label: `会计期间 #${String(s.fiscalPeriodId)}`,
        });
      }
    }
    return periods;
  }, [statements]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleAccountChange = (v: string | null) => {
    setSelectedAccountId(v ? Number(v) : null);
  };

  const handleReset = () => {
    setSelectedAccountId(null);
    setActiveTab('全部');
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">BANK RECONCILIATION</div>
          <h1 className="page-title mt-1">银行对账</h1>
          <p className="page-subtitle">
            复核未达账项处理、长期未达控制及银行存款余额调节表。
          </p>
        </div>
        <Button size="sm" className="gap-1.5" disabled={isLoading || !effectiveAccountId}>
          <FileCheck className="h-4 w-4" />
          复核余额调节表
        </Button>
      </div>

      <Separator />

      {/* ========== 账务分工 ========== */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">出纳：</strong>导入银行对账单、执行勾对、登记未达项及编制余额调节表。</p>
        <p><strong className="text-foreground">财务负责人：</strong>复核差异处理、长期未达项和余额调节表。</p>
        <p><strong className="text-foreground">财务专员：</strong>无银行对账访问权限。</p>
      </div>

      {/* ========== Error state ========== */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* ========== Filters ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground mr-1">银行账户</span>
          {accountsLoading ? (
            <Skeleton className="w-52 h-8" />
          ) : accounts.length === 0 ? (
            <span className="text-xs text-muted-foreground">暂无银行账户</span>
          ) : (
            <Select
              value={effectiveAccountId ? String(effectiveAccountId) : ''}
              onValueChange={handleAccountChange}
            >
              <SelectTrigger className="w-64 h-8 text-xs">
                <SelectValue placeholder="选择银行账户" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={String(a.id)} value={String(a.id)}>
                    {a.bankName} {a.accountNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <span className="text-xs text-muted-foreground mr-1">对账期间</span>
          {isBalanceLoading ? (
            <Skeleton className="w-36 h-8" />
          ) : availablePeriods.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <Select value={periodLabel} disabled>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods.map((p) => (
                  <SelectItem key={`${p.year}-${p.month}`} value={p.label}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            className="h-8 gap-1"
            disabled={!effectiveAccountId || isBalanceLoading}
          >
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> 重置
          </Button>
        </CardContent>
      </Card>

      {/* ========== No account selected / empty ========== */}
      {!isLoading && !isError && !effectiveAccountId && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {accounts.length === 0
            ? '暂无银行账户数据，请先在系统设置中添加银行账户'
            : '请选择银行账户以查看对账数据'}
        </div>
      )}

      {/* ========== Stats ========== */}
      {effectiveAccountId && isBalanceLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="elevation-1">
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-32 mt-1" />
                <Skeleton className="h-3 w-40 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">对账单状态</div>
              <div className="text-lg font-bold mt-1">
                已导入 · {stats.itemCount} 笔
              </div>
              <div className="text-[10px] text-muted-foreground">
                银行流水{stats.itemCount}笔 借方总额计算中
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">自动匹配</div>
              <div className="text-lg font-bold mt-1">{stats.matchedCount} 笔</div>
              <div className="text-[10px] text-success">
                匹配率 {(stats.matchRate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">未达事项</div>
              <div className="text-lg font-bold mt-1">{stats.unmatchedCount} 笔</div>
              <div className="text-[10px] text-muted-foreground">
                合计影响 {fmtCurrency(stats.totalDiff)}
              </div>
            </CardContent>
          </Card>
          <Card className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">调节后总余额</div>
              <div className="text-lg font-bold mt-1 font-mono">
                {fmtCurrency(adjustedBookBalance)}
              </div>
              <div className="text-[10px] text-success">
                {balanceDiff < 0.01 ? '双方余额相符' : `差额 ${fmtCurrency(balanceDiff)}`}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== 对账明细 ========== */}
      {!isLoading && !isError && stats && (
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">对账明细与未达账项</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="全部" className="text-xs">
                  全部 {allItems.length}
                </TabsTrigger>
                <TabsTrigger value="已勾对" className="text-xs">
                  已勾对 {matchedItems.length}
                </TabsTrigger>
                <TabsTrigger value="未达" className="text-xs">
                  未达 {unmatchedItems.length}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {displayItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                暂无对账记录
              </div>
            ) : (
              <Table className="mt-3">
                <TableHeader>
                  <TableRow className="text-[11px]">
                    <TableHead>日期·流水号</TableHead>
                    <TableHead>银行对账单</TableHead>
                    <TableHead>企业日记账·凭证</TableHead>
                    <TableHead>勾对结果</TableHead>
                    <TableHead>处理责任</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.map((item) => {
                    const resultLabel = getMatchResultLabel(item);
                    return (
                      <TableRow key={String(item.id)} className="text-xs">
                        <TableCell className="font-mono">
                          {fmtShortDate(item.entryDate)} · {String(item.id)}
                        </TableCell>
                        <TableCell>{item.summary || `${item.type} ${fmtCurrency(Number(item.bankAmount))}`}</TableCell>
                        <TableCell>
                          {item.voucherId
                            ? `凭证 #${String(item.voucherId)}`
                            : '日记账中未找到'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.isMatched
                                ? 'bg-success/10 text-success'
                                : 'bg-warning/10 text-warning'
                            }
                            variant="outline"
                          >
                            {resultLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>{getResponsibility(item)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            {getActionLabel(item)}
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
      )}

      {/* ========== 长期未达账项控制 ========== */}
      {!isLoading && !isError && stats && (
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0',
                    longTermItems.length > 0 ? 'bg-danger/10' : 'bg-success/10',
                  )}
                >
                  <ShieldAlert
                    className={cn(
                      'h-5 w-5',
                      longTermItems.length > 0 ? 'text-danger' : 'text-success',
                    )}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">长期未达账项控制</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    监控超过 30 天仍未处理的未达账项，超期自动上报财务负责人。
                  </p>
                </div>
              </div>
              <Badge
                className={
                  longTermItems.length > 0
                    ? 'bg-danger/10 text-danger text-xs'
                    : 'bg-success/10 text-success text-xs'
                }
                variant="outline"
              >
                {longTermItems.length} 笔
              </Badge>
            </div>
            <div className="mt-3 bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              {longTermItems.length === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    当前无长期未达账项（超过 30 天）。所有未达事项均在正常处理周期内。
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 text-danger flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    存在 {longTermItems.length} 笔长期未达账项（超过 30 天），请尽快处理。
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 银行存款余额调节表 ========== */}
      {!isLoading && !isError && stats && (
        <Card className="elevation-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">银行存款余额调节表</CardTitle>
            <CardDescription>
              {periodLabel && `${periodLabel}日 · `}{selectedAccountName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">企业银行存款日记账</h4>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>账面余额</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(bookBalance)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-success">加：银行已收、企业未收</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(bankReceivedEnterpriseNot)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-danger">减：银行已付、企业未付</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(bankPaidEnterpriseNot)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell>调节后余额</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(adjustedBookBalance)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">银行对账单</h4>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>对账单余额</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(bankBalance)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-success">加：企业已付、银行未付</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(enterprisePaidBankNot)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-danger">减：企业已收、银行未收</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(enterpriseReceivedBankNot)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell>调节后余额</TableCell>
                      <TableCell className="text-right font-mono">{fmtCurrency(adjustedBankBalance)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 mt-4 p-3 rounded-lg',
                balanceDiff < 0.01 ? 'bg-success/10' : 'bg-danger/10',
              )}
            >
              {balanceDiff < 0.01 ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-danger" />
              )}
              <div className="text-xs">
                {balanceDiff < 0.01 ? (
                  <span className="text-success font-medium">
                    双方调节后余额一致 · 差额 ¥0.00
                  </span>
                ) : (
                  <span className="text-danger font-medium">
                    双方调节后余额不一致 · 差额 {fmtCurrency(balanceDiff)}
                  </span>
                )}
                {selectedAccount && (
                  <span className="text-muted-foreground ml-3">
                    账户：{selectedAccount.bankName} {selectedAccount.accountNo}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs ml-auto">
                导出调节表
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
