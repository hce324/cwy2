import { describe, it, expect } from 'vitest';
import { fmtAmount, fmtMoney, fmtCompact, fmtDate, formatDelta } from './format';

describe('fmtAmount (自适应 亿/万/元 + ¥)', () => {
  it('默认 0 显示为 ¥0.00', () => {
    expect(fmtAmount(0)).toBe('¥0.00');
    expect(fmtAmount(null)).toBe('¥0.00');
    expect(fmtAmount(undefined)).toBe('¥0.00');
    expect(fmtAmount('')).toBe('¥0.00');
  });

  it('emptyIfZero 时 0 / 非法返回空串', () => {
    expect(fmtAmount(0, { emptyIfZero: true })).toBe('');
    expect(fmtAmount(null, { emptyIfZero: true })).toBe('');
  });

  it('小数不缩放', () => {
    expect(fmtAmount(9999)).toBe('¥9,999.00');
  });

  it('元级强制 2 位小数（0 → ¥0.00）', () => {
    expect(fmtAmount(0)).toBe('¥0.00');
  });

  it('万级缩放', () => {
    expect(fmtAmount(12341)).toBe('¥1.2万');
  });

  it('亿级缩放', () => {
    expect(fmtAmount(1268000000)).toBe('¥12.68亿');
  });

  it('负数保留符号', () => {
    expect(fmtAmount(-1268000000)).toBe('¥-12.68亿');
  });

  it('接受字符串入参', () => {
    expect(fmtAmount('12341')).toBe('¥1.2万');
  });

  it('prefix 可去掉', () => {
    expect(fmtAmount(12341, { prefix: '' })).toBe('1.2万');
  });
});

describe('fmtMoney (精确 2 位 + ¥，不缩放)', () => {
  it('精确 2 位小数 + ¥', () => {
    expect(fmtMoney(1234.5)).toBe('¥1,234.50');
  });

  it('默认 0 显示为 ¥0.00', () => {
    expect(fmtMoney(0)).toBe('¥0.00');
  });

  it('emptyIfZero + 去前缀（余额表风格）', () => {
    expect(fmtMoney(0, { emptyIfZero: true, prefix: '' })).toBe('');
    expect(fmtMoney(1234.5, { prefix: '' })).toBe('1,234.50');
  });

  it('接受字符串入参', () => {
    expect(fmtMoney('1234.5')).toBe('¥1,234.50');
  });
});

describe('fmtCompact (无前缀，坐标轴)', () => {
  it('亿级', () => {
    expect(fmtCompact(1268000000)).toBe('12.7亿');
  });
  it('万级 toFixed(0)', () => {
    expect(fmtCompact(12341)).toBe('1万');
  });
  it('元级', () => {
    expect(fmtCompact(999)).toBe('999');
  });
  it('负数', () => {
    expect(fmtCompact(-12341)).toBe('-1万');
  });
});

describe('fmtDate (YYYY-MM-DD)', () => {
  it('Date 对象', () => {
    expect(fmtDate(new Date('2026-07-28T12:00:00Z'))).toBe('2026-07-28');
  });
  it('ISO 字符串', () => {
    expect(fmtDate('2026-07-28T10:00:00')).toBe('2026-07-28');
  });
  it('空值返回空串', () => {
    expect(fmtDate(null)).toBe('');
    expect(fmtDate('')).toBe('');
    expect(fmtDate(undefined)).toBe('');
  });
});

describe('formatDelta (KPI 涨跌)', () => {
  it('正增长 + 同比 + 好', () => {
    const r = formatDelta({ value: 8.6, unit: '%', period: '同比', good: true });
    expect(r.text).toBe('+8.6% 同比');
    expect(r.tone).toBe('up');
    expect(r.symbol).toBe('▲');
  });

  it('负增长 + 坏', () => {
    const r = formatDelta({ value: -1.8, good: false });
    expect(r.text).toBe('−1.8%'); // 真减号 U+2212
    expect(r.tone).toBe('danger');
  });

  it('中性默认', () => {
    const r = formatDelta({ value: 5 });
    expect(r.text).toBe('+5.0%');
  });
});
