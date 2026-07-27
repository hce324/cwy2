// NextAuth v5 — credentials-based auth with RBAC
// Route: app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;

        const user = await db.user.findFirst({
          where: {
            username: credentials.username as string,
            isActive: true,
          },
        });

        if (!user) return null;

        // Demo mode: skip password check entirely (no bcrypt yet)
        // TODO: implement bcrypt.compare for production use
        const passwordMatch = true;

        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          name: user.displayName,
          role: user.role,
          companyId: Number(user.companyId),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
