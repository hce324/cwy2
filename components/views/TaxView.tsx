'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function TaxView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">TAX FILING</div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-1">纳税申报</h1>
          <p className="text-sm text-muted-foreground mt-1">
            复核申报表、税会差异与勾稽关系，确认后由授权人员提交。
          </p>
        </div>
        <Button size="sm">复核申报表</Button>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">销项税额</div>
            <div className="text-xl font-bold font-mono mt-1">¥1,486,320</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">已与开票数据核对</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">进项税额</div>
            <div className="text-xl font-bold font-mono mt-1">¥428,360</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">4笔待用途确认</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">预计应纳增值税</div>
            <div className="text-xl font-bold font-mono mt-1">¥1,057,960</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">未包含上期留抵</div>
          </CardContent>
        </Card>
        <Card className="elevation-1 border-warning/20">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">账票差异</div>
            <div className="text-xl font-bold font-mono mt-1 text-warning">¥12,840</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">3项需要说明</div>
          </CardContent>
        </Card>
      </div>

      {/* Filing period info */}
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        税款所属期：2026-07-01 至 2026-07-31 ｜ 申报截止：2026-08-17
      </div>

      {/* Filing forms */}
      <div className="space-y-3">
        {[
          { type: '增', name: '增值税及附加税费申报表', detail: '一般纳税人 · 1张主表＋6张附表', tax: '应补（退）税额 ¥1,080,695.21', status: '待复核' },
          { type: '企', name: '企业所得税月（季）度预缴纳税申报表', detail: 'A类 · 季度申报', tax: '本期应补所得税 ¥153,195.00', status: '待复核' },
          { type: '印', name: '财产和行为税纳税申报表', detail: '印花税 · 按次/按季', tax: '本期应纳税额 ¥3,842.60', status: '校验通过' },
        ].map((form, i) => (
          <Card key={i} className="elevation-1">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">{form.type}</Badge>
                <div>
                  <div className="text-sm font-medium">{form.name}</div>
                  <div className="text-xs text-muted-foreground">{form.detail}</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{form.tax}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={form.status === '校验通过' ? 'text-success' : 'text-warning'}
                >
                  {form.status}
                </Badge>
                <Button variant="outline" size="sm" className="h-7 text-xs">预览</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation */}
      <Card className="elevation-1">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox id="confirm-tax" />
            <Label htmlFor="confirm-tax" className="text-sm cursor-pointer">
              我已复核申报数据，并确认由授权人员执行正式申报
            </Label>
          </div>
          <Button size="sm" onClick={() => toast('申报清册已提交')}>
            提交申报清册
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
