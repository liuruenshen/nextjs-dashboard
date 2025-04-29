import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
// export { auth as middleware} from '@/auth

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname === '/dashboard/i') {
    return NextResponse.rewrite(new URL('/dashboard/invoices', req.url));
  }
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
