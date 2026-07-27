# 财务云 — 后端设计流程

> **技术方案**：Prisma + tRPC + Next.js App Router（方案 A）  
> **数据库**：MySQL 8.0+，55 张表，详见 [`database-schema.md`](./database-schema.md)  
> **后端设计参考**：[`backend-tech-stack.md`](./backend-tech-stack.md)  
> **文档版本**：v1.1 / 2026-07-24（更新：全部 Phase 完成 + 前端全量接入）

---

## 设计原则

| 原则 | 说明 |
|:---|:---|
| **由底向上** | 先基础设施，再业务模块；先共享表，再业务表 |
| **逐层验证** | 每完成一层，写 Seed + tRPC Query 验证数据通路 |
| **事务先行** | 涉及多表写入的模块必须在 Phase 阶段就确定事务边界 |
| **类型驱动** | Prisma Schema → Zod Schema → tRPC Router → 前端 Hook，一条类型链 |
| **可观测性** | 每个 tRPC Router 注册后立刻接入审计日志 |

---

## 总体流程（10 个阶段）

```
Phase 1 ─── 项目脚手架 + Prisma 初始化 + 连接池
  │
Phase 2 ─── 10 张基础共享表 + 种子数据
  │
Phase 3 ─── 认证鉴权（NextAuth + RBAC + 多租户隔离）
  │
Phase 4 ─── 会计科目 + 会计期间 + 期初余额
  │
Phase 5 ─── 记账凭证（CRUD + 分录 + 签字 + 状态机）
  │
Phase 6 ─── 资金收付（银行账户 + 交易流水 + 付款任务）
  │
Phase 7 ─── 银行对账 + 平台对账
  │
Phase 8 ─── 账簿 + 科目余额表 + 报表
  │
Phase 9 ─── 应收 + 应付 + 预算 + 资产 + 库存 + 税务 + 月结
  │
Phase 10 ── 风险 + AI + 审计 + 系统设置 + 数据导入
```

---

## Phase 1：项目脚手架

### 目标
搭建后端基础设施，确保 Prisma + tRPC + Next.js 三件套可运行。

### 输入
- [`backend-tech-stack.md`](./backend-tech-stack.md) — 技术选型表
- [`database-schema.md`](./database-schema.md) — 通用约定（命名规范、标准列）

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 1.1 | `pnpm add prisma @prisma/client`，`pnpm prisma init` | `prisma/schema.prisma` 骨架 |
| 1.2 | 配置 `datasource`（MySQL 连接字符串），generator（`prisma-client-js`） | 可连接的 Prisma 配置 |
| 1.3 | 创建 `lib/db.ts` — PrismaClient 单例（globalThis 防热重载重复） | 数据库客户端 |
| 1.4 | `pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod` | tRPC 全家桶 |
| 1.5 | 创建 `server/trpc/context.ts` — tRPC context（注入 `db`、`user`） | tRPC 上下文 |
| 1.6 | 创建 `server/trpc/index.ts` — 空 AppRouter，`app/api/trpc/[trpc]/route.ts` | tRPC 端点可访问 |
| 1.7 | 安装 Pino，创建 `lib/logger.ts` | 结构化日志 |
| 1.8 | 连接池参数：`connection_limit=20`，`pool_timeout=10` | 生产级连接池 |

### 验证方式
- `pnpm prisma db push` 对空数据库执行成功
- `curl http://localhost:3000/api/trpc/health` 返回 `{ ok: true }`

---

## Phase 2：基础共享表

### 目标
创建 10 张跨模块共享表，写入种子数据，建立多租户骨架。

### 涉及表

| 表 | 说明 | 优先级 |
|:---|:---|:---|
| `companies` | 公司/租户 | P0 |
| `departments` | 部门 | P1 |
| `employees` | 员工 | P1 |
| `users` | 用户（登录） | P0 |
| `roles` | 角色定义 | P0 |
| `permissions` | 权限（35 个 ViewId） | P0 |
| `role_permissions` | 角色-权限关联 | P0 |
| `fiscal_periods` | 会计期间 | P0 |
| `settlement_entities` | 结算主体/店铺 | P1 |
| `attachments` | 附件（多态关联） | P1 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 2.1 | 将 `database-schema.md` 第 3 节的 10 张表写入 `prisma/schema.prisma` | Prisma Schema（基础表） |
| 2.2 | `prisma migrate dev --name init-base` | 初始 migration |
| 2.3 | `prisma/seed.ts` — 写入 1 家公司、3 个部门、3 个角色、35 个权限、角色权限关联 | 种子数据 |
| 2.4 | 在 `seed.ts` 中注册 `prisma.seed` 脚本 | `pnpm prisma db seed` 可执行 |
| 2.5 | 创建 `server/trpc/routers/company.ts` — `list` query | 首个 tRPC Router |
| 2.6 | 创建 `server/trpc/routers/user.ts` — `list`, `byId` query | 用户查询 |

