// ============================================================
// HR 模块数据层 (人枢) — 企管云
// 数据全部为静态模拟数据；颜色引用 Material/CSS 变量，禁止任意色值。
// ============================================================

export interface HRDepartment {
  id: string;
  name: string;
  head: string;
  headcount: number; // 编制人数
  color: string; // CSS 变量，如 var(--chart-1)
}

export interface HRStaff {
  id: number;
  code: string; // 工号 LC+4位
  name: string;
  department: string;
  position: string;
  entryDate: string; // YYYY-MM-DD
  status: '在职' | '离职';
}

export interface HRAttendanceRecord {
  month: string;
  rate: number; // 出勤率 %
  late: number;
  leave: number;
  overtime: number; // 小时
}

export interface HRPayrollRecord {
  dept: string;
  headcount: number;
  avgSalary: number; // 人均月薪
  color: string;
}

export interface HRRecruitPosition {
  id: number;
  title: string;
  dept: string;
  urgency: '紧急' | '普通' | '低';
  candidates: number;
  interviewed: number;
  offered: number;
  planned: number; // 计划招聘人数
  budget: string;
}

export interface HRPerformanceRecord {
  dept: string;
  S: number;
  A: number;
  B: number;
  C: number;
  D: number;
}

// ------------------------------------------------------------
// 部门
// ------------------------------------------------------------
export const hrDepartments: HRDepartment[] = [
  { id: 'tech', name: '技术部', head: '张明远', headcount: 38, color: 'var(--chart-1)' },
  { id: 'product', name: '产品部', head: '林若溪', headcount: 16, color: 'var(--chart-2)' },
  { id: 'market', name: '市场部', head: '陈思宇', headcount: 22, color: 'var(--chart-3)' },
  { id: 'sales', name: '销售部', head: '王建国', headcount: 25, color: 'var(--chart-4)' },
  { id: 'finance', name: '财务部', head: '赵雅琴', headcount: 8, color: 'var(--chart-5)' },
  { id: 'hr_admin', name: '人事行政部', head: '周雨婷', headcount: 12, color: 'var(--chart-8)' },
];

// ------------------------------------------------------------
// 考勤（1月-6月）
// ------------------------------------------------------------
export const hrAttendance: HRAttendanceRecord[] = [
  { month: '1月', rate: 95.2, late: 18, leave: 12, overtime: 168 },
  { month: '2月', rate: 94.8, late: 21, leave: 14, overtime: 175 },
  { month: '3月', rate: 96.1, late: 17, leave: 11, overtime: 160 },
  { month: '4月', rate: 96.5, late: 16, leave: 10, overtime: 158 },
  { month: '5月', rate: 96.8, late: 17, leave: 11, overtime: 167 },
  { month: '6月', rate: 97.3, late: 14, leave: 9, overtime: 152 },
];

// ------------------------------------------------------------
// 薪酬（6 部门）
// ------------------------------------------------------------
export const hrPayroll: HRPayrollRecord[] = [
  { dept: '技术部', headcount: 38, avgSalary: 28800, color: 'var(--chart-1)' },
  { dept: '产品部', headcount: 16, avgSalary: 21800, color: 'var(--chart-2)' },
  { dept: '市场部', headcount: 22, avgSalary: 16500, color: 'var(--chart-3)' },
  { dept: '销售部', headcount: 25, avgSalary: 19900, color: 'var(--chart-4)' },
  { dept: '财务部', headcount: 8, avgSalary: 16800, color: 'var(--chart-5)' },
  { dept: '人事行政部', headcount: 12, avgSalary: 13800, color: 'var(--chart-8)' },
];

