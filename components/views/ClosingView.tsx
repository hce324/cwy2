'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function ClosingView() {
  const { currentRole } = useAppStore();
  const utils = trpc.useUtils();

  // ── Fetch current fiscal period ──
  const { data: period, isLoading: periodLoading } = trpc.period.current.useQuery();
  const periodId = period ? Number(period.id) : undefined;

  // ── Fetch tasks & progress ──
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = trpc.closing.tasks.useQuery(
    { fiscalPeriodId: periodId! },
    { enabled: periodId !== undefined },
  );

  const { data: progressData } = trpc.closing.progress.useQuery(
    { fiscalPeriodId: periodId! },
    { enabled: periodId !== undefined },
  );

  // ── Toggle mutation ──
  const toggleMutation = trpc.closing.toggle.useMutation({
    onSuccess: () => {
      utils.closing.tasks.invalidate();
      utils.closing.progress.invalidate();
      toast('月结任务状态已更新');
    },
  });

  const handleToggle = (id: bigint) => {
    toggleMutation.mutate({ id: Number(id) });
  };

  const handleRetry = () => {
    refetchTasks();
    utils.closing.progress.invalidate();
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = progressData?.progress ?? (totalCount > 0 ? (completedCount / totalCount) * 100 : 0);

  const periodLabel = period ? `${period.year}年${period.month}月月结` : '月结';

  // ── Loading state ──
  if (periodLoading || tasksLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[--primary]" />
          <p className="text-sm text-muted-foreground">加载月结任务...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (tasksError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-[--danger]" />
          <div>
            <p className="text-sm font-medium text-foreground">加载月结任务失败</p>
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
  if (tasks.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{periodLabel}</h1>
            <p className="page-subtitle">通过标准任务清单协同完成月末检查、报表和复核。</p>
          </div>
          <Button variant="outline" size="sm">查看月结历史</Button>
        </div>
        <Separator />
        <Card className="elevation-1">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">当前没有分配给 {currentRole} 的月结任务</p>
            <p className="text-xs text-muted-foreground mt-1">请确认当前会计期间是否已配置月结任务</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main content ──
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{periodLabel}</h1>
          <p className="page-subtitle">
            通过标准任务清单协同完成月末检查、报表和复核。
          </p>
        </div>
        <Button variant="outline" size="sm">查看月结历史</Button>
      </div>

      <Separator />

      {/* Progress */}
      <Card
        className={`elevation-1 ${
          completedCount < totalCount ? 'border-[--warning]/20' : 'border-[--success]/20'
        }`}
      >
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">本期月结进度</div>
              <div className="text-xs text-muted-foreground">
                已完成 {completedCount} / {totalCount} 项任务
              </div>
              <div className="text-xs text-muted-foreground">
                仅显示分配给 {currentRole} 的工作台同步任务
              </div>
            </div>
            {completedCount < totalCount ? (
              <Badge className="bg-[--warning]/10 text-[--warning]">进行中</Badge>
            ) : (
              <Badge className="bg-[--success]/10 text-[--success]">全部完成</Badge>
            )}
          </div>
          <Progress value={progress}>
            <ProgressTrack className="h-2" />
            <ProgressIndicator style={{ width: `${progress}%` }} className="h-2" />
          </Progress>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                会计期间：{period?.year}/{String(period?.month).padStart(2, '0')}
              </span>
            </div>
            {progressData && (
              <span>{progress >= 100 ? '已完成' : `剩余 ${progressData.total - progressData.completed} 项`}</span>
            )}
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
            {tasks.map((task) => (
              <div
                key={String(task.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  task.isCompleted
                    ? 'bg-[--success]/5 border-[--success]/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => handleToggle(task.id)}
                  id={String(task.id)}
                  disabled={toggleMutation.isPending}
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={String(task.id)}
                    className={`text-sm cursor-pointer ${
                      task.isCompleted ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    <Badge
                      className={
                        task.priority === '高'
                          ? 'bg-[--danger]/10 text-[--danger] mr-1.5'
                          : task.priority === '中'
                            ? 'bg-[--warning]/10 text-[--warning] mr-1.5'
                            : 'bg-muted text-muted-foreground mr-1.5'
                      }
                    >
                      {task.priority}
                    </Badge>
                    {task.title}
                  </Label>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    {task.module && <span>{task.module}</span>}
                    {task.module && task.deadline && <span>|</span>}
                    {task.deadline && <span>截止：{task.deadline}</span>}
                  </div>
                </div>
                {task.isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-[--success] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
