import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { NextResponse } from 'next/server';

/**
 * This file can't import any NODE API because it is used in the middleware, which is
 * not accessible to the Node API.
 *
 * The file is separated from auth.ts to apply to both the middleware(non-node env) and the auth API(node env, auth.ts).
 */

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  callbacks: {
    /**
     * Returning false won't work(Unauthenticated users see the protected resources) after upgrading Nextjs from v14 to v15. Even though I
     * followed the documentation from the following sources:
     * 1. https://nextjs.org/learn/dashboard-app/adding-authentication
     * 2. https://authjs.dev/getting-started/session-management/protecting
     *
     * The workaround is to use `redirect` to prevent unauthenticated users from accessing the protected resources.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return NextResponse.redirect(new URL('/login', nextUrl));
      } else if (isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [GitHub], // Add providers with an empty array for now
} satisfies NextAuthConfig;