// ------------------------------------------------------------
// 招聘（8 在招岗位）
// ------------------------------------------------------------
export const hrRecruitPositions: HRRecruitPosition[] = [
  { id: 1, title: '高级后端工程师', dept: '技术部', urgency: '紧急', candidates: 12, interviewed: 5, offered: 2, planned: 3, budget: '25-35K' },
  { id: 2, title: '数据工程师', dept: '技术部', urgency: '紧急', candidates: 8, interviewed: 3, offered: 1, planned: 2, budget: '22-32K' },
  { id: 3, title: 'UI/UX设计师', dept: '产品部', urgency: '普通', candidates: 18, interviewed: 7, offered: 0, planned: 1, budget: '18-25K' },
  { id: 4, title: '大客户经理', dept: '销售部', urgency: '紧急', candidates: 6, interviewed: 2, offered: 0, planned: 2, budget: '20-30K' },
  { id: 5, title: '品牌策划', dept: '市场部', urgency: '普通', candidates: 15, interviewed: 6, offered: 1, planned: 1, budget: '15-22K' },
  { id: 6, title: '财务分析师', dept: '财务部', urgency: '普通', candidates: 9, interviewed: 3, offered: 0, planned: 1, budget: '14-20K' },
  { id: 7, title: '测试工程师', dept: '技术部', urgency: '普通', candidates: 11, interviewed: 4, offered: 1, planned: 2, budget: '16-24K' },
  { id: 8, title: 'HR专员', dept: '人事行政部', urgency: '低', candidates: 24, interviewed: 9, offered: 2, planned: 2, budget: '10-16K' },
];

// ------------------------------------------------------------
// 绩效（2026 Q2，6 部门，合计 S10/A38/B53/C17/D3 = 121）
// ------------------------------------------------------------
export const hrPerformance: HRPerformanceRecord[] = [
  { dept: '技术部', S: 3, A: 12, B: 18, C: 4, D: 1 },
  { dept: '产品部', S: 2, A: 5, B: 7, C: 2, D: 0 },
  { dept: '市场部', S: 1, A: 6, B: 11, C: 3, D: 1 },
  { dept: '销售部', S: 2, A: 8, B: 13, C: 2, D: 0 },
  { dept: '财务部', S: 1, A: 3, B: 3, C: 1, D: 0 },
  { dept: '人事行政部', S: 1, A: 4, B: 1, C: 5, D: 1 },
];

// ------------------------------------------------------------
// 员工花名册（121 人，确定性生成，避免 SSR/CSR 不一致）
// ------------------------------------------------------------
const DEPT_COUNTS: Record<string, number> = {
  技术部: 38,
  产品部: 16,
  市场部: 22,
  销售部: 25,
  财务部: 8,
  人事行政部: 12,
};

const DEPT_POSITIONS: Record<string, string[]> = {
  技术部: ['高级工程师', '后端工程师', '前端工程师', '测试工程师', '算法工程师', '架构师', '技术经理', '工程师'],
  产品部: ['高级产品经理', '产品经理', '产品助理', '交互设计师', '数据产品经理'],
  市场部: ['品牌经理', '市场专员', '内容运营', '活动策划', '新媒体运营', '市场经理'],
  销售部: ['大客户经理', '销售经理', '销售代表', '渠道经理', '销售总监'],
  财务部: ['财务总监', '会计', '出纳', '财务分析师', '财务经理'],
  人事行政部: ['HR经理', 'HR专员', '行政专员', '招聘专员', '薪酬专员'],
};

const SURNAMES = [
  '张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余',
];

const GIVEN = [
  '明远', '若溪', '思宇', '建国', '雅琴', '雨婷', '志强', '芳', '伟', '磊',
  '军', '洋', '勇', '艳', '杰', '娟', '霞', '平', '刚', '桂英',
  '婷', '超', '敏', '静', '涛', '欣', '宇', '浩然', '嘉', '璐',
];

function pad(n: number, len: number): string {
  return n.toString().padStart(len, '0');
}

function buildStaff(): HRStaff[] {
  const list: HRStaff[] = [];
  let idx = 0;
  for (const dept of Object.keys(DEPT_COUNTS)) {
    const count = DEPT_COUNTS[dept];
    const positions = DEPT_POSITIONS[dept];
    for (let i = 0; i < count; i++) {
      idx += 1;
      const name = SURNAMES[(idx * 3) % SURNAMES.length] + GIVEN[(idx * 7) % GIVEN.length];
      const position = positions[i % positions.length];
      const year = 2019 + (idx % 8); // 2019..2026，部分 2026 入职 → 不足1年
      const month = 1 + (idx % 12);
      const day = 1 + (idx % 28);
      list.push({
        id: idx,
        code: `LC${pad(1000 + idx, 4)}`,
        name,
        department: dept,
        position,
        entryDate: `${year}-${pad(month, 2)}-${pad(day, 2)}`,
        status: '在职',
      });
    }
  }
  return list;
}

