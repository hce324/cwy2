'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, FileText, CheckCircle2, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type AuditStatus = 'pending' | 'approved' | 'posted';

interface Voucher {
  id: string;
  summary: string;
  info: string;
  status: string;
  category: string;
  debitAmount: string;
  creditAmount: string;
  date: string;
  creator: string;
  auditStatus: AuditStatus;
}

const initialVouchers: Voucher[] = [
  {
    id: '转字138号',
    summary: '采购蓝牙耳机验收入库',
    info: '制单：周会计；杭州星杰供应链；科目：140501/22210101/220201',
    status: '待审核',
    category: '转账凭证',
    debitAmount: '¥113,000.00',
    creditAmount: '¥113,000.00',
    date: '2026-07-13',
    creator: '周会计',
    auditStatus: 'pending',
  },
  {
    id: '转字139号',
    summary: '购入办公电脑并验收',
    info: '发票+验收单；成都蓝芯科技；160101 固定资产—电子设备',
    status: '待审核',
    category: '转账凭证',
    debitAmount: '¥22,600.00',
    creditAmount: '¥22,600.00',
    date: '2026-07-12',
    creator: '周会计',
    auditStatus: 'pending',
  },
  {
    id: '转字140号',
    summary: '确认销售物流服务费',
    info: '结算单；迅达物流；660209 销售费用—物流费',
    status: '待审核',
    category: '转账凭证',
    debitAmount: '¥4,280.00',
    creditAmount: '¥4,280.00',
    date: '2026-07-11',
    creator: '周会计',
    auditStatus: 'pending',
  },
  {
    id: '收字128号',
    summary: '收到抖音平台结算款',
    info: '陈出纳；100201 银行存款/112202 应收抖音平台款',
    status: '已审核',
    category: '收款凭证',
    debitAmount: '¥86,392.18',
    creditAmount: '¥86,392.18',
    date: '2026-07-12',
    creator: '陈出纳',
    auditStatus: 'approved',
  },
  {
    id: '付字209号',
    summary: '支付供应商货款',
    info: '上海云仓',
    status: '已审核',
    category: '付款凭证',
    debitAmount: '¥113,000.00',
    creditAmount: '¥113,000.00',
    date: '2026-07-13',
    creator: '周会计',
    auditStatus: 'approved',
  },
  {
    id: '付字021号',
    summary: '支付零星办公费用',
    info: '660201 管理费用—办公费/100101 库存现金',
    status: '已记账',
    category: '付款凭证',
    debitAmount: '¥860.00',
    creditAmount: '¥860.00',
    date: '2026-07-10',
    creator: '周会计',
    auditStatus: 'posted',
  },
  {
    id: '（暂估）',
    summary: '平台服务费暂估',
    info: '660202 销售费用—平台费/220202 其他应付款—暂估',
    status: '已记账',
    category: '转账凭证',
    debitAmount: '¥—',
    creditAmount: '¥—',
    date: '2026-07-10',
    creator: '周会计',
    auditStatus: 'posted',
  },
  {
    id: '收字130号',
    summary: '收到客户来款',
    info: '杭州远海贸易；100201 银行存款/112201 应收账款',
    status: '已记账',
    category: '收款凭证',
    debitAmount: '¥48,200.00',
    creditAmount: '¥48,200.00',
    date: '2026-07-15',
    creator: '陈出纳',
    auditStatus: 'posted',
  },
];

const tabConfig = [
  { key: '待审核', status: 'pending' as AuditStatus },
  { key: '已审核', status: 'approved' as AuditStatus },
  { key: '已记账', status: 'posted' as AuditStatus },
  { key: '全部凭证', status: null },
];

function ArrowIcon() {
  return <span className="text-muted-foreground">→</span>;
}

function parseAmount(s: string): number {
  if (!s || s === '¥—') return 0;
  return Number(s.replace(/[¥,]/g, ''));
}

