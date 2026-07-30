# 遗弃文件排查（code-review：可删除项）

排查范围：`cwy2/` 受 git 跟踪的源码（排除 `node_modules` / `.next` / UI 组件库）。
方法：逐一核对每个模块是否被 import / 被框架加载，结合本项目"已切真实 DB、无 mock"的既定方向。

## ✅ 确认可删除（零引用）

| 文件 | 说明 |
|------|------|
| `lib/kpi-mock.ts` | 硬编码 KPI 趋势 mock 数据（收入/利润/Margin/现金流）。全仓 **0 处 import**，且 `OverviewView` 已改为读真实 `snapshot` 字段（`snapshot.overdueRatio` / `snapshot.fundCoverage`）。与"去 mock、接真实库"方向冲突，纯残留。 |
| `lib/log.ts` | pino 风格的 `logger` 包装，注释写明"装了 pino 再替换"。全仓 **0 处 import**，从没接进去过。 |

## ⚠️ 需要你拍板（不是干净的可删项）

| 文件 | 说明 |
|------|------|
| `proxy.ts` | 内容是标准 NextAuth v5 中间件（未登录跳 `/login`）。**但 Next.js 只认 `middleware.ts`，不会加载 `proxy.ts`**——目前它根本不执行，登录路由守卫等于没生效（潜在 auth bug）。要么 `git mv proxy.ts middleware.ts` 激活它，要么确认鉴权已在 tRPC context 内强制后就删掉。删前先确认不依赖这个重定向。 |

## 📌 顺带提示（非代码、低优先）

- `docs/seed-data-berry-2025h1.md`：配套 seed SQL 已按之前约定删除，此文档可能已过时。文档类，是否删看你。
- `components/ui/*` 部分 shadcn 组件可能未被使用，但属 UI 库，不建议逐个删。

## 已核对「不是遗弃」的项（避免误删）
- 39 个 `components/views/*.tsx`：全部在 `ViewRenderer.tsx` 用 `lazy()` 注册，无孤儿视图。
- `lib/risk.ts` / `lib/tenant.ts` / `server/utils/voucher-no.ts` / `components/custom/RippleContainer.tsx`：均有引用。
- `public/pdf.worker.min.mjs`：被 `DocumentsView.tsx` 用作 pdf.js worker，在用。
- 所有 `server/trpc/routers/*`：均在 `server/trpc/index.ts` 注册，无孤儿 router。

## 建议
先删 `lib/kpi-mock.ts`（纯残留，零风险）；`lib/log.ts` 若近期不打算接日志也一并删；`proxy.ts` 先决定"改名激活 or 删除"，不要直接删。