export const hrStaffAll: HRStaff[] = buildStaff();

// 部门核心岗位（去重前 4 个）
export function getDeptTopPositions(deptName: string, top = 4): string[] {
  const seen = new Set<string>();
  for (const s of hrStaffAll) {
    if (s.department === deptName) seen.add(s.position);
  }
  return Array.from(seen).slice(0, top);
}

// 公司在职人数（全部在职）
export const hrActiveCount = hrStaffAll.filter((s) => s.status === '在职').length;

// 月度薪酬总额（元）
export const hrPayrollTotal = hrPayroll.reduce((sum, d) => sum + d.avgSalary * d.headcount, 0);
// 人均月薪（加权，元）
export const hrAvgSalaryWeighted = Math.round(
  hrPayroll.reduce((sum, d) => sum + d.avgSalary * d.headcount, 0) / hrActiveCount
);

// 营收与人力成本效益（年报口径；与 HrManageView 人力模块人均营收¥186万自洽；数据均为静态模拟）
export const hrRevenuePerCapita = 186; // 人均营收：万元/人·年
export const hrRevenueTotal = hrRevenuePerCapita * hrActiveCount; // 年营收：万元
export const hrAnnualPayroll = (hrPayrollTotal / 10000) * 12; // 年人力成本（薪酬总额年化）：万元
export const hrCostRevenueRatio = ((hrAnnualPayroll / hrRevenueTotal) * 100).toFixed(1); // 人力成本营收比：%

// 绩效汇总
export const hrPerfTotal = hrPerformance.reduce(
  (acc, d) => ({
    S: acc.S + d.S,
    A: acc.A + d.A,
    B: acc.B + d.B,
    C: acc.C + d.C,
    D: acc.D + d.D,
  }),
  { S: 0, A: 0, B: 0, C: 0, D: 0 }
);
export const hrPerfExcellentRate = ((hrPerfTotal.S + hrPerfTotal.A) / hrActiveCount * 100).toFixed(1);

// 招聘汇总
export const hrRecruitTotals = {
  candidates: hrRecruitPositions.reduce((s, p) => s + p.candidates, 0),
  interviewed: hrRecruitPositions.reduce((s, p) => s + p.interviewed, 0),
  offered: hrRecruitPositions.reduce((s, p) => s + p.offered, 0),
  urgent: hrRecruitPositions.filter((p) => p.urgency === '紧急').length,
};

// ------------------------------------------------------------
// 上市公司人力管理（人力资本 / 长期激励 / 董监高薪酬 / 人才梯队 / 合规披露）
// 口径：年报与 ESG 信息披露；数据均为静态模拟。
// ------------------------------------------------------------
export interface HREduMix {
  level: string;
  count: number;
}
export interface HRAgeMix {
  range: string;
  count: number;
}
export interface HRCostTrend {
  year: string;
  cost: number; // 万元
}
export interface HREquityPlan {
  name: string;
  type: string;
  granted: string;
  covered: number;
  progress: number; // 解锁 / 行权 / 实施进度 %
  color: string;
}
export interface HRExecComp {
  role: string;
  count: number;
  total: number; // 万元
}
export interface HRTalentCell {
  potential: string; // 高 / 中 / 基础
  perf: string; // 优 / 中 / 待改进
  count: number;
  highlight?: boolean;
}
export interface HRComplianceRow {
  label: string;
  value: string;
  pct: number;
  color: string;
}

// 学历结构（合计 121）
export const hrEduMix: HREduMix[] = [
  { level: '博士', count: 6 },
  { level: '硕士', count: 32 },
  { level: '本科', count: 58 },
  { level: '大专', count: 20 },
  { level: '其他', count: 5 },
];

