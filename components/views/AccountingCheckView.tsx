'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Scale, Hash, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function AccountingCheckView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">凭证与期间控制</h1>
          <p className="text-sm text-muted-foreground mt-1">
            基础控制：借贷平衡、凭证号唯一、会计期间开放状态...
          </p>
        </div>
        <Button size="sm" onClick={() => toast('数据校验完成：全部校验通过')}>
          执行数据校验
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="elevation-1 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-success" />
              借贷平衡
            </CardTitle>
            <CardDescription className="text-xs">1,105 张凭证</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-success/10 text-success">全部平衡</Badge>
          </CardContent>
        </Card>

        <Card className="elevation-1 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4 text-success" />
              凭证号唯一
            </CardTitle>
            <CardDescription className="text-xs">2026年7月</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-success/10 text-success">未发现重复</Badge>
          </CardContent>
        </Card>

        <Card className="elevation-1 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-success" />
              会计期间
            </CardTitle>
            <CardDescription className="text-xs">2026-07</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-success/10 text-success">开放</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
