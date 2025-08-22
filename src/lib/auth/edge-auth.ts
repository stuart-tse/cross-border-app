// Edge Runtime compatible authentication setup
// Use this for middleware and edge functions
// IMPORTANT: This file MUST NOT import any Node.js-only dependencies

import NextAuth, { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

// Edge Runtime compatible NextAuth config (without password-based auth)
export const edgeAuthConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = ['CLIENT']; // Default role for OAuth users
        token.selectedRole = 'CLIENT';
        token.userType = 'CLIENT';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) || ['CLIENT'];
        session.user.selectedRole = (token.selectedRole as string) || 'CLIENT';
        session.user.userType = (token.userType as string) || 'CLIENT';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// Export auth instance for middleware use
export const { auth: edgeAuth, handlers, signIn, signOut } = NextAuth(edgeAuthConfig);

// Note: This is a simplified config for Edge Runtime
// For full auth functionality including Credentials provider, use the main auth config in Node.js runtime