// 年龄结构（合计 121）
export const hrAgeMix: HRAgeMix[] = [
  { range: '25岁以下', count: 14 },
  { range: '26-35岁', count: 52 },
  { range: '36-45岁', count: 41 },
  { range: '46岁以上', count: 14 },
];

// 人力成本趋势（年报口径，万元）
export const hrCostTrend: HRCostTrend[] = [
  { year: '2021', cost: 2180 },
  { year: '2022', cost: 2450 },
  { year: '2023', cost: 2680 },
  { year: '2024', cost: 2890 },
  { year: '2025', cost: 3010 },
  { year: '2026', cost: 3124 },
];

// 长期激励计划（限制性股票 / 股票期权 / 员工持股计划）
export const hrEquityPlans: HREquityPlan[] = [
  { name: '限制性股票激励计划', type: '限制性股票', granted: '80万股', covered: 60, progress: 68, color: 'var(--chart-1)' },
  { name: '股票期权计划', type: '股票期权', granted: '50万份', covered: 26, progress: 42, color: 'var(--chart-4)' },
  { name: '员工持股计划（ESOP）', type: '员工持股计划', granted: '2,000万元', covered: 45, progress: 55, color: 'var(--chart-3)' },
];
export const hrEquityCovered = 86; // 去重后覆盖人数
export const hrEquityCoverageRate = ((hrEquityCovered / hrActiveCount) * 100).toFixed(0); // %

// 董监高薪酬（年报披露，万元）
export const hrExecComp: HRExecComp[] = [
  { role: '董事长', count: 1, total: 480 },
  { role: '总经理', count: 1, total: 360 },
  { role: '财务总监', count: 1, total: 180 },
  { role: '董事会秘书', count: 1, total: 150 },
  { role: '其他董事', count: 4, total: 240 },
  { role: '监事', count: 3, total: 120 },
  { role: '其他高管', count: 6, total: 420 },
];
export const hrExecCompTotal = hrExecComp.reduce((s, r) => s + r.total, 0);

// 人才九宫格（绩效 × 潜力，合计 121）
export const hrTalentGrid: HRTalentCell[] = [
  { potential: '高', perf: '优', count: 14, highlight: true },
  { potential: '高', perf: '中', count: 9 },
  { potential: '高', perf: '待改进', count: 3 },
  { potential: '中', perf: '优', count: 12 },
  { potential: '中', perf: '中', count: 38 },
  { potential: '中', perf: '待改进', count: 7 },
  { potential: '基础', perf: '优', count: 4 },
  { potential: '基础', perf: '中', count: 22 },
  { potential: '基础', perf: '待改进', count: 12 },
];
export const hrHiPoCount = hrTalentGrid
  .filter((c) => c.potential === '高')
  .reduce((s, c) => s + c.count, 0);
export const hrSuccession = { keyRoles: 18, covered: 15, rate: 83.3 };

// 合规与披露（ESG / 年报人力指标）
export const hrCompliance: HRComplianceRow[] = [
  { label: '劳动合同签订率', value: '100%', pct: 100, color: 'var(--chart-3)' },
  { label: '社保公积金缴纳率', value: '100%', pct: 100, color: 'var(--chart-3)' },
  { label: '核心人才保留率', value: '95%', pct: 95, color: 'var(--chart-1)' },
  { label: '培训计划完成率', value: '92%', pct: 92, color: 'var(--chart-4)' },
  { label: '女性管理者占比', value: '34%', pct: 34, color: 'var(--chart-2)' },
];

export const hrTraining = { invest: 186, hoursPerCap: 42, certRate: 88 };

// ------------------------------------------------------------
// AI 数据分析洞察（演示用：基于现有数据派生的多维洞察 / 预测 / 风险预警）
// 全部静态模拟；颜色仅引用 Material/CSS 变量，禁止任意色值。
// ------------------------------------------------------------
export type AiInsightLevel = 'risk' | 'warn' | 'opportunity' | 'positive' | 'info';

export interface AiInsight {
  id: string;
  level: AiInsightLevel;
  title: string;
  detail: string;
  metric?: string;
  delta?: string;
  deltaUp?: boolean;
  action?: string;
}

