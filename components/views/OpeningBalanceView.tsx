'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Save, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface OpeningBalanceRow {
  code: string;
  name: string;
  amount: number;
  direction: '借' | '贷';
}

const initialRows: OpeningBalanceRow[] = [
  { code: '1002', name: '银行存款', amount: 842660.00, direction: '借' },
  { code: '1122', name: '应收账款', amount: 384260.00, direction: '借' },
  { code: '2202', name: '应付账款', amount: 276080.00, direction: '贷' },
  { code: '4104', name: '未分配利润', amount: 950840.00, direction: '贷' },
];

function computeBalances(rows: OpeningBalanceRow[]) {
  const totalDebit = rows
    .filter(r => r.direction === '借')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCredit = rows
    .filter(r => r.direction === '贷')
    .reduce((sum, r) => sum + r.amount, 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01;
  return { totalDebit, totalCredit, diff, isBalanced };
}

export function OpeningBalanceView() {
  const { currentRole } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    totalDebit: number;
    totalCredit: number;
    diff: number;
    isBalanced: boolean;
  } | null>(null);

  const balances = useMemo(() => computeBalances(initialRows), []);

  const handleSaveAndValidate = () => {
    const result = computeBalances(initialRows);
    setValidationResult(result);
    setSaved(true);

    if (result.isBalanced) {
      toast('期初余额已保存，借贷平衡校验通过', {
        description: `借方合计 ¥${result.totalDebit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} = 贷方合计 ¥${result.totalCredit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
      });
    } else {
      toast('期初余额已保存，但借贷不平衡，请检查', {
        description: `差额 ¥${result.diff.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}，贷方${result.totalCredit > result.totalDebit ? '大于' : '小于'}借方`,
      });
    }
  };

  const handleView = (row: OpeningBalanceRow) => {
    toast(`查看科目：${row.code} ${row.name}`);
  };

  const handleEdit = (row: OpeningBalanceRow) => {
    toast(`修改科目：${row.code} ${row.name}`, {
      description: `当前余额 ¥${row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}（${row.direction}方）`,
    });
  };

  const formatAmount = (amount: number) =>
    amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">期初余额录入</h1>
          <p className="text-sm text-muted-foreground mt-1">
            按已启用会计科目录入期初余额；保存后自动校验借贷平衡，并提交财务负责人复核。
          </p>
        </div>
        <Button size="sm" onClick={handleSaveAndValidate} className="gap-1.5">
          <Save className="h-4 w-4" /> 保存并校验
        </Button>
      </div>

      <Separator />

      {/* Permission note */}
      <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-3 text-sm">
        <Shield className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground text-xs">
          操作权限与复核控制 — 保存、修改与提交复核均记录操作人和时间；审核、反审核及结账按岗位权限执行。
        </span>
      </div>

      {/* Balance summary */}
      {validationResult && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 text-sm ${
            validationResult.isBalanced
              ? 'bg-success/10 border border-success/20'
              : 'bg-danger/10 border border-danger/20'
          }`}
        >
          {validationResult.isBalanced ? (
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          )}
          <div className="flex-1">
            <div
              className={`font-medium ${
                validationResult.isBalanced ? 'text-success' : 'text-danger'
              }`}
            >
              {validationResult.isBalanced ? '借贷平衡校验通过' : '借贷不平衡'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                借方合计：¥{formatAmount(validationResult.totalDebit)}
              </span>
              <span>
                贷方合计：¥{formatAmount(validationResult.totalCredit)}
              </span>
              {!validationResult.isBalanced && (
                <span className="font-medium text-destructive">
                  差额：¥{formatAmount(validationResult.diff)}
                </span>
              )}
            </div>
          </div>
          {validationResult.isBalanced ? (
            <Badge className="bg-success/10 text-success">已平衡</Badge>
          ) : (
            <Badge className="bg-danger/10 text-danger">未平衡</Badge>
          )}
        </div>
      )}

      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            科目期初余额
          </CardTitle>
          <CardDescription>
            {initialRows.length} 个已启用的会计科目 | 当前角色：{currentRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">科目编码</TableHead>
                <TableHead>科目名称</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead className="text-center">方向</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ¥{formatAmount(row.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        row.direction === '借'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-danger/10 text-danger'
                      }
                    >
                      {row.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleView(row)}
                      >
                        查看
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleEdit(row)}
                      >
                        修改
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals row */}
              <TableRow className="bg-muted/30 font-medium text-xs">
                <TableCell colSpan={2} className="text-right text-muted-foreground">
                  合计
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  ¥{formatAmount(balances.totalDebit + balances.totalCredit)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Badge className="bg-primary/10 text-primary text-[10px]">
                      借 ¥{formatAmount(balances.totalDebit)}
                    </Badge>
                    <Badge className="bg-danger/10 text-danger text-[10px]">
                      贷 ¥{formatAmount(balances.totalCredit)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {balances.isBalanced ? (
                    <Badge className="bg-success/10 text-success text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      平衡
                    </Badge>
                  ) : (
                    <Badge className="bg-danger/10 text-danger text-[10px] gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      差额 ¥{formatAmount(balances.diff)}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAndValidate} className="gap-1.5">
          <Save className="h-4 w-4" /> 保存并校验
        </Button>
      </div>
    </div>
  );
}
