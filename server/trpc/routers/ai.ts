import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const sendMessageSchema = z.object({
  content: z.string().min(1, '内容不能为空'),
  sessionId: z.string().min(1),
});

const messagesListSchema = z.object({
  sessionId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const createAnalysisSchema = z.object({
  fiscalPeriodId: z.number(),
  module: z.string().min(1),
  status: z.enum(['健康', '需关注', '预警']),
  conclusion: z.string().min(1),
  analysisCount: z.number().default(0),
  warningCount: z.number().default(0),
  findingsJson: z.any().optional(),
});

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })),
});

// ── Helpers ───────────────────────────────────────────────────────

function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0;
  return Number(v);
}
function fmtWan(n: number): string {
  return (n / 10_000).toFixed(2) + '万';
}
function fmtPct(n: number): string {
  return n.toFixed(2) + '%';
}

async function buildContext(db: any, companyId: number) {
  // Match OverviewView: try current year+month first, fall back to latest period
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  let period = await db.fiscalPeriod.findFirst({
    where: { companyId: BigInt(companyId), year, month },
  });
  if (!period) {
    // Fallback: most recent period (OverviewView also falls back to id=1 here)
    period = await db.fiscalPeriod.findFirst({
      where: { companyId: BigInt(companyId) },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
  if (!period) return null;

  const periodId = period.id;
  const periodLabel = `${period.year}年${period.month}月`;

  const [snapshot, riskExceptions] = await Promise.all([
    db.monthlyFinancialSnapshot.findFirst({
      where: { companyId: BigInt(companyId), fiscalPeriodId: BigInt(periodId) },
    }),
    db.riskException.findMany({
      where: { companyId: BigInt(companyId), status: 'open' },
      take: 5,
      orderBy: { detectedAt: 'desc' },
    }),
  ]);

  if (!snapshot) return null;

  return {
    periodLabel,
    revenue: toNum(snapshot.revenue),
    revenueYoy: toNum(snapshot.revenueYoy),
    netProfit: toNum(snapshot.netProfit),
    netProfitYoy: toNum(snapshot.netProfitYoy),
    netMargin: toNum(snapshot.netMargin),
    grossMargin: toNum(snapshot.grossMargin),
    grossMarginBenchmark: toNum(snapshot.grossMarginBenchmark),
    operatingCashFlow: toNum(snapshot.operatingCashFlow),
    openingCash: toNum(snapshot.openingCash),
    closingCash: toNum(snapshot.closingCash),
    overdueRatio: toNum(snapshot.overdueRatio),
    fundCoverage: toNum(snapshot.fundCoverage),
    risks: (riskExceptions as any[]).map((r: any) => ({
      title: r.title,
      level: r.riskLevel,
      status: r.status,
    })),
  };
}

function buildSystemPrompt(ctx: NonNullable<Awaited<ReturnType<typeof buildContext>>>) {
  const data = [
    `【当前会计期间】${ctx.periodLabel}`,
    `【收入】${fmtWan(ctx.revenue)}（同比 ${fmtPct(ctx.revenueYoy)}）`,
    `【净利润】${fmtWan(ctx.netProfit)}（同比 ${fmtPct(ctx.netProfitYoy)}）`,
    `【净利率】${fmtPct(ctx.netMargin)}`,
    `【毛利率】${fmtPct(ctx.grossMargin)}（基准 ${fmtPct(ctx.grossMarginBenchmark)}）`,
    `【经营现金流】${fmtWan(ctx.operatingCashFlow)}`,
    `【期初现金】${fmtWan(ctx.openingCash)} · 【期末现金】${fmtWan(ctx.closingCash)}`,
    `【逾期率】${fmtPct(ctx.overdueRatio)}`,
    `【资金保障倍数】${ctx.fundCoverage.toFixed(2)}`,
  ];

  if (ctx.risks.length > 0) {
    data.push('【当前风险】' + ctx.risks.map((r: any) => `${r.level}·${r.title}`).join('；'));
  }

  return `你是企业财务驾驶舱的 AI 助手，帮助老板快速理解经营状况。

你的核心职责：把财务数据转化为老板听得懂、用得上的经营洞察。
回答规则：
1. 始终使用 Markdown 格式回复：表格用 | 列 | 列 |、重点用 **加粗**、对比用 - 列表、数值标记用 🔴 紧急 / 🟡 关注 / 🟢 正常
2. 结论先行：一句话说清核心结论，再用数据支撑
3. 金额默认用万元（如 1,268.04 万）
4. 比率用百分数（如 16.94%）
5. 多指标对比用 Markdown 表格，单指标趋势用文字
6. 数据缺失时明确告知，不要编造
7. 只说结论和数据，不说空话（如"经过综合分析""建议酌情考虑"等）
7. 只说结论和数据，不说空话（如"经过综合分析""建议酌情考虑"等）

当前财务数据：
${data.join('\n')}`;
}

// ─── Router ───────────────────────────────────────────────────────

export const aiRouter = router({
  // ── Chat Messages ───────────────────────────────────────────────

  messages: protectedProcedure
    .input(messagesListSchema)
    .query(async ({ ctx, input }) => {
      const { sessionId, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (sessionId) where.sessionId = sessionId;

      const [items, total] = await Promise.all([
        ctx.db.chatMessage.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'asc' },
        }),
        ctx.db.chatMessage.count({ where }),
      ]);
      return { items, total };
    }),

  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Store user message
      const userMsg = await ctx.db.chatMessage.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          sessionId: input.sessionId,
          role: 'user',
          content: input.content,
          timestampMs: BigInt(Date.now()),
        },
      });

      // Generate assistant echo response (demo mode — echoes with AI prefix)
      const assistantContent = `[AI Demo] 收到您的消息："${input.content.slice(0, 200)}"。当前为演示模式，完整的 AI 分析功能将在后续版本中实现。`;
      const assistantMsg = await ctx.db.chatMessage.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          sessionId: input.sessionId,
          role: 'assistant',
          content: assistantContent,
          timestampMs: BigInt(Date.now() + 1),
        },
      });

      return { userMessage: userMsg, assistantMessage: assistantMsg };
    }),

  clearConversation: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatMessage.deleteMany({
        where: {
          ...tenantWhere(ctx.user.companyId),
          sessionId: input.sessionId,
        },
      });
    }),

  // ── DeepSeek Chat ────────────────────────────────────────────────

  chat: protectedProcedure
    .input(chatSchema)
    .mutation(async ({ ctx, input }) => {
      const context = await buildContext(ctx.db, Number(ctx.user.companyId));
      if (!context) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到当前会计期间的财务数据，无法提供 AI 问答。',
        });
      }

      const systemPrompt = buildSystemPrompt(context);

      // Build messages: system + history + current user message
      const messages = [
        { role: 'system', content: systemPrompt },
        ...input.history.map((h) => ({
          role: h.role === 'ai' ? 'assistant' : 'user',
          content: h.content,
        })),
        { role: 'user', content: input.message },
      ];

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'DeepSeek API Key 未配置，请在 .env 中设置 DEEPSEEK_API_KEY。',
        });
      }

      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `DeepSeek API 调用失败 (${res.status})：${errBody.slice(0, 200)}`,
        });
      }

      const json = await res.json() as {
        choices: Array<{ message: { content: string } }>;
      };

      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI 未返回有效内容，请稍后重试。',
        });
      }

      return { content };
    }),

  // ── AI Analysis Results ─────────────────────────────────────────

  analysisResults: protectedProcedure
    .input(z.object({
      module: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { module, status, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (module) where.module = module;
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        ctx.db.aiAnalysisResult.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { fiscalPeriod: true },
        }),
        ctx.db.aiAnalysisResult.count({ where }),
      ]);
      return { items, total };
    }),

  latestAnalysis: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.aiAnalysisResult.findMany({
      where: tenantWhere(ctx.user.companyId),
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { fiscalPeriod: true },
    });
  }),

  createAnalysis: protectedProcedure
    .input(createAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.aiAnalysisResult.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          fiscalPeriodId: BigInt(input.fiscalPeriodId),
          module: input.module,
          status: input.status,
          conclusion: input.conclusion,
          analysisCount: input.analysisCount,
          warningCount: input.warningCount,
          findingsJson: input.findingsJson ?? undefined,
        },
      });
    }),
});
