'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RippleContainer } from '@/components/custom/RippleContainer';
import { Plus, Minus, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// Constants
// ============================================================================

const categoryTabs = ['全部', '资产', '负债', '所有者权益', '成本', '损益'];

// ============================================================================
// Types
// ============================================================================

interface SubjectNode {
  code: string;
  name: string;
  direction: '借' | '贷';
  status: '启用' | '停用';
  category: string;
  children?: SubjectNode[];
}

// ============================================================================
// Data — 会计科目树（依据企业会计准则通用科目框架）
// ============================================================================

const subjectTree: SubjectNode[] = [
  // ── 资产 ──
  {
    category: '资产',
    code: '1001',
    name: '库存现金',
    direction: '借',
    status: '启用',
    children: [
      { code: '100101', name: '库存现金—人民币', direction: '借', status: '启用', category: '资产' },
      {
        code: '10010101',
        name: '库存现金—人民币—基本账户备用金',
        direction: '借',
        status: '启用',
        category: '资产',
      },
    ],
  },
  {
    category: '资产',
    code: '1002',
    name: '银行存款',
    direction: '借',
    status: '启用',
    children: [
      { code: '100201', name: '银行存款—人民币', direction: '借', status: '启用', category: '资产' },
      { code: '100202', name: '银行存款—外币', direction: '借', status: '启用', category: '资产' },
    ],
  },
  { category: '资产', code: '1012', name: '其他货币资金', direction: '借', status: '启用' },
  { category: '资产', code: '1101', name: '交易性金融资产', direction: '借', status: '启用' },
  {
    category: '资产',
    code: '1122',
    name: '应收账款',
    direction: '借',
    status: '启用',
    children: [
      { code: '112201', name: '应收账款—电商平台', direction: '借', status: '启用', category: '资产' },
      { code: '112202', name: '应收账款—客户', direction: '借', status: '启用', category: '资产' },
    ],
  },
  { category: '资产', code: '1123', name: '预付账款', direction: '借', status: '启用' },
  { category: '资产', code: '1221', name: '其他应收款', direction: '借', status: '启用' },
  {
    category: '资产',
    code: '1405',
    name: '库存商品',
    direction: '借',
    status: '启用',
    children: [
      { code: '140501', name: '库存商品—数码类', direction: '借', status: '启用', category: '资产' },
      { code: '140502', name: '库存商品—美妆个护', direction: '借', status: '启用', category: '资产' },
    ],
  },
  {
    category: '资产',
    code: '1601',
    name: '固定资产',
    direction: '借',
    status: '启用',
    children: [
      { code: '160101', name: '固定资产—办公设备', direction: '借', status: '启用', category: '资产' },
      {
        code: '16010101',
        name: '固定资产—办公设备—电脑',
        direction: '借',
        status: '启用',
        category: '资产',
      },
    ],
  },
  { category: '资产', code: '1701', name: '无形资产', direction: '借', status: '启用' },
  {
    category: '资产',
    code: '1702',
    name: '累计摊销',
    direction: '贷',
    status: '启用',
  },

  // ── 负债 ──
  { category: '负债', code: '2001', name: '短期借款', direction: '贷', status: '启用' },
  {
    category: '负债',
    code: '2202',
    name: '应付账款',
    direction: '贷',
    status: '启用',
    children: [
      { code: '220201', name: '应付账款—商品供应商', direction: '贷', status: '启用', category: '负债' },
      { code: '220202', name: '应付账款—物流供应商', direction: '贷', status: '启用', category: '负债' },
    ],
  },
  { category: '负债', code: '2211', name: '应付职工薪酬', direction: '贷', status: '启用' },
  {
    category: '负债',
    code: '2221',
    name: '应交税费',
    direction: '贷',
    status: '启用',
    children: [
      {
        code: '222101',
        name: '应交税费—应交增值税',
        direction: '贷',
        status: '启用',
        category: '负债',
      },
      {
        code: '22210101',
        name: '应交税费—应交增值税—进项税额',
        direction: '贷',
        status: '启用',
        category: '负债',
      },
      {
        code: '22210102',
        name: '应交税费—应交增值税—销项税额',
        direction: '贷',
        status: '启用',
        category: '负债',
      },
    ],
  },
  { category: '负债', code: '2241', name: '其他应付款', direction: '贷', status: '启用' },
  { category: '负债', code: '2501', name: '长期借款', direction: '贷', status: '启用' },

  // ── 所有者权益 ──
  { category: '所有者权益', code: '4001', name: '实收资本（或股本）', direction: '贷', status: '启用' },
  { category: '所有者权益', code: '4002', name: '资本公积', direction: '贷', status: '启用' },
  { category: '所有者权益', code: '4101', name: '盈余公积', direction: '贷', status: '启用' },
  { category: '所有者权益', code: '4103', name: '本年利润', direction: '贷', status: '启用' },
  { category: '所有者权益', code: '4104', name: '利润分配', direction: '贷', status: '启用' },

  // ── 成本 ──
  {
    category: '成本',
    code: '5001',
    name: '生产成本',
    direction: '借',
    status: '启用',
    children: [
      { code: '500101', name: '生产成本—直接材料', direction: '借', status: '启用', category: '成本' },
      { code: '500102', name: '生产成本—直接人工', direction: '借', status: '启用', category: '成本' },
      { code: '500103', name: '生产成本—制造费用', direction: '借', status: '启用', category: '成本' },
    ],
  },
  {
    category: '成本',
    code: '5101',
    name: '制造费用',
    direction: '借',
    status: '启用',
    children: [
      { code: '510101', name: '制造费用—工资', direction: '借', status: '启用', category: '成本' },
      { code: '510102', name: '制造费用—折旧费', direction: '借', status: '启用', category: '成本' },
      { code: '510103', name: '制造费用—水电费', direction: '借', status: '启用', category: '成本' },
    ],
  },
  { category: '成本', code: '5201', name: '劳务成本', direction: '借', status: '启用' },
  {
    category: '成本',
    code: '5301',
    name: '研发支出',
    direction: '借',
    status: '启用',
    children: [
      { code: '530101', name: '研发支出—费用化支出', direction: '借', status: '启用', category: '成本' },
      { code: '530102', name: '研发支出—资本化支出', direction: '借', status: '启用', category: '成本' },
    ],
  },

  // ── 损益 ──
  { category: '损益', code: '6001', name: '主营业务收入', direction: '贷', status: '启用' },
  { category: '损益', code: '6051', name: '其他业务收入', direction: '贷', status: '启用' },
  { category: '损益', code: '6401', name: '主营业务成本', direction: '借', status: '启用' },
  { category: '损益', code: '6402', name: '其他业务成本', direction: '借', status: '启用' },
  { category: '损益', code: '6403', name: '税金及附加', direction: '借', status: '启用' },
  { category: '损益', code: '6601', name: '销售费用', direction: '借', status: '启用' },
  { category: '损益', code: '6602', name: '管理费用', direction: '借', status: '启用' },
  { category: '损益', code: '6603', name: '财务费用', direction: '借', status: '启用' },
];

// ============================================================================
// Helpers
// ============================================================================

/** Recursively check whether a subject or any of its descendants matches the search query. */
function anyMatch(subject: SubjectNode, query: string): boolean {
  if (subject.code.includes(query) || subject.name.toLowerCase().includes(query)) {
    return true;
  }
  if (subject.children) {
    return subject.children.some((child) => anyMatch(child, query));
  }
  return false;
}

// ============================================================================
// Direction & Status badge style helpers
// ============================================================================

function directionBadgeClass(direction: '借' | '贷'): string {
  return direction === '借'
    ? 'bg-primary/10 text-primary'
    : 'bg-destructive/10 text-destructive';
}

function statusBadgeClass(status: '启用' | '停用'): string {
  return status === '启用'
    ? 'bg-success/10 text-success'
    : 'bg-muted text-muted-foreground';
}

// ============================================================================
// Recursive Tree Row
// ============================================================================

function SubjectTreeRow({
  subject,
  depth,
  searchActive,
}: {
  subject: SubjectNode;
  depth: number;
  searchActive: boolean;
}) {
  const hasChildren = subject.children && subject.children.length > 0;
  const indentPx = 12 + depth * 24;

  const rowContent = (
    <>
      {/* Chevron or spacer */}
      {hasChildren ? (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180" />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}

      {/* Code */}
      <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
        {subject.code}
      </span>

      {/* Name */}
      <span className={hasChildren ? 'font-medium truncate' : 'truncate'}>
        {subject.name}
      </span>

      {/* Category badge — only shown at root level */}
      {depth === 0 && (
        <Badge variant="outline" className="text-[10px] shrink-0">
          {subject.category}
        </Badge>
      )}

      {/* Direction badge */}
      <Badge className={`text-[10px] shrink-0 ${directionBadgeClass(subject.direction)}`}>
        {subject.direction}
      </Badge>

      {/* Status badge */}
      <Badge className={`text-[10px] shrink-0 ${statusBadgeClass(subject.status)}`}>
        {subject.status}
      </Badge>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Row actions */}
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            toast(`查看科目：${subject.code} ${subject.name}`);
          }}
        >
          查看
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            toast(`修改科目：${subject.code} ${subject.name}`);
          }}
        >
          修改
        </Button>
      </div>
    </>
  );

  return (
    <Collapsible
      defaultOpen={searchActive && hasChildren}
      key={`${subject.code}-${searchActive ? 's' : ''}`}
    >
      <div
        className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-border/50"
        style={{ paddingLeft: `${indentPx}px` }}
      >
        {hasChildren ? (
          <CollapsibleTrigger className="group flex flex-1 items-center gap-3 text-sm min-w-0">
            {rowContent}
          </CollapsibleTrigger>
        ) : (
          <div className="flex flex-1 items-center gap-3 text-sm min-w-0">
            {rowContent}
          </div>
        )}
      </div>

      {hasChildren && (
        <CollapsibleContent>
          {subject.children!.map((child) => (
            <SubjectTreeRow
              key={child.code}
              subject={child}
              depth={depth + 1}
              searchActive={searchActive}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SubjectsView() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTree = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return subjectTree.filter((subject) => {
      if (activeCategory !== '全部' && subject.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return anyMatch(subject, q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            会计科目表
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            依据《企业会计准则》通用科目框架维护企业明细科目；新增、修改与停用均保留变更记录。
          </p>
        </div>
        <div className="flex gap-2">
          <RippleContainer>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => toast('已打开新增会计科目表单')}
            >
              <Plus className="h-4 w-4" /> 增加会计科目
            </Button>
          </RippleContainer>
          <RippleContainer>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => toast('请先选择科目后调整其使用状态')}
            >
              <Minus className="h-4 w-4" /> 减少（停用）
            </Button>
          </RippleContainer>
        </div>
      </div>

      <Separator />

      {/* ========== Toolbar: Category Tabs + Search ========== */}
      <div className="flex items-center gap-3">
        <Tabs
          value={activeCategory}
          onValueChange={(val) => setActiveCategory(val)}
          className="flex-1"
        >
          <TabsList>
            {categoryTabs.map((t) => (
              <TabsTrigger key={t} value={t} className="text-xs">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索科目编码或名称"
            className="h-8 pl-7 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ========== Subject Tree ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          {filteredTree.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              未找到匹配的会计科目
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTree.map((subject) => (
                <SubjectTreeRow
                  key={subject.code}
                  subject={subject}
                  depth={0}
                  searchActive={searchQuery.length > 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