### 验证方式
- `pnpm prisma db seed` 写入成功
- Prisma Studio 中可浏览所有种子数据
- `trpc.company.list` 返回公司列表

---

## Phase 3：认证鉴权

### 目标
实现登录、JWT Session、角色鉴权、多租户数据隔离。

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 3.1 | 安装 NextAuth v5：`pnpm add next-auth@beta @auth/prisma-adapter` | — |
| 3.2 | 配置 `auth.ts` — Credentials Provider（用户名+密码），JWT Strategy | 认证配置 |
| 3.3 | 在 JWT callback 中注入 `companyId`、`role` | 租户 + 角色信息入 token |
| 3.4 | 创建 `server/trpc/context.ts` 升级版 — 从 token 解析 `ctx.user` | 带鉴权的 tRPC context |
| 3.5 | 实现 `protectedProcedure` — 未登录拒绝；`roleProcedure(roles)` — 角色不足拒绝 | 可复用的鉴权中间件 |
| 3.6 | 实现 Prisma Middleware — 自动为所有查询添加 `company_id` 过滤 | 多租户数据隔离 |
| 3.7 | 实现 `canAccess(viewId, role)` 服务端版本 | RBAC 鉴权 |

### 验证方式
- 无 token 调用 `protectedProcedure` → 401
- 出纳角色调用 `roleProcedure(['财务负责人'])` → 403
- 用户 A（公司1）查不到用户 B（公司2）的数据

---

## Phase 4：会计科目 + 会计期间 + 期初余额

### 目标
建立财务核算的基础数据结构。

### 涉及表

| 表 | 说明 |
|:---|:---|
| `accounting_subjects` | 会计科目树（67 个一级 + 238 个明细） |
| `opening_balances` | 期初余额 |
| （`fiscal_periods` 已在 Phase 2 完成） | — |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 4.1 | `prisma/schema.prisma` 写入 `accounting_subjects`、`opening_balances`，`migrate dev` | 科目表 migration |
| 4.2 | Seed：33 个一级科目 + 34 个明细科目 | 科目树种子数据 |
| 4.3 | Seed：2026-07 期初余额 4 条 | 期初余额种子数据 |
| 4.4 | `server/trpc/routers/subject.ts` — `tree`（递归查询）、`list`、`byCode` | 科目查询 |
| 4.5 | `server/trpc/routers/period.ts` — `current`、`list`、`close`（关账） | 期间管理 |
| 4.6 | `server/trpc/routers/opening-balance.ts` — `list`、`validate`（借贷平衡校验） | 期初余额 |

### 验证方式
- 科目树完整可查询，层级正确
- 期初余额借方合计 = 贷方合计

---

## Phase 5：记账凭证（核心）

### 目标
实现凭证完整生命周期：原始凭证 → 填制凭证 → 分录 → 审核 → 出纳签字 → 记账。

### 涉及表

| 表 | 说明 |
|:---|:---|
| `collected_documents` | 智能采集单据 |
| `source_vouchers` | 原始凭证 |
| `voucher_business_facts` | 凭证业务事实 |
| `voucher_verification_results` | 凭证校验结果 |
| `accounting_vouchers` | 记账凭证 |
| `voucher_entries` | 凭证分录 |
| `voucher_signatures` | 出纳签字 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 5.1 | 写入 7 张表到 `prisma/schema.prisma`，定义关联关系 | Prisma Schema |
| 5.2 | 设计凭证状态机：`draft → pending → approved → posted`（含 `voided` 分支） | 状态图 |
| 5.3 | `voucher.service.ts` — `create`（含分录事务写入）、`approve`、`post`、`void` | 核心业务逻辑 |
| 5.4 | `server/trpc/routers/voucher.ts` — `list`（分页+筛选）、`create`、`byId`、`approve`、`void` | 凭证 API |
| 5.5 | `server/trpc/routers/source-voucher.ts` — `list`、`byId`、`verify` | 原始凭证 API |
| 5.6 | `server/trpc/routers/document.ts` — `list`（按类别筛选）、`recognize` | 智能采集 API |
| 5.7 | 凭证编号自动生成：`generateVoucherNo(word, companyId)` — 字+月+流水号 | 编号服务 |
| 5.8 | Seed：5 条原始凭证 + 5 条记账凭证 + 分录 | 凭证种子数据 |

