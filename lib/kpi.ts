// ============================================================================
// KPI 涨跌 · 全局统一格式器
// ----------------------------------------------------------------------------
// 解决「涨跌格式、颜色、符号混乱」：所有 KPI 变动统一走 formatDelta()，
// 保证 方向符号(▲/▼) + 正负号(+) + 口径标签(同比/环比) + 配色 完全一致。
//
// 配色语义（与用户确认）：好=绿(--success) · 坏=红(--danger) · 警示=橙(--warning)
//   —— 即「涨且为好→绿，跌且为坏→红」，而非按纯方向着色。
// 注意：涨跌(delta) 与 风险等级(level) 是两个不同概念，请勿混用。
// 相关 CSS 工具类见 app/globals.css：.kpi-delta(+ .kpi-delta--up|down|warning|danger|neutral)
// ============================================================================

import { cn } from '@/lib/utils';

export type DeltaDirection = 'up' | 'down' | 'flat';
export type DeltaTone = 'up' | 'down' | 'warning' | 'danger' | 'neutral';

export interface DeltaInput {
  /** 变动数值，如 8.6 或 -1.8（百分比或百分点） */
  value: number;
  /** 单位，默认 '%'；百分点用 'pp' */
  unit?: '%' | 'pp';
  /** 口径标签，如 '同比' / '环比' / '较上月'；省略则不显示 */
  period?: string;
  /** 语义好坏：true=好(绿) false=坏(红)；省略则按方向推导（涨绿跌红） */
  good?: boolean;
}

export interface DeltaResult {
  /** 完整文案，如 "+8.6% 同比" / "−1.8pp" */
  text: string;
  /** 方向符号：▲ 涨 / ▼ 跌 / — 持平 */
  symbol: string;
  /** 语义色调 */
  tone: DeltaTone;
  /** 可直接挂在 <p>/<span> 上的 className（含 .kpi-delta 基类） */
  className: string;
}

const TONE_CLASS: Record<DeltaTone, string> = {
  up: 'kpi-delta--up',
  down: 'kpi-delta--down',
  warning: 'kpi-delta--warning',
  danger: 'kpi-delta--danger',
  neutral: 'kpi-delta--neutral',
};

const SYMBOL: Record<DeltaDirection, string> = {
  up: '▲',
  down: '▼',
  flat: '—',
};

export function getDeltaDirection(value: number): DeltaDirection {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

const MINUS = '−'; // 真减号 U+2212，视觉优于连字符

/**
 * 统一格式化一个 KPI 变动。
 * @example
 *   formatDelta({ value: 8.6, unit: '%', period: '同比', good: true })
 *   // → { text: '+8.6% 同比', symbol: '▲', tone: 'up', className: 'kpi-delta kpi-delta--up' }
 */
export function formatDelta(input: DeltaInput): DeltaResult {
  const { value, unit = '%', period, good } = input;
  const direction = getDeltaDirection(value);

  // 语义色调：好→绿(up) 坏→红(danger)；未指定则按方向（涨绿跌红）
  let tone: DeltaTone;
  if (good === true) tone = 'up';
  else if (good === false) tone = 'danger';
  else tone = direction === 'down' ? 'down' : 'up';

  const sign = value > 0 ? '+' : value < 0 ? MINUS : '';
  const num = Math.abs(value).toFixed(1);
  const valueText = `${sign}${num}${unit}`;
  const text = period ? `${valueText} ${period}` : valueText;

  return {
    text,
    symbol: SYMBOL[direction],
    tone,
    className: cn('kpi-delta', TONE_CLASS[tone]),
  };
}
