# WORKBUDDY.md — 财务云 · 财务管理协同平台

面向企业财务团队的 SaaS 演示原型，支持 3 种角色（财务负责人 / 财务专员 / 出纳），覆盖智能采集、凭证管理、资金收付、对账、账簿、报表、税务等 40+ 财务视图。

- **框架**：Next.js 16 + React 19 + TypeScript（`strict: true`）
- **样式方案**：Tailwind CSS v4（`@tailwindcss/postcss`，CSS-first 配置，**不是 v3**）
- **组件库**：shadcn/ui，独占使用
- **状态管理**：Zustand
- **图表**：Recharts
- **图标**：Lucide React
- **动效**：Material Design 3 涟漪（ripple）+ elevation 阴影
- **视觉令牌**：Material Design 3 配色 / 间距 / 字体 / 圆角
- **路径别名**：`@/*` → `./*`

---

## 核心架构

### 角色体系

3 种角色，RBAC 权限矩阵定义在 `lib/navigation.ts`——新增视图时必须更新 `viewPermissions`：

| 角色 | 标识 | 权限范围 |
|:---|:---|:---|
| 财务负责人 | `财务负责人` | 全部模块（总览、业务管理、报表、系统设置） |
| 财务专员 | `财务专员` | 日常核算操作（凭证、账簿、报表、月结） |
| 出纳 | `出纳` | 资金相关（收付、银行对账、资金管理） |

### 关键依赖

| 依赖 | 用途 | 备注 |
|:---|:---|:---|
| `zustand` | 全局状态（角色、视图、AI 面板） | `lib/store.ts` |
| `recharts` | 图表（Bar / Line / Area / Composed / Pie） | 大量用于 OverviewView 等 |
| `lucide-react` | 图标（文件、钱包、图表等） | shadcn 默认图标库 |
| `sonner` | Toast 通知 | `layout.tsx` 配置了 `richColors` |
| `next-themes` | 暗色模式切换 | `.dark` class 触发 |
| `tw-animate-css` | Tailwind 动画扩展 | `animate-in` 等 |
| `cmdk` | Command 面板底层 | shadcn Command 组件依赖 |
| `react-resizable-panels` | 可拖拽面板 | Resizable 组件 |
| `class-variance-authority` | shadcn 组件变体管理 | `cva()` 函数 |
| `clsx` + `tailwind-merge` | `cn()` 工具函数 | 合并 className 的标准方式 |

### Server / Client Component 约定

- shadcn 组件默认为 Server Component（`components.json` 中 `"rsc": true`）
- 必须加 `'use client'` 的场景：使用了 `useState` / `useEffect` / `useAppStore` / 事件处理 / 浏览器 API
- 所有 `components/layout/*`、`components/views/*`、`components/custom/*` 都是 Client Component

---

## 组件策略

1. **仅用 shadcn/ui 组件**。禁止 Ant Design、MUI、Chakra UI 等任何其他 UI 库。
2. **优先查 shadcn 官方 blocks**。写代码前通过 shadcn MCP（`@sherifbutt/shadcn-ui-mcp-server`）检查是否已有现成实现。
3. **不创建自定义组件**，除非属于下方「允许自定义」范围。必须创建时，注释说明原因。
4. 参考：https://ui.shadcn.com/

### 允许自定义的组件（仅限 3 个）

| 组件 | 原因 | 文件 | 备注 |
|:---|:---|:---|:---|
| **FAB** | shadcn 无浮动操作按钮 | 尚未创建 | `fixed bottom-4 right-4`，mini(40px) / normal(56px) / extended(48px+文字)，`bg-[--primary]` |
| **RippleContainer** | shadcn 无涟漪动效 | `components/custom/RippleContainer.tsx` | pointerdown → radial-gradient 扩散 → 450ms 淡出 |
| **Elevation** | shadcn 无 elevation 层级 | 仅 CSS 类，无需组件 | 见下方 Elevation 章节 |

---

## Material 视觉令牌

### 颜色

所有颜色通过 CSS 变量注入（`app/globals.css`）。**禁止使用任意颜色值**（`#ff0000`、`rgb()`），始终通过变量引用。

#### 基础颜色