### 关键约束
- 凭证创建必须在 `$transaction` 内：主表 + 分录 × N + 审计日志
- 借方合计 = 贷方合计（前端 + 后端双重校验）
- 已审核/已记账凭证不可直接修改，必须先冲回（红字冲销）

### 验证方式
- 创建凭证 → 分录正确写入 → 借贷平衡
- 审核通过 → 状态变为 `approved`
- 作废 → 状态变为 `voided`，记录原因

---

## Phase 6：资金收付

### 目标
管理银行账户、资金流水、收付款任务。

### 涉及表

| 表 | 说明 |
|:---|:---|
| `bank_accounts` | 银行账户 |
| `fund_transactions` | 资金交易流水 |
| `payment_tasks` | 收付款任务 |
| `cash_flow_predictions` | 资金预测 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 6.1 | 写入 4 张表到 `prisma/schema.prisma` | Prisma Schema |
| 6.2 | `bank.service.ts` — 账户 CRUD、余额变更 | 账户服务 |
| 6.3 | `payment.service.ts` — 付款任务生命周期：`pending → processing → completed/failed` | 付款服务 |
| 6.4 | `server/trpc/routers/bank.ts` — `listAccounts`、`byId`、`transactions` | 银行 API |
| 6.5 | `server/trpc/routers/payment.ts` — `list`（按状态分组）、`execute`、`batch` | 付款 API |
| 6.6 | 付款执行时同步更新 `bank_accounts.balance`、写入 `fund_transactions` | 资金一致性 |

### 验证方式
- 执行付款 → 银行余额扣减 → 交易流水生成
- 批量付款 → 全部成功或全部回滚

---

## Phase 7：银行对账 + 平台对账

### 目标
银行流水与企业日记账自动匹配，平台结算单与系统订单对账。

### 涉及表

| 表 | 说明 |
|:---|:---|
| `bank_statements` | 银行对账单 |
| `bank_reconciliation_items` | 银行对账明细/未达账项 |
| `platform_settlements` | 平台结算批次 |
| `platform_reconciliation_items` | 平台对账差异明细 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 7.1 | 写入 4 张表到 `prisma/schema.prisma` | Prisma Schema |
| 7.2 | `reconciliation.service.ts` — 银行流水导入 + 自动匹配（金额+日期+摘要） | 对账引擎 |
| 7.3 | `server/trpc/routers/bank-recon.ts` — `list`、`match`、`unmatch`、`balance-sheet` | 银行对账 API |
| 7.4 | `server/trpc/routers/platform-recon.ts` — `batches`、`diffs`、`resolve` | 平台对账 API |
| 7.5 | 余额调节表生成：企业账面余额 + 未达项调整 = 银行对账单余额 | 调节表 |

### 验证方式
- 导入银行流水 → 自动匹配率 > 95%
- 余额调节表：差额 = 0

---

## Phase 8：账簿 + 科目余额表 + 报表

### 目标
从凭证数据生成日记账/分类账/备查账、科目余额表、月度 KPI 快照。

### 涉及表

| 表 | 说明 |
|:---|:---|
| `ledger_entries` | 账簿分录 |
| `trial_balances` | 科目余额表 |
| `monthly_financial_snapshots` | 月度 KPI 快照 |
| `profit_details` | 利润明细 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 8.1 | 写入 4 张表到 `prisma/schema.prisma` | Prisma Schema |
| 8.2 | `ledger.service.ts` — 凭证过账到日记账、分类账、备查账 | 过账引擎 |
| 8.3 | `trial-balance.service.ts` — 从分录汇总生成科目余额表 | 余额汇总 |
| 8.4 | `server/trpc/routers/ledger.ts` — `list`（按 `book_type` 筛选）、`export` | 账簿 API |
| 8.5 | `server/trpc/routers/trial-balance.ts` — `list`（按期间）、`export` | 余额表 API |
| 8.6 | `server/trpc/routers/report.ts` — `kpi`、`profit`、`cashflow` | 报表 API |

### 验证方式
- 过账后日记账行数 = 凭证分录数（资金类科目）
- 科目余额表借贷平衡
- 月度 KPI 与报表数据一致

