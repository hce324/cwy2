'use client';

import { useMemo, useState } from 'react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AuditStatus = 'pending' | 'approved' | 'posted';

interface Voucher {
  id: string;
  summary: string;
  info: string;
  status: string;
  auditStatus: AuditStatus;
  category: string;
  debitAmount: string;
  creditAmount: string;
  date: string;
  creator: string;
  attachments: string;
  sourceDocs: string;
  sourceType: string;
  flowNo: string;
  docNo: string;
}

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: '转字138号',
    summary: '采购蓝牙耳机验收入库',
    info: '制单：周会计；杭州星杰供应链；科目：140501/22210101/220201',
    status: '已识别·附件已归档',
    auditStatus: 'pending',
    category: '转账凭证',
    debitAmount: '¥113,000.00',
    creditAmount: '¥113,000.00',
    date: '2026-07-13',
    creator: '周会计',
    attachments: '采购订单 PO-20260713-089、入库单 WH-20260713-132、增值税专用发票 INV-20260713-451',
    sourceDocs: '采购订单 + 入库单 + 专用发票',
    sourceType: '从采购入库单自动生成',
    flowNo: 'BS-202607-08932',
    docNo: 'DOC-20260713-138',
  },
  {
    id: '转字139号',
    summary: '购入办公电脑并验收',
    info: '发票+验收单；成都蓝芯科技；160101 固定资产—电子设备',
    status: '—',
    auditStatus: 'pending',
    category: '转账凭证',
    debitAmount: '¥22,600.00',
    creditAmount: '¥22,600.00',
    date: '2026-07-12',
    creator: '周会计',
    attachments: '固定资产验收单 FA-20260712-014、增值税专用发票 INV-20260712-203、付款申请单',
    sourceDocs: '固定资产验收单 + 专用发票',
    sourceType: '从固定资产模块自动生成',
    flowNo: 'BS-202607-08918',
    docNo: 'DOC-20260712-102',
  },
  {
    id: '转字140号',
    summary: '确认销售物流服务费',
    info: '结算单；迅达物流；660209 销售费用—物流费',
    status: '—',
    auditStatus: 'pending',
    category: '转账凭证',
    debitAmount: '¥4,280.00',
    creditAmount: '¥4,280.00',
    date: '2026-07-11',
    creator: '周会计',
    attachments: '物流结算单 LZ-20260711-056、对账确认单',
    sourceDocs: '物流结算单 + 对账确认单',
    sourceType: '从物流对账单自动生成',
    flowNo: 'BS-202607-08895',
    docNo: 'DOC-20260711-087',
  },
  {
    id: '收字128号',
    summary: '收到抖音平台结算款',
    info: '陈出纳；100201 银行存款/112202 应收抖音平台款',
    status: '已到账',
    auditStatus: 'approved',
    category: '收款凭证',
    debitAmount: '¥86,392.18',
    creditAmount: '¥86,392.18',
    date: '2026-07-12',
    creator: '陈出纳',
    attachments: '抖音平台结算单 DY-20260712-001、银行电子回单',
    sourceDocs: '平台结算单 + 银行回单',
    sourceType: '从电商平台对账单自动生成',
    flowNo: 'BS-202607-08905',
    docNo: 'DOC-20260712-095',
  },
  {
    id: '付字209号',
    summary: '支付供应商货款',
    info: '上海云仓',
    status: '已支付',
    auditStatus: 'approved',
    category: '付款凭证',
    debitAmount: '¥113,000.00',
    creditAmount: '¥113,000.00',
    date: '2026-07-13',
    creator: '周会计',
    attachments: '付款审批单 PY-20260713-031、银行付款回单、采购合同',
    sourceDocs: '付款审批单 + 银行回单',
    sourceType: '从付款申请单自动生成',
    flowNo: 'BS-202607-08931',
    docNo: 'DOC-20260713-136',
  },
  {
    id: '付字021号',
    summary: '支付零星办公费用',
    info: '660201 管理费用—办公费/100101 库存现金',
    status: '—',
    auditStatus: 'posted',
    category: '付款凭证',
    debitAmount: '¥860.00',
    creditAmount: '¥860.00',
    date: '2026-07-10',
    creator: '周会计',
    attachments: '费用报销单 BX-20260710-012、办公用品发票',
    sourceDocs: '费用报销单 + 发票',
    sourceType: '从费用报销单自动生成',
    flowNo: 'BS-202607-08872',
    docNo: 'DOC-20260710-063',
  },
  {
    id: '（暂估）',
    summary: '平台服务费暂估',
    info: '660202 销售费用—平台费/220202 其他应付款—暂估',
    status: '—',
    auditStatus: 'posted',
    category: '转账凭证',
    debitAmount: '¥—',
    creditAmount: '¥—',
    date: '2026-07-10',
    creator: '周会计',
    attachments: '平台服务费暂估单 ZE-20260710-001、合同页',
    sourceDocs: '暂估单 + 合同页',
    sourceType: '从费用暂估单自动生成',
    flowNo: 'BS-202607-08871',
    docNo: 'DOC-20260710-061',
  },
  {
    id: '转字141号',
    summary: '支付上月水电费',
    info: '660203 管理费用—水电费/220201 应付账款',
    status: '—',
    auditStatus: 'posted',
    category: '转账凭证',
    debitAmount: '¥3,250.00',
    creditAmount: '¥3,250.00',
    date: '2026-07-09',
    creator: '周会计',
    attachments: '水电费发票 INV-20260709-112、分摊计算表',
    sourceDocs: '水电费发票 + 分摊计算表',
    sourceType: '从费用分摊单自动生成',
    flowNo: 'BS-202607-08860',
    docNo: 'DOC-20260709-055',
  },
];