// 技术部薪酬占总额比例（由薪酬数据派生）
export const hrTechPayrollShare = Math.round(
  (hrPayroll[0].avgSalary * hrPayroll[0].headcount) / hrPayrollTotal * 100
);

// 各视图 AI 综合健康度评分（0-100，演示用）
export const hrAiScore: Record<string, number> = {
  'hr-overview': 82,
  'hr-org': 78,
  'hr-staff': 80,
  'hr-attendance': 85,
  'hr-payroll': 76,
  'hr-recruit': 74,
  'hr-perf': 81,
  'hr-manage': 88,
};

// 各业务模块 AI 洞察（key = 左侧导航 viewId）
export const hrAiInsights: Record<string, AiInsight[]> = {
  'hr-overview': [
    { id: 'o1', level: 'opportunity', title: '人效预测', detail: '模型预测下季度人均营收约 ¥196 万，环比提升，高于行业均值 ¥172 万，人力资本效能领先。', metric: '¥196万', delta: '+5.4%', deltaUp: true, action: '维持技术投入强度' },
    { id: 'o2', level: 'risk', title: '离职风险预警', detail: '流失预测模型识别 11 名高流失风险员工（司龄<1年且绩效B以下占比偏高），集中在技术部与市场部。', metric: '11人', action: '启动关键人才保留面谈' },
    { id: 'o3', level: 'warn', title: '关键岗位到岗', detail: '3 个紧急岗位平均招聘周期预计 38 天，超内部 SLA（30 天），建议开启内推绿色通道。', metric: '38天', action: '内推奖金上浮 30%' },
    { id: 'o4', level: 'positive', title: '薪酬竞争力', detail: '整体薪酬处市场 65 分位，技术岗达 75 分位，对核心人才具备外部吸引力。', metric: '65P' },
    { id: 'o5', level: 'info', title: '继任覆盖', detail: `18 个关键岗位中 15 个已有继任者，覆盖率 ${hrSuccession.rate}%，剩余 3 个建议 6 个月内补齐。`, metric: `${hrSuccession.rate}%` },
  ],
  'hr-org': [
    { id: 'g1', level: 'warn', title: '管理跨度预警', detail: '技术部管理跨度 9.5 人偏高（公司均值 7.2），一线负责人负荷重，建议增设 TL 岗分流。', metric: '9.5', action: '增设 2 名技术 TL' },
    { id: 'g2', level: 'risk', title: '关键人风险', detail: '人事行政部负责人岗位暂无副职备份，单点风险较高，继任准备度不足。', action: '指定备份并轮岗培养' },
    { id: 'g3', level: 'info', title: '人力成本集中度', detail: `技术部薪酬占总额 ${hrTechPayrollShare}%，高于其营收贡献占比，关注人均产出。`, metric: `${hrTechPayrollShare}%` },
    { id: 'g4', level: 'positive', title: '组织扁平度', detail: '当前为 CEO→部门 两级架构，决策链路短、响应快，适配 120 人规模。', metric: '2 级' },
  ],
  'hr-staff': [
    { id: 's1', level: 'info', title: '人才年龄结构', detail: `26-35 岁骨干 ${hrAgeMix[1].count} 人占 ${(hrAgeMix[1].count / hrActiveCount * 100).toFixed(0)}%，核心年龄段稳定。`, metric: `${(hrAgeMix[1].count / hrActiveCount * 100).toFixed(0)}%` },
    { id: 's2', level: 'risk', title: '司龄节点风险', detail: '28 名员工将于明年达到 5 年司龄节点，历史该节点离职率偏高，建议提前锁定保留。', metric: '28人', action: '定制保留方案' },
    { id: 's3', level: 'opportunity', title: '高潜识别', detail: `九宫格高潜人才 ${hrHiPoCount} 人，其中 14 人处绩效优区，优先纳入继任池重点培养。`, metric: `${hrHiPoCount}人` },
    { id: 's4', level: 'warn', title: '编制缺口', detail: '技术部等核心部门仍存在隐性缺编，影响交付节奏，建议结合招聘漏斗加速补位。', metric: '3岗', action: '同步推进紧急招聘' },
  ],
  'hr-attendance': [
    { id: 'a1', level: 'risk', title: '异常考勤聚类', detail: '技术部 6 月迟到 18 次居首，集中于 9:30-10:00，弹性工时或可降低异常。', metric: '18次', action: '试点弹性打卡' },
    { id: 'a2', level: 'warn', title: '加班强度', detail: '6 月加班 152 小时，技术部占 58% 且连续 3 月上升，存在过载风险。', metric: '152h', action: '评估工作负载再平衡' },
    { id: 'a3', level: 'opportunity', title: '出勤率预测', detail: '模型预测 7 月出勤率 97.6%，环比 +0.3pp，暑期请假高峰可控。', metric: '97.6%', delta: '+0.3pp', deltaUp: true },
    { id: 'a4', level: 'positive', title: '合规完备', detail: '考勤数据完整率 100%，无连续旷工超 3 日记录，劳动合规无异常。', metric: '100%' },
  ],
  'hr-payroll': [
    { id: 'p1', level: 'risk', title: '薪酬倒挂检测', detail: '检出 2 例同岗新进薪酬高于资深员工（产品部），建议校准职级带宽。', metric: '2例', action: '启动带宽复核' },
    { id: 'p2', level: 'warn', title: '内部公平性', detail: '薪酬带宽合规率 88%，财务部偏离度相对较大，需关注同岗同酬。', metric: '88%', action: '季度薪酬审计' },
    { id: 'p3', level: 'opportunity', title: '调薪预算建议', detail: '建议 Q3 调薪预算 ¥42 万，重点覆盖技术与高潜人才，预期 ROI 最高。', metric: '¥42万', action: '倾斜高潜序列' },
    { id: 'p4', level: 'info', title: '外部竞争力', detail: '技术岗市场分位 75P 具吸引力，销售/市场岗约 55P，存在外部挖角风险。', metric: '75P' },
  ],
  'hr-recruit': [
    { id: 'r1', level: 'risk', title: 'Offer 接受率预警', detail: '3 个紧急岗位 Offer 接受率仅 50%，低于基准 70%，薪酬竞争力待提升。', metric: '50%', action: '优化薪酬包' },
    { id: 'r2', level: 'warn', title: '招聘周期', detail: '高级后端工程师平均招聘周期 46 天，超 SLA 30 天，建议内推加码。', metric: '46天', action: '内推奖金上浮' },
    { id: 'r3', level: 'opportunity', title: '渠道效能', detail: '内推渠道转化率 28% 居首，高于猎头 16% 与官网 12%，建议提高内推激励。', metric: '28%' },
    { id: 'r4', level: 'info', title: '漏斗转化', detail: '整体 简历→面试 21%、面试→Offer 14%，面试环节优于行业中位（18%/16%）。', metric: '21%→14%' },
  ],
  'hr-perf': [
    { id: 'f1', level: 'warn', title: '分布健康度', detail: '强制分布符合度 91%，人事行政部 C+D 占比 60% 偏高，建议绩效辅导。', metric: '91%', action: '一对一改进计划' },
    { id: 'f2', level: 'risk', title: '低绩效改进', detail: `${hrPerfTotal.C + hrPerfTotal.D} 人处 C+D，其中 3 人连续两季待改进，触发 PIP。`, metric: `${hrPerfTotal.C + hrPerfTotal.D}人`, action: '启动 PIP' },
    { id: 'f3', level: 'opportunity', title: '高绩效保留', detail: `S 级 ${hrPerfTotal.S} 人市场抢手，建议以股权激励锁定 8 人，降低流失。`, metric: `${hrPerfTotal.S}人`, action: '纳入激励池' },
    { id: 'f4', level: 'info', title: '九宫格缺口', detail: '高潜×优 14 人充足，但高潜×待改进 3 人需加速培养，避免高潜流失。', metric: '3人' },
  ],
  'hr-manage': [
    { id: 'm1', level: 'positive', title: '披露完备度', detail: '人力资本相关披露项 12/12 齐备，符合上市规则与交易所要求。', metric: '12/12' },
    { id: 'm2', level: 'warn', title: '股权激励充分性', detail: `长期激励覆盖 ${hrEquityCoverageRate}%，核心技术骨干仍有 14 人未纳入，建议下期扩面。`, metric: `${hrEquityCoverageRate}%`, action: '扩面至核心骨干' },
    { id: 'm3', level: 'risk', title: '董监高薪酬偏离', detail: '董事长薪酬处同业 25 分位偏低，存在薪酬吸引力与治理风险。', metric: '25P', action: '参照同业校准' },
    { id: 'm4', level: 'opportunity', title: '继任补齐', detail: `关键岗位继任覆盖 ${hrSuccession.rate}%，3 个缺口建议 6 个月内补齐。`, metric: `${hrSuccession.rate}%`, action: '锁定继任人选' },
    { id: 'm5', level: 'positive', title: 'ESG 表现', detail: '女性管理者占比 34% 高于行业 28%，培训完成率 92%，ESG 表现良好。', metric: '34%' },
  ],
};

