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
  // Exclude `/api` so the auth middleware never runs on API routes.
  // NextAuth v5 serves /api/auth/* via the route handler; letting the
  // middleware intercept them (and returning `undefined`) was 404'ing
  // every /api route. This matches the official Auth.js v5 matcher.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
