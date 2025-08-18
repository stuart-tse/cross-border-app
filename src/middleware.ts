import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from './lib/auth/config';
import { locales, defaultLocale } from './i18n';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/booking',
  '/profile',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/routes',
  '/contact',
  '/blog',
  '/login',
  '/register',
];

// Role-based route definitions
const roleRoutes = {
  ADMIN: ['/dashboard/admin'],
  DRIVER: ['/dashboard/driver'],
  BLOG_EDITOR: ['/dashboard/editor'],
  CLIENT: ['/dashboard/client'],
};

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(route);
  });
}

function hasRoleAccess(pathname: string, userRole: string): boolean {
  // Check if user has access to the specific route based on their role
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return userRole === role || userRole === 'ADMIN'; // Admin can access all routes
    }
  }
  return true; // Allow access to general dashboard routes
}

function getDefaultDashboardForRole(role: string): string {
  const dashboardMap: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    DRIVER: '/dashboard/driver',
    BLOG_EDITOR: '/dashboard/editor', 
    CLIENT: '/dashboard/client',
  };
  return dashboardMap[role] || '/dashboard/client';
}

function getPathnameWithoutLocale(pathname: string): string {
  // Remove locale prefix from pathname
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as any)) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Handle internationalization first - this should handle the routing
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returns a response (redirect), use it
  if (intlResponse instanceof Response && intlResponse.status !== 200) {
    return intlResponse;
  }

  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

  // Check if route requires authentication
  if (isProtectedRoute(pathnameWithoutLocale)) {
    try {
      const session = await auth();
      
      if (!session?.user) {
        // Redirect to login with callback URL
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check role-based access
      const userSelectedRole = session.user.selectedRole;
      if (!userSelectedRole || !hasRoleAccess(pathnameWithoutLocale, userSelectedRole)) {
        // If no selected role or unauthorized, redirect to appropriate dashboard for user's role
        const safeSelectedRole = userSelectedRole || 'CLIENT'; // Default to CLIENT if no role
        const defaultDashboard = getDefaultDashboardForRole(safeSelectedRole);
        
        console.log('🚫 Middleware: Unauthorized access attempt');
        console.log('🛤️  Path:', pathnameWithoutLocale);
        console.log('👤 User role:', userSelectedRole);
        console.log('🔄 Redirecting to:', defaultDashboard);
        
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }

      // Redirect bare /dashboard to role-specific dashboard
      if (pathnameWithoutLocale === '/dashboard') {
        const defaultDashboard = getDefaultDashboardForRole(userSelectedRole || 'CLIENT');
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Redirect to login on auth error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For authenticated users accessing login/register, redirect to dashboard
  if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register') {
    try {
      const session = await auth();
      if (session?.user) {
        const defaultDashboard = getDefaultDashboardForRole(session.user.selectedRole || 'CLIENT');
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }
    } catch (error) {
      // Continue to login/register page if auth check fails
    }
  }

  // Add security headers
  const response = intlResponse instanceof Response 
    ? new NextResponse(intlResponse.body, intlResponse) 
    : NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add CSP header for enhanced security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.amap.com",
    "style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob: *.googleapis.com *.amap.com *.unsplash.com res.cloudinary.com",
    "connect-src 'self' *.googleapis.com *.amap.com api.mapbox.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - _static (inside /public)
    // - _vercel (Vercel internals)
    // - favicon.ico, sitemap.xml, robots.txt (static files)
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)',
  ],
};