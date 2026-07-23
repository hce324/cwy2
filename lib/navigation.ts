import { Role, MenuGroup, ViewId } from './types';

// ============================================================
// Role-based navigation menus
// ============================================================

export const navMenus: Record<Role, MenuGroup[]> = {
  '财务负责人': [
    {
      label: '首页',
      items: [
        { viewId: 'overview', label: '财务总览' },
        { viewId: 'workbench', label: '我的工作台' },
      ],
    },
    {
      label: '财务模块',
      items: [
        { viewId: 'workbench', label: '工作台首页' },
        { viewId: 'hz-documents', label: '智能采集' },
        { viewId: 'hz-sourcevoucher', label: '原始凭证' },
        { viewId: 'hz-cashmanagement', label: '资金收付' },
        { viewId: 'hz-voucherquery', label: '查询凭证' },
        { viewId: 'hz-reconcile', label: '平台对账' },
        { viewId: 'hz-bankrecon', label: '银行对账' },
        { viewId: 'hz-ledger', label: '会计账簿' },
        { viewId: 'hz-balance', label: '科目余额表' },
        { viewId: 'accounting-check', label: '凭证与期间校验' },
        { viewId: 'hz-reports', label: '报表管理' },
        { viewId: 'hz-tax', label: '纳税申报' },
        { viewId: 'hz-settings', label: '系统连接' },
      ],
    },
    {
      label: '业务管理',
      items: [
        { viewId: 'cash', label: '资金管理' },
        { viewId: 'receivable', label: '应收管理', badge: 6 },
        { viewId: 'payable', label: '应付与付款', badge: 4 },
        { viewId: 'inventory', label: '产销管理' },
        { viewId: 'budget', label: '预算执行' },
        { viewId: 'profit', label: '利润管理' },
      ],
    },
    {
      label: '协同工作',
      items: [
        { viewId: 'risk', label: '风险与异常', badge: 13 },
      ],
    },
  ],
  '财务专员': [
    {
      label: '首页',
      items: [
        { viewId: 'workbench', label: '我的工作台' },
      ],
    },
    {
      label: '财务模块',
      items: [
        { viewId: 'workbench', label: '工作台首页' },
        { viewId: 'hz-documents', label: '智能采集' },
        { viewId: 'hz-sourcevoucher', label: '原始凭证' },
        { viewId: 'hz-voucher', label: '记账凭证' },
        { viewId: 'hz-voucherorganize', label: '整理凭证' },
        { viewId: 'hz-vouchervoid', label: '作废凭证' },
        { viewId: 'hz-voucherquery', label: '查询凭证' },
        { viewId: 'hz-ledger', label: '会计账簿' },
        { viewId: 'hz-balance', label: '科目余额表' },
        { viewId: 'subjects', label: '会计科目' },
        { viewId: 'opening-balance', label: '期初余额' },
        { viewId: 'business-entry', label: '业务录入' },
        { viewId: 'asset-management', label: '固定资产管理' },
        { viewId: 'inventory-management', label: '库存管理' },
        { viewId: 'accounting-check', label: '凭证与期间校验' },
        { viewId: 'hz-reports', label: '报表管理' },
        { viewId: 'hz-closing', label: '期末结转' },
        { viewId: 'hz-tax', label: '纳税申报' },
      ],
    },
    {
      label: '业务管理',
      items: [
        { viewId: 'receivable', label: '应收管理', badge: 6 },
        { viewId: 'profit', label: '利润管理' },
      ],
    },
    {
      label: '协同工作',
      items: [
        { viewId: 'closing', label: '月结任务', badge: 3 },
        { viewId: 'import', label: '数据导入' },
      ],
    },
  ],
  '出纳': [
    {
      label: '首页',
      items: [
        { viewId: 'workbench', label: '我的工作台' },
      ],
    },
    {
      label: '财务模块',
      items: [
        { viewId: 'workbench', label: '工作台首页' },
        { viewId: 'hz-documents', label: '智能采集' },
        { viewId: 'hz-cashmanagement', label: '资金收付' },
        { viewId: 'hz-voucher', label: '记账凭证' },
        { viewId: 'hz-bankrecon', label: '银行对账' },
        { viewId: 'hz-ledger', label: '会计账簿' },
        { viewId: 'business-entry', label: '业务录入' },
      ],
    },
    {
      label: '业务管理',
      items: [
        { viewId: 'cash', label: '资金管理' },
      ],
    },
    {
      label: '协同工作',
      items: [
        { viewId: 'import', label: '数据导入' },
      ],
    },
  ],
};

// Presentation mode extra menu (appended for all roles)
export const presentationMenuGroup: MenuGroup = {
  label: '方案与验收',
  items: [
    { viewId: 'blueprint', label: '角色与流程' },
    { viewId: 'data', label: '数据需求' },
    { viewId: 'boundary', label: '系统边界' },
  ],
};

// ============================================================
// View permissions
// ============================================================