| CSS 变量 | 亮色值 | 用途 |
|:---|:---|:---|
| `--primary` | `#6442D6` | 主色（按钮、选中态、强调） |
| `--primary-foreground` | `#FFFFFF` | 主色上的文字 |
| `--secondary` | `#C8B3FD` | 辅色 |
| `--secondary-foreground` | `#1E1B4B` | 辅色上的文字 |
| `--success` | `#16A34A` | 成功 / 正向 |
| `--warning` | `#D97706` | 警告 |
| `--danger` | `#DC2626` | 危险（语义同 `--destructive`） |
| `--destructive` | `#DC2626` | 危险 / 删除操作 |
| `--trend-up` | `#16A34A` | 上涨 / 正向趋势 |
| `--trend-down` | `#DC2626` | 下跌 / 负向趋势 |
| `--background` | `#FFFFFF` | 页面背景 |
| `--foreground` | `#111827` | 正文文字 |
| `--muted` | `#F3F4F6` | 中性背景（**不是 `#FFFFFF`**） |
| `--muted-foreground` | `#6B7280` | 次要 / 辅助文字 |
| `--accent` | `#F5F3FF` | 强调背景（淡紫） |
| `--accent-foreground` | `#4C1D95` | 强调背景上的文字 |
| `--card` | `#FFFFFF` | 卡片背景 |
| `--card-foreground` | `#111827` | 卡片文字 |
| `--popover` | `#FFFFFF` | Popover / DropdownMenu 背景 |
| `--popover-foreground` | `#111827` | Popover / DropdownMenu 文字 |
| `--border` | `#E5E7EB` | 边框 |
| `--input` | `#E5E7EB` | 输入框边框 |
| `--ring` | `#6442D6` | Focus ring 颜色 |

#### 暗色模式

`.dark` class 触发，所有变量在 `globals.css:119-165` 有暗色覆盖值：

| CSS 变量 | 暗色值 | 说明 |
|:---|:---|:---|
| `--primary` | `#8B7CF6` | 稍亮保持可读性 |
| `--background` | `#0F172A` | 深色背景 |
| `--foreground` | `#F1F5F9` | 浅色文字 |
| `--muted` | `#1E293B` | 深色中性 |
| `--card` / `--popover` | `#1E293B` | 深色表面 |
| `--border` / `--input` | `#334155` | 深色边框 |

> 设计亮色模式时始终确保暗色模式下可读。

#### Sidebar 颜色

| 变量 | 亮色值 | 用途 |
|:---|:---|:---|
| `--sidebar` | `#F8FAFC` | 侧边栏背景 |
| `--sidebar-foreground` | `#111827` | 侧边栏文字 |
| `--sidebar-primary` | `#6442D6` | 侧边栏强调色 |
| `--sidebar-primary-foreground` | `#FFFFFF` | 强调色上的文字 |
| `--sidebar-accent` | `#F5F3FF` | 选中/hover 背景 |
| `--sidebar-accent-foreground` | `#4C1D95` | 选中文字 |
| `--sidebar-border` | `#E5E7EB` | 分割线 |
| `--sidebar-ring` | `#6442D6` | Focus ring |

#### Chart 色板

| 变量 | 亮色值 |
|:---|:---|
| `--chart-1` | `#6442D6` |
| `--chart-2` | `#C8B3FD` |
| `--chart-3` | `#16A34A` |
| `--chart-4` | `#D97706` |
| `--chart-5` | `#DC2626` |

---

### 间距

Material 阶梯（1 单位 = 4px）：

| 阶梯 | Tailwind | 值 | 典型场景 |
|:---|:---|:---|:---|
| xs | `p-1` `gap-1` | 4px | badge 内边距 |
| sm | `p-2` `gap-2` | 8px | 按钮内边距 |
| md | `p-3` `gap-3` | 12px | 卡片内边距 |
| lg | `p-4` `gap-4` | 16px | 区块间距 |
| xl | `p-6` `gap-6` | 24px | 页面内边距 |
| 2xl | `p-8` `gap-8` | 32px | 大区块间距 |

页面内容区统一 `p-6 space-y-6`。

---

### 字体

Next.js `next/font/google` 加载 → CSS 变量 → Tailwind `@theme` 映射：

| 角色 | 字体 | 变量链 | Tailwind 类 |
|:---|:---|:---|:---|
| 正文 | Inter | `--font-inter` → `--font-sans` | `font-sans` |
| 展示 | Roboto | `--font-roboto` → `--font-heading` | `font-heading` |
| 代码 | Fira Code | `--font-fira-code` → `--font-mono` | `font-mono` |

字号：`text-xs`(12) / `text-sm`(14) / `text-base`(16) / `text-lg`(20) / `text-xl`(24) / `text-2xl`(32)
字重：100–900，`font-thin` ~ `font-black`

页面主标题：使用全局工具类 `<h1 className="page-title">`（定义见 `app/globals.css`，统一 24px / 700 / Roboto(heading) / tracking-tight / foreground，左对齐）。副标题用 `<p className="page-subtitle">`（14px / 400 / muted-foreground，标题下 4px 间距）。标题上方若有 eyebrow/kicker 标签，在标题类后追加 `mt-1` 与其保持 4px 间距；无 kicker 时标题顶部不留 margin。所有视图的标题块必须复用这两个类，禁止在各文件内联拼写 `text-2xl font-heading font-bold …`。

---

### 圆角

| Token | Tailwind | 值 | 用途 |
|:---|:---|:---|:---|
| sm | `rounded-sm` | 4px | input、badge |
| md | `rounded-md` | 8px | button、card、dialog |
| lg | `rounded-lg` | 8px | 菜单项 |
| xl | `rounded-xl` | 12px | Logo 容器 |
| 2xl | `rounded-2xl` | 16px | — |
| 3xl | `rounded-3xl` | 24px | — |
| 4xl | `rounded-4xl` | 32px | — |

