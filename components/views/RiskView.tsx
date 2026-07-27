'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RISK_LEVELS, type RiskLevel } from '@/lib/risk';
import { trpc } from '@/lib/trpc-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ────────────────────────────────────────────────────────

const FILTER_TO_TAB: Record<string, string> = {
  all: '全部异常',
  high: '高风险',
  mid: '中风险',
  low: '低风险',
};

const TAB_TO_FILTER: Record<string, RiskLevel | 'all'> = {
  '全部异常': 'all',
  '高风险': 'high',
  '中风险': 'mid',
  '低风险': 'low',
};

function fmtTime(d: unknown): string {
  if (d instanceof Date) {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86_400_000)
      return `今天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    if (diff < 172_800_000)
      return `昨天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    return `${d.toLocaleDateString('zh-CN')} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return String(d ?? '').slice(0, 16);
}

// ─── Static demo data (not yet migrated to tRPC — fiscal-period based indicator monitoring) ──

const indicators = [
  { label: '偿债能力', items: [{ name: '速动比率', val: '1.28', range: '≥ 1.0', result: '达标' }, { name: '流动比率', val: '1.82', range: '≥ 1.5', result: '达标' }, { name: '资产负债率', val: '52.3%', range: '≤ 60%', result: '偏高', warn: true }, { name: '利息保障倍数', val: '5.8', range: '≥ 3.0', result: '达标' }] },
  { label: '营运能力', items: [{ name: '应收周转天数', val: '52天', range: '≤ 48天', result: '偏慢', warn: true }, { name: '应付周转天数', val: '38天', range: '≤ 35天', result: '偏慢', warn: true }, { name: '存货周转天数', val: '28天', range: '≤ 30天', result: '达标' }, { name: '总资产周转率', val: '0.82', range: '≥ 0.7', result: '达标' }] },
  { label: '盈利能力', items: [{ name: '销售净利率', val: '16.9%', range: '≥ 15%', result: '达标' }, { name: 'ROE', val: '18.6%', range: '≥ 15%', result: '达标' }, { name: '总资产收益率', val: '9.2%', range: '≥ 8%', result: '达标' }, { name: '毛利率', val: '39.8%', range: '≥ 35%', result: '达标' }] },
];

// ─── Component ──────────────────────────────────────────────────────

export function RiskView() {
  // --- filter state ---
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  // --- sheet state ---
  const [selectedException, setSelectedException] = useState<Record<string, unknown> | null>(null);
  const [processAction, setProcessAction] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [processResult, setProcessResult] = useState('');

  const utils = trpc.useUtils();

  // ─── Queries ─────────────────────────────────────────────────────

  const countsQuery = trpc.risk.counts.useQuery();

  const listQuery = trpc.risk.list.useQuery({
    riskLevel: riskFilter,
    limit: 50,
    offset: 0,
  });

  // ─── Mutation ────────────────────────────────────────────────────

  const resolveMutation = trpc.risk.resolve.useMutation({
    onSuccess: () => {
      toast.success('处理记录已保存，状态已更新');
      setSelectedException(null);
      setProcessAction('');
      setProcessNote('');
      setProcessResult('');
      utils.risk.list.invalidate();
      utils.risk.counts.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || '处理失败，请重试');
    },
  });

  // ─── Derived data ────────────────────────────────────────────────

  const riskCounts = countsQuery.data ?? { all: 0, high: 0, mid: 0, low: 0 };
  const items = listQuery.data?.items ?? [];
  const isLoadingStats = countsQuery.isLoading;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // ─── Handlers ────────────────────────────────────────────────────

  const handleTabChange = (val: string) => {
    const filter = TAB_TO_FILTER[val] ?? 'all';
    setRiskFilter(filter);
  };

  const handleSave = () => {
    if (!selectedException || !processAction || !processResult) return;
    const resolution = `[${processAction}] ${processNote ? processNote + '; ' : ''}${processResult}`;
    resolveMutation.mutate({ id: Number(selectedException.id), resolution });
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">风险与异常 — 财务与经营风险处理中心</h1>
          <p className="page-subtitle">
            统一处理财务、产销、直播ROI、SKU和供应链异常，形成分派、处理与复核闭环。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Brain className="h-4 w-4" /> AI诊断</Button>
          <Button size="sm" variant="outline" className="gap-1.5"><Settings className="h-4 w-4" /> 预警规则设置</Button>
        </div>
      </div>

      <Separator />

      {/* ── AI Warning Bar ────────────────────────────────────────── */}
      <div className="bg-warning/5 rounded-lg p-3 text-sm text-warning flex items-center gap-2 border border-warning/20">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>AI 诊断：有风险 — 新增5项产销经营异常，其中达人D亏损、低效SKU和产销偏差需优先处理。</span>
        <Button variant="outline" size="sm" className="h-7 text-xs ml-auto flex-shrink-0">查看 AI 诊断</Button>
      </div>

      {/* ── Stats — 数据驱动，点击联动下方异常列表 ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="elevation-1">
                <CardContent className="pt-4">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-8 w-10" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setRiskFilter('all')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRiskFilter('all'); } }}
              className={cn('elevation-1 ripple-container card-hover cursor-pointer', riskFilter === 'all' && 'ring-2 ring-primary/40')}
            >
              <CardContent className="pt-4"><div className="text-xs text-muted-foreground">待处理风险</div><div className="text-2xl font-bold mt-1 tabular-nums">{riskCounts.all}</div></CardContent>
            </Card>
            {(['high', 'mid', 'low'] as const).map((lv) => {
              const meta = RISK_LEVELS[lv];
              return (
                <Card
                  key={lv}
                  role="button"
                  tabIndex={0}
                  onClick={() => setRiskFilter(riskFilter === lv ? 'all' : lv)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRiskFilter(riskFilter === lv ? 'all' : lv); } }}
                  className={cn('elevation-1 ripple-container card-hover cursor-pointer', meta.surface, riskFilter === lv && 'ring-2 ring-primary/40')}
                >
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className={cn('risk-dot', meta.dot)} />
                      {meta.label}
                    </div>
                    <div className={cn('text-2xl font-bold mt-1 tabular-nums', meta.text)}>{riskCounts[lv]}</div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* ── Exception tabs ────────────────────────────────────────── */}
      <Tabs value={FILTER_TO_TAB[riskFilter]} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap">
          {(['全部异常', '高风险', '中风险', '低风险'] as const).map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Exception list ────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          {riskFilter !== 'all' && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn('risk-dot', RISK_LEVELS[riskFilter].dot)} />
              <span>当前筛选：{RISK_LEVELS[riskFilter].label} · 共 {listQuery.data?.total ?? 0} 条</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setRiskFilter('all')}>清除筛选</Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>{errorMsg || '无法获取风险异常列表，请检查网络连接后重试'}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无匹配的风险异常数据
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow className="text-[11px]"><TableHead className="w-8">#</TableHead><TableHead>等级</TableHead><TableHead>类型</TableHead><TableHead>标题</TableHead><TableHead>描述</TableHead><TableHead>时间</TableHead><TableHead>责任人</TableHead><TableHead className="text-center">操作</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((e, i) => {
                  const level = (e.riskLevel as RiskLevel) ?? 'low';
                  const meta = RISK_LEVELS[level];
                  return (
                    <TableRow key={String(e.id)} className={cn('text-xs', riskFilter !== 'all' && meta.surface)}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell><span className={cn('risk-badge', meta.badge)}>{meta.label}</span></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{String(e.exceptionType ?? '—')}</Badge></TableCell>
                      <TableCell className="font-medium">{String(e.title ?? '—')}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[240px] truncate">{String(e.description ?? '—')}</TableCell>
                      <TableCell>{fmtTime(e.detectedAt)}</TableCell>
                      <TableCell>{String(e.assignee ?? '—')}</TableCell>
                      <TableCell className="text-center">
                        {e.status === 'open' ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedException(e as Record<string, unknown>)}>处理异常</Button>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">已处理</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── 三维指标 ──────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base">三维指标明细与风险预警</CardTitle><CardDescription>偿债能力 · 营运能力 · 盈利能力 — 核心指标分析与风险预警</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {indicators.map((dim) => (
              <div key={dim.label} className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2">{dim.label}</h4>
                <div className="space-y-2">
                  {dim.items.map((item, j) => (
                    <div key={j} className="text-xs">
                      <div className="flex justify-between">
                        <span>{item.name}</span>
                        <span className={`font-mono font-medium ${item.warn ? 'text-warning' : 'text-success'}`}>{item.val}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{item.range}</span>
                        <span className={item.warn ? 'text-warning' : 'text-success'}>{item.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 综合指标预警 ──────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base">综合指标预警</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead>指标</TableHead><TableHead>值</TableHead><TableHead>阈值</TableHead><TableHead>计算口径</TableHead><TableHead>判定说明</TableHead></TableRow></TableHeader>
            <TableBody>
              {[
                { name: '盈余现金保障倍数', val: '0.42', threshold: '≥ 0.5', formula: '经营现金净流量 ¥98.00万 ÷ 净利润 ¥214.68万', judge: '预警：低于0.5进入黄灯区', warn: true },
                { name: '现金总资产比', val: '12.4%', threshold: '≥ 6%', formula: '货币资产 ¥842.66万 ÷ 资产总额 ¥6,820.00万', judge: '正常：高于6%，现金资产充裕', warn: false },
                { name: '月度经营性现金流', val: '¥286.00万', threshold: '¥320.00万', formula: '本月经营现金净流量低于预算 ¥34.00万', judge: '预警：低于预算阈值触发预警', warn: true },
                { name: '销售增长率', val: '8.6%', threshold: '≥ 5%', formula: '本期增长额 ¥100.04万 ÷ 上期 ¥1,168.00万', judge: '正常：高于行业均值，增长健康', warn: false },
                { name: '资本积累率', val: '6.9%', threshold: '≥ 5%', formula: '权益增长 ¥74.00万 ÷ 年初权益 ¥1,080.00万', judge: '正常：所有者权益稳步增长', warn: false },
              ].map((r, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className={`font-mono ${r.warn ? 'text-warning' : 'text-success'}`}>{r.val}</TableCell>
                  <TableCell>{r.threshold}</TableCell>
                  <TableCell className="text-muted-foreground">{r.formula}</TableCell>
                  <TableCell><Badge className={r.warn ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} variant="outline">{r.judge}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Exception processing drawer ───────────────────────────── */}
      <Sheet open={!!selectedException} onOpenChange={(o) => !o && setSelectedException(null)}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[540px]">
          <SheetHeader><SheetTitle>处理异常</SheetTitle><SheetDescription>{String(selectedException?.title ?? '—')}</SheetDescription></SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm space-y-1">
              <p className="font-medium text-sm">异常说明</p>
              <p className="text-muted-foreground">{String(selectedException?.description ?? '—')}</p>
              <p className="text-xs">责任人：{String(selectedException?.assignee ?? '—')}</p>
              <p className="text-xs">检测时间：{fmtTime(selectedException?.detectedAt)}</p>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">处理动作</Label>
                <RadioGroup value={processAction} onValueChange={setProcessAction} className="mt-2 space-y-2">
                  {['已联系', '调整计划', '升级', '误报'].map(a => (
                    <div key={a} className="flex items-center space-x-2"><RadioGroupItem value={a} id={a} /><Label htmlFor={a} className="text-sm">{a}</Label></div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm">处理说明</Label>
                <Textarea value={processNote} onChange={e => setProcessNote(e.target.value)} className="mt-1 text-sm" rows={3} />
              </div>
              <div>
                <Label className="text-sm">处理结果</Label>
                <RadioGroup value={processResult} onValueChange={setProcessResult} className="mt-2 space-y-2">
                  {['处理完成，申请关闭', '持续跟进', '需要负责人决策'].map(r => (
                    <div key={r} className="flex items-center space-x-2"><RadioGroupItem value={r} id={r} /><Label htmlFor={r} className="text-sm">{r}</Label></div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!processAction || !processResult || resolveMutation.isPending}>
              {resolveMutation.isPending ? '保存中...' : '保存记录'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
