'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function ReconcileView() {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const platforms = [
    { name: '抖音', diff: '1笔差异 · ¥186.40', status: 'warning' as const },
    { name: '天猫', diff: '全部相符', status: 'success' as const },
    { name: '京东', diff: '1笔差异 · ¥300.00', status: 'warning' as const },
    { name: '拼多多', diff: '1笔差异 · ¥500.00', status: 'warning' as const },
  ];

  const stats = [
    { label: '本期结算批次', value: '42 批', sub: '4个平台 · 6家店铺' },
    { label: '订单匹配率', value: '99.2%', sub: '12,486 / 12,587笔' },
    { label: '已定位差异', value: '3 笔', sub: '原因匹配金额 ¥986.40' },
    { label: '待人工确认', value: '2 笔', sub: '会计政策判断后制证' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            PLATFORM RECONCILIATION
          </div>
          <h1 className="page-title mt-1">
            平台结算对账
          </h1>
          <p className="page-subtitle">
            平台账单由系统自动归集匹配，会计主管查看证据链、确认差异原因并下发待制证资料。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 ripple-container">
            <RefreshCw className="h-4 w-4" />
            同步平台账单
          </Button>
          <Button size="sm" variant="outline" className="ripple-container">
            重新执行匹配
          </Button>
        </div>
      </div>

      <Separator />

      {/* ========== Platform Summaries ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {platforms.map((p) => (
          <Card
            key={p.name}
            className={`elevation-1 ${p.status === 'warning' ? 'border-warning/30' : 'border-success/30'}`}
          >
            <CardContent className="pt-3 text-center">
              <div className="text-sm font-medium">{p.name}</div>
              <div
                className={`text-xs mt-0.5 ${p.status === 'success' ? 'text-success' : 'text-warning'}`}
              >
                {p.diff}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Stats ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="elevation-1">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold mt-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Settlement Batches ========== */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">结算批次</CardTitle>
          <CardDescription>期间：2026年07月</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Batch 1 — 抖音 DY-20260712-0831 (with diff, expandable) */}
          <div className="border rounded-lg">
            <button
              onClick={() => setExpandedBatch(expandedBatch === 'dy1' ? null : 'dy1')}
              className="w-full text-left p-3 hover:bg-muted/30 rounded-t-lg ripple-container"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    抖音旗舰店 · 07-12结算批 DY-20260712-0831
                  </div>
                </div>
                <Badge className="bg-warning/10 text-warning">+¥186.40</Badge>
              </div>
            </button>
            {expandedBatch === 'dy1' && (
              <div className="p-3 border-t space-y-3 text-sm">
                {/* 金额拆分 */}
                <div className="space-y-1">
                  <p className="font-medium">金额拆分：</p>
                  <p className="text-xs text-muted-foreground">
                    订单应收 ¥96,874.20 | 减：退款 ¥6,822.60 | 减：平台费用 ¥3,845.82 |
                    预计手续费 ¥86,205.78 | 银行到账额 ¥86,392.18 | 内嵌费用 +¥186.40
                  </p>
                </div>

                {/* AI 差异原因识别 */}
                <div className="bg-accent/30 rounded-lg p-3">
                  <p className="font-medium text-sm">AI 差异原因识别（置信度 99%）：</p>
                  <p className="text-xs text-muted-foreground">
                    活动补贴计入预计结算金额 — 银行为实际到账比预计多186.40元。匹配存疑项：平台活动补贴 ¥186.40
                  </p>
                </div>

                {/* 会计分录建议 */}
                <div className="bg-success/5 rounded-lg p-3 text-xs">
                  <p className="font-medium">会计分录建议：</p>
                  <p>
                    借：100201 银行存款 186.40　贷：6051 其他业务收入 186.40
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button size="sm" className="ripple-container">
                    确认入账并下发计算
                  </Button>
                  <Button size="sm" variant="outline" className="ripple-container">
                    待人工复核
                  </Button>
                </div>

                {/* 差异证据链 */}
                <div>
                  <p className="font-medium text-xs mb-1">差异证据链：</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      1. 结算单 · DYJS-20260712-0831 — 营销补贴明细 · +¥186.40（已关联）
                    </p>
                    <p>2. 银行流水 · 招商银行 755901（已关联）</p>
                    <p>3. 订单汇总 · 468笔订单 / 23笔退单 — 订单、退款均已勾稽（已关联）</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch 2 — 抖音 DY-20260720-0629 (matched) */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  抖音旗舰店 · 07-20结算批 DY-20260720-0629
                </div>
              </div>
              <Badge className="bg-success/10 text-success">
                ✓ 已匹配
              </Badge>
            </div>
          </div>

          {/* Batch 3 — 天猫 (matched) */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  天猫旗舰店 · 07-20结算批 · 招商银行 ¥756,842
                </div>
              </div>
              <Badge className="bg-success/10 text-success">
                ✓ 已匹配
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
