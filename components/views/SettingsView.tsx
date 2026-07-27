'use client';

import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, RefreshCw, AlertCircle, Plus, Settings, Wrench } from 'lucide-react';

// ============================================================================
// Helpers
// ============================================================================

function getConnectionIcon(type: string): React.ReactNode {
  switch (type?.toLowerCase()) {
    case 'erp':
      return <Wrench className="h-4 w-4 text-[--primary]" />;
    default:
      return <Settings className="h-4 w-4 text-[--primary]" />;
  }
}

const statusBadgeClass: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
};

const activityClass: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
};

// ============================================================================
// Main Component
// ============================================================================

export function SettingsView() {
  // ─── Queries ─────────────────────────────────────────────────────

  const connectionsQuery = trpc.settings.connections.useQuery();
  const dictionaryQuery = trpc.settings.dictionary.useQuery();

  const connections = connectionsQuery.data ?? [];
  const dictionary = dictionaryQuery.data ?? [];

  const isConnLoading = connectionsQuery.isLoading;
  const isConnError = connectionsQuery.isError;
  const connErrorMsg = connectionsQuery.error?.message;

  const isDictLoading = dictionaryQuery.isLoading;
  const isDictError = dictionaryQuery.isError;
  const dictErrorMsg = dictionaryQuery.error?.message;

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            系统连接{' '}
            <span className="text-xs font-normal text-muted-foreground font-sans uppercase tracking-wider align-middle">
              INTEGRATIONS
            </span>
          </h1>
          <p className="page-subtitle">
            通过统一适配层连接各法人公司的ERP与电商平台。
          </p>
        </div>
        <Button size="sm" className="gap-1.5 ripple-container">
          <Plus className="h-4 w-4" />
          新增连接
        </Button>
      </div>

      <Separator />

      {/* ========== Connection Cards ========== */}
      {isConnLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="elevation-1">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isConnError ? (
        <Alert variant="destructive">
          <AlertTitle>数据加载失败</AlertTitle>
          <AlertDescription>
            {connErrorMsg || '无法获取系统连接列表，请检查网络连接后重试'}
          </AlertDescription>
        </Alert>
      ) : connections.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无系统连接，点击"新增连接"添加第一个连接
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <Card
              key={String(conn.id)}
              className={cn(
                'elevation-1',
                conn.statusTone === 'warning' && 'border-warning/30',
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getConnectionIcon(conn.connectionType)}
                    {conn.connectionName}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] border',
                      statusBadgeClass[conn.statusTone] ?? statusBadgeClass.success,
                    )}
                  >
                    {conn.status}
                  </Badge>
                </div>
                <CardDescription>{conn.subtitle ?? '—'}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-1.5">
                  {conn.syncTone === 'warning' ? (
                    <AlertCircle
                      className={cn('h-3 w-3', activityClass[conn.syncTone])}
                    />
                  ) : (
                    <Activity
                      className={cn('h-3 w-3', activityClass[conn.syncTone] ?? activityClass.success)}
                    />
                  )}
                  <span className={conn.syncTone === 'warning' ? 'text-warning' : ''}>
                    {conn.syncLabel ?? '—'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs ripple-container">
                  {conn.syncTone === 'warning' && (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {conn.actionLabel ?? '管理映射'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ========== Data Dictionary Section ========== */}
      <Separator />

      <div>
        <h2 className="page-title text-xl">
          数据字典{' '}
          <span className="text-xs font-normal text-muted-foreground font-sans uppercase tracking-wider align-middle">
            DATA DICTIONARY
          </span>
        </h2>
        <p className="page-subtitle">
          统一管理各业务模块的数据采集规则与指标定义。
        </p>
      </div>

      <Card className="elevation-1">
        <CardContent className="overflow-x-auto pt-6">
          {isDictLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isDictError ? (
            <Alert variant="destructive">
              <AlertTitle>数据加载失败</AlertTitle>
              <AlertDescription>
                {dictErrorMsg || '无法获取数据字典，请检查网络连接后重试'}
              </AlertDescription>
            </Alert>
          ) : dictionary.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无数据字典条目
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>业务模块</TableHead>
                  <TableHead>采集指标</TableHead>
                  <TableHead>关键字段</TableHead>
                  <TableHead>来源系统</TableHead>
                  <TableHead>责任人</TableHead>
                  <TableHead>更新频率</TableHead>
                  <TableHead>采集方式</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dictionary.map((entry) => (
                  <TableRow key={String(entry.id)} className="text-xs">
                    <TableCell className="font-medium">{entry.module}</TableCell>
                    <TableCell>{entry.indicators || '—'}</TableCell>
                    <TableCell>{entry.keyFields || '—'}</TableCell>
                    <TableCell>{entry.sourceSystems || '—'}</TableCell>
                    <TableCell>{entry.responsiblePerson || '—'}</TableCell>
                    <TableCell>{entry.updateFrequency || '—'}</TableCell>
                    <TableCell>{entry.collectionMethod || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
