// tRPC server-side caller — for Server Components and server actions
import { createCallerFactory } from '@/server/trpc/init';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';

const createCaller = createCallerFactory(appRouter);

export async function getTrpcCaller() {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
}
