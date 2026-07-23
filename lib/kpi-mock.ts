// KPI card trend data for OverviewView.
// Monthly series, YoY baselines and risk ratios used by the KPI sparklines.
// Kept as a plain data module (not a component) to respect the project's
// "no custom components" rule while separating mock data from the view.

export const kpiMonths = [
  '2025.08', '2025.09', '2025.10', '2025.11', '2025.12',
  '2026.01', '2026.02', '2026.03', '2026.04', '2026.05', '2026.06', '2026.07',
];

const revenueSeries = [1024.8, 1078.3, 1123.5, 1156.7, 1201.3, 1187.6, 1098.2, 1145.9, 1198.4, 1234.1, 1268.0, 1268.0];
// YoY baseline (~ -8.6% vs this year)
const revenueYoY = revenueSeries.map((v) => +(v / 1.086).toFixed(1));

const profitSeries = [165.2, 175.6, 182.4, 188.9, 195.1, 192.8, 178.5, 188.1, 198.7, 207.3, 214.7, 214.7];
// YoY baseline (~ -12.4% vs this year)
const profitYoY = profitSeries.map((v) => +(v / 1.124).toFixed(1));

const netMarginSeries = [16.1, 16.3, 16.2, 16.3, 16.2, 16.2, 16.3, 16.4, 16.6, 16.8, 16.9, 16.9];
// Gross margin (%) — declining from 41.8% to 40.0%
const grossMarginSeries = [41.8, 41.6, 41.5, 41.3, 41.2, 41.0, 40.9, 40.7, 40.6, 40.4, 40.2, 40.0];
const grossMarginBenchmark = 41.0;

// Recent 6 months operating cash flow (万元)
const cashFlowMonthly = [42.1, 38.5, 45.2, 51.0, 49.3, 54.36];

// Risk card progress ratios (%)
export const overdueRatio = 42.0;
export const fundCoverage = 95.25; // 期末842.66 / 应付884.66

export const revenueTrend = kpiMonths.map((month, i) => ({
  month,
  value: revenueSeries[i],
  yoy: revenueYoY[i],
}));

export const profitTrend = kpiMonths.map((month, i) => ({
  month,
  value: profitSeries[i],
  yoy: profitYoY[i],
}));

export const marginTrend = kpiMonths.map((month, i) => ({
  month,
  net: netMarginSeries[i],
  gross: grossMarginSeries[i],
  bench: grossMarginBenchmark,
}));

export const cashFlowTrend = cashFlowMonthly.map((value, idx) => ({
  idx,
  value,
}));
