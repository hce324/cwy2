'use client';

/**
 * hr-ui.tsx — HR 模块共享展示组件
 *
 * 自定义组件原因（CLAUDE.md / WORKBUDDY.md §允许自定义组件：必须创建时注释原因）：
 * HR 模块 7 个视图大量复用「语义色 KPI 卡 / 语义 badge / 进度条 / 待办块」等组合，
 * shadcn/ui 无等价复合组件；此处仅为对 shadcn Card/Badge 的薄封装，
 * 所有颜色均引用 Material CSS 变量（优先使用 --chart-1..5 财务调色板），未引入任何第三方 UI 库。
 */
import { cn } from '@/lib/utils';
import { hrAiInsights, hrAiScore, type AiInsightLevel } from '@/lib/hr-data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
} from 'lucide-react';

// 语义色浅底：用 color-mix 基于任意传入色生成 10% 透明底，
// 兼容图表迁移后的 --chart-* 调色板（globals.css 未定义 --chart-*-50）。
function softBg(color: string): string {
  if (!color || color === 'var(--muted-foreground)' || color === 'var(--muted)') return 'var(--muted)';
  return `color-mix(in srgb, ${color} 10%, transparent)`;
}

// ------------------------------------------------------------
// 页面头部
// ------------------------------------------------------------
export function HrPageHeader({
  title,
  subtitle,
  description,
  maxWidth = 'max-w-[1100px]',
}: {
  title: string;
  subtitle?: string;
  description?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn('mx-auto w-full', maxWidth)}>
      <h1 className="page-title">{title}</h1>
      {subtitle && (
        <p className="page-subtitle">{subtitle}</p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// KPI 指标卡（语义色圆点 + 数值 + 趋势）
// ------------------------------------------------------------
export function HrMetricCard({
  label,
  value,
  sub,
  trend,
  trendUp,
  color = 'var(--chart-1)',
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <Card className={cn('elevation-1 card-hover', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium tabular-nums',
                trendUp ? 'text-[--trend-up]' : 'text-[--trend-down]'
              )}
            >
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend}
            </span>
          )}
        </div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// 语义 Badge（solid 或 soft）
// ------------------------------------------------------------
export function HrBadge({
  color = 'var(--chart-1)',
  children,
  soft = false,
}: {
  color?: string;
  children: React.ReactNode;
  soft?: boolean;
}) {
  if (soft) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: softBg(color), color }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-primary-foreground"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

// ------------------------------------------------------------
// 进度条（语义色填充）
// ------------------------------------------------------------
export function HrProgress({
  value,
  color = 'var(--chart-1)',
  warn = false,
  className,
}: {
  value: number; // 0-100
  color?: string;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all', warn && 'opacity-90')}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: warn ? 'var(--chart-4)' : color }}
      />
    </div>
  );
}

// ------------------------------------------------------------
// 待办 / 提醒块（左侧彩色边框 + 浅色背景）
// ------------------------------------------------------------
export function HrTodoItem({
  children,
  color = 'var(--chart-1)',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="rounded-r-md border-l-4 px-3 py-2 text-sm"
      style={{ backgroundColor: softBg(color), borderColor: color }}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// 带标题的区块卡片
// ------------------------------------------------------------
export function HrSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn('elevation-1', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// AI 智能分析面板（统一洞察卡：分级图标 + 健康度评分 + 指标/预测/建议）
// ------------------------------------------------------------
const AI_LEVEL: Record<AiInsightLevel, { icon: typeof Info; color: string; label: string }> = {
  risk: { icon: AlertTriangle, color: 'var(--danger)', label: '风险' },
  warn: { icon: AlertCircle, color: 'var(--warning)', label: '关注' },
  opportunity: { icon: TrendingUp, color: 'var(--chart-1)', label: '机会' },
  positive: { icon: CheckCircle2, color: 'var(--success)', label: '良好' },
  info: { icon: Info, color: 'var(--chart-2)', label: '洞察' },
};

export function HrAiPanel({ viewId, className }: { viewId: string; className?: string }) {
  const insights = hrAiInsights[viewId] ?? [];
  const score = hrAiScore[viewId];
  if (!insights.length) return null;

  return (
    <Card className={cn('elevation-1 card-hover', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-heading font-semibold text-foreground">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[--chart-1] text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            AI 智能分析
          </CardTitle>
          {score != null && (
            <span className="flex items-center gap-1 rounded-full bg-[--chart-1] px-2.5 py-1 text-xs font-semibold text-primary-foreground tabular-nums">
              健康度 {score}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">基于现有数据 · 多维洞察 · 趋势预测 · 风险预警</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {insights.map((it) => {
          const meta = AI_LEVEL[it.level];
          const Icon = meta.icon;
          return (
            <div key={it.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start gap-2.5">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`, color: meta.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{it.title}</span>
                    {it.metric && (
                      <span className="ml-auto text-sm font-bold tabular-nums shrink-0" style={{ color: meta.color }}>
                        {it.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.detail}</p>
                  {(it.delta || it.action) && (
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {it.delta && (
                        <span
                          className={cn(
                            'flex items-center gap-0.5 text-xs font-medium tabular-nums',
                            it.deltaUp ? 'text-[--trend-up]' : 'text-[--trend-down]'
                          )}
                        >
                          {it.deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {it.delta}
                        </span>
                      )}
                      {it.action && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lightbulb className="h-3 w-3" />
                          {it.action}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