---

## Phase 9：应收 + 应付 + 预算 + 资产 + 库存 + 税务 + 月结

### 目标
实现全部业务模块的 CRUD 和核心逻辑。

### 涉及表（共 20 张）

| 模块 | 表 | 核心逻辑 |
|:---|:---|:---|
| **应收** | `customer_receivables`、`collection_records`、`receivable_aging_snapshots`、`collector_kpis` | 账龄计算、催收状态流转 |
| **应付** | `suppliers`、`supplier_payables`、`payment_applications`、`solvency_indicators` | 三单匹配校验、付款审批流 |
| **预算** | `budgets`、`budget_executions` | 预算执行率计算、超预算预警 |
| **固定资产** | `fixed_assets`、`depreciation_records` | 月折旧自动计算（直线法） |
| **库存** | `inventory_items`、`inventory_inbound`、`inventory_outbound` | 收发存汇总、安全库存预警 |
| **费用报销** | `expense_reports` | 费用审批 + 凭证生成 |
| **工资** | `payroll_records` | 薪资计算 + 凭证生成 |
| **税务** | `tax_filings` | 销项/进项汇总、应纳税额计算 |
| **月结** | `closing_tasks`、`period_end_steps`、`period_end_transfers` | 月结任务流、期末结转凭证生成 |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 9.1 | 写入所有 20 张表到 `prisma/schema.prisma` | Prisma Schema |
| 9.2 | 应收模块 — tRPC Routers + Services | 账龄/催收 API |
| 9.3 | 应付模块 — tRPC Routers + Services（含三单匹配 + 审批流） | 付款审批 API |
| 9.4 | 预算模块 — tRPC Routers + Services | 预算执行 API |
| 9.5 | 固定资产 — `depreciation.service.ts`（直线法折旧自动计算） | 折旧引擎 |
| 9.6 | 库存模块 — tRPC Routers + Services | 收发存 API |
| 9.7 | 费用报销 + 工资 — tRPC Routers + Services | 报销/薪资 API |
| 9.8 | 税务模块 — `tax.service.ts`（销项/进项汇总、应纳税额） | 税务计算引擎 |
| 9.9 | 月结模块 — `closing.service.ts`（任务流 + 结转凭证自动生成） | 月结引擎 |

### 验证方式
- 各模块列表查询返回种子数据
- 折旧计算：月折旧额 = (原值 - 残值) / 使用月数
- 月结流程：5 步依次完成

---

## Phase 10：风险 + AI + 审计 + 系统设置 + 数据导入

### 目标
实现系统级功能和跨模块集成。

### 涉及表

| 模块 | 表 |
|:---|:---|
| **风险** | `risk_exceptions`、`risk_indicators` |
| **AI** | `chat_messages`、`ai_analysis_results` |
| **审计** | `audit_logs`、`accounting_checks` |
| **系统设置** | `system_connections` |
| **数据导入** | `import_templates`、`import_records` |
| **数据字典** | `data_dictionary` |
| **产销** | `live_room_profit_ranking`、`product_profit_ranking`、`business_finance_penetration` |

### 任务清单

| # | 任务 | 产出 |
|:--|:---|:---|
| 10.1 | 写入所有剩余表到 `prisma/schema.prisma` | 完整 Prisma Schema（55 表） |
| 10.2 | 实现 Prisma Middleware — 自动审计 CUD 操作 → `audit_logs` | 审计中间件 |
| 10.3 | `risk.service.ts` — 异常检测规则引擎 | 风险引擎 |
| 10.4 | `ai.service.ts` — 聊天记录管理 + AI 诊断触发 | AI 服务 |
| 10.5 | `import.service.ts` — Excel 模板下载 + 数据导入 + 校验 | 导入引擎 |
| 10.6 | `server/trpc/routers/risk.ts`、`ai.ts`、`audit.ts`、`settings.ts`、`import.ts` | 系统 API |
| 10.7 | 最终 Seed — 所有表的演示数据（含 7 家上市公司真实财务数据） | 完整种子数据 |

### 验证方式
- CUD 操作 → `audit_logs` 有对应记录
- Excel 导入 → 校验通过/失败 → 返回错误明细行
- AI 诊断 → 生成 `ai_analysis_results` 记录

---

## tRPC Router 命名规范（实际实现）

