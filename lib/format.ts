// ============================================================================
// 全局统一格式化器（深模块）
// ----------------------------------------------------------------------------
// 收敛原先散落在 ~18 个视图里的本地 fmtAmount / fmtDate / fmtCompact 副本，
// 以及从 kpi.ts 并入的 formatDelta。
//
// 设计要点（经架构评审 /grilling 确认）：
//  - 金额有两种语义需求，故暴露两个格式化器：
//      · fmtAmount  —— 自适应 亿/万/元 + ¥ 前缀，用于 KPI / 汇总卡（防大数撑破）。
//      · fmtMoney   —— 精确 2 位 + ¥ 前缀、不缩放，用于账簿 / 余额表 / 凭证行（看准数）。
//      · fmtCompact —— 无前缀，用于图表坐标轴刻度。
//  - 所有函数入参宽松（unknown），内部安全转换，
//    替换旧 unknown 版零改动。
//  - 0 值默认显示 ¥0.00 / 0.00；传 { emptyIfZero: true } 可返回空串（兼容旧 BalanceView）。
// ============================================================================

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------- 安全转换
function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.\-eE]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

// ---------------------------------------------------------------- 金额：自适应
export interface AmountOpts {
  /** 值为 0（或不可解析）时返回空串而非 ¥0.00，兼容旧 BalanceView 的空单元格风格 */
  emptyIfZero?: boolean;
  /** 金额前缀，默认 '¥'；传 '' 可去掉（如余额表历史无 ¥ 前缀） */
  prefix?: string;
}

/**
 * 自适应金额格式化（入参单位：元）。
 * 大数自动升级到 万 / 亿，避免超长字符串撑破卡片与图表。
 */
export function fmtAmount(
  value: unknown,
  opts?: AmountOpts,
): string {
  const n = toNum(value);
  const prefix = opts?.prefix ?? '¥';
  if (!Number.isFinite(n)) return opts?.emptyIfZero ? '' : `${prefix}0.00`;
  if (n === 0 && opts?.emptyIfZero) return '';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e8) return `${prefix}${sign}${(abs / 1e8).toFixed(2)}亿`;
  if (abs >= 1e4) return `${prefix}${sign}${(abs / 1e4).toLocaleString('zh-CN', { maximumFractionDigits: 1 })}万`;
  return `${prefix}${sign}${abs.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * 精确金额格式化（入参单位：元）。
 * 2 位小数 + ¥ 前缀、**不缩放**，用于账簿 / 余额表 / 凭证行等需要看准数的场景。
 */
export function fmtMoney(
  value: unknown,
  opts?: AmountOpts,
): string {
  const n = toNum(value);
  const prefix = opts?.prefix ?? '¥';
  if (!Number.isFinite(n)) return opts?.emptyIfZero ? '' : `${prefix}0.00`;
  if (n === 0 && opts?.emptyIfZero) return '';
  return `${prefix}${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * 紧凑金额格式化（无 ¥ 前缀），用于图表坐标轴刻度 / 图内标签。
 */
export function fmtCompact(value: unknown): string {
  const n = toNum(value);
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(1)}亿`;
  if (abs >= 1e4) return `${sign}${(abs / 1e4).toFixed(0)}万`;
  return `${sign}${abs.toFixed(0)}`;
}

// ---------------------------------------------------------------- 日期
/**
 * 日期格式化：接受 unknown，统一输出 YYYY-MM-DD。
 * 非法 / 空值返回空串。
 */
export function fmtDate(d: unknown): string {
  if (d === null || d === undefined || d === '') return '';
  if (d instanceof Date) {
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
}

// ---------------------------------------------------------------- KPI 涨跌（自 kpi.ts 并入）
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
