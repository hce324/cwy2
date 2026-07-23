'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { useAppStore } from '@/lib/store';
import type { ViewId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, RotateCcw, CheckCircle2, FileCheck, ShieldAlert, FileDown } from 'lucide-react';
import { toast } from 'sonner';

type ReconStatus = '已勾对' | '未达';

interface ReconRow {
  id: string;
  date: string;
  serial: string;
  bank: string;
  company: string;
  result: string;
  duty: string;
  action: string;
  status: ReconStatus;
  amount: number;
}

const allRows: ReconRow[] = [
  {
    id: 'BR-202607-0001',
    date: '07-12',
    serial: '755901',
    bank: '抖音平台结算到账 收 ¥86,392.18',
    company: '银收-128 · 收到平台款',
    result: '自动勾对·金额日期流水号一致',
    duty: '系统',
    action: '查看',
    status: '已勾对',
    amount: 86392.18,
  },
  {
    id: 'BR-202607-0002',
    date: '07-31',
    serial: 'IN2026073108',
    bank: '银行结息 收 ¥1,268.40',
    company: '日记账中未找到',
    result: '银行已收、企业未收',
    duty: '出纳',
    action: '待出纳跟踪',
    status: '未达',
    amount: 1268.4,
  },
  {
    id: 'BR-202607-0003',
    date: '07-31',
    serial: 'OUT2026073196',
    bank: '网银服务费 付 ¥186.40',
    company: '日记账中未找到',
    result: '银行已付、企业未付',
    duty: '出纳',
    action: '待出纳跟踪',
    status: '未达',
    amount: 186.4,
  },
  {
    id: 'BR-202607-0004',
    date: '—',
    serial: 'JV-202607-0156',
    bank: '银行尚未入账',
    company: '收字205号·收到客户转账 ¥25,000',
    result: '企业已收、银行未收',
    duty: '出纳',
    action: '待银行入账',
    status: '未达',
    amount: 25000,
  },
  {
    id: 'BR-202607-0005',
    date: '—',
    serial: 'JV-202607-0167',
    bank: '银行尚未扣款',
    company: '付字209号·支付供应商 ¥10,000',
    result: '企业已付、银行未付',
    duty: '出纳',
    action: '待银行扣款',
    status: '未达',
    amount: 10000,
  },
];

const settlementEntities = [
  '杭州星芒供应链有限公司',
  '上海星芒贸易有限公司',
];

const bankAccounts = [
  '招商银行杭州分行 8888',
  '工商银行上海分行 6666',
  '支付宝企业账户 9999',
];

const reconPeriods = [
  '2026-07',
  '2026-06',
  '2026-05',
];

const tabs: { key: '全部' | ReconStatus; label: string }[] = [
  { key: '全部', label: '全部' },
  { key: '已勾对', label: '已勾对' },
  { key: '未达', label: '未达' },
];

