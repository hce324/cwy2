'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress, ProgressValue, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const directorTasks = [
  { id: 'd1', priority: '高', title: '复核待审核凭证及 AI 分录建议', module: '原始凭证 / 凭证填制', deadline: '今日 11:30' },
  { id: 'd2', priority: '高', title: '审批迅达物流¥28.64万付款申请', module: '资金收付 · 已完成合规校验', deadline: '今日 14:00' },
  { id: 'd3', priority: '中', title: '复核平台结算与银行对账差异', module: '平台结算 / 银行对账', deadline: '今日 16:00' },
  { id: 'd4', priority: '中', title: '复核本期会计报表口径与关键勾稽关系', module: '会计报表', deadline: '今日 18:00' },
];

const specialistTasks = [
  { id: 's1', priority: '高', title: '复核天猫结算单 AI 拆分结果', module: '智能采集 / 原始凭证', deadline: '今天 12:00' },
  { id: 's2', priority: '高', title: '复核付款资料中的合同、发票与验收依据', module: '原始凭证复核', deadline: '今天 16:00' },
  { id: 's3', priority: '中', title: '完成抖音平台佣金、退款与运费险对账', module: '平台结算对账', deadline: '今天 18:00' },
  { id: 's4', priority: '中', title: '完成期末结转草稿并归档结转依据', module: '期末结转', deadline: '7月15日' },
];

const cashierTasks = [
  { id: 'c1', priority: '高', title: '执行迅达物流已授权付款', module: '资金收付 / 付款执行', deadline: '今天 14:00' },
  { id: 'c2', priority: '高', title: '导入并匹配招商银行当日流水', module: '银行流水', deadline: '今天 16:00' },
  { id: 'c3', priority: '中', title: '上传付款回单并登记银行日记账', module: '资金收付', deadline: '今天 18:00' },
  { id: 'c4', priority: '中', title: '完成工商银行余额调节事项确认', module: '银行对账', deadline: '7月15日' },
];

export function ClosingView() {
  const { currentRole, closingTasks, toggleClosingTask } = useAppStore();

  const tasks = currentRole === '财务负责人' ? directorTasks
    : currentRole === '财务专员' ? specialistTasks
    : cashierTasks;

  const completedCount = tasks.filter(t => closingTasks[t.id]).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggle = (id: string) => {
    toggleClosingTask(id);
    toast('月结任务状态已更新');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">2026年7月月结</h1>
          <p className="page-subtitle">
            通过标准任务清单协同完成月末检查、报表和复核。
          </p>
        </div>
        <Button variant="outline" size="sm">查看月结历史</Button>
      </div>

      <Separator />

      {/* Progress */}
      <Card className={`elevation-1 ${completedCount < totalCount ? 'border-warning/20' : 'border-success/20'}`}>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">本期月结进度</div>
              <div className="text-xs text-muted-foreground">已完成 {completedCount} / {totalCount} 项任务</div>
              <div className="text-xs text-muted-foreground">仅显示分配给 {currentRole} 的工作台同步任务</div>
            </div>
            <Badge className="bg-warning/10 text-warning">即将到期</Badge>
          </div>
          <Progress value={progress}>
            <ProgressTrack className="h-2" />
            <ProgressIndicator style={{ width: `${progress}%` }} className="h-2" />
            <ProgressValue className="text-xs" />
          </Progress>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>预计完成时间 2026年7月18日</span>
            </div>
            <span>距截止还有 5 天</span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card className="elevation-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {currentRole} 任务
          </CardTitle>
          <CardDescription>
            {completedCount === totalCount ? '全部完成' : `${totalCount - completedCount} 项待处理`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${closingTasks[task.id] ? 'bg-success/5 border-success/20' : 'hover:bg-muted/50'}`}
              >
                <Checkbox
                  checked={!!closingTasks[task.id]}
                  onCheckedChange={() => handleToggle(task.id)}
                  id={task.id}
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={task.id} className={`text-sm cursor-pointer ${closingTasks[task.id] ? 'line-through text-muted-foreground' : ''}`}>
                    <Badge className={task.priority === '高' ? 'bg-danger/10 text-danger mr-1.5' : 'bg-warning/10 text-warning mr-1.5'}>
                      {task.priority}
                    </Badge>
                    {task.title}
                  </Label>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{task.module}</span>
                    <span>|</span>
                    <span>截止：{task.deadline}</span>
                  </div>
                </div>
                {closingTasks[task.id] && (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
