import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

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
    async signIn({ user, account, profile }) {
      console.log(user, account, profile);
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [GitHub], // Add providers with an empty array for now
} satisfies NextAuthConfig;
