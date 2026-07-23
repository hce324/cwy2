'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner';

const exceptions = [
  { id: 1, type: '应收逾期', title: '华东优选商贸逾期32天', desc: '逾期金额 ¥680,000，超过高风险阈值', time: '今天 09:24', assignee: '李晓雯' },
  { id: 2, type: '资金风险', title: '未来7天预计出现资金缺口', desc: '7月18日预计缺口 ¥420,000，建议调整付款计划', time: '今天 08:40', assignee: '财务负责人' },
  { id: 3, type: '付款异常', title: '新程广告传媒付款超预算', desc: '本次申请使项目预算超出12%', time: '昨天 16:18', assignee: '王思雨' },
  { id: 4, type: '数据迟报', title: '费用明细未按时上传', desc: '市场部7月12日费用明细仍未提交', time: '昨天 14:32', assignee: '市场部接口人' },
  { id: 5, type: '应收逾期', title: '星禾电子商务逾期18天', desc: '逾期金额 ¥416,800，客户近期经营异常', time: '今天 10:15', assignee: '王思雨' },
  { id: 6, type: '资金风险', title: '资产负债率突破警戒线', desc: '当前资产负债率52.3%，接近行业参考上限60%', time: '昨天 17:20', assignee: '财务负责人' },
  { id: 7, type: '付款异常', title: '恒创信息技术缺少发票', desc: '付款申请缺少增值税发票，无法进入审批流程', time: '今天 11:02', assignee: '陈洁' },
  { id: 8, type: '数据迟报', title: '银行流水与台账不一致', desc: '工商银行账户7月12日流水存在3笔未匹配记录', time: '今天 08:10', assignee: '出纳' },
  { id: 9, type: '产销偏差', title: '夏季个护系列产销匹配率仅83.1%', desc: '排产额¥224.0万、销售额¥186.2万，库存周转已升至42天', time: '今天 11:36', assignee: '供应链负责人' },
  { id: 10, type: '直播ROI', title: '新品精华自播ROI低于目标', desc: '当前ROI 4.97，低于目标5.50；退货率8.9%同步偏高', time: '今天 10:48', assignee: '直播运营负责人' },
  { id: 11, type: '直播ROI', title: '达人D场次出现经营亏损', desc: '达播ROI仅2.94，贡献毛利率12.6%，退货率达到18.8%', time: '今天 10:22', assignee: '达人商务负责人' },
  { id: 12, type: 'SKU经营', title: 'SKU-076进入低效清退观察', desc: '经营ROI 1.82、毛利率21.4%，库存周转63天', time: '今天 09:56', assignee: '商品负责人' },
  { id: 13, type: '供应链', title: '两家供应商交付率低于目标', desc: '清源原料准时率91.4%，新远物流包材仅86.5%', time: '今天 09:18', assignee: '采购负责人' },
];

const indicators = [
  { label: '偿债能力', items: [{ name: '速动比率', val: '1.28', range: '≥ 1.0', result: '达标' }, { name: '流动比率', val: '1.82', range: '≥ 1.5', result: '达标' }, { name: '资产负债率', val: '52.3%', range: '≤ 60%', result: '偏高', warn: true }, { name: '利息保障倍数', val: '5.8', range: '≥ 3.0', result: '达标' }] },
  { label: '营运能力', items: [{ name: '应收周转天数', val: '52天', range: '≤ 48天', result: '偏慢', warn: true }, { name: '应付周转天数', val: '38天', range: '≤ 35天', result: '偏慢', warn: true }, { name: '存货周转天数', val: '28天', range: '≤ 30天', result: '达标' }, { name: '总资产周转率', val: '0.82', range: '≥ 0.7', result: '达标' }] },
  { label: '盈利能力', items: [{ name: '销售净利率', val: '16.9%', range: '≥ 15%', result: '达标' }, { name: 'ROE', val: '18.6%', range: '≥ 15%', result: '达标' }, { name: '总资产收益率', val: '9.2%', range: '≥ 8%', result: '达标' }, { name: '毛利率', val: '39.8%', range: '≥ 35%', result: '达标' }] },
];

