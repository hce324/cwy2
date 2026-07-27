// tRPC context — extracts auth from NextAuth session
// Phase 3: full JWT parsing with role + companyId
import { db } from '@/lib/db';
import { auth } from '@/server/auth';

export interface AuthUser {
  id: number;
  companyId: number;
  role: '财务负责人' | '财务专员' | '出纳';
  displayName: string;
}

export async function createTRPCContext() {
  const session = await auth();

  let user: AuthUser | null = null;

  if (session?.user) {
    const u = session.user as any;
    user = {
      id: Number(u.id),
      companyId: Number(u.companyId),
      role: u.role as AuthUser['role'],
      displayName: u.name ?? '',
    };
  }

  return { db, user };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
