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
