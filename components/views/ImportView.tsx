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
import { Download, Upload, FileSpreadsheet, FileCheck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Template definitions matching the four data categories
const templates = [
  {
    name: '银行流水',
    usage: '用于资金动态、付款回单与银行对账',
    freq: '每日',
  },
  {
    name: '应收明细',
    usage: '用于账龄、回款与客户往来核对',
    freq: '每日',
  },
  {
    name: '费用明细',
    usage: '用于费用归属、凭证与月结核对',
    freq: '每周',
  },
  {
    name: '客户供应商档案',
    usage: '用于统一业务主体编码与基础资料维护',
    freq: '按需',
  },
];

// Recent import records displayed in the history table
const recentImports = [
  {
    file: '应收明细_20260712.xlsx',
    uploader: '李晓雯',
    status: 'success' as const,
    count: '268条',
  },
  {
    file: '银行流水_20260712.xlsx',
    uploader: '王思雨',
    status: 'success' as const,
    count: '94条',
  },
  {
    file: '费用明细_市场部.xlsx',
    uploader: '市场部接口人',
    status: 'warning' as const,
    count: '186条',
  },
];

export function ImportView() {
  const [uploaded, setUploaded] = useState(false);

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

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            数据管理 — 数据导入中心
          </h1>
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

      {/* ========== Template Cards ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map((t, i) => (
          <Card key={i} className="elevation-1">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{t.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.usage}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {t.freq}
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

      {/* ========== Upload Zone ========== */}
      <Card
        className={`elevation-1 border-2 border-dashed ${
          uploaded ? 'border-success/30 bg-success/5' : 'border-border'
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
              <FileCheck className="h-10 w-10 text-success" />
              <div className="text-center">
                <p className="text-sm text-success font-medium">文件校验通过</p>
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

      {/* ========== Recent Imports Table ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">最近导入记录</CardTitle>
          <CardDescription>可追溯每次数据更新及错误情况</CardDescription>
        </CardHeader>
        <CardContent>
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
              {recentImports.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-sm">{row.file}</TableCell>
                  <TableCell>{row.uploader}</TableCell>
                  <TableCell>
                    {row.status === 'success' ? (
                      <Badge className="bg-success/10 text-success text-[10px]">
                        成功
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/10 text-warning text-[10px]">
                        3条错误
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      查看记录
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
