'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCheck,
  RotateCcw,
  Loader2,
  AlertCircle,
  Database,
  FileX,
} from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function ImportView() {
  const [uploaded, setUploaded] = useState(false);
  const utils = trpc.useUtils();

  // ── Fetch templates ──
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = trpc.import.listTemplates.useQuery();

  // ── Fetch recent import records ──
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = trpc.import.listRecords.useQuery({ limit: 5, offset: 0 });

  const records = recordsData?.items ?? [];

  const isLoading = templatesLoading || recordsLoading;
  const hasError = templatesError || recordsError;

  const handleUpload = () => {
    setUploaded(true);
    toast('模拟导入成功：128条记录已通过校验');
  };

  const handleDownloadAll = () => {
    toast('已开始下载全部模板');
  };

  const handleDownloadTemplate = (name: string) => {
    toast(`已下载${name}模板`);
  };

  const handleRetry = () => {
    refetchTemplates();
    refetchRecords();
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[--primary]" />
          <p className="text-sm text-muted-foreground">加载导入数据...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (hasError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-[--danger]" />
          <div>
            <p className="text-sm font-medium text-foreground">加载导入数据失败</p>
            <p className="text-xs text-muted-foreground mt-1">请检查网络连接后重试</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (templates.length === 0 && records.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">数据管理 — 数据导入中心</h1>
            <p className="page-subtitle">通过标准模板归集数据，保障数据一致性与完整性。</p>
          </div>
        </div>
        <Separator />
        <Card className="elevation-1">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <Database className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">暂无可用的导入模板</p>
            <p className="text-xs text-muted-foreground mt-1">请联系管理员配置导入模板</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">数据管理 — 数据导入中心</h1>
          <p className="page-subtitle">
            通过标准模板归集数据，保障数据一致性与完整性。
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handleDownloadAll}
        >
          <Download className="h-4 w-4" />
          下载全部模板
        </Button>
      </div>

      <Separator />

      {/* Template Cards */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((t) => (
            <Card key={String(t.id)} className="elevation-1">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-[--primary]" />
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                {t.usageDescription && (
                  <p className="text-xs text-muted-foreground">{t.usageDescription}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    {t.frequency}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleDownloadTemplate(t.name)}
                  >
                    <Download className="h-3 w-3" />
                    下载模板
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <Card
        className={`elevation-1 border-2 border-dashed ${
          uploaded ? 'border-[--success]/30 bg-[--success]/5' : 'border-border'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-3">
          {!uploaded ? (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  拖放文件到这里，或点击选择文件
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 .xlsx、.xls 和 .csv，单个文件不超过20MB
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleUpload}>
                选择文件
              </Button>
            </>
          ) : (
            <>
              <FileCheck className="h-10 w-10 text-[--success]" />
              <div className="text-center">
                <p className="text-sm text-[--success] font-medium">文件校验通过</p>
                <p className="text-sm mt-1">银行流水_20260713.xlsx · 128条记录</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  模拟导入成功：128条记录已通过校验
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploaded(false)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                重新选择
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Imports Table */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">最近导入记录</CardTitle>
          <CardDescription>可追溯每次数据更新及错误情况</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileX className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">暂无导入记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件</TableHead>
                  <TableHead>上传人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>条数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((row) => (
                  <TableRow key={String(row.id)}>
                    <TableCell className="text-sm">{row.fileName}</TableCell>
                    <TableCell>{row.uploaderName}</TableCell>
                    <TableCell>
                      {row.status === 'success' || row.status === '已处理' ? (
                        <Badge className="bg-[--success]/10 text-[--success] text-[10px]">
                          成功
                        </Badge>
                      ) : row.status === '待处理' ? (
                        <Badge className="bg-muted text-muted-foreground text-[10px]">
                          待处理
                        </Badge>
                      ) : (
                        <Badge className="bg-[--warning]/10 text-[--warning] text-[10px]">
                          {row.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{row.recordCount}条</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        查看记录
                      </Button>
                    </TableCell>
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