export function RiskView() {
  const [selectedException, setSelectedException] = useState<typeof exceptions[0] | null>(null);
  const [processAction, setProcessAction] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [processResult, setProcessResult] = useState('');

  const handleSave = () => {
    toast('处理记录已保存，状态已更新');
    setSelectedException(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">风险与异常 — 财务与经营风险处理中心</h1>
          <p className="page-subtitle">
            统一处理财务、产销、直播ROI、SKU和供应链异常，形成分派、处理与复核闭环。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Brain className="h-4 w-4" /> AI诊断</Button>
          <Button size="sm" variant="outline" className="gap-1.5"><Settings className="h-4 w-4" /> 预警规则设置</Button>
        </div>
      </div>

      <Separator />

      <div className="bg-warning/5 rounded-lg p-3 text-sm text-warning flex items-center gap-2 border border-warning/20">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>AI 诊断：有风险 — 新增5项产销经营异常，其中达人D亏损、低效SKU和产销偏差需优先处理。</span>
        <Button variant="outline" size="sm" className="h-7 text-xs ml-auto flex-shrink-0">查看 AI 诊断</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="elevation-1"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">待处理风险</div><div className="text-2xl font-bold mt-1">13</div></CardContent></Card>
        <Card className="elevation-1 border-danger/20"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">高风险</div><div className="text-2xl font-bold mt-1 text-danger">6</div></CardContent></Card>
        <Card className="elevation-1"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">本周已关闭</div><div className="text-2xl font-bold mt-1">12</div></CardContent></Card>
        <Card className="elevation-1"><CardContent className="pt-4"><div className="text-xs text-muted-foreground">平均处理时长</div><div className="text-2xl font-bold mt-1">6.4小时</div></CardContent></Card>
      </div>

      {/* Exception tabs */}
      <Tabs defaultValue="全部异常">
        <TabsList className="flex-wrap">
          {['全部异常', '产销风险5', '资金风险2', '应收风险2', '付款异常2', '数据质量2'].map(t => (
            <TabsTrigger key={t} value={t.split(/[\d]/)[0]} className="text-xs">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Exception list */}
      <Card className="elevation-1">
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead className="w-8">#</TableHead><TableHead>类型</TableHead><TableHead>标题</TableHead><TableHead>描述</TableHead><TableHead>时间</TableHead><TableHead>责任人</TableHead><TableHead className="text-center">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {exceptions.map((e) => (
                <TableRow key={e.id} className="text-xs">
                  <TableCell>{e.id}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{e.type}</Badge></TableCell>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[240px] truncate">{e.desc}</TableCell>
                  <TableCell>{e.time}</TableCell>
                  <TableCell>{e.assignee}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedException(e)}>处理异常</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 三维指标 */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base">三维指标明细与风险预警</CardTitle><CardDescription>偿债能力 · 营运能力 · 盈利能力 — 核心指标分析与风险预警</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {indicators.map((dim) => (
              <div key={dim.label} className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2">{dim.label}</h4>
                <div className="space-y-2">
                  {dim.items.map((item, j) => (
                    <div key={j} className="text-xs">
                      <div className="flex justify-between">
                        <span>{item.name}</span>
                        <span className={`font-mono font-medium ${item.warn ? 'text-warning' : 'text-success'}`}>{item.val}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{item.range}</span>
                        <span className={item.warn ? 'text-warning' : 'text-success'}>{item.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 综合指标 */}
      <Card className="elevation-1">
        <CardHeader className="pb-3"><CardTitle className="text-base">综合指标预警</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-[11px]"><TableHead>指标</TableHead><TableHead>值</TableHead><TableHead>阈值</TableHead><TableHead>计算口径</TableHead><TableHead>判定说明</TableHead></TableRow></TableHeader>
            <TableBody>
              {[
                { name: '盈余现金保障倍数', val: '0.42', threshold: '≥ 0.5', formula: '经营现金净流量 ¥98.00万 ÷ 净利润 ¥214.68万', judge: '预警：低于0.5进入黄灯区', warn: true },
                { name: '现金总资产比', val: '12.4%', threshold: '≥ 6%', formula: '货币资产 ¥842.66万 ÷ 资产总额 ¥6,820.00万', judge: '正常：高于6%，现金资产充裕', warn: false },
                { name: '月度经营性现金流', val: '¥286.00万', threshold: '¥320.00万', formula: '本月经营现金净流量低于预算 ¥34.00万', judge: '预警：低于预算阈值触发预警', warn: true },
                { name: '销售增长率', val: '8.6%', threshold: '≥ 5%', formula: '本期增长额 ¥100.04万 ÷ 上期 ¥1,168.00万', judge: '正常：高于行业均值，增长健康', warn: false },
                { name: '资本积累率', val: '6.9%', threshold: '≥ 5%', formula: '权益增长 ¥74.00万 ÷ 年初权益 ¥1,080.00万', judge: '正常：所有者权益稳步增长', warn: false },
              ].map((r, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className={`font-mono ${r.warn ? 'text-warning' : 'text-success'}`}>{r.val}</TableCell>
                  <TableCell>{r.threshold}</TableCell>
                  <TableCell className="text-muted-foreground">{r.formula}</TableCell>
                  <TableCell><Badge className={r.warn ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} variant="outline">{r.judge}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exception processing drawer */}
      <Sheet open={!!selectedException} onOpenChange={(o) => !o && setSelectedException(null)}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[540px]">
          <SheetHeader><SheetTitle>处理异常</SheetTitle><SheetDescription>{selectedException?.title}</SheetDescription></SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm space-y-1">
              <p className="font-medium text-sm">异常说明</p>
              <p className="text-muted-foreground">{selectedException?.desc}</p>
              <p className="text-xs">责任人：{selectedException?.assignee}</p>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">处理动作</Label>
                <RadioGroup value={processAction} onValueChange={setProcessAction} className="mt-2 space-y-2">
                  {['已联系', '调整计划', '升级', '误报'].map(a => (
                    <div key={a} className="flex items-center space-x-2"><RadioGroupItem value={a} id={a} /><Label htmlFor={a} className="text-sm">{a}</Label></div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm">处理说明</Label>
                <Textarea value={processNote} onChange={e => setProcessNote(e.target.value)} className="mt-1 text-sm" rows={3} />
              </div>
              <div>
                <Label className="text-sm">处理结果</Label>
                <RadioGroup value={processResult} onValueChange={setProcessResult} className="mt-2 space-y-2">
                  {['处理完成，申请关闭', '持续跟进', '需要负责人决策'].map(r => (
                    <div key={r} className="flex items-center space-x-2"><RadioGroupItem value={r} id={r} /><Label htmlFor={r} className="text-sm">{r}</Label></div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!processAction || !processResult}>保存记录</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
