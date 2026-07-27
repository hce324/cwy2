import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../init';
import { tenantWhere } from '@/lib/tenant';

// ─── Zod schemas ──────────────────────────────────────────────────

const itemCreateSchema = z.object({
  skuCode: z.string().min(1, 'SKU编码不能为空').max(50),
  skuName: z.string().min(1, 'SKU名称不能为空').max(255),
  warehouse: z.string().min(1, '仓库不能为空').max(255),
  quantity: z.number().int().min(0).default(0),
  safetyStock: z.number().int().min(0).default(0),
  unitCost: z.number().min(0),
  category: z.string().min(1, '分类不能为空').max(50),
  turnoverDays: z.number().optional(),
});

const itemUpdateSchema = itemCreateSchema.partial();

const itemListSchema = z.object({
  category: z.string().optional(),
  warehouse: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const inboundCreateSchema = z.object({
  docNo: z.string().min(1, '单据号不能为空').max(50),
  type: z.string().min(1, '入库类型不能为空').max(50),
  inboundDate: z.string(),
  warehouse: z.string().min(1, '仓库不能为空').max(255),
  itemCount: z.number().int().min(1, '商品数量至少为1'),
  totalAmount: z.number().min(0),
  status: z.string().default('completed'),
});

const inboundListSchema = z.object({
  warehouse: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const outboundCreateSchema = z.object({
  docNo: z.string().min(1, '单据号不能为空').max(50),
  type: z.string().min(1, '出库类型不能为空').max(50),
  outboundDate: z.string(),
  warehouse: z.string().min(1, '仓库不能为空').max(255),
  itemCount: z.number().int().min(1, '商品数量至少为1'),
  totalAmount: z.number().min(0),
  status: z.string().default('completed'),
});

const outboundListSchema = z.object({
  warehouse: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ─── Router ───────────────────────────────────────────────────────

export const inventoryRouter = router({
  // ── InventoryItem ──────────────────────────────────────────────

  listItems: protectedProcedure
    .input(itemListSchema)
    .query(async ({ ctx, input }) => {
      const { category, warehouse, keyword, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (category) where.category = category;
      if (warehouse) where.warehouse = warehouse;
      if (keyword) {
        where.OR = [
          { skuCode: { contains: keyword } },
          { skuName: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.inventoryItem.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.inventoryItem.count({ where }),
      ]);
      return { items, total };
    }),

  itemById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inventoryItem.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
    }),

  createItem: protectedProcedure
    .input(itemCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inventoryItem.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          skuCode: input.skuCode,
          skuName: input.skuName,
          warehouse: input.warehouse,
          quantity: input.quantity,
          safetyStock: input.safetyStock,
          unitCost: input.unitCost,
          category: input.category,
          turnoverDays: input.turnoverDays,
        },
      });
    }),

  updateItem: protectedProcedure
    .input(z.object({ id: z.number(), data: itemUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.inventoryItem.findFirst({
        where: { ...tenantWhere(ctx.user.companyId), id: input.id },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: '商品不存在' });

      return ctx.db.inventoryItem.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // ── InventoryInbound ───────────────────────────────────────────

  listInbounds: protectedProcedure
    .input(inboundListSchema)
    .query(async ({ ctx, input }) => {
      const { warehouse, type, status, dateFrom, dateTo, keyword, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (warehouse) where.warehouse = warehouse;
      if (type) where.type = type;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        where.inboundDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { docNo: { contains: keyword } },
          { warehouse: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.inventoryInbound.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { inboundDate: 'desc' },
        }),
        ctx.db.inventoryInbound.count({ where }),
      ]);
      return { items, total };
    }),

  createInbound: protectedProcedure
    .input(inboundCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inventoryInbound.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          docNo: input.docNo,
          type: input.type,
          inboundDate: new Date(input.inboundDate),
          warehouse: input.warehouse,
          itemCount: input.itemCount,
          totalAmount: input.totalAmount,
          status: input.status,
        },
      });
    }),

  // ── InventoryOutbound ──────────────────────────────────────────

  listOutbounds: protectedProcedure
    .input(outboundListSchema)
    .query(async ({ ctx, input }) => {
      const { warehouse, type, status, dateFrom, dateTo, keyword, limit, offset } = input;
      const where: any = tenantWhere(ctx.user.companyId);

      if (warehouse) where.warehouse = warehouse;
      if (type) where.type = type;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        where.outboundDate = dateFilter;
      }
      if (keyword) {
        where.OR = [
          { docNo: { contains: keyword } },
          { warehouse: { contains: keyword } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.inventoryOutbound.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { outboundDate: 'desc' },
        }),
        ctx.db.inventoryOutbound.count({ where }),
      ]);
      return { items, total };
    }),

  createOutbound: protectedProcedure
    .input(outboundCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate stock sufficiency — check total inventory quantity in the warehouse
      const itemsInWarehouse = await ctx.db.inventoryItem.aggregate({
        where: {
          ...tenantWhere(ctx.user.companyId),
          warehouse: input.warehouse,
        },
        _sum: { quantity: true },
      });
      const totalStock = itemsInWarehouse._sum.quantity ?? 0;
      if (totalStock < input.itemCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `库存不足：当前仓库库存 ${totalStock}，出库数量 ${input.itemCount}`,
        });
      }

      return ctx.db.inventoryOutbound.create({
        data: {
          companyId: BigInt(ctx.user.companyId),
          docNo: input.docNo,
          type: input.type,
          outboundDate: new Date(input.outboundDate),
          warehouse: input.warehouse,
          itemCount: input.itemCount,
          totalAmount: input.totalAmount,
          status: input.status,
        },
      });
    }),

  // ── Stock Summary ──────────────────────────────────────────────

  stockSummary: protectedProcedure.query(async ({ ctx }) => {
    const [categorySummary, warehouseSummary, totalItems, lowStockItems] = await Promise.all([
      ctx.db.inventoryItem.groupBy({
        by: ['category'],
        where: tenantWhere(ctx.user.companyId),
        _sum: { quantity: true },
        _count: true,
      }),
      ctx.db.inventoryItem.groupBy({
        by: ['warehouse'],
        where: tenantWhere(ctx.user.companyId),
        _sum: { quantity: true },
        _count: true,
      }),
      ctx.db.inventoryItem.count({ where: tenantWhere(ctx.user.companyId) }),
      ctx.db.inventoryItem.count({
        where: {
          ...tenantWhere(ctx.user.companyId),
          quantity: { lte: ctx.db.inventoryItem.fields.safetyStock },
        },
      }),
    ]);

    const totalQuantity = warehouseSummary.reduce((s, w) => s + (w._sum.quantity ?? 0), 0);
    const totalValue = 0; // Would require per-item unitCost * quantity

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockCount: lowStockItems,
      byCategory: categorySummary.map((c) => ({
        category: c.category,
        count: c._count,
        totalQuantity: c._sum.quantity ?? 0,
      })),
      byWarehouse: warehouseSummary.map((w) => ({
        warehouse: w.warehouse,
        count: w._count,
        totalQuantity: w._sum.quantity ?? 0,
      })),
    };
  }),
});
