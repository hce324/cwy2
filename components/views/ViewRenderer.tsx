'use client';

import { useAppStore } from '@/lib/store';
import { ViewId } from '@/lib/types';
import { lazy, Suspense, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { canAccess, getDefaultView } from '@/lib/navigation';
import { toast } from 'sonner';

// Lazy load all views
const WorkbenchView = lazy(() => import('./WorkbenchView').then(m => ({ default: m.WorkbenchView })));
const OverviewView = lazy(() => import('./OverviewView').then(m => ({ default: m.OverviewView })));
const CashView = lazy(() => import('./CashView').then(m => ({ default: m.CashView })));
const ReceivableView = lazy(() => import('./ReceivableView').then(m => ({ default: m.ReceivableView })));
const PayableView = lazy(() => import('./PayableView').then(m => ({ default: m.PayableView })));
const InventoryView = lazy(() => import('./InventoryView').then(m => ({ default: m.InventoryView })));
const BudgetView = lazy(() => import('./BudgetView').then(m => ({ default: m.BudgetView })));
const ProfitView = lazy(() => import('./ProfitView').then(m => ({ default: m.ProfitView })));
const ClosingView = lazy(() => import('./ClosingView').then(m => ({ default: m.ClosingView })));
const RiskView = lazy(() => import('./RiskView').then(m => ({ default: m.RiskView })));
const ImportView = lazy(() => import('./ImportView').then(m => ({ default: m.ImportView })));
const BlueprintView = lazy(() => import('./BlueprintView').then(m => ({ default: m.BlueprintView })));
const DataView = lazy(() => import('./DataView').then(m => ({ default: m.DataView })));
const BoundaryView = lazy(() => import('./BoundaryView').then(m => ({ default: m.BoundaryView })));
const DocumentsView = lazy(() => import('./DocumentsView').then(m => ({ default: m.DocumentsView })));
const SourceVoucherView = lazy(() => import('./SourceVoucherView').then(m => ({ default: m.SourceVoucherView })));
const CashManagementView = lazy(() => import('./CashManagementView').then(m => ({ default: m.CashManagementView })));
const VoucherView = lazy(() => import('./VoucherView').then(m => ({ default: m.VoucherView })));
const VoucherOrganizeView = lazy(() => import('./VoucherOrganizeView').then(m => ({ default: m.VoucherOrganizeView })));
const VoucherVoidView = lazy(() => import('./VoucherVoidView').then(m => ({ default: m.VoucherVoidView })));
const VoucherQueryView = lazy(() => import('./VoucherQueryView').then(m => ({ default: m.VoucherQueryView })));
const ReconcileView = lazy(() => import('./ReconcileView').then(m => ({ default: m.ReconcileView })));
const BankReconView = lazy(() => import('./BankReconView').then(m => ({ default: m.BankReconView })));
const LedgerView = lazy(() => import('./LedgerView').then(m => ({ default: m.LedgerView })));
const BalanceView = lazy(() => import('./BalanceView').then(m => ({ default: m.BalanceView })));
const SubjectsView = lazy(() => import('./SubjectsView').then(m => ({ default: m.SubjectsView })));
const OpeningBalanceView = lazy(() => import('./OpeningBalanceView').then(m => ({ default: m.OpeningBalanceView })));
const BusinessEntryView = lazy(() => import('./BusinessEntryView').then(m => ({ default: m.BusinessEntryView })));
const AssetManagementView = lazy(() => import('./AssetManagementView').then(m => ({ default: m.AssetManagementView })));
const InventoryManagementView = lazy(() => import('./InventoryManagementView').then(m => ({ default: m.InventoryManagementView })));
const AccountingCheckView = lazy(() => import('./AccountingCheckView').then(m => ({ default: m.AccountingCheckView })));
const ReportsView = lazy(() => import('./ReportsView').then(m => ({ default: m.ReportsView })));
const PeriodEndView = lazy(() => import('./PeriodEndView').then(m => ({ default: m.PeriodEndView })));
const TaxView = lazy(() => import('./TaxView').then(m => ({ default: m.TaxView })));
const SettingsView = lazy(() => import('./SettingsView').then(m => ({ default: m.SettingsView })));

const viewMap: Record<ViewId, React.LazyExoticComponent<React.ComponentType>> = {
  workbench: WorkbenchView,
  overview: OverviewView,
  cash: CashView,
  receivable: ReceivableView,
  payable: PayableView,
  inventory: InventoryView,
  budget: BudgetView,
  profit: ProfitView,
  closing: ClosingView,
  risk: RiskView,
  import: ImportView,
  blueprint: BlueprintView,
  data: DataView,
  boundary: BoundaryView,
  'hz-documents': DocumentsView,
  'hz-sourcevoucher': SourceVoucherView,
  'hz-cashmanagement': CashManagementView,
  'hz-voucher': VoucherView,
  'hz-voucherorganize': VoucherOrganizeView,
  'hz-vouchervoid': VoucherVoidView,
  'hz-voucherquery': VoucherQueryView,
  'hz-reconcile': ReconcileView,
  'hz-bankrecon': BankReconView,
  'hz-ledger': LedgerView,
  'hz-balance': BalanceView,
  subjects: SubjectsView,
  'opening-balance': OpeningBalanceView,
  'business-entry': BusinessEntryView,
  'asset-management': AssetManagementView,
  'inventory-management': InventoryManagementView,
  'accounting-check': AccountingCheckView,
  'hz-reports': ReportsView,
  'hz-closing': PeriodEndView,
  'hz-tax': TaxView,
  'hz-settings': SettingsView,
};

function ViewFallback() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[300px] mt-4" />
    </div>
  );
}

export function ViewRenderer() {
  const { currentView, currentRole, isPresentationMode } = useAppStore();

  const ViewComponent = viewMap[currentView];

  if (!ViewComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">页面加载异常
          <button className="ml-2 text-primary" onClick={() => window.location.reload()}>重试</button>
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<ViewFallback />}>
      <ViewComponent />
    </Suspense>
  );
}
