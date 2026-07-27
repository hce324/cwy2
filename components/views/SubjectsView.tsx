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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
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
  direction: string;
  status: string;
  category: string;
  children?: SubjectNode[];
}

// ============================================================================
// Direction & Status badge style helpers
// ============================================================================

function directionBadgeClass(direction: string): string {
  return direction === '借'
    ? 'bg-primary/10 text-primary'
    : 'bg-destructive/10 text-destructive';
}

function statusBadgeClass(status: string): string {
  return status === '启用'
    ? 'bg-success/10 text-success'
    : 'bg-muted text-muted-foreground';
}

// ============================================================================
// Stat Card
// ============================================================================

function SubjectStatCard({
  title,
  value,
  tone = 'default',
  loading = false,
}: {
  title: string;
  value?: number;
  tone?: 'default' | 'danger';
  loading?: boolean;
}) {
  return (
    <Card className="elevation-1">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p
            className={cn(
              'mt-1 text-2xl font-heading font-bold tabular-nums',
              tone === 'danger' ? 'text-destructive' : 'text-foreground',
            )}
          >
            {value ?? '—'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Recursive Tree Row
// ============================================================================

function SubjectTreeRow({
  subject,
  depth,
}: {
  subject: SubjectNode;
  depth: number;
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
    <Collapsible defaultOpen={false} key={subject.code}>
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
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // ─── tRPC Queries ─────────────────────────────────────────────────

  const treeQuery = trpc.subject.tree.useQuery();
  const statsQuery = trpc.subject.stats.useQuery();

  const listQueryEnabled = searchKeyword.length > 0 || activeCategory !== '全部';
  const listQuery = trpc.subject.list.useQuery(
    {
      keyword: searchKeyword || undefined,
      category: activeCategory !== '全部' ? activeCategory : undefined,
    },
    { enabled: listQueryEnabled },
  );

  // ─── Derived data ─────────────────────────────────────────────────

  const isFlatMode = listQueryEnabled;
  const displayData: SubjectNode[] = isFlatMode
    ? (listQuery.data ?? []) as SubjectNode[]
    : (treeQuery.data ?? []) as SubjectNode[];
  const dataLoading = isFlatMode ? listQuery.isLoading : treeQuery.isLoading;
  const dataError = isFlatMode ? listQuery.isError : treeQuery.isError;
  const dataErrorMsg = isFlatMode
    ? listQuery.error?.message
    : treeQuery.error?.message;

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleSearch = () => {
    setSearchKeyword(keyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setKeyword('');
    setSearchKeyword('');
  };

  const handleCategoryChange = (val: string) => {
    setActiveCategory(val);
    // Clear search when switching category to avoid stale combined filter
    setKeyword('');
    setSearchKeyword('');
  };

  // ─── Stat card definitions ────────────────────────────────────────

  const statItems = useMemo(() => {
    if (!statsQuery.data) {
      return [
        { title: '科目总数', value: undefined as number | undefined, tone: 'default' as const },
        { title: '已启用', value: undefined, tone: 'default' as const },
        { title: '已使用', value: undefined, tone: 'default' as const },
        { title: '已停用', value: undefined, tone: 'danger' as const },
      ];
    }
    return [
      { title: '科目总数', value: statsQuery.data.total, tone: 'default' as const },
      { title: '已启用', value: statsQuery.data.active, tone: 'default' as const },
      { title: '已使用', value: statsQuery.data.usedCount, tone: 'default' as const },
      { title: '已停用', value: statsQuery.data.disabledCount, tone: 'danger' as const },
    ];
  }, [statsQuery.data]);

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">
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

      {/* ========== Subject Stats ========== */}
      {statsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>统计数据加载失败</AlertTitle>
          <AlertDescription>
            {statsQuery.error?.message || '无法获取科目统计数据，请检查网络连接后重试'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((s) => (
            <SubjectStatCard
              key={s.title}
              title={s.title}
              value={s.value}
              tone={s.tone}
              loading={statsQuery.isLoading}
            />
          ))}
        </div>
      )}

      {/* ========== Toolbar: Category Tabs + Search ========== */}
      <div className="flex items-center gap-3">
        <Tabs
          value={activeCategory}
          onValueChange={handleCategoryChange}
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
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchKeyword && (
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* ========== Subject Tree / List ========== */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          {dataLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-2">
                  <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-20 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
                  <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
                  <Skeleton className="h-6 w-10 shrink-0" />
                  <Skeleton className="h-6 w-10 shrink-0" />
                </div>
              ))}
            </div>
          ) : dataError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {dataErrorMsg || '无法获取会计科目数据，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : displayData.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              未找到匹配的会计科目
            </div>
          ) : (
            <div className="space-y-1">
              {displayData.map((subject) => (
                <SubjectTreeRow
                  key={subject.code}
                  subject={subject}
                  depth={0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
