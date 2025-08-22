import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { edgeAuth as auth } from '@/lib/auth/edge-auth';
import {
  isProtectedRoute as isProtectedRouteEdge,
  hasRouteAccess,
  getDefaultDashboardForRole
} from '@/lib/auth/edge-utils';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

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

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(route);
  });
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
  if (isProtectedRouteEdge(pathnameWithoutLocale)) {
    // Use NextAuth v5 auth function for proper session verification
    const session = await auth();
    
    if (!session?.user) {
      // Redirect to login with callback URL, preserving locale
      const locale = pathname.split('/')[1];
      const loginPath = locales.includes(locale) 
        ? `/${locale}/login` 
        : `/${defaultLocale}/login`;
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access for specific routes
    const userRoles = session.user.roles || [];
    const selectedRole = session.user.selectedRole || userRoles[0] || 'CLIENT';
    
    if (!hasRouteAccess(pathnameWithoutLocale, selectedRole)) {
      // Redirect to appropriate dashboard for user's role
      const locale = pathname.split('/')[1];
      const dashboardPath = getDefaultDashboardForRole(selectedRole);
      const redirectPath = locales.includes(locale) 
        ? `/${locale}${dashboardPath}` 
        : `/${defaultLocale}${dashboardPath}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // For authenticated users accessing login/register, redirect to dashboard
  if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register') {
    const session = await auth();
    
    if (session?.user) {
      const userRoles = session.user.roles || [];
      const selectedRole = session.user.selectedRole || userRoles[0] || 'CLIENT';
      const locale = pathname.split('/')[1];
      const dashboardPath = getDefaultDashboardForRole(selectedRole);
      const redirectPath = locales.includes(locale) 
        ? `/${locale}${dashboardPath}` 
        : `/${defaultLocale}${dashboardPath}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
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