// ------------------------------------------------------------
// 人事诊断模块（悬浮窗「AI 诊断」之人事模块，仅分析人事情况）
// 数字与现有 HR 数据自洽；颜色仅引用 Material/CSS 变量，禁止任意色值。
// ------------------------------------------------------------
export interface AiModule {
  module: string;
  status: '健康' | '需关注' | '预警';
  conclusion: string;
  analysisCount: number;
  warningCount: number;
  findings: string[];
}

export const hrDiagnosisModules: AiModule[] = [
  {
    module: '人才结构',
    status: '健康',
    conclusion: '全员 121 人，本科及以上占比 68%，技术序列占 42% 结构合理；但技术部管理跨度 9.5 偏大需关注。',
    analysisCount: 5, warningCount: 0,
    findings: ['✓ 本科及以上占比 68% · 结构合理', '! 技术部管理跨度 9.5 人偏高'],
  },
  {
    module: '招聘效能',
    status: '需关注',
    conclusion: '在招 8 个岗位，Offer 接受率仅 50%，平均周期 46 天偏长，内推占比 28% 仍有提升空间。',
    analysisCount: 4, warningCount: 2,
    findings: ['! Offer 接受率 50% 低于基准 70%', '! 平均招聘周期 46 天超内部 SLA'],
  },
  {
    module: '考勤合规',
    status: '健康',
    conclusion: '月度出勤率 97.3%，异常考勤 18 次均已处理，加班强度 152h 处于可控区间。',
    analysisCount: 4, warningCount: 0,
    findings: ['✓ 出勤率 97.3% · 达标', '! 加班 152h 连续 3 月上升'],
  },
  {
    module: '薪酬公平',
    status: '需关注',
    conclusion: '内部公平性指数 88，检出 2 例薪酬倒挂；外部竞争力技术岗 75P、市场岗约 55P。',
    analysisCount: 4, warningCount: 1,
    findings: ['! 同岗薪酬倒挂 2 例', '✓ 技术岗市场分位 75P'],
  },
  {
    module: '绩效分布',
    status: '预警',
    conclusion: '强制分布符合度 91%，但 C+D 低绩效 20 人需改进计划，高潜 26 人需锁定保留。',
    analysisCount: 4, warningCount: 1,
    findings: ['! 低绩效(C/D) 20 人待改进', '✓ 高潜人才 26 人已识别'],
  },
  {
    module: '员工关系与离职',
    status: '预警',
    conclusion: '年离职率 12% 高于行业，核心人才保留率 95% 良好；明年 28 人达 5 年司龄节点需提前保留。',
    analysisCount: 5, warningCount: 2,
    findings: ['! 年离职率 12% 高于行业', '! 28 人临近 5 年司龄流失节点'],
  },
  {
    module: '合规与披露',
    status: '健康',
    conclusion: '劳动合同/社保公积金签订缴纳率 100%，上市披露 12/12 完备，女性管理者占比 34%。',
    analysisCount: 5, warningCount: 0,
    findings: ['✓ 劳动合同/社保缴纳率 100%', '✓ 上市人力披露 12/12 完备'],
  },
];