export const viewPermissions: Record<ViewId, Role[]> = {
  overview: ['财务负责人'],
  workbench: ['财务负责人', '财务专员', '出纳'],
  cash: ['财务负责人', '出纳'],
  receivable: ['财务负责人', '财务专员'],
  payable: ['财务负责人'],
  inventory: ['财务负责人'],
  budget: ['财务负责人'],
  profit: ['财务负责人', '财务专员'],
  closing: ['财务专员'],
  risk: ['财务负责人'],
  import: ['财务专员', '出纳'],
  blueprint: ['财务负责人', '财务专员', '出纳'],
  data: ['财务负责人', '财务专员', '出纳'],
  boundary: ['财务负责人', '财务专员', '出纳'],
  'hz-documents': ['财务负责人', '财务专员', '出纳'],
  'hz-sourcevoucher': ['财务负责人', '财务专员'],
  'hz-cashmanagement': ['财务负责人', '出纳'],
  'hz-voucher': ['财务专员', '出纳'],
  'hz-voucherorganize': ['财务专员'],
  'hz-vouchervoid': ['财务专员'],
  'hz-voucherquery': ['财务负责人', '财务专员'],
  'hz-reconcile': ['财务负责人'],
  'hz-bankrecon': ['财务负责人', '出纳'],
  'hz-ledger': ['财务负责人', '财务专员', '出纳'],
  'hz-balance': ['财务负责人', '财务专员'],
  subjects: ['财务专员'],
  'opening-balance': ['财务专员'],
  'business-entry': ['财务专员', '出纳'],
  'asset-management': ['财务专员'],
  'inventory-management': ['财务专员'],
  'accounting-check': ['财务负责人', '财务专员'],
  'hz-reports': ['财务负责人', '财务专员'],
  'hz-closing': ['财务专员'],
  'hz-tax': ['财务负责人', '财务专员'],
  'hz-settings': ['财务负责人'],
};

// ============================================================
// View metadata
// ============================================================

export const viewMeta: Record<ViewId, {
  title: string;
  enLabel?: string;
  breadcrumb: string;
}> = {
  workbench: { title: '我的工作台', breadcrumb: '我的工作台' },
  overview: { title: '财务总览', breadcrumb: '财务总览' },
  cash: { title: '资金管理 — 资金账户与预测', breadcrumb: '资金管理' },
  receivable: { title: '应收管理 — 客户应收与催收', breadcrumb: '应收管理' },
  payable: { title: '应付与付款 — 付款申请与审批', breadcrumb: '应付与付款' },
  inventory: { title: '产销管理 · 财务经营视角 — 产销经营总览', breadcrumb: '产销管理' },
  budget: { title: '预算与费用 — 预算执行分析', breadcrumb: '预算执行' },
  profit: { title: '利润管理 · 收入与费用', breadcrumb: '利润管理' },
  closing: { title: '2026年7月月结', breadcrumb: '月结任务' },
  risk: { title: '风险与异常 — 财务与经营风险处理中心', breadcrumb: '风险与异常' },
  import: { title: '数据管理 — 数据导入中心', breadcrumb: '数据导入' },
  blueprint: { title: '角色、工作流程与系统承载', breadcrumb: '角色与流程' },
  data: { title: '指标、字段、来源与更新责任', breadcrumb: '数据需求' },
  boundary: { title: 'Demo边界与驻场业务分析', breadcrumb: '系统边界' },
  'hz-documents': { title: '智能采集', enLabel: 'SMART CAPTURE', breadcrumb: '智能采集' },
  'hz-sourcevoucher': { title: '原始凭证', enLabel: 'SOURCE VOUCHERS', breadcrumb: '原始凭证' },
  'hz-cashmanagement': { title: '资金收付', enLabel: 'CASH & PAYMENT OPERATIONS', breadcrumb: '资金收付' },
  'hz-voucher': { title: '凭证填制', enLabel: 'VOUCHER PREPARATION', breadcrumb: '记账凭证' },
  'hz-voucherorganize': { title: '整理凭证', enLabel: 'VOUCHER ARRANGEMENT', breadcrumb: '整理凭证' },
  'hz-vouchervoid': { title: '作废凭证', enLabel: 'VOUCHER VOID', breadcrumb: '作废凭证' },
  'hz-voucherquery': { title: '查询凭证', enLabel: 'VOUCHER QUERY', breadcrumb: '查询凭证' },
  'hz-reconcile': { title: '平台结算对账', enLabel: 'PLATFORM RECONCILIATION', breadcrumb: '平台对账' },
  'hz-bankrecon': { title: '银行对账', enLabel: 'BANK RECONCILIATION', breadcrumb: '银行对账' },
  'hz-ledger': { title: '会计账簿', enLabel: 'ACCOUNTING BOOKS', breadcrumb: '会计账簿' },
  'hz-balance': { title: '科目余额表', enLabel: 'TRIAL BALANCE', breadcrumb: '科目余额表' },
  subjects: { title: '会计科目表', breadcrumb: '会计科目' },
  'opening-balance': { title: '期初余额录入', breadcrumb: '期初余额' },
  'business-entry': { title: '业务录入', breadcrumb: '业务录入' },
  'asset-management': { title: '固定资产管理', breadcrumb: '固定资产管理' },
  'inventory-management': { title: '库存管理', breadcrumb: '库存管理' },
  'accounting-check': { title: '凭证与期间控制', breadcrumb: '凭证与期间校验' },
  'hz-reports': { title: '报表管理', enLabel: 'FINANCIAL STATEMENTS', breadcrumb: '报表管理' },
  'hz-closing': { title: '期末结转', enLabel: 'PERIOD END', breadcrumb: '期末结转' },
  'hz-tax': { title: '纳税申报', enLabel: 'TAX FILING', breadcrumb: '纳税申报' },
  'hz-settings': { title: '系统连接', enLabel: 'INTEGRATIONS', breadcrumb: '系统连接' },
};

// ============================================================
// Helpers
// ============================================================

export function canAccess(viewId: ViewId, role: Role, isPresentationMode: boolean): boolean {
  const presentationViews: ViewId[] = ['blueprint', 'data', 'boundary'];
  if (presentationViews.includes(viewId)) return isPresentationMode;
  return viewPermissions[viewId]?.includes(role) ?? false;
}

export function getDefaultView(role: Role): ViewId {
  return 'workbench';
}

export function getNavMenus(role: Role, isPresentationMode: boolean): MenuGroup[] {
  const menus = [...navMenus[role]];
  if (isPresentationMode) {
    menus.push(presentationMenuGroup);
  }
  return menus;
}