const TAB_ITEMS: { value: AuditStatus | 'all'; label: string }[] = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'posted', label: '已记账' },
  { value: 'all', label: '全部凭证' },
];

function getStatusBadgeVariant(auditStatus: AuditStatus) {
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

function formatDateTime(date: string) {
  return `${date} 14:32`;
}

export function VoucherQueryView() {
  const { currentRole } = useAppStore();
  const isDirector = currentRole === '财务负责人';

  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuditStatus | 'all'>('all');

  // filter states
  const [category, setCategory] = useState('全部类别');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('07');
  const [keyword, setKeyword] = useState('');

  const counts = useMemo(() => {
    return {
      pending: vouchers.filter(v => v.auditStatus === 'pending').length,
      approved: vouchers.filter(v => v.auditStatus === 'approved').length,
      posted: vouchers.filter(v => v.auditStatus === 'posted').length,
      all: vouchers.length,
    };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchTab = activeTab === 'all' || v.auditStatus === activeTab;
      const matchCategory = category === '全部类别' || v.category === category;
      const matchDate = v.date.startsWith(`${year}-${month}`);
      const matchKeyword =
        !keyword ||
        [v.id, v.summary, v.info, v.creator, v.category].some(s =>
          s.toLowerCase().includes(keyword.trim().toLowerCase())
        );
      return matchTab && matchCategory && matchDate && matchKeyword;
    });
  }, [vouchers, activeTab, category, year, month, keyword]);

  const handleRowClick = (v: Voucher) => {
    setSelectedVoucher(v);
    setSheetOpen(true);
  };

  const updateVoucherStatus = (id: string, next: AuditStatus) => {
    setVouchers(prev =>
      prev.map(v => {
        if (v.id !== id) return v;
        const status =
          next === 'pending'
            ? '—'
            : next === 'approved'
              ? '已审核'
              : '已记账';
        return { ...v, auditStatus: next, status };
      })
    );
    setSelectedVoucher(prev =>
      prev && prev.id === id
        ? {
            ...prev,
            auditStatus: next,
            status:
              next === 'pending'
                ? '—'
                : next === 'approved'
                  ? '已审核'
                  : '已记账',
          }
        : prev
    );
  };

  const handleApprove = () => {
    if (!selectedVoucher) return;
    if (selectedVoucher.auditStatus !== 'pending') {
      toast.warning('仅待审核凭证可执行审核');
      return;
    }
    updateVoucherStatus(selectedVoucher.id, 'approved');
    toast.success(`审核完成：${selectedVoucher.id} 已通过审核`);
  };

  const handleUnapprove = () => {
    if (!selectedVoucher) return;
    if (selectedVoucher.auditStatus === 'pending') {
      toast.warning('待审核凭证无需反审核');
      return;
    }
    updateVoucherStatus(selectedVoucher.id, 'pending');
    toast.info(`已执行反审核：${selectedVoucher.id} 退回至待审核状态`);
  };

  const handleBatchApprove = () => {
    const pendingIds = vouchers
      .filter(v => v.auditStatus === 'pending')
      .map(v => v.id);
    if (pendingIds.length === 0) {
      toast.warning('当前没有待审核凭证');
      return;
    }
    pendingIds.forEach(id => updateVoucherStatus(id, 'approved'));
    toast.success(`批量审核完成：共处理 ${pendingIds.length} 张待审核凭证`);
  };

  const handleReset = () => {
    setCategory('全部类别');
    setYear('2026');
    setMonth('07');
    setKeyword('');
    setActiveTab('all');
    toast.info('筛选条件已重置');
  };

  const currentDetail = selectedVoucher;

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
                disabled={!selectedVoucher}
                onClick={handleApprove}
              >
                审核当前凭证
              </Button>
            </RippleContainer>
            <RippleContainer className="ripple-container rounded-md">
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedVoucher}
                onClick={handleUnapprove}
              >
                反审核当前凭证
              </Button>
            </RippleContainer>
            <RippleContainer className="ripple-container rounded-md">
              <Button size="sm" variant="outline" onClick={handleBatchApprove}>
                批量审核
              </Button>
            </RippleContainer>
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
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
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
          <Select value={year} onValueChange={(v) => setYear(v ?? '')}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={(v) => setMonth(v ?? '')}>
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
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                toast.info(`已按关键字“${keyword || '全部'}”筛选`);
              }
            }}
          />
          <RippleContainer className="ripple-container rounded-md">
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() =>
                toast.info(`已按关键字“${keyword || '全部'}”筛选`)
              }
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
        onValueChange={v => setActiveTab(v as AuditStatus | 'all')}
      >
        <TabsList>
          {TAB_ITEMS.map(item => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="text-xs"
            >
              {item.label}
              <span className="ml-1 text-[11px] text-muted-foreground">
                {counts[item.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ========== Query Note ========== */}
      <p className="text-xs text-muted-foreground">
        凭证字号在生成时按核算主体、会计期间和凭证类别顺序分配。草稿没有字号，也不能被主管审核或登记账簿。查询结果按凭证字号、日期降序排列，
        <span className="text-foreground font-medium">点击任意行可查看凭证详情与审计轨迹</span>。
      </p>

      {/* ========== Voucher List Table ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground mb-2">
            {filteredVouchers.length} 张凭证 · 按生成记录查询
          </div>
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
              {filteredVouchers.map((v, i) => {
                const isSelected = selectedVoucher?.id === v.id;
                return (
                  <TableRow
                    key={i}
                    className={cn(
                      'text-xs cursor-pointer transition-colors hover:bg-accent/40',
                      isSelected && 'bg-accent/50 border-l-2 border-l-primary'
                    )}
                    onClick={() => handleRowClick(v)}
                  >
                    <TableCell className="font-medium">{v.id}</TableCell>
                    <TableCell>{v.summary}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {v.info}
                    </TableCell>
                    <TableCell>
                      {v.status === '—' ? (
                        '—'
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(getStatusBadgeVariant(v.auditStatus))}
                        >
                          {v.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                        onClick={e => {
                          e.stopPropagation();
                          handleRowClick(v);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredVouchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-xs text-muted-foreground py-8"
                  >
                    未找到符合条件的凭证
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ========== Footer: 借方/贷方/合计 + 落款 ========== */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-muted/30 rounded-lg text-xs">
            <div>
              <span className="text-muted-foreground">借方金额合计：</span>
              <span className="font-mono font-medium">¥340,132.18</span>
            </div>
            <div>
              <span className="text-muted-foreground">贷方金额合计：</span>
              <span className="font-mono font-medium">¥340,132.18</span>
            </div>
            <div>
              <span className="text-muted-foreground">合 计：</span>
              <span className="font-mono font-medium">¥340,132.18</span>
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

      {/* ========== Empty state: no voucher selected ========== */}
      {!currentDetail && (
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
                {currentDetail ? (
                  <span>
                    {currentDetail.id} — {currentDetail.summary}
                  </span>
                ) : (
                  '请选择凭证'
                )}
              </SheetDescription>
            </SheetHeader>

            {currentDetail && (
              <div className="p-4 space-y-4">
                {/* Basic info */}
                <Card className="elevation-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">原始资料与业务来源</CardTitle>
                    <CardDescription>
                      {currentDetail.sourceDocs}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">凭证类别</span>
                        <div className="font-medium">{currentDetail.category}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">业务日期</span>
                        <div className="font-medium">{currentDetail.date}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">制单人</span>
                        <div className="font-medium">{currentDetail.creator}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">凭证字号</span>
                        <div className="font-medium">{currentDetail.id}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">借方金额</span>
                        <div className="font-mono font-medium text-success">
                          {currentDetail.debitAmount}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">贷方金额</span>
                        <div className="font-mono font-medium text-danger">
                          {currentDetail.creditAmount}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          原始资料：{currentDetail.attachments}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          附件归档状态：已完整归档至档案中心，编号 {currentDetail.docNo}
                        </span>
                      </div>
                      {currentDetail.auditStatus !== 'pending' && (
                        <div className="flex items-start gap-2">
                          <History className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            业务来源：{currentDetail.sourceType}，关联业务流水号 {currentDetail.flowNo}
                          </span>
                        </div>
                      )}
                      {currentDetail.auditStatus === 'pending' && (
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
                          {currentDetail.creator} · {formatDateTime(currentDetail.date)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1',
                          currentDetail.auditStatus === 'pending'
                            ? 'bg-warning/10'
                            : 'bg-success/10'
                        )}
                      >
                        {currentDetail.auditStatus === 'pending' ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            currentDetail.auditStatus === 'pending' && 'text-warning'
                          )}
                        >
                          复核
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {currentDetail.auditStatus === 'pending'
                            ? '等待林主管审核'
                            : `林主管 · ${formatDateTime(currentDetail.date)}`}
                        </span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1',
                          currentDetail.auditStatus === 'posted'
                            ? 'bg-success/10'
                            : 'bg-muted'
                        )}
                      >
                        {currentDetail.auditStatus === 'posted' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            currentDetail.auditStatus !== 'posted' &&
                              'text-muted-foreground'
                          )}
                        >
                          记账
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {currentDetail.auditStatus === 'posted'
                            ? `林主管 · ${formatDateTime(currentDetail.date)}`
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
                        <span className="font-medium text-foreground">操作日志：</span>
                        <span className="ml-1">
                          {formatDateTime(currentDetail.date)} {currentDetail.creator}{' '}
                          生成凭证 · {formatDateTime(currentDetail.date)} 系统
                          自动归档附件
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
                          !currentDetail ||
                          currentDetail.auditStatus !== 'pending'
                        }
                        onClick={handleApprove}
                      >
                        审核当前凭证
                      </Button>
                    </RippleContainer>
                    <RippleContainer className="ripple-container flex-1 rounded-md">
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={
                          !currentDetail ||
                          currentDetail.auditStatus === 'pending'
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
                    onClick={() => toast.info('打印预览功能开发中')}
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
