import NextAuth, { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { 
  verifyPassword, 
  findUserByEmail, 
  sanitizeUserData,
  getActiveRoles 
} from './utils';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        selectedRole: { label: 'Selected Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email as string);

        if (!user || !user.passwords.length || !user.isActive) {
          return null;
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.passwords[0].hash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Get user's active roles
        const activeRoles = getActiveRoles(sanitizeUserData(user));
        
        if (activeRoles.length === 0) {
          return null; // User has no active roles
        }

        // Handle role selection
        let selectedRole: UserType;
        if (credentials.selectedRole && activeRoles.includes(credentials.selectedRole as UserType)) {
          selectedRole = credentials.selectedRole as UserType;
        } else {
          // Default to primary role if no role selected or invalid role
          const rolePriority = [UserType.ADMIN, UserType.DRIVER, UserType.BLOG_EDITOR, UserType.CLIENT];
          selectedRole = rolePriority.find(role => activeRoles.includes(role)) || activeRoles[0];
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || undefined,
          roles: activeRoles,
          selectedRole,
          userType: selectedRole,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.selectedRole = user.selectedRole;
        token.userType = user.userType;
        token.isVerified = user.isVerified;
      }

      // Handle role switching
      if (trigger === 'update' && session?.selectedRole) {
        console.log('🔐 NextAuth JWT callback - role switch requested:', session.selectedRole);
        
        // Fetch fresh roles from database to ensure we have the latest data
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              userRoles: {
                where: { isActive: true },
                select: { role: true }
              }
            }
          });
          
          if (freshUser) {
            const freshRoles = freshUser.userRoles.map(r => r.role);
            console.log('🔐 Fresh user roles from DB:', freshRoles);
            
            // Update token with latest roles
            token.roles = freshRoles;
            
            if (freshRoles.includes(session.selectedRole)) {
              console.log('✅ Role switch approved with fresh data, updating token');
              token.selectedRole = session.selectedRole;
              token.userType = session.selectedRole;
            } else {
              console.warn('❌ Role switch denied - user does not have role:', session.selectedRole);
            }
          } else {
            console.error('❌ User not found during role switch, using cached roles');
            const userRoles = token.roles as UserType[];
            console.log('🔐 Cached user available roles:', userRoles);
            if (userRoles.includes(session.selectedRole)) {
              console.log('✅ Role switch approved with cached data, updating token');
              token.selectedRole = session.selectedRole;
              token.userType = session.selectedRole;
            } else {
              console.warn('❌ Role switch denied - user does not have role:', session.selectedRole);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching fresh roles during JWT callback:', error);
          // Fallback to cached roles
          const userRoles = token.roles as UserType[];
          console.log('🔐 Fallback to cached roles:', userRoles);
          if (userRoles.includes(session.selectedRole)) {
            console.log('✅ Role switch approved with fallback data, updating token');
            token.selectedRole = session.selectedRole;
            token.userType = session.selectedRole;
          } else {
            console.warn('❌ Role switch denied - user does not have role:', session.selectedRole);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as UserType[];
        session.user.selectedRole = token.selectedRole as UserType;
        session.user.userType = token.userType as UserType;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              userRoles: {
                where: { isActive: true },
              },
            },
          });

          if (!existingUser) {
            // Create new user with default CLIENT role
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                avatar: user.image,
                isVerified: true, // Auto-verify Google users
                userRoles: {
                  create: {
                    role: UserType.CLIENT,
                    isActive: true,
                  },
                },
                clientProfile: {
                  create: {
                    membershipTier: 'BASIC',
                  },
                },
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }

      // For credentials login, user is already validated in authorize()
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login based on role
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign-in for security audit
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut(params: any) {
      // Log sign-out for security audit  
      const email = params?.token?.email || params?.session?.user?.email || 'unknown user';
      console.log(`User ${email} signed out`);
    },
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
  // Enable Next.js 15 features
  experimental: {
    enableWebAuthn: false, // Disable for now, enable when implementing WebAuthn
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);