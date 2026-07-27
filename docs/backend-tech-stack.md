# 财务云 — 后端设计文档

> **数据库**：MySQL 8.0+（InnoDB / utf8mb4），详见 [`database-schema.md`](./database-schema.md)  
> **前端**：Next.js 16 + React 19 + TypeScript（已有）  
> **技术方案**：方案 A — Prisma + tRPC + Next.js App Router（同仓 Monorepo）  
> **文档版本**：v1.0 / 2026-07-24

---

## 1. 技术选型

| 层级 | 技术 | 理由 |
|:---|:---|:---|
| **ORM** | **Prisma** | MySQL 支持最完善、TypeScript 原生类型安全、Migration 管理成熟 |
| **API 层** | **tRPC** | 端到端类型安全，与 Next.js 深度集成，消除前后端类型脱节 |
| **运行时** | **Next.js App Router API** | 无需额外服务，同仓部署，`app/api/` 即后端 |
| **身份认证** | **NextAuth.js v5** | 官方支持 Credentials / OAuth，内置 session、JWT、RBAC 适配 |
| **数据校验** | **Zod** | tRPC 内置支持，定义一次 Schema 同时用于 API 校验和前端类型 |
| **缓存** | **Redis** (Upstash / ioredis) | 会计科目树、权限矩阵、KPI 快照等热数据缓存 |
| **任务队列** | **Inngest** / **BullMQ** | 异步任务（银行流水导入、AI 凭证识别、期末结转） |
| **文件存储** | **AWS S3** / **阿里云 OSS** | 原始凭证附件、发票图片、导入模板存储 |
| **AI 集成** | **Claude API** / **OpenAI API** | 智能采集 OCR、凭证自动生成、风险诊断 |
| **日志/监控** | **Pino** + **Axiom** / **BetterStack** | 结构化日志 + 审计追踪 |
| **测试** | **Vitest** + **Playwright** | 单元测试 + E2E |

---

## 2. 各层选型理由

### 2.1 Prisma — MySQL ORM

```
✅ 优点
├── TypeScript 原生类型推断 — Schema 变更后自动生成类型
├── Migration 工作流成熟 — `prisma migrate dev` 治完即走
├── Relation 建模直观 — 55 张表的关联关系清晰
├── Prisma Studio — 内置 GUI 管理界面
└── Raw Query 兜底 — 复杂报表 SQL 可用 `$queryRaw`
```

> **备选参考**：Drizzle ORM — 更轻量、SQL-like API。若后续需要更精细的查询控制可切换。

### 2.2 tRPC — 前后端类型安全

```
✅ 优点
├── 端到端类型 — API 参数/返回自动同步到前端
├── 零样板代码 — 无需手写 REST 路径/Swagger
├── Zod 深度整合 — 输入校验与类型定义同一份代码
├── 批处理请求 — 自动合并多个 query 为一次网络请求
└── 订阅支持 — WebSocket 实时推送（AI 诊断流式输出）
```

> **为什么不用 REST / GraphQL？**
> - REST：需要手动同步前后端类型，55 张表 × CRUD = 大量样板
> - GraphQL：复杂度高，缓存策略重，财务场景不需要灵活的字段选择
> - tRPC：项目已是全栈 TypeScript，tRPC 是最契合的方案

### 2.3 Next.js App Router API — 零额外服务

```
✅ 优点
├── 同仓部署 — 无需独立后端服务
├── Server Components 复用 — 部分查询可直接用 Server Component 直连数据库
├── Edge Runtime 可选 — 轻量接口可部署到边缘
└── Vercel 一键部署
```

**架构示意**：
```
app/
├── api/
│   └── trpc/
│       └── [trpc]/
│           └── route.ts        ← tRPC handler
├── (server)/                     ← 可选：Server Component 直连 DB
│   └── overview/
│       └── page.tsx
├── layout.tsx
└── page.tsx
```

### 2.4 同仓 Monorepo

**决策**：前端与后端在同一仓库。类型共享零成本，数据库迁移与代码同步。

> **演进路径**：当业务需要独立扩展后端时，可将 `app/api/` 拆分为独立服务（NestJS 或 Hono），`lib/types.ts` 抽为共享包。

---

## 3. 项目目录结构

```
财务云/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts  # tRPC handler
│   │   └── auth/[...nextauth]/   # NextAuth
│   ├── (pages)/                   # Server Components（部分数据直查）
│   └── layout.tsx
├── server/                        # 后端逻辑
│   ├── trpc/
│   │   ├── routers/               # 按模块拆分
│   │   │   ├── voucher.ts
│   │   │   ├── ledger.ts
│   │   │   ├── account.ts
│   │   │   └── ...
│   │   ├── context.ts             # tRPC context（auth, db）
│   │   └── index.ts               # AppRouter 导出
│   ├── services/                  # 业务逻辑层
│   │   ├── voucher.service.ts
│   │   ├── depreciation.service.ts
│   │   └── tax.service.ts
│   ├── jobs/                      # 异步任务
│   │   ├── bank-import.job.ts
│   │   └── month-end-close.job.ts
│   └── utils/
├── prisma/
│   ├── schema.prisma              # 数据库 Schema（55 张表）
│   └── migrations/
├── lib/                           # 共享（前端 + 后端）
│   ├── db.ts                      # PrismaClient 单例
│   ├── types.ts                   # 共享类型
│   ├── navigation.ts
│   └── utils.ts
├── components/                    # 前端组件
├── docs/
│   ├── database-schema.md
│   └── backend-tech-stack.md
└── package.json
```

---

## 4. tRPC Router 设计（示例：凭证管理）

