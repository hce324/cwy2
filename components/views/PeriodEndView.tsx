'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle, Calculator, TrendingUp, Receipt, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { label: '业务入账', status: 'done', detail: '1,105张' },
  { label: '账实核对', status: 'done', detail: '全部通过' },
  { label: '自动结转', status: 'pending', detail: '待生成6张' },
  { label: '报表检查', status: 'not-started', detail: '未执行' },
  { label: '月末结账', status: 'not-started', detail: '未执行' },
];

const transfers = [
  {
    label: '折',
    icon: <Calculator className="h-4 w-4" />,
    name: '折旧',
    desc: '根据资产卡片自动计算本期折旧',
    amount: '¥18,600.00',
    status: '已计算',
  },
  {
    label: '摊',
    icon: <TrendingUp className="h-4 w-4" />,
    name: '摊销',
    desc: '按剩余摊销期自动分摊',
    amount: '¥6,400.00',
    status: '已计算',
  },
  {
    label: '税',
    icon: <Receipt className="h-4 w-4" />,
    name: '税费',
    desc: '依据销项、进项和计税基础计提',
    amount: '¥22,735.21',
    status: '已计算',
  },
  {
    label: '损',
    icon: <BookOpen className="h-4 w-4" />,
    name: '损益结转',
    desc: '收入费用科目结转至本年利润',
    amount: '¥459,585.00',
    status: '待生成',
  },
];

export function PeriodEndView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">PERIOD END</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">期末结转</h1>
          <p className="text-sm text-muted-foreground mt-1">
            记账会计准备结转草稿...
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary"
          onClick={() => toast('结转完成：相关数据已写入共享账务数据')}
        >
          复核并执行期末结转
        </Button>
      </div>

      <Separator />

      {/* 5-step flow */}
      <Card className="elevation-1">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {step.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : step.status === 'pending' ? (
                    <Circle className="h-5 w-5 text-warning" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{i + 1}. {step.label}</div>
                    <div className="text-[11px] text-muted-foreground">{step.detail}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-6 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4 transfer items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transfers.map((t, i) => (
          <Card key={i} className="elevation-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge
                  className={
                    t.status === '待生成'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                  }
                >
                  {t.label}
                </Badge>
                {t.name}
              </CardTitle>
              <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono">{t.amount}</span>
                <Badge
                  variant="outline"
                  className={
                    t.status === '待生成'
                      ? 'text-warning'
                      : 'text-success'
                  }
                >
                  {t.icon}
                  <span className="ml-1">{t.status}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