export function BankReconView() {
  const setView = useAppStore((s) => s.setView);
  const [settlementEntity, setSettlementEntity] = useState(settlementEntities[0]);
  const [bankAccount, setBankAccount] = useState(bankAccounts[0]);
  const [reconPeriod, setReconPeriod] = useState(reconPeriods[0]);
  const [activeTab, setActiveTab] = useState<'全部' | ReconStatus>('全部');
  const [reviewed, setReviewed] = useState(false);

  // 查询条件快照，点击「查询」后才真正用于过滤；初始与当前选择一致
  const [appliedFilters, setAppliedFilters] = useState({
    settlementEntity: settlementEntities[0],
    bankAccount: bankAccounts[0],
    reconPeriod: reconPeriods[0],
  });

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (activeTab !== '全部') {
      rows = rows.filter((r) => r.status === activeTab);
    }
    // 不同期间使用不同数据量模拟后端切换效果
    if (appliedFilters.reconPeriod === '2026-06') {
      rows = rows.filter((_, i) => i !== 0);
    } else if (appliedFilters.reconPeriod === '2026-05') {
      rows = rows.filter((_, i) => i !== 0 && i !== 1);
    }
    return rows;
  }, [activeTab, appliedFilters.reconPeriod]);

  const counts = useMemo(() => {
    const total = appliedFilters.reconPeriod === '2026-07' ? allRows.length : appliedFilters.reconPeriod === '2026-06' ? allRows.length - 1 : allRows.length - 2;
    const matched = allRows.filter((r) => r.status === '已勾对').length - (appliedFilters.reconPeriod === '2026-07' ? 0 : appliedFilters.reconPeriod === '2026-06' ? 1 : 2);
    const unreached = allRows.filter((r) => r.status === '未达').length;
    return {
      全部: Math.max(total, 0),
      已勾对: Math.max(matched, 0),
      未达: unreached,
    };
  }, [appliedFilters.reconPeriod]);

  const unreachedAmount = useMemo(
    () => filteredRows.filter((r) => r.status === '未达').reduce((sum, r) => sum + r.amount, 0),
    [filteredRows]
  );

  const handleSearch = () => {
    setAppliedFilters({ settlementEntity, bankAccount, reconPeriod });
    toast.success('对账明细已按当前条件刷新');
  };

  const handleReset = () => {
    setSettlementEntity(settlementEntities[0]);
    setBankAccount(bankAccounts[0]);
    setReconPeriod(reconPeriods[0]);
    setAppliedFilters({
      settlementEntity: settlementEntities[0],
      bankAccount: bankAccounts[0],
      reconPeriod: reconPeriods[0],
    });
    setActiveTab('全部');
    toast.info('筛选条件已重置');
  };

  const handleReview = () => {
    setReviewed(true);
    toast.success('余额调节表复核通过，双方余额一致');
  };

  const handleViewSource = () => {
    setView('hz-sourcevoucher' as ViewId);
  };

  const handleExport = () => {
    toast.success('银行存款余额调节表已开始导出（PDF）');
  };

  const formatAmount = (n: number) =>
    `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="p-6 space-y-6">
      {/* ========== Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">BANK RECONCILIATION</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">银行对账</h1>
          <p className="text-sm text-muted-foreground mt-1">
            复核未达账项处理、长期未达控制及银行存款余额调节表。
          </p>
        </div>
        <RippleContainer>
          <Button
            size="sm"
            className={cn('gap-1.5', reviewed && 'bg-success hover:bg-success')}
            onClick={handleReview}
            disabled={reviewed}
          >
            {reviewed ? <CheckCircle2 className="h-4 w-4" /> : <FileCheck className="h-4 w-4" />}
            {reviewed ? '已复核通过' : '复核余额调节表'}
          </Button>
        </RippleContainer>
      </div>

      <Separator />

      {/* ========== 账务分工 ========== */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">出纳：</strong>导入银行对账单、执行勾对、登记未达项及编制余额调节表。</p>
        <p><strong className="text-foreground">财务负责人：</strong>复核差异处理、长期未达项和余额调节表。</p>
        <p><strong className="text-foreground">财务专员：</strong>无银行对账访问权限。</p>
      </div>

      {/* ========== Filters ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground mr-1">结算主体</span>
          <Select value={settlementEntity} onValueChange={(v) => v && setSettlementEntity(v)}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settlementEntities.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground mr-1">银行账户</span>
          <Select value={bankAccount} onValueChange={(v) => v && setBankAccount(v)}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground mr-1">对账期间</span>
          <Select value={reconPeriod} onValueChange={(v) => v && setReconPeriod(v)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reconPeriods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.replace('-', '年')}月
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RippleContainer>
            <Button size="sm" className="h-8 gap-1" onClick={handleSearch}>
              <Search className="h-3.5 w-3.5" /> 查询
            </Button>
          </RippleContainer>
          <RippleContainer>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> 重置
            </Button>
          </RippleContainer>
        </CardContent>
      </Card>

      {/* ========== Stats ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">对账单状态</div>
            <div className="text-lg font-bold mt-1">已导入 · {counts['全部']} 笔</div>
            <div className="text-[10px] text-muted-foreground">银行流水{counts['全部']}笔 借方¥2,846,392.18</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">自动匹配</div>
            <div className="text-lg font-bold mt-1">{counts['已勾对']} 笔</div>
            <div className="text-[10px] text-success">匹配率 {counts['全部'] > 0 ? ((counts['已勾对'] / counts['全部']) * 100).toFixed(1) : '0.0'}%</div>
          </CardContent>
        </Card>
        <Card className="elevation-1 border-warning/20">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">未达事项</div>
            <div className="text-lg font-bold mt-1">{counts['未达']} 笔</div>
            <div className="text-[10px] text-muted-foreground">合计影响 {formatAmount(unreachedAmount)}</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">节后总余额</div>
            <div className="text-lg font-bold mt-1 font-mono">¥1,138,294.53</div>
            <div className="text-[10px] text-success">双方余额相符</div>
          </CardContent>
        </Card>
      </div>

      {/* ========== 对账明细 ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">对账明细与未达账项</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '全部' | ReconStatus)}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                  {tab.label} {counts[tab.key]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
              {filteredRows.map((r) => (
                <TableRow key={r.id} className="text-xs">
                  <TableCell className="font-mono">{r.date} · {r.serial}</TableCell>
                  <TableCell>{r.bank}</TableCell>
                  <TableCell>{r.company}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        r.status === '已勾对' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      )}
                      variant="outline"
                    >
                      {r.result}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.duty}</TableCell>
                  <TableCell className="text-center">
                    <RippleContainer>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleViewSource}>
                        {r.action}
                      </Button>
                    </RippleContainer>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                    当前筛选条件下暂无对账明细
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========== 长期未达账项控制 ========== */}
      <Card className="elevation-1 border-success/20">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-success/10 flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-success" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">长期未达账项控制</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  监控超过 30 天仍未处理的未达账项，超期自动上报财务负责人。
                </p>
              </div>
            </div>
            <Badge className="bg-success/10 text-success text-xs" variant="outline">
              0 笔
            </Badge>
          </div>
          <div className="mt-3 bg-muted/30 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              当前无长期未达账项（超过 30 天）。所有未达事项均在正常处理周期内。
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ========== 银行存款余额调节表 ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">银行存款余额调节表</CardTitle>
          <CardDescription>2026年7月31日 · {bankAccount}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">企业银行存款日记账</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>账面余额</TableCell>
                    <TableCell className="text-right font-mono">¥1,137,212.53</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-success">加：银行已收、企业未收</TableCell>
                    <TableCell className="text-right font-mono">¥1,268.40</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-danger">减：银行已付、企业未付</TableCell>
                    <TableCell className="text-right font-mono">¥186.40</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>调节后余额</TableCell>
                    <TableCell className="text-right font-mono">¥1,138,294.53</TableCell>
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
                    <TableCell className="text-right font-mono">¥1,153,294.53</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-success">加：企业已付、银行未付</TableCell>
                    <TableCell className="text-right font-mono">¥10,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-danger">减：企业已收、银行未收</TableCell>
                    <TableCell className="text-right font-mono">¥25,000.00</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>调节后余额</TableCell>
                    <TableCell className="text-right font-mono">¥1,138,294.53</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 p-3 bg-success/10 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div className="text-xs">
              <span className="text-success font-medium">
                {reviewed ? '✓ 已复核 · 双方调节后余额一致 · 差额 ¥0.00' : '✓ 双方调节后余额一致 · 差额 ¥0.00'}
              </span>
              <span className="text-muted-foreground ml-3">编制人：陈出纳 · 2026-08-01 09:42</span>
            </div>
            <RippleContainer className="ml-auto">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleExport}>
                <FileDown className="h-3.5 w-3.5" /> 导出调节表
              </Button>
            </RippleContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