```
server/trpc/routers/          （27 个 Router）
├── health.ts             → appRouter.health
├── period.ts             → appRouter.period
├── subject.ts            → appRouter.subject
├── opening-balance.ts    → appRouter.openingBalance    ← 新建
├── voucher.ts            → appRouter.voucher
├── source-voucher.ts     → appRouter.sourceVoucher
├── documents.ts          → appRouter.documents
├── bank.ts               → appRouter.bank
├── payment.ts            → appRouter.payment
├── reconciliation.ts     → appRouter.reconciliation    （合并银行+平台对账）
├── ledger.ts             → appRouter.ledger
├── trial-balance.ts      → appRouter.trialBalance
├── receivable.ts         → appRouter.receivable
├── payable.ts            → appRouter.payable
├── budget.ts             → appRouter.budget
├── asset.ts              → appRouter.asset
├── inventory.ts          → appRouter.inventory
├── expense.ts            → appRouter.expense
├── tax.ts                → appRouter.tax
├── closing.ts            → appRouter.closing
├── risk.ts               → appRouter.risk
├── ai.ts                 → appRouter.ai
├── audit.ts              → appRouter.audit
├── settings.ts           → appRouter.settings
├── import_.ts            → appRouter.import             （import 是保留字）
├── profit.ts             → appRouter.profit              ← 新建
└── overview.ts           → appRouter.overview            ← 新建
```

每个 Router 统一导出模式：

```typescript
// 标准 CRUD 方法签名
list:   protectedProcedure.input(filtersSchema).query(...)
byId:   protectedProcedure.input(z.object({ id: z.number() })).query(...)
create: protectedProcedure.input(createSchema).mutation(...)
update: protectedProcedure.input(updateSchema).mutation(...)
delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(...)
```

---

## 前端视图接入状态（32/32 ✅）

所有视图统一采用 VoucherView 模板模式：

```typescript
// 查询
const query = trpc.<router>.<procedure>.useQuery(input);
// 变更
const mutation = trpc.<router>.<procedure>.useMutation({
  onSuccess: () => { toast.success('...'); utils.<router>.<procedure>.invalidate(); },
  onError: (err) => toast.error(err.message),
});
// 三态
{ isLoading && <Skeleton /> }
{ isError && <Alert variant="destructive">...</Alert> }
{ data.length === 0 && <EmptyState /> }
```

| 视图 | Router | 类型 |
|:---|:---|:---|
| VoucherView | voucher | 列表 + CRUD + 审核/作废 |
| VoucherQueryView | voucher | 查询 + 筛选 |
| VoucherOrganizeView | voucher | 整理 + 批量操作 |
| VoucherVoidView | voucher | 作废管理 |
| SubjectsView | subject | 科目树 + 搜索 + 统计 |
| OpeningBalanceView | openingBalance | 期初余额列表 + 录入 |
| LedgerView | ledger | 日记账/分类账/备查账 |
| BalanceView | trialBalance | 科目余额表 |
| CashManagementView | bank, payment | 资金收付 + 付款执行 |
| CashView | bank, payment | 资金管理 + 账户/流水 |
| BankReconView | reconciliation | 银行对账 + 余额调节表 |
| ReconcileView | reconciliation | 平台结算对账 |
| DocumentsView | documents | 智能采集列表 |
| SourceVoucherView | sourceVoucher | 原始凭证 + 校验/入账 |
| ReceivableView | receivable | 应收 + 账龄 + 催收 |
| PayableView | payable | 应付 + 付款审批 |
| BudgetView | budget | 预算执行 + 超支预警 |
| AssetManagementView | asset | 固定资产 + 折旧 |
| InventoryView | inventory | 产销经营总览 |
| InventoryManagementView | inventory | 库存管理 + 收发存 |
| TaxView | tax | 纳税申报 + 销项/进项汇总 |
| BusinessEntryView | expense | 费用报销 CRUD |
| ClosingView | closing | 月结任务 |
| PeriodEndView | closing | 期末结转 |
| RiskView | risk | 风险异常处理 |
| AccountingCheckView | audit, period | 凭证与期间校验 |
| SettingsView | settings | 系统连接 + 数据字典 |
| ImportView | import | 数据导入 |
| OverviewView | period, profit, overview, risk, bank | 财务总览（多源 KPI + 图表） |
| WorkbenchView | voucher, payment, risk, closing, bank, reconciliation, sourceVoucher | 我的工作台（角色差异化） |
| ReportsView | period, trialBalance, budget | 报表管理（资产负债表/利润表/现金流量表/预算执行） |
| ProfitView | profit | 利润管理 + 趋势/对比/明细 |
| BlueprintView | — | 静态展示（无需 API） |
| DataView | — | 静态展示（无需 API） |
| BoundaryView | — | 静态展示（无需 API） |

