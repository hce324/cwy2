import { z } from 'zod';
import { protectedProcedure, directorProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

export const settingsRouter = router({
  // ── existing ──
  connections: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.systemConnection.findMany({
      where: tenantWhere(ctx.user.companyId),
    });
  }),

  dictionary: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.dataDictionaryEntry.findMany({
      where: tenantWhere(ctx.user.companyId),
    });
  }),

  // ── new ──

  createConnection: directorProcedure
    .input(z.object({
      connectionType: z.string(),
      connectionName: z.string(),
      status: z.string().optional(),
      config: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.systemConnection.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          connectionType: input.connectionType,
          connectionName: input.connectionName,
          status: input.status ?? '已连接',
          statusTone: 'neutral',
          syncTone: 'neutral',
          subtitle: input.config,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'CREATE',
          entityType: 'SystemConnection',
          entityId: result.id,
          newValueJson: {
            connectionType: input.connectionType,
            connectionName: input.connectionName,
            status: input.status ?? '已连接',
          },
        },
      });
      return result;
    }),

  updateConnection: directorProcedure
    .input(z.object({
      id: z.number(),
      connectionName: z.string().optional(),
      status: z.string().optional(),
      config: z.string().optional(),
      lastSyncAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input;
      const data: Record<string, unknown> = {};
      if (fields.connectionName !== undefined) data.connectionName = fields.connectionName;
      if (fields.status !== undefined) data.status = fields.status;
      if (fields.config !== undefined) data.subtitle = fields.config;
      if (fields.lastSyncAt !== undefined) data.lastSyncAt = new Date(fields.lastSyncAt);
      const result = await ctx.db.systemConnection.update({
        where: { id },
        data,
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'UPDATE',
          entityType: 'SystemConnection',
          entityId: BigInt(id),
          newValueJson: fields,
        },
      });
      return result;
    }),

  deleteConnection: directorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.systemConnection.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'DELETE',
          entityType: 'SystemConnection',
          entityId: BigInt(input.id),
          newValueJson: { deletedAt: new Date().toISOString() },
        },
      });
      return result;
    }),

  createDictEntry: directorProcedure
    .input(z.object({
      dictType: z.string(),
      dictCode: z.string(),
      dictName: z.string(),
      dictValue: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.dataDictionaryEntry.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          module: input.dictType,
          keyFields: input.dictCode,
          responsiblePerson: input.dictName,
          indicators: input.dictValue,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'CREATE',
          entityType: 'DataDictionaryEntry',
          entityId: result.id,
          newValueJson: {
            dictType: input.dictType,
            dictCode: input.dictCode,
            dictName: input.dictName,
            dictValue: input.dictValue,
          },
        },
      });
      return result;
    }),

  updateDictEntry: directorProcedure
    .input(z.object({
      id: z.number(),
      dictName: z.string().optional(),
      dictValue: z.string().optional(),
      sortOrder: z.number().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input;
      const data: Record<string, unknown> = {};
      if (fields.dictName !== undefined) data.responsiblePerson = fields.dictName;
      if (fields.dictValue !== undefined) data.indicators = fields.dictValue;
      // sortOrder and status have no matching columns in DataDictionaryEntry schema
      const result = await ctx.db.dataDictionaryEntry.update({
        where: { id },
        data,
      });
      await ctx.db.auditLog.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          userId: BigInt(ctx.user.id),
          action: 'UPDATE',
          entityType: 'DataDictionaryEntry',
          entityId: BigInt(id),
          newValueJson: fields,
        },
      });
      return result;
    }),
});
