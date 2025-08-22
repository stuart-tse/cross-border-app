// Edge Runtime compatible auth utilities
// This file should only contain utilities that work in Edge Runtime

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * JWT verification using jose library (Edge Runtime compatible)
 */
export async function verifyJWTEdge(token: string, secret: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        issuer: 'crossborder-vehicles',
        audience: 'crossborder-vehicles-app',
      }
    );
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract JWT token from request cookies
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

/**
 * Get session token from NextAuth cookies
 */
export function getNextAuthToken(request: NextRequest): string | null {
  // Try both production and development cookie names
  const prodToken = request.cookies.get('__Secure-next-auth.session-token')?.value;
  const devToken = request.cookies.get('next-auth.session-token')?.value;
  return prodToken || devToken || null;
}

/**
 * Extract user ID from NextAuth session token (Edge Runtime compatible)
 * Note: This is a simplified version. In production, use proper NextAuth edge functions
 */
export function extractUserFromNextAuthToken(token: string): { id: string; roles: string[] } | null {
  try {
    // NextAuth tokens are JWTs, so we can decode them
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return {
      id: payload.id || payload.sub,
      roles: payload.roles || ['CLIENT']
    };
  } catch (error) {
    console.error('NextAuth token extraction error:', error);
    return null;
  }
}

/**
 * Check if user has required role (Edge Runtime compatible)
 */
export function hasRequiredRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole) || userRoles.includes('ADMIN');
}

/**
 * Get default dashboard path for role
 */
export function getDefaultDashboardForRole(role: string): string {
  const dashboardMap: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    DRIVER: '/dashboard/driver',
    BLOG_EDITOR: '/dashboard/editor',
    CLIENT: '/dashboard/client',
  };
  return dashboardMap[role] || '/dashboard/client';
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/booking',
    '/profile',
  ];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if user has access to specific route
 */
export function hasRouteAccess(pathname: string, userRole: string): boolean {
  const roleRoutes = {
    ADMIN: ['/dashboard/admin'],
    DRIVER: ['/dashboard/driver'],
    BLOG_EDITOR: ['/dashboard/editor'],
    CLIENT: ['/dashboard/client'],
  };

  // Check if user has access to the specific route based on their role
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return userRole === role || userRole === 'ADMIN'; // Admin can access all routes
    }
  }
  return true; // Allow access to general dashboard routes
}