import { auth } from '@/server/auth';

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isAuthPage) {
    if (isAuth) return Response.redirect(new URL('/', req.nextUrl));
    return;
  }

  if (!isAuth && !isApiRoute) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
