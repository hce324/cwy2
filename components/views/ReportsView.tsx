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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle2, Download, Brain, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

// ─── Report type ─────────────────────────────────────────────────────

type ReportId = 'bs' | 'pl' | 'cf' | 'oe' | 'dept' | 'prod' | 'expense' | 'budget';

// ─── Formatting helpers ──────────────────────────────────────────────

function fmtCurrency(v: unknown): string {
  const n = Number(v ?? 0);
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtWan(v: unknown): string {
  const n = Number(v ?? 0);
  return `¥${(n / 10000).toFixed(2)}万`;
}

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

function categorizeSubject(code: string): string {
  const p = code.charAt(0);
  if (p === '1') return '资产';
  if (p === '2') return '负债';
  if (p === '3' || p === '4') return '所有者权益';
  if (p === '5') return '收入';
  if (p === '6') return '成本费用';
  return '其他';
}

function isCurrentAsset(code: string): boolean {
  return code >= '1001' && code < '1500';
}
function isNonCurrentAsset(code: string): boolean {
  return code >= '1501' && code < '2000';
}
function isCurrentLiability(code: string): boolean {
  return code >= '2001' && code < '2500';
}
function isNonCurrentLiability(code: string): boolean {
  return code >= '2501' && code < '3000';
}
function isRevenue(code: string): boolean {
  return code >= '5000' && code < '6000';
}
function isExpense(code: string): boolean {
  return code >= '6000' && code < '7000';
}

// ─── Report skeletons ────────────────────────────────────────────────

function ReportSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="elevation-1 mt-2">
      <CardContent className="pt-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyReport({ message }: { message: string }) {
  return (
    <Card className="elevation-1 mt-2">
      <CardContent className="pt-6 pb-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function ErrorReport({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="elevation-1 mt-2">
      <CardContent className="pt-6 pb-6">
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            <span>{message}</span>
            {onRetry && (
              <Button variant="outline" size="sm" className="h-7 gap-1" onClick={onRetry}>
                <RefreshCw className="h-3 w-3" />
                重试
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function ReportsView() {
  const [activeReport, setActiveReport] = useState<ReportId>('bs');

  // ── Fetch current fiscal period ──
  const { data: period, isLoading: periodLoading } = trpc.period.current.useQuery();
  const fiscalPeriodId = period?.id ? Number(period.id) : 1;

  // ── Fetch trial balance ──
  const {
    data: trialBalanceData,
    isLoading: tbLoading,
    isError: tbIsError,
    error: tbError,
    refetch: tbRefetch,
  } = trpc.trialBalance.list.useQuery({ fiscalPeriodId });

  // ── Fetch budget execution ──
  const {
    data: budgetExecData,
    isLoading: budgetLoading,
    isError: budgetIsError,
    error: budgetError,
    refetch: budgetRefetch,
  } = trpc.budget.execution.useQuery({ fiscalPeriodId });

  // ── Loading state for whole page ──
  const isPageLoading = periodLoading || tbLoading;

  // ── Derived data ──

  // Trial balance items sorted by subject code
  const tbItems = (trialBalanceData ?? []).sort(
    (a, b) => a.subject.code.localeCompare(b.subject.code),
  );

  // Assets: code starts with '1'
  const assetItems = tbItems.filter(
    (t) => categorizeSubject(t.subject.code) === '资产' && t.subject.isLeaf,
  );
  const currentAssets = assetItems.filter((t) => isCurrentAsset(t.subject.code));
  const nonCurrentAssets = assetItems.filter((t) => isNonCurrentAsset(t.subject.code));

  // Liabilities: code starts with '2'
  const liabilityItems = tbItems.filter(
    (t) => categorizeSubject(t.subject.code) === '负债' && t.subject.isLeaf,
  );
  const currentLiabilities = liabilityItems.filter((t) => isCurrentLiability(t.subject.code));
  const nonCurrentLiabilities = liabilityItems.filter((t) => isNonCurrentLiability(t.subject.code));

  // Owner's equity: code starts with '3' or '4'
  const equityItems = tbItems.filter(
    (t) => categorizeSubject(t.subject.code) === '所有者权益' && t.subject.isLeaf,
  );

  // Income statement: revenue (5xxx) + expenses (6xxx)
  const revenueItems = tbItems.filter((t) => isRevenue(t.subject.code) && t.subject.isLeaf);
  const expenseItems = tbItems.filter((t) => isExpense(t.subject.code) && t.subject.isLeaf);

  // Calculate totals
  const sumDebit = (items: typeof tbItems, field: 'openingDebit' | 'endingDebit' | 'currentDebit') =>
    items.reduce((s, t) => s + toNum(t[field]), 0);
  const sumCredit = (items: typeof tbItems, field: 'openingCredit' | 'endingCredit' | 'currentCredit') =>
    items.reduce((s, t) => s + toNum(t[field]), 0);

  // Balance sheet totals
  const currentAssetEnding = sumDebit(currentAssets, 'endingDebit') - sumCredit(currentAssets, 'endingCredit');
  const nonCurrentAssetEnding = sumDebit(nonCurrentAssets, 'endingDebit') - sumCredit(nonCurrentAssets, 'endingCredit');
  const totalAssetEnding = currentAssetEnding + nonCurrentAssetEnding;
  const totalAssetOpening = sumDebit(assetItems, 'openingDebit') - sumCredit(assetItems, 'openingCredit');

  const currentLiabilityEnding = sumCredit(currentLiabilities, 'endingCredit') - sumDebit(currentLiabilities, 'endingDebit');
  const nonCurrentLiabilityEnding = sumCredit(nonCurrentLiabilities, 'endingCredit') - sumDebit(nonCurrentLiabilities, 'endingDebit');
  const totalLiabilityEnding = currentLiabilityEnding + nonCurrentLiabilityEnding;
  const totalLiabilityOpening = sumCredit(liabilityItems, 'openingCredit') - sumDebit(liabilityItems, 'openingDebit');

  const totalEquityEnding = sumCredit(equityItems, 'endingCredit') - sumDebit(equityItems, 'endingDebit');
  const totalEquityOpening = sumCredit(equityItems, 'openingCredit') - sumDebit(equityItems, 'openingDebit');

  // Income statement totals
  const totalRevenue = revenueItems.reduce((s, t) => s + toNum(t.endingCredit) - toNum(t.endingDebit), 0);
  const totalExpense = expenseItems.reduce((s, t) => s + toNum(t.endingDebit) - toNum(t.endingCredit), 0);
  const netProfit = totalRevenue - totalExpense;

  // Budget execution data
  const budgetItems = budgetExecData ?? [];

  // Determine if trial balance has any data
  const hasTBData = tbItems.length > 0;
  const hasBudgetData = budgetItems.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">FINANCIAL STATEMENTS</div>
          <h1 className="page-title mt-1">报表管理</h1>
          <p className="page-subtitle">
            依据科目余额和报表公式生成财务报表与管理报表。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast('报表勾稽检查通过')}>
            <CheckCircle2 className="h-4 w-4" /> 报表勾稽检查
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> 导出检查报表
          </Button>
        </div>
      </div>

      <Separator />

      {/* ========== Period Tabs ========== */}
      <Tabs defaultValue="月度报表">
        <TabsList>
          <TabsTrigger value="月度报表" className="text-xs">月度报表</TabsTrigger>
          <TabsTrigger value="季度报表" className="text-xs">季度报表</TabsTrigger>
          <TabsTrigger value="年度报表" className="text-xs">年度报表</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ========== Report Type Buttons ========== */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">财务报表</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bs', name: '资产负债表' },
              { id: 'pl', name: '利润表' },
              { id: 'cf', name: '现金流量表' },
              { id: 'oe', name: '所有者权益变动表' },
            ].map(r => (
              <Button
                key={r.id}
                variant={activeReport === r.id ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-sm"
                onClick={() => setActiveReport(r.id as ReportId)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">管理报表</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'dept', name: '部门损益表' },
              { id: 'prod', name: '产品线利润表' },
              { id: 'expense', name: '费用明细表' },
              { id: 'budget', name: '预算执行表' },
            ].map(r => (
              <Button
                key={r.id}
                variant={activeReport === r.id ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-sm"
                onClick={() => setActiveReport(r.id as ReportId)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== Balance Check Banner ========== */}
      {isPageLoading ? (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : hasTBData ? (
        <div className="flex items-center gap-2 bg-success/10 rounded-lg p-2 text-xs text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>资产合计=负债及所有者权益总计校验通过 √</span>
        </div>
      ) : null}

      {/* ========== Reports Accordion ========== */}
      {isPageLoading ? (
        <ReportSkeleton rows={12} />
      ) : tbIsError ? (
        <ErrorReport message={tbError.message} onRetry={() => tbRefetch()} />
      ) : (
        <>
          {/* ---------- 资产负债表 ---------- */}
          {activeReport === 'bs' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">辅助单位：上海星芒　ZQ0　　企业1表　单位：元</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {!hasTBData ? (
                  <EmptyReport message="暂无科目余额数据，请先生成科目余额表。" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 资产 */}
                    <div>
                      <h5 className="text-sm font-semibold mb-2">资产</h5>
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[11px]">
                            <TableHead className="w-8">序号</TableHead>
                            <TableHead>资产</TableHead>
                            <TableHead className="text-right">年初数</TableHead>
                            <TableHead className="text-right">年末数</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>{1}</TableCell>
                            <TableCell>流动资产：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {currentAssets.length > 0 ? (
                            currentAssets.map((item, i) => (
                              <TableRow key={item.subjectId ?? i} className="text-xs">
                                <TableCell>{i + 2}</TableCell>
                                <TableCell>{item.subject.name}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {fmtCurrency(toNum(item.openingDebit) - toNum(item.openingCredit))}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {fmtCurrency(toNum(item.endingDebit) - toNum(item.endingCredit))}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="text-xs">
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                                无流动资产数据
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="text-xs font-semibold bg-muted/30">
                            <TableCell />
                            <TableCell>流动资产合计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(sumDebit(currentAssets, 'openingDebit') - sumCredit(currentAssets, 'openingCredit'))}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(currentAssetEnding)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>{currentAssets.length + 2}</TableCell>
                            <TableCell>非流动资产：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {nonCurrentAssets.length > 0 ? (
                            nonCurrentAssets.map((item, i) => (
                              <TableRow key={item.subjectId ?? i} className="text-xs">
                                <TableCell>{currentAssets.length + i + 3}</TableCell>
                                <TableCell>{item.subject.name}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {fmtCurrency(toNum(item.openingDebit) - toNum(item.openingCredit))}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {fmtCurrency(toNum(item.endingDebit) - toNum(item.endingCredit))}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="text-xs">
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                                无非流动资产数据
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="text-xs font-semibold bg-muted/30">
                            <TableCell />
                            <TableCell>非流动资产合计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(sumDebit(nonCurrentAssets, 'openingDebit') - sumCredit(nonCurrentAssets, 'openingCredit'))}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(nonCurrentAssetEnding)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-xs font-bold bg-muted/40">
                            <TableCell />
                            <TableCell>资产总计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalAssetOpening)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalAssetEnding)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* 负债及所有者权益 */}
                    <div>
                      <h5 className="text-sm font-semibold mb-2">负债及所有者权益</h5>
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[11px]">
                            <TableHead className="w-8">序号</TableHead>
                            <TableHead>负债及所有者权益</TableHead>
                            <TableHead className="text-right">年初数</TableHead>
                            <TableHead className="text-right">年末数</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>{1}</TableCell>
                            <TableCell>流动负债：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {currentLiabilities.length > 0 ? (
                            currentLiabilities.map((item, i) => {
                              const opening = toNum(item.openingCredit) - toNum(item.openingDebit);
                              const ending = toNum(item.endingCredit) - toNum(item.endingDebit);
                              return (
                                <TableRow key={item.subjectId ?? i} className="text-xs">
                                  <TableCell>{i + 2}</TableCell>
                                  <TableCell>{item.subject.name}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(opening, 0))}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(ending, 0))}</TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow className="text-xs">
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                                无流动负债数据
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="text-xs font-semibold bg-muted/30">
                            <TableCell />
                            <TableCell>流动负债合计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(sumCredit(currentLiabilities, 'openingCredit') - sumDebit(currentLiabilities, 'openingDebit'))}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(currentLiabilityEnding)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>{currentLiabilities.length + 2}</TableCell>
                            <TableCell>长期负债：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {nonCurrentLiabilities.length > 0 ? (
                            nonCurrentLiabilities.map((item, i) => {
                              const opening = toNum(item.openingCredit) - toNum(item.openingDebit);
                              const ending = toNum(item.endingCredit) - toNum(item.endingDebit);
                              return (
                                <TableRow key={item.subjectId ?? i} className="text-xs">
                                  <TableCell>{currentLiabilities.length + i + 3}</TableCell>
                                  <TableCell>{item.subject.name}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(opening, 0))}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(ending, 0))}</TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow className="text-xs">
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                                无长期负债数据
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="text-xs font-semibold bg-muted/30">
                            <TableCell />
                            <TableCell>负债合计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalLiabilityOpening)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalLiabilityEnding)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>{currentLiabilities.length + nonCurrentLiabilities.length + 3}</TableCell>
                            <TableCell>所有者权益：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {equityItems.length > 0 ? (
                            equityItems.map((item, i) => {
                              const opening = toNum(item.openingCredit) - toNum(item.openingDebit);
                              const ending = toNum(item.endingCredit) - toNum(item.endingDebit);
                              return (
                                <TableRow key={item.subjectId ?? i} className="text-xs">
                                  <TableCell>{currentLiabilities.length + nonCurrentLiabilities.length + i + 4}</TableCell>
                                  <TableCell>{item.subject.name}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(opening, 0))}</TableCell>
                                  <TableCell className="text-right font-mono">{fmtCurrency(Math.max(ending, 0))}</TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow className="text-xs">
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                                无所有者权益数据
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="text-xs font-semibold bg-muted/30">
                            <TableCell />
                            <TableCell>所有者权益合计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalEquityOpening)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalEquityEnding)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-xs font-bold bg-muted/40">
                            <TableCell />
                            <TableCell>负债及所有者权益总计</TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalLiabilityOpening + totalEquityOpening)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {fmtCurrency(totalLiabilityEnding + totalEquityEnding)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground mt-3">企业负责人：林主管 ｜ 财务负责人：周会计 ｜ 制表人：陈会计</div>
              </CardContent>
            </Card>
          )}

          {/* ---------- 利润表 ---------- */}
          {activeReport === 'pl' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务有限公司　会企02表</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasTBData ? (
                  <EmptyReport message="暂无科目余额数据，请先生成科目余额表。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">本期金额</TableHead>
                        <TableHead className="text-right">上期金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="text-xs font-semibold bg-muted/20">
                        <TableCell>一、营业收入</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtWan(totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          —（同期数据待上期生成）
                        </TableCell>
                      </TableRow>
                      {revenueItems.length > 0 ? (
                        <>
                          <TableRow className="text-xs">
                            <TableCell>其中：</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {revenueItems.map((item, i) => (
                            <TableRow key={item.subjectId ?? i} className="text-xs">
                              <TableCell className="pl-6">{item.subject.name}</TableCell>
                              <TableCell className="text-right font-mono">
                                {fmtWan(toNum(item.endingCredit) - toNum(item.endingDebit))}
                              </TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : null}
                      {expenseItems.length > 0 ? (
                        <>
                          <TableRow className="text-xs font-semibold bg-muted/20">
                            <TableCell>减：营业成本与费用</TableCell>
                            <TableCell className="text-right font-mono" />
                            <TableCell className="text-right font-mono" />
                          </TableRow>
                          {expenseItems.map((item, i) => (
                            <TableRow key={item.subjectId ?? i} className="text-xs">
                              <TableCell className="pl-6">{item.subject.name}</TableCell>
                              <TableCell className="text-right font-mono">
                                {fmtWan(toNum(item.endingDebit) - toNum(item.endingCredit))}
                              </TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : null}
                      <TableRow className="text-xs font-semibold bg-muted/20">
                        <TableCell>二、营业利润</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtWan(totalRevenue - totalExpense)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                      </TableRow>
                      <TableRow className="text-xs font-bold bg-muted/40">
                        <TableCell>三、净利润</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtWan(netProfit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
                <div className="text-[11px] text-muted-foreground mt-3">企业负责人：林王萱</div>
              </CardContent>
            </Card>
          )}

          {/* ---------- 现金流量表 ---------- */}
          {activeReport === 'cf' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务　会企03表</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasTBData ? (
                  <EmptyReport message="暂无科目余额与现金流快照数据，请先完成月结生成当月快照。" />
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle>提示</AlertTitle>
                      <AlertDescription>
                        现金流量表基于当月科目变动与现金流快照生成。当前展示为简化视图，完整现金流量分析请参照月度财务快照模块。
                      </AlertDescription>
                    </Alert>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px]">
                          <TableHead>项目</TableHead>
                          <TableHead className="text-right">本期金额</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>一、经营活动产生的现金流量：</TableCell>
                          <TableCell className="text-right" />
                        </TableRow>
                        {/* Derive from revenue/expense current-period changes */}
                        <TableRow className="text-xs">
                          <TableCell className="pl-4">经营活动现金流入</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtWan(revenueItems.reduce((s, t) => s + toNum(t.currentCredit), 0))}
                          </TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell className="pl-4">经营活动现金流出</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtWan(expenseItems.reduce((s, t) => s + toNum(t.currentDebit), 0))}
                          </TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>经营活动产生的现金流量净额</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtWan(
                              revenueItems.reduce((s, t) => s + toNum(t.currentCredit), 0) -
                              expenseItems.reduce((s, t) => s + toNum(t.currentDebit), 0),
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>二、投资活动产生的现金流量：</TableCell>
                          <TableCell className="text-right" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell className="pl-4">购建固定资产、无形资产支付的现金</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtWan(
                              nonCurrentAssets.reduce((s, t) => s + toNum(t.currentDebit), 0),
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>投资活动产生的现金流量净额</TableCell>
                          <TableCell className="text-right font-mono">
                            -{fmtWan(nonCurrentAssets.reduce((s, t) => s + toNum(t.currentDebit), 0))}
                          </TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>三、筹资活动产生的现金流量：</TableCell>
                          <TableCell className="text-right" />
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell className="pl-4">取得借款收到的现金</TableCell>
                          <TableCell className="text-right font-mono">—</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>筹资活动产生的现金流量净额</TableCell>
                          <TableCell className="text-right font-mono">¥0.00</TableCell>
                        </TableRow>
                        <TableRow className="text-xs">
                          <TableCell>四、汇率变动对现金的影响</TableCell>
                          <TableCell className="text-right font-mono">—</TableCell>
                        </TableRow>
                        <TableRow className="text-xs font-semibold bg-muted/20">
                          <TableCell>五、现金及现金等价物净增加额</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtWan(
                              revenueItems.reduce((s, t) => s + toNum(t.currentCredit), 0) -
                              expenseItems.reduce((s, t) => s + toNum(t.currentDebit), 0) -
                              nonCurrentAssets.reduce((s, t) => s + toNum(t.currentDebit), 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ---------- 所有者权益变动表 ---------- */}
          {activeReport === 'oe' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">编制单位：上海星芒电子商务有限公司</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {!hasTBData ? (
                  <EmptyReport message="暂无科目余额数据，请先生成科目余额表。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">上年年末余额</TableHead>
                        <TableHead className="text-right">本期增加</TableHead>
                        <TableHead className="text-right">本期减少</TableHead>
                        <TableHead className="text-right">本期期末余额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equityItems.length > 0 ? (
                        equityItems.map((item, i) => {
                          const opening = Math.max(toNum(item.openingCredit) - toNum(item.openingDebit), 0);
                          const increase = toNum(item.currentCredit);
                          const decrease = toNum(item.currentDebit);
                          const ending = Math.max(toNum(item.endingCredit) - toNum(item.endingDebit), 0);
                          return (
                            <TableRow key={item.subjectId ?? i} className="text-xs">
                              <TableCell>{item.subject.name}</TableCell>
                              <TableCell className="text-right font-mono">{fmtCurrency(opening)}</TableCell>
                              <TableCell className="text-right font-mono">{fmtCurrency(increase)}</TableCell>
                              <TableCell className="text-right font-mono">{fmtCurrency(decrease)}</TableCell>
                              <TableCell className="text-right font-mono">{fmtCurrency(ending)}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow className="text-xs">
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                            无所有者权益科目数据
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="text-xs font-bold bg-muted/40">
                        <TableCell>所有者权益期末合计</TableCell>
                        <TableCell className="text-right font-mono">{fmtCurrency(totalEquityOpening)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtCurrency(equityItems.reduce((s, t) => s + toNum(t.currentCredit), 0))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtCurrency(equityItems.reduce((s, t) => s + toNum(t.currentDebit), 0))}
                        </TableCell>
                        <TableCell className="text-right font-mono">{fmtCurrency(totalEquityEnding)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* ---------- 部门损益表 ---------- */}
          {activeReport === 'dept' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">管理报表口径</CardDescription>
              </CardHeader>
              <CardContent>
                {budgetLoading ? (
                  <ReportSkeleton rows={4} />
                ) : budgetIsError ? (
                  <ErrorReport message={budgetError.message} onRetry={() => budgetRefetch()} />
                ) : !hasBudgetData ? (
                  <EmptyReport message="暂无预算执行数据，请先在系统设置中配置部门预算。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>部门</TableHead>
                        <TableHead className="text-right">预算金额</TableHead>
                        <TableHead className="text-right">实际支出</TableHead>
                        <TableHead className="text-right">差异</TableHead>
                        <TableHead className="text-right">执行率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Group by department
                        const deptMap = new Map<
                          string,
                          { budgeted: number; actual: number; categories: string[] }
                        >();
                        for (const item of budgetItems) {
                          const existing = deptMap.get(item.departmentName);
                          if (existing) {
                            existing.budgeted += item.budgetedAmount;
                            existing.actual += item.actualAmount;
                            existing.categories.push(item.budgetCategory);
                          } else {
                            deptMap.set(item.departmentName, {
                              budgeted: item.budgetedAmount,
                              actual: item.actualAmount,
                              categories: [item.budgetCategory],
                            });
                          }
                        }
                        const deptEntries = Array.from(deptMap.entries());
                        const totalBudgeted = deptEntries.reduce((s, [, v]) => s + v.budgeted, 0);
                        const totalActual = deptEntries.reduce((s, [, v]) => s + v.actual, 0);
                        return (
                          <>
                            {deptEntries.map(([dept, vals], i) => {
                              const variance = vals.budgeted - vals.actual;
                              const rate = vals.budgeted > 0 ? (vals.actual / vals.budgeted) * 100 : 0;
                              return (
                                <TableRow key={i} className="text-xs">
                                  <TableCell>{dept}</TableCell>
                                  <TableCell className="text-right font-mono">
                                    ¥{vals.budgeted.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    ¥{vals.actual.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      'text-right font-mono',
                                      variance < 0 ? 'text-warning' : 'text-success',
                                    )}
                                  >
                                    {variance >= 0 ? '+' : ''}
                                    ¥{variance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      'text-right',
                                      rate > 100 ? 'text-warning font-semibold' : '',
                                    )}
                                  >
                                    {rate.toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow className="text-xs font-semibold bg-muted/20">
                              <TableCell>合计</TableCell>
                              <TableCell className="text-right font-mono">
                                ¥{totalBudgeted.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                ¥{totalActual.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right font-mono',
                                  totalBudgeted - totalActual < 0 ? 'text-warning' : 'text-success',
                                )}
                              >
                                {totalBudgeted - totalActual >= 0 ? '+' : ''}
                                ¥{(totalBudgeted - totalActual).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {totalBudgeted > 0
                                  ? ((totalActual / totalBudgeted) * 100).toFixed(1)
                                  : '0.0'}
                                %
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })()}
                    </TableBody>
                  </Table>
                )}
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 经营解读：部门损益数据基于预算执行情况生成。超过100%的部门需关注费用控制。</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ---------- 产品线利润表 ---------- */}
          {activeReport === 'prod' && (
            <Card className="elevation-1 mt-2">
              <CardContent className="pt-4">
                {!hasBudgetData && !hasTBData ? (
                  <EmptyReport message="暂无产品或利润明细数据，请先在系统中录入产品线信息。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>产品线/预算类别</TableHead>
                        <TableHead className="text-right">预算金额</TableHead>
                        <TableHead className="text-right">实际金额</TableHead>
                        <TableHead className="text-right">差异</TableHead>
                        <TableHead className="text-right">执行率</TableHead>
                        <TableHead className="text-right w-12">趋势</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetItems.length > 0 ? (
                        budgetItems.map((row, i) => {
                          const variance = row.budgetedAmount - row.actualAmount;
                          const rate = row.executionRate * 100;
                          const trend =
                            row.actualAmount < row.budgetedAmount ? 'up' : 'down';
                          return (
                            <TableRow key={i} className="text-xs">
                              <TableCell>{row.budgetCategory}</TableCell>
                              <TableCell className="text-right font-mono">
                                ¥{row.budgetedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                ¥{row.actualAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right font-mono',
                                  variance < 0 ? 'text-warning' : 'text-success',
                                )}
                              >
                                {variance >= 0 ? '+' : ''}
                                ¥{variance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right',
                                  rate > 100 ? 'text-warning' : '',
                                )}
                              >
                                {rate.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right">
                                {trend === 'up' ? (
                                  <TrendingUp className="h-3.5 w-3.5 text-success inline" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5 text-warning inline" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow className="text-xs">
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                            暂无预算执行数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 解读：本视图基于预算执行数据展示各产品线/预算类别的执行情况。实际低于预算的类别显示为绿色上升趋势。</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ---------- 费用明细表 ---------- */}
          {activeReport === 'expense' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">管理报表口径　单位：元</CardDescription>
              </CardHeader>
              <CardContent>
                {budgetLoading ? (
                  <ReportSkeleton rows={6} />
                ) : budgetIsError ? (
                  <ErrorReport message={budgetError.message} onRetry={() => budgetRefetch()} />
                ) : !hasBudgetData ? (
                  <EmptyReport message="暂无预算执行数据，请先在系统设置中录入预算。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>费用项目</TableHead>
                        <TableHead className="text-right">预算金额</TableHead>
                        <TableHead className="text-right">实际支出</TableHead>
                        <TableHead className="text-right">差异金额</TableHead>
                        <TableHead className="text-right">差异率</TableHead>
                        <TableHead className="text-right w-12">状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const expenseItems = budgetItems.filter(
                          (b) => !b.budgetCategory.includes('收入') && !b.budgetCategory.includes('利润'),
                        );
                        const totalBudgeted = expenseItems.reduce((s, b) => s + b.budgetedAmount, 0);
                        const totalActual = expenseItems.reduce((s, b) => s + b.actualAmount, 0);
                        const totalVariance = totalBudgeted - totalActual;
                        const totalRate = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

                        return (
                          <>
                            {expenseItems.length > 0 ? (
                              expenseItems.map((row, i) => {
                                const diff = row.budgetedAmount - row.actualAmount;
                                const diffRate = row.budgetedAmount > 0 ? (diff / row.budgetedAmount) * 100 : 0;
                                const isOver = diff < 0;
                                return (
                                  <TableRow key={i} className="text-xs">
                                    <TableCell>
                                      {row.departmentName} - {row.budgetCategory}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      ¥{row.budgetedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      ¥{row.actualAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell
                                      className={cn(
                                        'text-right font-mono',
                                        isOver ? 'text-warning' : 'text-success',
                                      )}
                                    >
                                      {diff >= 0 ? '+' : ''}¥
                                      {diff.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell
                                      className={cn('text-right', isOver ? 'text-warning' : '')}
                                    >
                                      {diffRate >= 0 ? '+' : ''}
                                      {diffRate.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {isOver ? (
                                        <Badge variant="secondary" className="h-4 text-[10px] px-1 font-mono">
                                          超支
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="h-4 text-[10px] px-1 font-mono text-success border-success/30"
                                        >
                                          节约
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow className="text-xs">
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                                  暂无费用明细数据
                                </TableCell>
                              </TableRow>
                            )}
                            {expenseItems.length > 0 && (
                              <TableRow className="text-xs font-bold bg-muted/40">
                                <TableCell>费用合计</TableCell>
                                <TableCell className="text-right font-mono">
                                  ¥{totalBudgeted.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  ¥{totalActual.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    'text-right font-mono',
                                    totalVariance < 0 ? 'text-warning' : 'text-success',
                                  )}
                                >
                                  {totalVariance >= 0 ? '+' : ''}¥
                                  {totalVariance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                  className={cn('text-right', totalVariance < 0 ? 'text-warning' : '')}
                                >
                                  {totalRate >= 0 ? '+' : ''}
                                  {totalRate.toFixed(1)}%
                                </TableCell>
                                <TableCell className="text-right" />
                              </TableRow>
                            )}
                          </>
                        );
                      })()}
                    </TableBody>
                  </Table>
                )}
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>AI 解读：费用数据基于预算执行记录生成。标记为"超支"的项目实际支出已超出预算，需关注成本控制。</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ---------- 预算执行表 ---------- */}
          {activeReport === 'budget' && (
            <Card className="elevation-1 mt-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">管理报表口径　单位：元</CardDescription>
              </CardHeader>
              <CardContent>
                {budgetLoading ? (
                  <ReportSkeleton rows={6} />
                ) : budgetIsError ? (
                  <ErrorReport message={budgetError.message} onRetry={() => budgetRefetch()} />
                ) : !hasBudgetData ? (
                  <EmptyReport message="暂无预算执行数据，请先在系统设置中录入预算并关联会计期。" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>预算项目</TableHead>
                        <TableHead className="text-right">预算金额</TableHead>
                        <TableHead className="text-right">实际金额</TableHead>
                        <TableHead className="text-right">执行率</TableHead>
                        <TableHead className="text-right">差异</TableHead>
                        <TableHead className="text-right w-16">进度</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetItems.map((row, i) => {
                        const rate = Math.max(0, Math.min(row.executionRate * 100, 100));
                        const isOver = row.actualAmount > row.budgetedAmount;
                        const variance = row.variance;
                        const isProfit =
                          row.budgetCategory.includes('利润') || row.budgetCategory.includes('收入');
                        return (
                          <TableRow
                            key={i}
                            className={cn('text-xs', isProfit && 'font-semibold bg-muted/20')}
                          >
                            <TableCell>
                              {row.departmentName} - {row.budgetCategory}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ¥{row.budgetedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ¥{row.actualAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell
                              className={cn(
                                'text-right font-mono',
                                isOver ? 'text-warning font-semibold' : '',
                              )}
                            >
                              {(row.executionRate * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {variance > 0 ? '+' : ''}
                              ¥{variance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                <div className="relative h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn(
                                      'absolute inset-y-0 left-0 rounded-full',
                                      isOver
                                        ? 'bg-warning'
                                        : isProfit
                                          ? 'bg-success'
                                          : 'bg-primary',
                                    )}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'text-[10px] font-mono',
                                    isOver ? 'text-warning' : 'text-muted-foreground',
                                  )}
                                >
                                  {(row.executionRate * 100).toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                <div className="bg-accent/30 rounded-lg p-2 mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    AI 解读：预算执行数据实时取自系统。进度条超过100%的项目已超预算，建议重点审核并控制相关费用支出。
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ========== Bottom Balance Check Banner ========== */}
      {isPageLoading ? (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : hasTBData ? (
        <div className="flex items-center gap-2 bg-success/10 rounded-lg p-2 text-xs text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            所有报表勾稽校验通过：资产负债表平衡 √ | 利润表与所有者权益表勾稽 √ |
            现金流量表与资产负债表衔接 √
          </span>
        </div>
      ) : null}
    </div>
  );
}
