# 财务云 — 财务管理协同平台

面向企业财务团队的 SaaS 演示原型。覆盖从原始凭证采集到财务报表输出的完整财务工作流，支持财务负责人、财务专员、出纳三种角色的协同作业。

## 技术栈

| 类别 | 方案 |
|:---|:---|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui（Radix UI） |
| 设计系统 | Material Design 3 |
| 状态管理 | Zustand |
| 图表 | Recharts |
| 图标 | Lucide React |
| 通知 | Sonner |
| 主题 | next-themes（亮色 / 暗色） |

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

## 角色体系

| 角色 | 视角 | 可访问模块 |
|:---|:---|:---|
| **财务负责人** | 全局管控 | 全部模块，侧重总览、报表、风险管理 |
| **财务专员** | 日常核算 | 凭证、账簿、报表、月结、固定资产、库存 |
| **出纳** | 资金操作 | 收付、银行对账、资金管理 |

角色通过顶栏下拉菜单切换，权限矩阵定义在 `lib/navigation.ts`。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 构建生产版本
npm run build

# 启动生产服务
npm run start
```

## 项目结构

```
cwy4/
├── app/
│   ├── layout.tsx          # 根布局（字体加载 + Provider 注入）
│   ├── page.tsx            # 首页入口（Sidebar + TopBar + 视图区）
│   └── globals.css         # 全局样式 + Material 令牌 + 动效 + 工具类
├── components/
│   ├── custom/
│   │   └── RippleContainer.tsx  # Material 涟漪动效
│   ├── layout/
│   │   ├── Providers.tsx    # URL 视图恢复
│   │   ├── Sidebar.tsx      # 侧边导航栏（分组 + 折叠 + 角色切换）
│   │   ├── TopBar.tsx       # 顶栏（面包屑 + 搜索 + 通知 + 角色选择）
│   │   └── AIAssistant.tsx  # AI 诊断 + 财枢问答面板
│   ├── ui/                  # 30+ shadcn/ui 组件
│   └── views/               # 40+ 财务视图（按需懒加载）
├── lib/
│   ├── types.ts             # 核心类型（Role、ViewId、MenuItem 等）
│   ├── navigation.ts        # 导航配置 + RBAC 权限矩阵 + 视图元数据
│   ├── store.ts             # Zustand 全局状态
│   └── utils.ts             # cn() 工具函数
├── public/                  # 静态资源
├── CLAUDE.md                # Claude Code 约束文件
├── WORKBUDDY.md             # WorkBuddy 约束文件
└── README.md                # 本文档
```

## 设计系统

项目遵循 Material Design 3 视觉规范，详见 `CLAUDE.md`。关键约定：

- **颜色** — 全部通过 CSS 变量引用（`--primary`、`--success`、`--danger` 等），禁止任意色值
- **间距** — Material 4px 基准阶梯（`p-1` = 4px ~ `p-8` = 32px）
- **字体** — Inter（正文）/ Roboto（标题）/ Fira Code（代码）
- **动效** — 涟漪（RippleContainer，450ms）+ elevation 阴影（`elevation-1` ~ `elevation-4`）
- **组件** — shadcn/ui 独占，仅 FAB、RippleContainer、Elevation 三个例外允许自定义

## 辅助工具

项目包含两个约束文件，确保 AI 编码助手遵循统一规范：

- `CLAUDE.md` — Claude Code 使用
- `WORKBUDDY.md` — WorkBuddy 使用

两个文件内容等价，均覆盖组件策略、视觉令牌、动效规范、禁止项和实现检查顺序。
