'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, CheckCircle2, FileCheck, ShieldAlert } from 'lucide-react';

export function BankReconView() {
  const [settlementEntity, setSettlementEntity] = useState('杭州星芒供应链有限公司');
  const [bankAccount, setBankAccount] = useState('招商银行杭州分行 8888');
  const [reconPeriod, setReconPeriod] = useState('2026-07');

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
        <Button size="sm" className="gap-1.5">
          <FileCheck className="h-4 w-4" />
          复核余额调节表
        </Button>
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
              <SelectItem value="杭州星芒供应链有限公司">杭州星芒供应链有限公司</SelectItem>
              <SelectItem value="上海星芒贸易有限公司">上海星芒贸易有限公司</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground mr-1">银行账户</span>
          <Select value={bankAccount} onValueChange={(v) => v && setBankAccount(v)}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="招商银行杭州分行 8888">招商银行杭州分行 8888</SelectItem>
              <SelectItem value="工商银行上海分行 6666">工商银行上海分行 6666</SelectItem>
              <SelectItem value="支付宝企业账户 9999">支付宝企业账户 9999</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground mr-1">对账期间</span>
          <Select value={reconPeriod} onValueChange={(v) => v && setReconPeriod(v)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-07">2026年07月</SelectItem>
              <SelectItem value="2026-06">2026年06月</SelectItem>
              <SelectItem value="2026-05">2026年05月</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" className="h-8 gap-1">
            <Search className="h-3.5 w-3.5" /> 查询
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <RotateCcw className="h-3.5 w-3.5" /> 重置
          </Button>
        </CardContent>
      </Card>

      {/* ========== Stats ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">对账单状态</div>
            <div className="text-lg font-bold mt-1">已导入 · 328 笔</div>
            <div className="text-[10px] text-muted-foreground">银行流水328笔 借方¥2,846,392.18</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">自动匹配</div>
            <div className="text-lg font-bold mt-1">324 笔</div>
            <div className="text-[10px] text-success">匹配率 98.8%</div>
          </CardContent>
        </Card>
        <Card className="elevation-1 border-warning/20">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">未达事项</div>
            <div className="text-lg font-bold mt-1">4 笔</div>
            <div className="text-[10px] text-muted-foreground">合计影响 ¥36,454.80</div>
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
          <Tabs defaultValue="全部">
            <TabsList>
              <TabsTrigger value="全部" className="text-xs">全部 328</TabsTrigger>
              <TabsTrigger value="已勾对" className="text-xs">已勾对 324</TabsTrigger>
              <TabsTrigger value="未达" className="text-xs">未达 4</TabsTrigger>
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
              {[
                { date: '07-12 · 755901', bank: '抖音平台结算到账 收 ¥86,392.18', company: '银收-128 · 收到平台款', result: '自动勾对·金额日期流水号一致', duty: '系统', action: '查看' },
                { date: '07-31 · IN2026073108', bank: '银行结息 收 ¥1,268.40', company: '日记账中未找到', result: '银行已收、企业未收', duty: '出纳', action: '待出纳跟踪' },
                { date: '07-31 · OUT2026073196', bank: '网银服务费 付 ¥186.40', company: '日记账中未找到', result: '银行已付、企业未付', duty: '出纳', action: '待出纳跟踪' },
                { date: '—', bank: '银行尚未入账', company: '收字205号·收到客户转账 ¥25,000', result: '企业已收、银行未收', duty: '出纳', action: '待银行入账' },
                { date: '—', bank: '银行尚未扣款', company: '付字209号·支付供应商 ¥10,000', result: '企业已付、银行未付', duty: '出纳', action: '待银行扣款' },
              ].map((r, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-mono">{r.date}</TableCell>
                  <TableCell>{r.bank}</TableCell>
                  <TableCell>{r.company}</TableCell>
                  <TableCell>
                    <Badge
                      className={r.result.includes('自动') ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                      variant="outline"
                    >
                      {r.result}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.duty}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">{r.action}</Button>
                  </TableCell>
                </TableRow>
              ))}
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
          <CardDescription>2026年7月31日 · 招商银行杭州分行 8888</CardDescription>
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
              <span className="text-success font-medium">✓ 双方调节后余额一致 · 差额 ¥0.00</span>
              <span className="text-muted-foreground ml-3">编制人：陈出纳 · 2026-08-01 09:42</span>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs ml-auto">导出调节表</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
