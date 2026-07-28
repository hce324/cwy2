# 财务云 — 财务管理协同平台

面向企业财务团队的 SaaS 演示原型。覆盖从原始凭证采集到财务报表输出的完整财务工作流，支持财务负责人、财务专员、出纳三种角色的协同作业。

---

## 技术栈

| 类别 | 方案 |
|:---|:---|
| 框架 | Next.js 16（App Router）+ React 19 + TypeScript（strict） |
| 样式 | Tailwind CSS v4（CSS-first，`@tailwindcss/postcss`） |
| 组件库 | shadcn/ui |
| 设计系统 | Material Design 3 |
| 状态管理 | Zustand（客户端全局）+ TanStack Query（服务端缓存） |
| 数据请求 / API | tRPC v11 + superjson + zod |
| 数据库 | Prisma 5（ORM）+ MySQL 8.0+（`relationMode=prisma`，无物理外键） |
| 认证 | NextAuth v5（Auth.js）+ `@auth/prisma-adapter` |
| 图表 | Recharts 3 |
| 图标 | Lucide React |
| 通知 | Sonner |
| 主题 | next-themes（亮色 / 暗色） |

---

## 功能模块

### 智能采集与凭证
- **智能采集** — 原始凭证自动采集与识别
- **原始凭证** — 原始凭证管理
- **凭证填制** — 记账凭证录入
- **整理凭证** — 凭证排序与归档
- **作废凭证** — 凭证作废与冲销
- **查询凭证** — 多条件凭证检索

### 资金与对账
- **资金收付** — 收付款操作与审批
- **平台对账** — 平台结算数据核对
- **银行对账** — 银行流水与账务核对

### 会计核算
- **会计账簿** — 总账、明细账
- **科目余额表** — 科目余额查询
- **会计科目** — 科目体系管理
- **期初余额** — 期初数据录入
- **业务录入** — 业务单据录入
- **固定资产管理** — 资产卡片与折旧
- **库存管理** — 存货核算
- **凭证与期间校验** — 会计合规检查

### 报表与税务
- **报表管理** — 财务报表生成
- **期末结转** — 月结 / 年结任务
- **纳税申报** — 税务计算与申报

### 业务管理
- **资金管理** — 资金账户与预测
- **应收管理** — 客户应收与催收
- **应付与付款** — 付款申请与审批
- **产销管理** — 产销经营总览
- **预算执行** — 预算执行分析
- **利润管理** — 收入与费用分析

### 协同与监控
- **风险与异常** — 财务风险处理中心
- **AI 诊断中心** — 6 大模块智能分析
- **财枢问答** — 经营数据 AI 对话

---

## 角色体系与演示账号

| 角色 | 用户名 | 显示名 | 可访问模块 |
|:---|:---|:---|:---|
| **财务负责人** | `director` | 林主管 | 全部模块，侧重总览、报表、风险管理 |
| **财务专员** | `specialist` | 周会计 | 凭证、账簿、报表、月结、固定资产、库存 |
| **出纳** | `cashier` | 陈出纳 | 收付、银行对账、资金管理 |

> 当前为 **demo 模式**（`server/auth.ts` 密码校验被跳过），登录时**用户名填上表任一值、密码任意填写**即可。生产环境请实现 bcrypt 密码校验。

角色通过顶栏下拉菜单切换，权限矩阵定义在 `lib/navigation.ts`。

---

## 部署教程

### 环境要求

| 依赖 | 版本 | 说明 |
|:---|:---|:---|
| Node.js | **>= 20.9.0**（推荐 22 LTS） | Next.js 16 硬性要求 |
| MySQL | **8.0+** | 演示数据含 utf8mb4 中文，需 8.0+ |
| `mysql` CLI | 任意 | `npm run db:import` 导入数据库时需要 |
| npm | 随 Node 附带 | — |

### 方式一：本地开发部署（5 步）

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
#   打开 .env，按需修改：
#   DATABASE_URL="mysql://<用户>:<密码>@localhost:3306/finance_cloud"
#   NEXTAUTH_SECRET="<随机串>"      # 用 `openssl rand -base64 32` 生成
#   NEXTAUTH_URL="http://localhost:3000"

# 3. 导入数据库（建库 + 全量表结构 + 全量数据，一条命令搞定）
npm run db:import           # 读取 .env 的 DATABASE_URL，自动建库并灌入 scripts/finance_cloud_dump.sql

# 4. 启动开发服务器
npm run dev
# → http://localhost:3000
```

打开浏览器访问 `http://localhost:3000`，用上方「演示账号」登录即可。

> 其它数据库脚本：`npm run db:generate`（生成 Prisma Client）/ `db:studio`（可视化浏览数据）。

### 方式二：生产环境部署

```bash
npm install
cp .env.example .env        # 生产环境 NEXTAUTH_URL 改为真实域名，务必设置强随机 NEXTAUTH_SECRET
npm run db:import           # 读取 .env 的 DATABASE_URL，自动建库并灌入全量数据
npm run build               # 生产构建
npm run start              # 启动生产服务（默认 3000 端口）
```

建议通过 Nginx / Caddy 等反向代理对外暴露，并启用 HTTPS。注意 `NEXTAUTH_URL` 必须与访问域名完全一致，否则登录回调会失败。

### 数据库从哪来（dump 来源）

