// Multi-tenant data isolation — adds company_id to all queries
// Usage: wrap your Prisma where clause with tenantWhere(ctx.user.companyId, yourWhere)

export function tenantWhere(companyId: number, where: Record<string, unknown> = {}) {
  return { ...where, companyId: BigInt(companyId) };
}

// List of models that have company_id (should match ALL business tables)
export const TENANT_MODELS = [
  'department', 'employee', 'user', 'fiscalPeriod', 'settlementEntity',
  'attachment', 'accountingSubject', 'openingBalance', 'collectedDocument',
  'sourceVoucher', 'accountingVoucher', 'bankAccount', 'fundTransaction',
  'paymentTask', 'cashFlowPrediction', 'bankStatement',
  'bankReconciliationItem', 'platformSettlement', 'platformReconciliationItem',
  'ledgerEntry', 'trialBalance', 'monthlyFinancialSnapshot', 'profitDetail',
  'customerReceivable', 'collectionRecord', 'receivableAgingSnapshot',
  'collectorKpi', 'supplier', 'supplierPayable', 'paymentApplication',
  'solvencyIndicator', 'budget', 'budgetExecution', 'fixedAsset',
  'depreciationRecord', 'inventoryItem', 'inventoryInbound',
  'inventoryOutbound', 'expenseReport', 'payrollRecord', 'taxFiling',
  'closingTask', 'periodEndStep', 'periodEndTransfer', 'riskException',
  'riskIndicator', 'chatMessage', 'aiAnalysisResult', 'auditLog',
  'accountingCheck', 'systemConnection', 'importTemplate', 'importRecord',
  'dataDictionaryEntry', 'liveRoomProfitRanking', 'productProfitRanking',
  'businessFinancePenetration',
] as const;