function formatMoney(n: number): string {
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function VoucherQueryView() {
  const { currentRole } = useAppStore();
  const isDirector = currentRole === '财务负责人';

  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState('全部凭证');

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('全部类别');
  const [yearFilter, setYearFilter] = useState('2026');
  const [monthFilter, setMonthFilter] = useState('07');
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const activeStatus = tabConfig.find((t) => t.key === activeTab)?.status;

  const matchesFilters = (v: Voucher): boolean => {
    if (categoryFilter !== '全部类别' && v.category !== categoryFilter) return false;
    if (yearFilter !== '2026' && !v.date.startsWith(yearFilter)) return false;
    if (monthFilter !== '全部' && !v.date.startsWith(`2026-${monthFilter}`)) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        v.id.toLowerCase().includes(kw) ||
        v.summary.toLowerCase().includes(kw) ||
        v.info.toLowerCase().includes(kw) ||
        v.creator.toLowerCase().includes(kw)
      );
    }
    return true;
  };

  const tabFilteredVouchers = useMemo(
    () => (activeStatus ? vouchers.filter((v) => v.auditStatus === activeStatus) : vouchers),
    [vouchers, activeStatus],
  );

  const displayedVouchers = useMemo(
    () => tabFilteredVouchers.filter(matchesFilters),
    [tabFilteredVouchers, categoryFilter, yearFilter, monthFilter, searchKeyword],
  );

  const totalDebit = displayedVouchers.reduce((sum, v) => sum + parseAmount(v.debitAmount), 0);
  const totalCredit = displayedVouchers.reduce((sum, v) => sum + parseAmount(v.creditAmount), 0);

  const handleSearch = () => {
    setSearchKeyword(searchInput);
    toast.success('查询完成');
  };

  const handleReset = () => {
    setCategoryFilter('全部类别');
    setYearFilter('2026');
    setMonthFilter('07');
    setSearchInput('');
    setSearchKeyword('');
    toast.success('已重置查询条件');
  };

  const updateSelectedVoucher = (updated: Voucher) => {
    setSelectedVoucher(updated);
    setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleApprove = () => {
    if (!selectedVoucher || selectedVoucher.auditStatus !== 'pending') {
      toast.error('请选择一张待审核凭证');
      return;
    }
    const updated = { ...selectedVoucher, auditStatus: 'approved' as AuditStatus, status: '已审核' };
    updateSelectedVoucher(updated);
    toast.success('审核完成：相关数据已写入共享账务数据');
  };

  const handleUnapprove = () => {
    if (!selectedVoucher || selectedVoucher.auditStatus !== 'approved') {
      toast.error('只能反审核已审核凭证');
      return;
    }
    const updated = { ...selectedVoucher, auditStatus: 'pending' as AuditStatus, status: '待审核' };
    updateSelectedVoucher(updated);
    toast.success('已执行反审核：该凭证退回至待审核状态');
  };

  const handleBatchApprove = () => {
    const pendingIds = vouchers.filter((v) => v.auditStatus === 'pending').map((v) => v.id);
    if (pendingIds.length === 0) {
      toast.error('没有待审核凭证');
      return;
    }
    setVouchers((prev) =>
      prev.map((v) => (pendingIds.includes(v.id) ? { ...v, auditStatus: 'approved' as AuditStatus, status: '已审核' } : v)),
    );
    if (selectedVoucher && selectedVoucher.auditStatus === 'pending') {
      setSelectedVoucher({ ...selectedVoucher, auditStatus: 'approved', status: '已审核' });
    }
    toast.success(`批量审核完成：共处理 ${pendingIds.length} 张待审核凭证`);
  };

  const statusBadgeClass = (status: AuditStatus) => {
    switch (status) {
      case 'pending':
        return 'border-warning/30 text-warning';
      case 'approved':
        return 'border-success/30 text-success';
      case 'posted':
        return 'border-muted-foreground/30 text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">VOUCHER QUERY</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">查询凭证</h1>
        </div>
        {isDirector && (
          <div className="flex gap-2">
            <Button size="sm" disabled={!selectedVoucher || selectedVoucher.auditStatus !== 'pending'} onClick={handleApprove}>
              审核当前凭证
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedVoucher || selectedVoucher.auditStatus !== 'approved'}
              onClick={handleUnapprove}
            >
              反审核当前凭证
            </Button>
            <Button size="sm" variant="outline" onClick={handleBatchApprove}>
              批量审核
            </Button>
          </div>
        )}
      </div>

      {/* ========== Permission Notice (财务专员) ========== */}
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
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
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
          <Select value={yearFilter} onValueChange={(v) => v && setYearFilter(v)}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={(v) => v && setMonthFilter(v)}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              <SelectItem value="07">07月</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="凭证字号、摘要、制单人"
            className="h-8 text-xs w-48"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button size="sm" className="h-8 gap-1" onClick={handleSearch}>
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> 重置
          </Button>
        </CardContent>
      </Card>

      {/* ========== Tabs ========== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabConfig.map((tab) => {
            const count = tab.status ? vouchers.filter((v) => v.auditStatus === tab.status).length : vouchers.length;
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                {tab.key}
                <span className="ml-1 text-[11px] text-muted-foreground">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* ========== Query Note ========== */}
      <p className="text-xs text-muted-foreground">
        凭证字号在生成时按核算主体、会计期间和凭证类别顺序分配。草稿没有字号，也不能被主管审核或登记账簿。查询结果按凭证字号、日期降序排列，可点击行查看凭证详情与审计轨迹。
      </p>

      {/* ========== Voucher List Table ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground mb-2">
            {displayedVouchers.length} 张凭证 · 按生成记录查询
          </div>
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead className="w-[120px]">凭证字号</TableHead>
                <TableHead>摘要</TableHead>
                <TableHead className="hidden md:table-cell">相关信息</TableHead>
                <TableHead className="w-[120px]">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedVouchers.map((v, i) => {
                const isSelected = selectedVoucher?.id === v.id;
                return (
                  <TableRow
                    key={i}
                    className={`text-xs cursor-pointer transition-colors hover:bg-accent/40 ${
                      isSelected ? 'bg-accent/50 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedVoucher(isSelected ? null : v)}
                  >
                    <TableCell className="font-medium">{v.id}</TableCell>
                    <TableCell>{v.summary}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{v.info}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(v.auditStatus)}>
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* ========== Footer: 借方/贷方/合计 + 落款 ========== */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-muted/30 rounded-lg text-xs">
            <div>
              <span className="text-muted-foreground">借方金额合计：</span>
              <span className="font-mono font-medium">{formatMoney(totalDebit)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">贷方金额合计：</span>
              <span className="font-mono font-medium">{formatMoney(totalCredit)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">合 计：</span>
              <span className="font-mono font-medium">{formatMoney(totalDebit)}</span>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
            <span>记账：林主管</span>
            <span>复核：</span>
            <span>制单：周会计</span>
            <span>凭证来源：业务系统</span>
          </div>
        </CardContent>
      </Card>

      {/* ========== Voucher Detail (shown when selected) ========== */}
      {selectedVoucher && (
        <>
          {/* 原始资料与业务来源 */}
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                原始资料与业务来源
              </CardTitle>
              <CardDescription>
                凭证 {selectedVoucher.id} — {selectedVoucher.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">凭证类别</span>
                    <span className="font-medium">{selectedVoucher.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">业务日期</span>
                    <span className="font-medium">{selectedVoucher.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">制单人</span>
                    <span className="font-medium">{selectedVoucher.creator}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">借方金额</span>
                    <span className="font-mono font-medium text-success">{selectedVoucher.debitAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">贷方金额</span>
                    <span className="font-mono font-medium text-danger">{selectedVoucher.creditAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">附件数量</span>
                    <span className="font-medium">3 份</span>
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    原始资料：采购订单 PO-20260713-089、入库单 WH-20260713-132、增值税专用发票 INV-20260713-451
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-muted-foreground">
                    附件归档状态：已完整归档至档案中心，编号 DOC-20260713-138
                  </span>
                </div>
                {selectedVoucher.status !== '—' && selectedVoucher.status !== '（暂估）' && (
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <span className="text-muted-foreground">
                      业务来源：从{selectedVoucher.category}模板自动生成，关联业务流水号 BS-202607-08932
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 凭证审计轨迹 */}
          <Card className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">凭证审计轨迹</CardTitle>
              <CardDescription>追溯凭证从制单、复核到记账的完整审计链</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Audit chain */}
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-medium">制单</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedVoucher.creator} · {selectedVoucher.date}
                    </span>
                  </div>
                  <ArrowIcon />
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                      selectedVoucher.auditStatus === 'pending' ? 'bg-warning/10' : 'bg-success/10'
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${selectedVoucher.auditStatus === 'pending' ? 'text-warning' : 'text-success'}`}
                    />
                    <span className="font-medium">复核</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedVoucher.auditStatus === 'pending' ? '等待林主管审核' : '林主管已审核'}
                    </span>
                  </div>
                  <ArrowIcon />
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                      selectedVoucher.auditStatus === 'posted' ? 'bg-success/10' : 'bg-muted'
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${selectedVoucher.auditStatus === 'posted' ? 'text-success' : 'text-muted-foreground'}`}
                    />
                    <span
                      className={selectedVoucher.auditStatus === 'posted' ? 'font-medium' : 'text-muted-foreground font-medium'}
                    >
                      记账
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedVoucher.auditStatus === 'posted' ? '已登记账簿' : '尚未记账'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Audit notes */}
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
                    <span className="font-medium text-foreground">操作日志：</span>
                    <span className="ml-1">
                      2026-07-13 10:32 周会计 生成凭证 · 2026-07-13 14:05 系统 自动归档附件
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ========== Empty state: no voucher selected ========== */}
      {!selectedVoucher && (
        <Card className="elevation-1 border-dashed">
          <CardContent className="py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              点击上方表格中的任意凭证行，查看原始资料与业务来源及完整审计轨迹
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