数据库表结构 + 全量数据已固化为一份自包含的 dump 文件 **`scripts/finance_cloud_dump.sql`**（由 `mysqldump` 从本地 `finance_cloud` 库导出，64 张表全量）。clone 后只需 `npm run db:import` 即可建库灌数，无需 Prisma 建表、无需 Node 灌种子。

- `prisma/schema.prisma` 仍保留，仅用于 **生成 Prisma Client 类型**（`npm run db:generate`），不再负责建库。
- 若要修改表结构：本地改完 `schema.prisma` 后，用 `npx prisma db push` 应用到本地库，再重新生成 dump 并提交，保证两者同步。

### 数据说明与开源注意事项

- **数据库随仓库提供**：`scripts/finance_cloud_dump.sql` 已提交，包含 64 张表的完整结构与全量演示数据。别人 clone 后执行 `npm run db:import` 即可得到与你本地一致的数据库（无需你单独导出）。
- **`.env` 不会泄露**：数据库连接串与密码已被 `.gitignore` 忽略，不会进入仓库。
- ⚠️ **业务数据会随仓库公开**：dump 内含贝特瑞 2025H1 真实量级业务数据（收入约 78 亿）。若仓库为 **public**，任何人都能看到这些数据。如介意，请：
  1. 将仓库设为 **private**；或
  2. 用脱敏 / 纯虚构数据替换该 SQL 后再提交。

---

## 后端与数据层

项目为**全栈 TypeScript**——前后端共用一套类型，通过 tRPC 实现端到端类型安全：

- **API（tRPC v11）** — 后端 procedure 定义在 `lib/trpc-server.ts`，前端经 `lib/trpc-client.ts` 调用；入参用 `zod` 校验、传输用 `superjson` 序列化。
- **ORM 与数据库** — `Prisma 5` 连接 **MySQL 8.0+**；`prisma/schema.prisma` 定义 64 张业务表（用于生成 Prisma Client），采用 `relationMode=prisma`（逻辑关联、无物理外键）。实际表结构与全量数据见 `scripts/finance_cloud_dump.sql`。
- **多租户** — `lib/tenant.ts` 的 `tenantWhere(companyId)` 为所有查询注入 `company_id` 过滤，演示数据 `company_id = 1`。
- **认证** — `NextAuth v5（Auth.js）` + `@auth/prisma-adapter`，配置见 `server/auth.ts`（当前 demo 模式跳过密码校验）。
- **演示数据** — 随数据库 dump（`scripts/finance_cloud_dump.sql`）一并导入，含三个演示账号与贝特瑞 2025H1 全量数据；初始化见上方「部署教程」。

---

## 项目结构

```
cwy2/
├── app/
│   ├── layout.tsx          # 根布局（Provider 注入 + 字体）
│   ├── page.tsx            # 首页入口（Sidebar + TopBar + 视图区）
│   └── globals.css         # 全局样式 + Material 令牌 + 动效 + 工具类
├── components/
│   ├── TRPCProvider.tsx    # tRPC + QueryClient + Theme Provider 注入
│   ├── layout/             # Providers / Sidebar / TopBar / AIAssistant
│   ├── ui/                 # shadcn/ui 组件
│   └── views/              # 财务视图（按需懒加载）
├── lib/
│   ├── types.ts            # 核心类型（Role、ViewId、MenuItem 等）
│   ├── navigation.ts       # 导航配置 + RBAC 权限矩阵 + 视图元数据
│   ├── store.ts            # Zustand 全局状态
│   ├── trpc-server.ts      # tRPC 服务端 procedure 定义
│   ├── trpc-client.ts      # tRPC 客户端（前端调用）
│   ├── db.ts               # Prisma Client 实例
│   ├── tenant.ts           # 多租户查询（company_id 过滤）
│   └── kpi.ts / risk.ts    # KPI 业务逻辑 / 风险分析
├── prisma/
│   └── schema.prisma       # 数据库表结构定义（64 张业务表，用于生成 Prisma Client）
├── server/
│   └── auth.ts             # NextAuth 配置（Auth.js v5，demo 模式）
├── scripts/
│   ├── finance_cloud_dump.sql  # 全量数据库 dump（表结构 + 数据，clone 后一键导入）
│   └── import-db.mjs          # 一键导入脚本（npm run db:import）
├── public/                  # 静态资源
├── .env / .env.example      # 环境变量（DATABASE_URL 等，.env 不提交）
├── CLAUDE.md                # Claude Code 约束文件
├── WORKBUDDY.md             # WorkBuddy 约束文件
└── README.md                # 本文档
```

---

## 设计系统

项目遵循 Material Design 3 视觉规范，详见 `CLAUDE.md`。关键约定：

- **颜色** — 全部通过 CSS 变量引用（`--primary`、`--success`、`--danger` 等），禁止任意色值
- **间距** — Material 4px 基准阶梯（`p-1` = 4px ~ `p-8` = 32px）
- **字体** — Inter（正文）/ Roboto（标题）/ Fira Code（代码）
- **动效** — 涟漪（RippleContainer，450ms）+ elevation 阴影（`elevation-1` ~ `elevation-4`）
- **组件** — shadcn/ui 独占，仅 FAB、RippleContainer、Elevation 三个例外允许自定义

---

## 辅助工具

项目包含两个约束文件，确保 AI 编码助手遵循统一规范：

- `CLAUDE.md` — Claude Code 使用
- `WORKBUDDY.md` — WorkBuddy 使用

两个文件内容等价，均覆盖组件策略、视觉令牌、动效规范、禁止项和实现检查顺序。