```typescript
// server/trpc/routers/voucher.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../context';
import { AuditStatus } from '@/lib/types';

export const voucherRouter = createTRPCRouter({
  // 查询凭证列表
  list: protectedProcedure
    .input(z.object({
      auditStatus: z.enum(['pending', 'approved', 'posted', 'all']).optional(),
      category: z.string().optional(),
      year: z.string().optional(),
      month: z.string().optional(),
      keyword: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { auditStatus, category, year, month, keyword, limit, offset } = input;
      const where: any = { company_id: ctx.user.companyId };

      if (auditStatus && auditStatus !== 'all') {
        where.audit_status = auditStatus;
      }
      if (category) where.category = category;
      if (year || month) {
        const prefix = year ? `${year}-${month?.padStart(2, '0') ?? ''}` : undefined;
        if (prefix) where.voucher_date = { startsWith: prefix };
      }
      if (keyword) {
        where.OR = [
          { voucher_no: { contains: keyword } },
          { summary: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.accountingVoucher.findMany({ where, skip: offset, take: limit, orderBy: { voucher_date: 'desc' } }),
        ctx.db.accountingVoucher.count({ where }),
      ]);

      return { items, total };
    }),

  // 创建凭证（含分录）
  create: protectedProcedure
    .input(z.object({
      voucherWord: z.enum(['收', '付', '转']),
      voucherDate: z.string(),
      summary: z.string().min(1),
      entries: z.array(z.object({
        subjectId: z.number(),
        summary: z.string().optional(),
        debitAmount: z.number().default(0),
        creditAmount: z.number().default(0),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // 生成凭证编号
      const voucherNo = await generateVoucherNo(ctx.db, input.voucherWord, ctx.user.companyId);

      // 计算合计
      const debitTotal = input.entries.reduce((sum, e) => sum + e.debitAmount, 0);
      const creditTotal = input.entries.reduce((sum, e) => sum + e.creditAmount, 0);

      // 事务写入
      return ctx.db.$transaction(async (tx) => {
        const voucher = await tx.accountingVoucher.create({
          data: {
            company_id: ctx.user.companyId,
            fiscal_period_id: ctx.user.currentPeriodId,
            voucher_no: voucherNo,
            voucher_word: input.voucherWord,
            voucher_date: new Date(input.voucherDate),
            summary: input.summary,
            debit_amount: debitTotal,
            credit_amount: creditTotal,
            creator_id: ctx.user.id,
            status: 'draft',
          },
        });

        await tx.voucherEntry.createMany({
          data: input.entries.map((e, i) => ({
            voucher_id: voucher.id,
            subject_id: e.subjectId,
            summary: e.summary,
            debit_amount: e.debitAmount,
            credit_amount: e.creditAmount,
            direction: e.debitAmount > 0 ? '借' : '贷',
            sort_order: i + 1,
          })),
        });

        // 写入审计日志
        await tx.auditLog.create({
          data: {
            company_id: ctx.user.companyId,
            user_id: ctx.user.id,
            action: 'CREATE',
            entity_type: 'accounting_voucher',
            entity_id: voucher.id,
            new_value_json: { voucher_no: voucherNo, summary: input.summary },
          },
        });

        return voucher;
      });
    }),
});
```

---

## 5. 实施要点

### 5.1 数据库连接

- **连接池**：使用 `@prisma/client` 内置连接池，配置 `connection_limit=20`
- **读写分离**（未来）：财务对账等重查询走只读副本，配置 Prisma 的 `datasource.read` 和 `datasource.write`

### 5.2 事务

- 凭证创建（主表 + 分录表 + 现金流量表 + 审计日志）务必在 `$transaction` 内
- 期末结转、银行对账勾兑等批量操作使用交互式事务 `$transaction(async (tx) => {...})`

### 5.3 金额精度

- 数据库存储用 `DECIMAL(18,2)`（元）
- 前端展示用万元，格式化函数统一定义
- 不依赖 JavaScript 浮点做金额运算 — 服务端用 Prisma 的 `Decimal` 类型

### 5.4 审计日志

- **55 张业务表的所有 CUD 操作**都要记录审计日志
- 可用 Prisma Middleware 自动拦截：
```typescript
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (['create', 'update', 'delete'].includes(params.action)) {
    await auditLog.create({ /* ... */ });
  }
  return result;
});
```

### 5.5 缓存策略

| 数据 | 缓存时长 | 失效触发 |
|:---|:---|:---|
| 会计科目树 | 1 小时 | 科目变更 |
| 角色权限矩阵 | 永久（应用加载时） | 权限变更 |
| 月度 KPI 快照 | 到下次月结 | 月结完成 |
| 银行账户余额 | 5 分钟 | 流水导入 |

### 5.6 文件上传

- 原始凭证附件、发票图片走 **Presigned URL** 直传 OSS/S3
- 服务端只存 `file_url`，不处理 multipart

### 5.7 AI 集成（Claude API）

当前项目已有 `AIAssistant` 面板 + 聊天记录 + AI 诊断，建议后端实现：
- **智能采集**：发票/结算单 OCR 识别 → 提单 → 生成原始凭证
- **凭证建议**：根据原始凭证自动推荐会计科目和分录
- **风险诊断**：根据应收、资金、产销数据生成诊断报告
- **流式输出**：AI 分析结果通过 tRPC Subscription 实时推送

---

## 6. 快速启动

```bash
# 1. 安装 Prisma
pnpm add prisma @prisma/client
pnpm prisma init

# 2. 配置 prisma/schema.prisma（写入 55 张表定义）
# 3. 创建初始 Migration
pnpm prisma migrate dev --name init

# 4. 安装 tRPC
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod

# 5. 安装 Redis
pnpm add ioredis

# 6. 安装 NextAuth
pnpm add next-auth@beta @auth/prisma-adapter

# 7. 安装日志
pnpm add pino
```
