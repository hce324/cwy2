// tRPC init — procedure builders with auth + RBAC
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { TRPCContext, AuthUser } from './context';

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ─── Reusable middlewares ──────────────────────────────────────────

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '请先登录' });
  }
  return next({ ctx: { ...ctx, user: ctx.user as AuthUser } });
});

const hasRole = (...roles: AuthUser['role'][]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '请先登录' });
    }
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `需要角色: ${roles.join(' / ')}，当前角色: ${ctx.user.role}`,
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user as AuthUser } });
  });

// ─── Procedure builders ────────────────────────────────────────────

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

/** Unauthenticated — health checks, login */
export const publicProcedure = t.procedure;

/** Authenticated — any logged-in user */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/** Authenticated + role-gated */
export const directorProcedure = t.procedure.use(hasRole('财务负责人'));
export const specialistProcedure = t.procedure.use(hasRole('财务负责人', '财务专员'));
export const cashierProcedure = t.procedure.use(hasRole('财务负责人', '出纳'));