---

## Material 动效

### Ripple（涟漪）

- 实现：`RippleContainer`（`components/custom/RippleContainer.tsx`）
- 触发：`pointerdown`
- 时长：**450ms**，缓动 `cubic-bezier(0.4, 0.0, 0.2, 1)`
- CSS：`.ripple-container`（容器）、`.ripple-effect`（动态元素）、`@keyframes ripple-anim`

```tsx
<RippleContainer className="ripple-container">
  <Button>点击</Button>
</RippleContainer>
```

### Elevation（阴影层级）

**必须用 CSS 类名**，不是 Tailwind 的 `shadow-*`：

| 层级 | CSS 类名 | 用途 | 示例 |
|:---|:---|:---|:---|
| 0dp | `elevation-0` | 平面 | — |
| 1dp | `elevation-1` | 默认卡片、导航栏 | Sidebar、TopBar |
| 2dp | `elevation-2` | hover 态 | — |
| 3dp | `elevation-3` | Dialog、FAB | AIAssistantFAB |
| 4dp | `elevation-4` | Drawer、Sheet | — |

Card hover：`.card-hover` → 上浮 1px + 阴影增强

---

## 全局工具类

| 类名 | 用途 |
|:---|:---|
| `.ripple-container` | 涟漪容器 |
| `.elevation-1` ~ `.elevation-4` | Material 阴影层级 |
| `.card-hover` | 卡片 hover 上浮 |
| `.custom-scrollbar` | 6px 细滚动条 |
| `.page-title` | 页面主标题统一规范（24px / 700 / Roboto / tracking-tight / foreground，左对齐） |
| `.page-subtitle` | 页面副标题统一规范（14px / 400 / muted-foreground，标题下 4px） |
| `.tabular-nums` | 等宽数字（财务报表必备） |
| `.kpi-card--danger` | 风险 KPI 卡片样式 |
| `.skip-link` | 无障碍跳转链接 |

---

## `cn()` 工具函数

`lib/utils.ts` 的 `cn()`（`clsx + tailwind-merge`）是合并 className 的标准方式：

```tsx
import { cn } from '@/lib/utils';

<button className={cn('base', isActive && 'active', className)} />
```

---

## 禁止项

- ❌ 禁止使用渐变（`bg-gradient-*`），除非用户明确要求
- ❌ 禁止使用其他 UI 库（MUI、Ant Design、Chakra UI 等），只用 shadcn/ui
- ❌ 禁止使用任意颜色值，必须通过 Material CSS 变量令牌
- ❌ 禁止随意创建自定义组件（仅 FAB、RippleContainer、Elevation 三个例外）
- ❌ 禁止使用 Tailwind v3 的 `tailwind.config.js` 模式

---

## 实现检查顺序

1. **查 shadcn blocks**（通过 shadcn MCP）
2. **查已安装的 shadcn 组件**（`components/ui/`，30+ 组件）
3. **组件组合 + Tailwind + Material 令牌**
4. **仅 3 个例外**允许自定义
5. 颜色用 CSS 变量（`bg-[--primary]`），间距用 Material 阶梯，字体用 `font-sans` / `font-heading` / `font-mono`
6. 交互元素加上 `.ripple-container` + `.elevation-N`
7. 新增视图时，同步更新 `ViewId` 类型、`viewMap`、`viewPermissions`、`navMenus`、`viewMeta`

---

## 项目结构

```
newcwy/
├── app/
│   ├── layout.tsx          # 根布局（字体加载 + Provider）
│   ├── page.tsx            # 首页（Sidebar + TopBar + ViewRenderer + AIAssistant）
│   └── globals.css         # 全局样式 + Material 令牌 + 动效
├── components/
│   ├── custom/
│   │   └── RippleContainer.tsx  # Material 涟漪容器
│   ├── layout/
│   │   ├── Providers.tsx    # URL 视图恢复
│   │   ├── Sidebar.tsx      # 侧边导航（分组折叠 + 图标映射 + 角色切换）
│   │   ├── TopBar.tsx       # 顶栏（面包屑 + 搜索 + 通知 + 角色选择 + 汇报模式）
│   │   └── AIAssistant.tsx  # AI 面板（诊断 + 财枢问答）
│   ├── ui/                  # 30+ shadcn/ui 组件
│   └── views/               # 40+ 财务视图（lazy loaded）
├── lib/
│   ├── types.ts             # 核心类型（Role、ViewId、MenuItem 等）
│   ├── navigation.ts        # 导航配置 + RBAC 权限 + 视图元数据
│   ├── store.ts             # Zustand 全局状态
│   └── utils.ts             # cn() 工具函数
├── CLAUDE.md                # Claude Code 约束文件
└── WORKBUDDY.md             # 本文档
```