---

## Prisma Schema 编写顺序

按依赖关系，55 张表在 `prisma/schema.prisma` 中的写入顺序：

```
# Phase 2 — 基础表（0 外键依赖）
companies → departments → employees → users → roles → permissions
→ role_permissions → fiscal_periods → settlement_entities → attachments

# Phase 4 — 科目（依赖 companies、fiscal_periods）
accounting_subjects → opening_balances

# Phase 5 — 凭证（依赖科目、期间、用户）
collected_documents → source_vouchers → voucher_business_facts
→ voucher_verification_results → accounting_vouchers
→ voucher_entries → voucher_signatures

# Phase 6 — 资金（依赖银行账户）
bank_accounts → fund_transactions → payment_tasks → cash_flow_predictions

# Phase 7 — 对账（依赖银行账户、凭证）
bank_statements → bank_reconciliation_items
→ platform_settlements → platform_reconciliation_items

# Phase 8 — 账簿报表（依赖凭证、科目）
ledger_entries → trial_balances
→ monthly_financial_snapshots → profit_details

# Phase 9 — 业务模块（依赖基础表 + 科目）
customer_receivables → collection_records → receivable_aging_snapshots
→ collector_kpis → suppliers → supplier_payables → payment_applications
→ solvency_indicators → budgets → budget_executions
→ fixed_assets → depreciation_records
→ inventory_items → inventory_inbound → inventory_outbound
→ expense_reports → payroll_records → tax_filings
→ closing_tasks → period_end_steps → period_end_transfers

# Phase 10 — 系统（跨模块）
risk_exceptions → risk_indicators → chat_messages
→ ai_analysis_results → audit_logs → accounting_checks
→ system_connections → import_templates → import_records
→ data_dictionary → live_room_profit_ranking
→ product_profit_ranking → business_finance_penetration
```

---

## 进度跟踪

| Phase | 内容 | 表数 | Router | 状态 |
|:---|:---|:--|:--|:--|
| **1** | 项目脚手架 | — | health | ✅ 完成（Prisma 5 + tRPC + Next.js 16 + dev server 运行中） |
| **2** | 基础共享表 | 10 | — | ✅ 完成（65 张表 + 15 类种子数据已写入 MySQL） |
| **3** | 认证鉴权 | — | — | ✅ 完成（NextAuth v5 + JWT + RBAC + 登录页 + SessionProvider + middleware 路由保护） |
| **4** | 会计科目 + 期间 + 期初 | 2 | period, subject, opening-balance | ✅ 完成（科目树 + 期间管理 + 期初余额 CRUD） |
| **5** | 记账凭证 | 7 | voucher, sourceVoucher, documents | ✅ 完成（CRUD + 审核 + 作废 + 签字 + 事务写入） |
| **6** | 资金收付 | 4 | bank, payment | ✅ 完成（账户管理 + 付款执行 + 余额扣减 + 交易流水） |
| **7** | 银行对账 + 平台对账 | 4 | reconciliation | ✅ 完成（银行对账匹配 + 平台结算对账 + 差异处理） |
| **8** | 账簿 + 余额表 + 报表 | 4 | ledger, trialBalance | ✅ 完成（过账引擎 + 余额汇总 + 科目余额表生成） |
| **9** | 应收/应付/预算/资产/库存/税务/月结 | 20 | receivable, payable, budget, asset, inventory, expense, tax, closing | ✅ 完成（8/8 router + 前端视图全部接入） |
| **10** | 风险/AI/审计/系统/导入/产销/利润 | 15 | risk, ai, audit, settings, import, profit, overview | ✅ 完成（7/7 router + 前端视图全部接入） |
| **—** | **前端接入后端** | — | — | ✅ **32/32 视图已接入 tRPC**（加载/错误/空态全覆盖，3 个静态展示页无需 API） |

> 表数含关联表、枚举表等辅助表，实际主业务表 65 张。

---

> **当前进度**：Phase 1-10 ✅ 全部完成，前端 32/32 视图已接入后端  
> **Router 总数**：27 个（全部注册于 `server/trpc/index.ts`，全部被前端消费）  
> **TypeScript**：0 错误，strict 模式  
> **下一步**：真实 LLM 接入 AI Router、middleware → proxy 迁移、TypeScript 5.1+ 升级
