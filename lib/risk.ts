// ============================================================================
// 风险等级 · 全局唯一真相源 (Single Source of Truth)
// ----------------------------------------------------------------------------
// 三处视图（Overview / Risk / Receivable）共用同一套风险等级词汇与色彩，
// 禁止在各文件内联拼写"高风险/中风险/低风险"的配色。
// 配色语义：高=红(--danger) · 中=橙(--warning) · 低=灰(--muted-foreground)
// 相关 CSS 工具类见 app/globals.css：
//   .risk-badge--high|mid|low  ·  .risk-surface--*  ·  .risk-dot--*  ·  .risk-text--*
// ============================================================================

export type RiskLevel = 'high' | 'mid' | 'low';

export interface RiskLevelMeta {
  /** 完整标签，如「高风险」 */
  label: string;
  /** 紧凑标签，如「高」 */
  short: string;
  /** 排序权重：高在前 */
  order: number;
  /** 徽章工具类（含底色/文字/描边） */
  badge: string;
  /** 卡片/行表面工具类（左侧色条 + 浅色底） */
  surface: string;
  /** 圆点工具类 */
  dot: string;
  /** 文字配色工具类 */
  text: string;
}

export const RISK_LEVELS: Record<RiskLevel, RiskLevelMeta> = {
  high: {
    label: '高风险',
    short: '高',
    order: 0,
    badge: 'risk-badge--high',
    surface: 'risk-surface--high',
    dot: 'risk-dot--high',
    text: 'risk-text--high',
  },
  mid: {
    label: '中风险',
    short: '中',
    order: 1,
    badge: 'risk-badge--mid',
    surface: 'risk-surface--mid',
    dot: 'risk-dot--mid',
    text: 'risk-text--mid',
  },
  low: {
    label: '低风险',
    short: '低',
    order: 2,
    badge: 'risk-badge--low',
    surface: 'risk-surface--low',
    dot: 'risk-dot--low',
    text: 'risk-text--low',
  },
};

/** 取某等级的元数据（徽章/表面/圆点/文字 className） */
export function riskLevelMeta(level: RiskLevel): RiskLevelMeta {
  return RISK_LEVELS[level];
}

/** 由中文标签推断等级，用于旧数据兼容（"高风险"→high 等） */
export function riskLevelFromLabel(label: string): RiskLevel {
  if (label.includes('高')) return 'high';
  if (label.includes('中')) return 'mid';
  return 'low';
}

/** 统计一组等级的出现次数，返回含 all 的计数 */
export function countRiskLevels<T extends { level: RiskLevel }>(
  items: T[],
): { all: number; high: number; mid: number; low: number } {
  return items.reduce(
    (acc, it) => {
      acc.all += 1;
      acc[it.level] += 1;
      return acc;
    },
    { all: 0, high: 0, mid: 0, low: 0 },
  );
}
