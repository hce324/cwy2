// Root tRPC router — all domain routers composed here
import { router } from './init';
import { healthRouter } from './routers/health';
import { periodRouter } from './routers/period';
import { subjectRouter } from './routers/subject';
import { voucherRouter } from './routers/voucher';
import { bankRouter } from './routers/bank';
import { paymentRouter } from './routers/payment';
import { ledgerRouter } from './routers/ledger';
import { trialBalanceRouter } from './routers/trial-balance';
import { receivableRouter } from './routers/receivable';
import { payableRouter } from './routers/payable';
import { budgetRouter } from './routers/budget';
import { assetRouter } from './routers/asset';
import { taxRouter } from './routers/tax';
import { closingRouter } from './routers/closing';
import { riskRouter } from './routers/risk';
import { auditRouter } from './routers/audit';
import { settingsRouter } from './routers/settings';
import { sourceVoucherRouter } from './routers/source-voucher';
import { reconciliationRouter } from './routers/reconciliation';
import { inventoryRouter } from './routers/inventory';
import { importRouter } from './routers/import_';
import { expenseRouter } from './routers/expense';
import { openingBalanceRouter } from './routers/opening-balance';
import { profitRouter } from './routers/profit';
import { aiRouter } from './routers/ai';
import { overviewRouter } from './routers/overview';

export const appRouter = router({
  health: healthRouter,
  period: periodRouter,
  subject: subjectRouter,
  voucher: voucherRouter,
  bank: bankRouter,
  payment: paymentRouter,
  ledger: ledgerRouter,
  trialBalance: trialBalanceRouter,
  receivable: receivableRouter,
  payable: payableRouter,
  budget: budgetRouter,
  asset: assetRouter,
  tax: taxRouter,
  closing: closingRouter,
  risk: riskRouter,
  audit: auditRouter,
  settings: settingsRouter,
  reconciliation: reconciliationRouter,
  sourceVoucher: sourceVoucherRouter,
  inventory: inventoryRouter,
  import: importRouter,
  expense: expenseRouter,
  profit: profitRouter,
  openingBalance: openingBalanceRouter,
  ai: aiRouter,
  overview: overviewRouter,
});

export type AppRouter = typeof appRouter;
