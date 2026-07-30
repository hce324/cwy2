// ============================================================
// Core Types for 财务云 - 财务管理协同平台
// ============================================================

export type Role = '财务负责人' | '财务专员' | '出纳' | 'HR负责人';

export type ViewId =
  // Dashboard pages
  | 'workbench' | 'overview' | 'cash' | 'receivable' | 'payable'
  | 'inventory' | 'budget' | 'profit' | 'closing' | 'risk' | 'import'
  // Blueprint pages (presentation mode only)
  | 'blueprint' | 'data' | 'boundary'
  // Accounting modules
  | 'hz-documents' | 'hz-sourcevoucher' | 'hz-cashmanagement' | 'hz-voucher'
  | 'hz-voucherorganize' | 'hz-vouchervoid' | 'hz-voucherquery'
  | 'hz-reconcile' | 'hz-bankrecon' | 'hz-ledger' | 'hz-balance'
  | 'subjects' | 'opening-balance' | 'business-entry'
  | 'asset-management' | 'inventory-management'
  | 'accounting-check' | 'hz-reports' | 'hz-closing' | 'hz-tax' | 'hz-settings'
  // HR module
  | 'hr-overview' | 'hr-org' | 'hr-staff' | 'hr-attendance' | 'hr-payroll'
  | 'hr-recruit' | 'hr-perf' | 'hr-manage';

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export interface MenuItem {
  viewId: ViewId;
  label: string;
  badge?: number;
}

export interface StatCardData {
  label: string;
  value: string;
  sub?: string;
  link?: ViewId;
}

export interface AIAnalysis {
  module: string;
  status: '健康' | '需关注' | '预警';
  conclusion: string;
  analysisCount: number;
  warningCount: number;
  findings: string[];
}

export interface Task {
  priority: '高' | '中' | '低';
  title: string;
  module: string;
  deadline: string;
  assignee?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
}
