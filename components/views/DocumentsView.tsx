'use client';

/**
 * 智能采集 (DocumentsView) — 自包含工作台
 * ───────────────────────────────────────────────────────────────
 * 后端缺口（占位/假数据，待后端补齐）：
 *   1. vouchers.batchCreate(ids[]) —— 批量写 AccountingVoucher+VoucherEntry（依赖 fiscalPeriodId），当前零路由。
 *      本页“批量制证”仅前端模拟：按类目套静态科目映射、本地置 linked、toast 标注“演示·待后端落库”。
 *   2. documents.recognize 当前是空壳：只翻 recognitionStatus→recognized，不抽字段、不写 rawDataJson。
 *      本页点“识别”仍调真实 recognize，并额外在前端按类目注入 mock 抽取字段到 rawDataJson（标注“模拟抽取”，刷新丢失）。
 *   3. CollectedDocument 无 fileUrl / 图片字段 —— 无原图可预览，查看原件仅展示结构化字段。
 *   4. documents.create 的 Zod 枚举未收录“采购订单”（DB 里却有该类目数据）→ 该类目可浏览(Tab)但经接口无法创建。
 * ───────────────────────────────────────────────────────────────
 * 数据-代码口径说明：DB 里 collected_documents 的真实 status 含 `success`（代码原只认 recognized/linked/archived/pending），
 * 本页已兼容 `success`→“已识别”。真实科目仅确认到 4 个（银行存款（货币资金）/应收账款/主营业务收入/管理费用），
 * 故批量制证映射只引用这 4 个真实科目，不编造进项税额/销项税额。
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  ArrowRight,
  Search,
  MoreVertical,
  Eye,
  ScanLine,
  AlertTriangle,
  Link2,
  FileText,
  Pencil,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────

interface Doc {
  id: bigint | number;
  name: string;
  category: string;
  amount: number;
  source: string | null;
  subDescription: string | null;
  documentDate: string | Date | null;
  recognitionStatus: string | null;
  isAbnormal: boolean;
  isRead: boolean;
  rawDataJson: any;
}

type VoucherEntry = { subject: string; dir: '借' | '贷'; amount: number };

// ─── Helpers ─────────────────────────────────────────────────────

function fmtAmount(n: unknown): string {
  return `¥${Number(n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? '').slice(0, 10);
}

// 状态渲染：兼容 DB 真实值 `success` 与接口值 `recognized`
function resultInfo(recognitionStatus: string | undefined, isAbnormal: boolean | undefined): { text: string; cls: string } {
  if (isAbnormal) return { text: '异常待处理', cls: 'text-warning' };
  switch (recognitionStatus) {
    case 'linked':
      return { text: '已关联至凭证', cls: 'text-success' };
    case 'recognized':
    case 'success': // DB 真实状态
      return { text: 'AI识别完成', cls: 'text-success' };
    case 'archived':
      return { text: '已归档', cls: 'text-muted-foreground' };
    case 'pending':
    default:
      return { text: '待识别', cls: 'text-muted-foreground' };
  }
}

function getCompany(rawDataJson: unknown, source: string | null | undefined): string {
  if (
    rawDataJson &&
    typeof rawDataJson === 'object' &&
    !Array.isArray(rawDataJson) &&
    'companyName' in rawDataJson
  ) {
    return String((rawDataJson as Record<string, unknown>).companyName);
  }
  return source || '—';
}

function hasSourceVoucher(doc: Doc): boolean {
  return !!(doc.rawDataJson && doc.rawDataJson.sourceVoucherId);
}

// 前端模拟抽取（后端 recognize 当前空壳，不抽字段）。刷新即丢失。
function mockExtract(doc: Doc): Record<string, unknown> {
  const amt = Number(doc.amount) || 0;
  const base: Record<string, unknown> = {
    单据编号: `FP${String(doc.id).padStart(6, '0')}`,
    发生日期: fmtDate(doc.documentDate) || '2025-06-15',
    对方单位: getCompany(doc.rawDataJson, doc.source),
    金额: amt,
    币种: 'CNY',
  };
  switch (doc.category) {
    case '发票':
      return { ...base, 类型: '增值税专用发票', 税率: '13%', 税额: Number((amt * 0.13 / 1.13).toFixed(2)) };
    case '银行回单':
      return { ...base, 类型: '收款回单', 交易类型: '货款回收', 对方账户: '工行深圳分行' };
    case '采购订单':
      return { ...base, 类型: '采购订单', 供应商: doc.source || '供应商' };
    case '平台结算单':
      return { ...base, 类型: '平台结算单', 平台: '京东', 平台扣费: Number((amt * 0.05).toFixed(2)) };
    default:
      return base;
  }
}

// 批量制证：静态科目映射，仅引用 DB 真实存在的 4 个科目，借贷必相等
function buildVoucher(doc: Doc): VoucherEntry[] {
  const amt = Number(doc.amount) || 0;
  switch (doc.category) {
    case '银行回单':
      return [
        { subject: '银行存款（货币资金）', dir: '借', amount: amt },
        { subject: '应收账款', dir: '贷', amount: amt },
      ];
    case '平台结算单':
      return [
        { subject: '应收账款', dir: '借', amount: amt },
        { subject: '主营业务收入', dir: '贷', amount: amt },
      ];
    case '发票':
    case '采购订单':
    case '合同':
    case '其他':
    default:
      return [
        { subject: '管理费用', dir: '借', amount: amt },
        { subject: '银行存款（货币资金）', dir: '贷', amount: amt },
      ];
  }
}

const flowSteps = ['资料上传', 'AI识别', '原始凭证', '批量制证'];

const IMPORTABLE_CATEGORIES = ['发票', '合同', '银行回单', '其他']; // Zod 枚举允许的创建类目

// ─── Component ────────────────────────────────────────────────────

export function DocumentsView() {
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  // 选中态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 弹层开关
  const [viewOpen, setViewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [abnormalOpen, setAbnormalOpen] = useState(false);
  const [abnormalDoc, setAbnormalDoc] = useState<Doc | null>(null);
  const [abForm, setAbForm] = useState({ name: '', amount: '', source: '', sub: '' });
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [importName, setImportName] = useState('');
  const [importCategory, setImportCategory] = useState('发票');
  const [importAmount, setImportAmount] = useState('');
  const [importSource, setImportSource] = useState('');
  const [importSub, setImportSub] = useState('');
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [voucherDocs, setVoucherDocs] = useState<Doc[]>([]);

  // 前端 mock 覆盖层（会话内有效，刷新即还原）
  const [overrideMap, setOverrideMap] = useState<Record<string, Partial<Doc>>>({});

  // ─── Query & mutations ───────────────────────────────────────
  const listQuery = trpc.documents.list.useQuery(
    {
      keyword: appliedKeyword || undefined,
      limit: 100,
      offset: 0,
    },
    { staleTime: 30_000 },
  );
  const utils = trpc.useUtils();
  const invalidate = () => utils.documents.list.invalidate();

  const recognizeMutation = trpc.documents.recognize.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast(`识别失败：${e.message}`),
  });
  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast(`保存失败：${e.message}`),
  });
  const associateMutation = trpc.documents.associate.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast(`关联失败：${e.message}`),
  });
  const createMutation = trpc.documents.create.useMutation({
    onSuccess: (created) => {
      const newDoc = created as unknown as Doc;
      recognizeMutation.mutate({ id: Number(newDoc.id) });
      setOverrideMap((prev) => ({
        ...prev,
        [String(newDoc.id)]: { rawDataJson: mockExtract(newDoc) },
      }));
      toast('已导入并送识别（演示抽取字段）');
      setImportOpen(false);
      resetImportForm();
    },
    onError: (e) => toast(`导入失败：${e.message}`),
  });

  const allItems = (listQuery.data?.items ?? []) as unknown as Doc[];
  const apiTotal = listQuery.data?.total ?? 0;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const errorMsg = listQuery.error?.message;

  // 合并 mock 覆盖
  const items = allItems.map((d) => ({ ...d, ...(overrideMap[String(d.id)] ?? {}) }));

  // ─── Client-side filtering ───────────────────────────────────
  const filteredItems = onlyAbnormal ? items.filter((doc) => doc.isAbnormal) : items;
  const abnormalCount = items.filter((doc) => doc.isAbnormal).length;

  // ─── Selection helpers ──────────────────────────────────────
  const allSelected = filteredItems.length > 0 && filteredItems.every((d) => selectedIds.has(String(d.id)));
  const someSelected = filteredItems.some((d) => selectedIds.has(String(d.id)));
  const headerIndeterminate = someSelected && !allSelected;

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) filteredItems.forEach((d) => next.delete(String(d.id)));
      else filteredItems.forEach((d) => next.add(String(d.id)));
      return next;
    });
  };

  const selectedDocs = filteredItems.filter((d) => selectedIds.has(String(d.id)));
  const allHaveSvid = selectedDocs.every((d) => hasSourceVoucher(d));

  // ─── Search handlers ────────────────────────────────────────
  const handleSearch = () => setAppliedKeyword(keyword);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ─── Actions ────────────────────────────────────────────────
  const injectMock = (doc: Doc) =>
    setOverrideMap((prev) => ({
      ...prev,
      [String(doc.id)]: { ...(prev[String(doc.id)] ?? {}), rawDataJson: mockExtract(doc) },
    }));

  const handleRecognize = (doc: Doc) => {
    if ((doc.recognitionStatus ?? 'pending') === 'recognized' || (doc.recognitionStatus ?? 'pending') === 'success') {
      toast('该单据已识别');
      return;
    }
    recognizeMutation.mutate({ id: Number(doc.id) });
    injectMock(doc);
  };

  const handleMarkAbnormal = (doc: Doc) => {
    updateMutation.mutate({ id: Number(doc.id), isAbnormal: true });
    toast('已标记为异常，待人工复核');
  };

  const handleView = (doc: Doc) => {
    setPreviewDoc(doc);
    setViewOpen(true);
  };

  const handleOpenAbnormal = (doc: Doc) => {
    setAbnormalDoc(doc);
    setAbForm({
      name: doc.name,
      amount: String(Number(doc.amount)),
      source: doc.source ?? '',
      sub: doc.subDescription ?? '',
    });
    setAbnormalOpen(true);
  };

  const handleAbnormalSave = () => {
    if (!abnormalDoc) return;
    updateMutation.mutate({
      id: Number(abnormalDoc.id),
      name: abForm.name,
      amount: Number(abForm.amount),
      source: abForm.source || undefined,
      subDescription: abForm.sub || undefined,
    });
    setOverrideMap((prev) => ({
      ...prev,
      [String(abnormalDoc.id)]: {
        ...(prev[String(abnormalDoc.id)] ?? {}),
        rawDataJson: mockExtract({ ...abnormalDoc, name: abForm.name, amount: Number(abForm.amount), source: abForm.source, subDescription: abForm.sub }),
      },
    }));
    setAbnormalOpen(false);
    toast('异常单据信息已更新（已写回后端）');
  };

  const handleAbnormalRescan = () => {
    if (!abnormalDoc) return;
    const status = abnormalDoc.recognitionStatus ?? 'pending';
    if (status === 'pending') recognizeMutation.mutate({ id: Number(abnormalDoc.id) });
    updateMutation.mutate({ id: Number(abnormalDoc.id), isAbnormal: false, recognitionStatus: 'recognized' });
    injectMock(abnormalDoc);
    setAbnormalOpen(false);
    toast('已重识别并清除异常标记（演示抽取字段）');
  };

  const handleBatchRecognize = () => {
    const pend = selectedDocs.filter((d) => (d.recognitionStatus ?? 'pending') === 'pending');
    pend.forEach((d) => recognizeMutation.mutate({ id: Number(d.id) }));
    selectedDocs.forEach((d) => injectMock(d));
    toast(`已对 ${pend.length} 张单据执行识别（演示抽取字段）`);
    setSelectedIds(new Set());
  };

  const handleOpenVoucher = () => {
    const eligible = selectedDocs.filter(
      (d) =>
        ['recognized', 'success'].includes(d.recognitionStatus ?? '') &&
        !d.isAbnormal &&
        d.recognitionStatus !== 'linked',
    );
    if (eligible.length === 0) {
      toast('请先选择已识别且未关联的单据');
      return;
    }
    setVoucherDocs(eligible);
    setVoucherOpen(true);
  };

  const handleConfirmVoucher = () => {
    setOverrideMap((prev) => {
      const next = { ...prev };
      voucherDocs.forEach((d) => {
        next[String(d.id)] = { ...(next[String(d.id)] ?? {}), recognitionStatus: 'linked' };
      });
      return next;
    });
    toast(`已生成 ${voucherDocs.length} 张记账凭证（演示·待后端落库）`);
    setVoucherOpen(false);
    setVoucherDocs([]);
    setSelectedIds(new Set());
  };

  const handleBatchAssociate = () => {
    if (!allHaveSvid) return;
    selectedDocs.forEach((d) =>
      associateMutation.mutate({ id: Number(d.id), sourceVoucherId: Number(d.rawDataJson.sourceVoucherId) }),
    );
    toast(`已关联 ${selectedDocs.length} 张单据至原始凭证`);
    setSelectedIds(new Set());
  };

  const resetImportForm = () => {
    setImportFile('');
    setImportName('');
    setImportCategory('发票');
    setImportAmount('');
    setImportSource('');
    setImportSub('');
  };

  const handleImport = () => {
    if (!importName.trim()) {
      toast('请选择文件或填写单据名称');
      return;
    }
    if (!IMPORTABLE_CATEGORIES.includes(importCategory)) {
      toast('请选择可创建的类别');
      return;
    }
    if (!importAmount || Number(importAmount) <= 0) {
      toast('请输入有效金额');
      return;
    }
    createMutation.mutate({
      name: importName.trim(),
      category: importCategory as any,
      amount: Number(importAmount),
      source: importSource || undefined,
      subDescription: importSub || undefined,
      documentDate: new Date().toISOString().slice(0, 10),
    });
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            智能采集{' '}
            <span className="text-xs text-muted-foreground font-sans font-normal uppercase tracking-wider">
              SMART CAPTURE
            </span>
          </h1>
          <p className="page-subtitle">
            扫描原始单据，导入发票、平台账单、银行流水和业务附件。
          </p>
        </div>
        <Button size="sm" className="gap-1.5 ripple-container elevation-1" onClick={() => setImportOpen(true)}>
          <Plus className="h-4 w-4" /> 扫描或导入
        </Button>
      </div>

      <Separator />

      {/* ── Flow Steps（静态说明 / 新人引导） ─────────────── */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {flowSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {i + 1}
              </span>
              {step}
            </span>
            {i < flowSteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* ── Search + 仅看异常 ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索名称、备注或来源（供应商、平台名）"
            className="h-8 pl-7 text-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none rounded-lg border border-border px-3 h-8 hover:bg-muted/50">
          <Checkbox checked={onlyAbnormal} onCheckedChange={(v) => setOnlyAbnormal(Boolean(v))} />
          仅看异常{abnormalCount > 0 ? `（${abnormalCount}）` : ''}
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        共 {apiTotal.toLocaleString()} 份采集资料，统一平铺展示；可搜索名称、备注或来源快速定位，勾选行后可批量识别、制证或关联凭证。
        {onlyAbnormal && ' 当前仅显示异常待处理单据。'}
      </p>

      {/* ── 常驻演示模式提示（决策 9 常驻化：说清真/假） ───── */}
      <Alert className="text-xs bg-primary/5 border-primary/20 text-foreground">
        <span>
          演示模式：本页 <strong className="font-medium">AI 识别的抽取字段</strong> 与{' '}
          <strong className="font-medium">批量制证</strong>{' '}
          为前端模拟，数据刷新即还原、待后端 vouchers.batchCreate 落库；
          <strong className="font-medium">异常复核为真实接口</strong>。
        </span>
      </Alert>

      {/* ── Batch action bar ─────────────────────────────────── */}
      {selectedDocs.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 elevation-1">
          <span className="text-xs font-medium text-primary">已选 {selectedDocs.length} 项</span>
          <Separator orientation="vertical" className="h-5" />
          <Button size="sm" variant="outline" className="h-7 text-xs ripple-container" onClick={handleBatchRecognize}>
            <ScanLine className="h-3.5 w-3.5" /> 批量识别
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs ripple-container" onClick={handleOpenVoucher}>
            <FileText className="h-3.5 w-3.5" /> 批量制证
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs ripple-container"
            disabled={!allHaveSvid}
            title={allHaveSvid ? undefined : '需后端提供可关联的原始凭证（sourceVoucherId）'}
            onClick={handleBatchAssociate}
          >
            <Link2 className="h-3.5 w-3.5" /> 关联凭证
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelectedIds(new Set())}>
            取消选择
          </Button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {errorMsg || '无法获取采集资料列表，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {onlyAbnormal
                ? '暂无异常资料'
                : '暂无采集资料，点击「扫描或导入」添加第一份单据'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} indeterminate={headerIndeterminate} onCheckedChange={() => toggleAll()} aria-label="全选" />
                  </TableHead>
                  <TableHead>资料名称</TableHead>
                  <TableHead>资料类别</TableHead>
                  <TableHead>所属公司</TableHead>
                  <TableHead>采集来源</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>识别·匹配结果</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((doc) => {
                  const result = resultInfo(doc.recognitionStatus ?? undefined, doc.isAbnormal ?? undefined);
                  const company = getCompany(doc.rawDataJson, doc.source);
                  const checked = selectedIds.has(String(doc.id));
                  return (
                    <TableRow key={String(doc.id)} className="text-xs" data-selected={checked}>
                      <TableCell>
                        <Checkbox checked={checked} onCheckedChange={() => toggleOne(String(doc.id))} aria-label="选择" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{doc.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {doc.subDescription || (doc.documentDate ? fmtDate(doc.documentDate) : null) || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{company}</TableCell>
                      <TableCell>{doc.source || '—'}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{fmtAmount(doc.amount)}</TableCell>
                      <TableCell>
                        <span className={result.cls}>{result.text}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" className="h-7 w-7 ripple-container">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(doc)}>
                              <Eye className="h-4 w-4" /> 查看原件
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRecognize(doc)}
                              disabled={(doc.recognitionStatus ?? 'pending') === 'recognized' || (doc.recognitionStatus ?? 'pending') === 'success'}
                            >
                              <ScanLine className="h-4 w-4" /> AI识别
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleMarkAbnormal(doc)}>
                              <AlertTriangle className="h-4 w-4" /> 标记异常
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── 查看原件 Sheet ───────────────────────────────────── */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          {previewDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> 查看原件
                </SheetTitle>
                <SheetDescription>{previewDoc.name}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Field label="类别" value={previewDoc.category} />
                  <Field label="金额" value={fmtAmount(previewDoc.amount)} />
                  <Field label="来源" value={previewDoc.source || '—'} />
                  <Field label="日期" value={fmtDate(previewDoc.documentDate)} />
                </div>

                {previewDoc.subDescription && (
                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1">备注</div>
                    <div className="text-foreground">{previewDoc.subDescription}</div>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">AI 抽取字段</span>
                    {!(previewDoc.rawDataJson && Object.keys(previewDoc.rawDataJson).length) && (
                      <Badge variant="outline" className="text-[10px] text-warning">
                        模拟抽取
                      </Badge>
                    )}
                  </div>
                  {/* 空则前端即时生成 mock（决策 A1），标注模拟 */}
                  <ExtractedFields
                    data={
                      previewDoc.rawDataJson && Object.keys(previewDoc.rawDataJson).length
                        ? previewDoc.rawDataJson
                        : mockExtract(previewDoc)
                    }
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    注：后端 recognize 当前为占位，以上字段为前端模拟抽取，刷新页面将还原。
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── 异常复核 Sheet ───────────────────────────────────── */}
      <Sheet open={abnormalOpen} onOpenChange={setAbnormalOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          {abnormalDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" /> 异常复核
                </SheetTitle>
                <SheetDescription>{abnormalDoc.name}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-4">
                <div className="space-y-1.5">
                  <Label text="单据名称" />
                  <Input className="h-8 text-xs" value={abForm.name} onChange={(e) => setAbForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label text="金额" />
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={abForm.amount}
                    onChange={(e) => setAbForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label text="来源 / 对方" />
                  <Input className="h-8 text-xs" value={abForm.source} onChange={(e) => setAbForm((f) => ({ ...f, source: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label text="备注" />
                  <Textarea className="text-xs" rows={3} value={abForm.sub} onChange={(e) => setAbForm((f) => ({ ...f, sub: e.target.value }))} />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 ripple-container" onClick={handleAbnormalSave}>
                    <Pencil className="h-3.5 w-3.5" /> 保存信息
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 ripple-container" onClick={handleAbnormalRescan}>
                    <ScanLine className="h-3.5 w-3.5" /> 重识别并清除异常
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  保存/重识别均调用真实后端接口（update / recognize），异常闭环不依赖 mock。
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── 导入 Dialog ──────────────────────────────────────── */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> 扫描或导入单据
            </DialogTitle>
            <DialogDescription>选择文件并填写基本信息，提交后自动送识别（演示抽取）。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label text="文件" />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  id="import-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImportFile(f.name);
                      if (!importName) setImportName(f.name);
                    }
                  }}
                />
                <label
                  htmlFor="import-file"
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 text-xs hover:bg-muted/50"
                >
                  <FileText className="h-3.5 w-3.5" /> 选择文件
                </label>
                <span className="text-xs text-muted-foreground truncate">{importFile || '未选择'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label text="单据名称" />
              <Input className="h-8 text-xs" placeholder="自动取文件名，可修改" value={importName} onChange={(e) => setImportName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label text="类别" />
              <Select value={importCategory} onValueChange={(v) => setImportCategory(v ?? importCategory)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  {IMPORTABLE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  {/* 禁用明示：后端未支持 / 枚举未收录，经接口无法创建 */}
                  <SelectItem value="平台结算单" disabled>
                    平台结算单（后端未支持类目）
                  </SelectItem>
                  <SelectItem value="采购订单" disabled>
                    采购订单（Zod 枚举未收录）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label text="金额" />
              <Input type="number" className="h-8 text-xs" placeholder="0.00" value={importAmount} onChange={(e) => setImportAmount(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label text="来源（可选）" />
                <Input className="h-8 text-xs" value={importSource} onChange={(e) => setImportSource(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label text="备注（可选）" />
                <Input className="h-8 text-xs" value={importSub} onChange={(e) => setImportSub(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              取消
            </Button>
            <Button className="ripple-container" onClick={handleImport} disabled={createMutation.isPending}>
              {createMutation.isPending ? '导入中…' : '导入并识别'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 批量制证 Dialog ─────────────────────────────────── */}
      <Dialog open={voucherOpen} onOpenChange={setVoucherOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> 批量制证预览
            </DialogTitle>
            <DialogDescription>
              以下为前端演示映射（仅引用系统中真实存在的科目，非真实会计准则），确认后本地置为「已关联」，待后端 vouchers.batchCreate 落库。
            </DialogDescription>
        </DialogHeader>

        {selectedDocs.length - voucherDocs.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            已自动跳过 {selectedDocs.length - voucherDocs.length} 张（已关联{' '}
            {selectedDocs.filter((d) => d.recognitionStatus === 'linked').length} · 异常{' '}
            {selectedDocs.filter((d) => d.isAbnormal && d.recognitionStatus !== 'linked').length} · 未识别{' '}
            {
              selectedDocs.filter(
                (d) =>
                  !['recognized', 'success'].includes(d.recognitionStatus ?? '') &&
                  !d.isAbnormal &&
                  d.recognitionStatus !== 'linked',
              ).length
            }
            ）
          </p>
        )}

        <div className="space-y-3">
            {voucherDocs.map((doc) => {
              const entries = buildVoucher(doc);
              const debit = entries.filter((e) => e.dir === '借').reduce((s, e) => s + e.amount, 0);
              const credit = entries.filter((e) => e.dir === '贷').reduce((s, e) => s + e.amount, 0);
              const balanced = Math.abs(debit - credit) < 0.01;
              return (
                <div key={String(doc.id)} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{doc.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {doc.category}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>科目</TableHead>
                        <TableHead className="text-center">方向</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((e, i) => (
                        <TableRow key={i} className="text-xs">
                          <TableCell>{e.subject}</TableCell>
                          <TableCell className="text-center">
                            <span className={e.dir === '借' ? 'text-warning' : 'text-success'}>{e.dir}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{fmtAmount(e.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-end gap-3 mt-2 text-[11px]">
                    <span>借 {fmtAmount(debit)}</span>
                    <span>贷 {fmtAmount(credit)}</span>
                    <Badge variant="outline" className={balanced ? 'text-[10px] text-success' : 'text-[10px] text-destructive'}>
                      {balanced ? '借贷平衡 ✓' : '不平衡'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoucherOpen(false)}>
              取消
            </Button>
            <Button className="ripple-container" onClick={handleConfirmVoucher}>
              确认生成 {voucherDocs.length} 张凭证
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Small presentational helpers ────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground mb-0.5">{label}</div>
      <div className="text-foreground font-medium">{value}</div>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <div className="text-[11px] text-muted-foreground">{text}</div>;
}

function ExtractedFields({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-border divide-y divide-border">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">{k}</span>
          <span className="text-foreground font-medium tabular-nums">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}
