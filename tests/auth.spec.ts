import { test, expect, type Page } from '@playwright/test';

// Test configuration
const TEST_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Test user data
const TEST_USERS = {
  client: {
    email: 'test.client@example.com',
    password: 'TestClient123!',
    name: 'Test Client',
    role: 'CLIENT'
  },
  driver: {
    email: 'test.driver@example.com',
    password: 'TestDriver123!',
    name: 'Test Driver',
    role: 'DRIVER'
  },
  admin: {
    email: 'test.admin@example.com',
    password: 'TestAdmin123!',
    name: 'Test Admin',
    role: 'ADMIN'
  }
};

// Helper functions
class AuthHelper {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto(`${TEST_BASE_URL}/en/login`);
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    
    // Click login button
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    // Look for logout button (may be in dropdown menu)
    const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try to find logout in user menu
      const userMenu = this.page.locator('[data-testid="user-menu"], .user-menu');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await this.page.click('button:has-text("Logout"), button:has-text("Sign Out")');
      }
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async checkAuthState() {
    // Check if we're on a dashboard page (indicates authentication)
    const currentUrl = this.page.url();
    return {
      isAuthenticated: currentUrl.includes('/dashboard'),
      isOnLoginPage: currentUrl.includes('/login'),
      currentUrl
    };
  }

  async waitForDashboard(expectedRole?: string) {
    await this.page.waitForURL(`**/dashboard/**`, { timeout: 10000 });
    
    if (expectedRole) {
      const expectedPath = expectedRole.toLowerCase();
      await expect(this.page).toHaveURL(new RegExp(`/dashboard/${expectedPath}`));
    }
  }

  async checkSessionCookies() {
    const cookies = await this.page.context().cookies();
    
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('next-auth.session-token') || 
      cookie.name.includes('__Secure-next-auth.session-token')
    );
    
    const authTokenCookie = cookies.find(cookie => cookie.name === 'auth-token');
    
    return {
      hasSessionCookie: !!sessionCookie,
      hasAuthTokenCookie: !!authTokenCookie,
      sessionCookie,
      authTokenCookie,
      allCookies: cookies
    };
  }
}

test.describe('NextAuth v5 Authentication Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test.afterEach(async ({ page }) => {
    // Clear all cookies after each test
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected dashboard route
    await page.goto(`${TEST_BASE_URL}/en/dashboard/client`);
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Should have callback URL parameter
    const url = new URL(page.url());
    expect(url.searchParams.get('callbackUrl')).toContain('/dashboard/client');
  });

  test('should prevent access to login page when authenticated', async ({ page }) => {
    // Mock authentication by setting NextAuth session cookie
    await page.context().addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/'
    }]);

    // Try to access login page
    await page.goto(`${TEST_BASE_URL}/en/login`);
    
    // Should redirect away from login (to dashboard or home)
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/login');
  });

  test('should handle NextAuth v5 credentials login flow', async ({ page }) => {
    await authHelper.navigateToLogin();
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_USERS.client.email);
    await page.fill('input[type="password"]', TEST_USERS.client.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect or error
    await page.waitForLoadState('networkidle');
    
    // Check if we have authentication cookies
    const cookieState = await authHelper.checkSessionCookies();
    
    // Should have NextAuth session cookie, not custom auth-token
    expect(cookieState.hasSessionCookie).toBeTruthy();
    expect(cookieState.hasAuthTokenCookie).toBeFalsy(); // Should NOT have custom JWT token
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // Mock an expired session
    await page.context().addCookies([{
      name: 'next-auth.session-token',
      value: 'expired-session-token',
      domain: 'localhost',
      path: '/'
    }]);

    // Try to access protected route
    await page.goto(`${TEST_BASE_URL}/en/dashboard/client`);
    
    // Should handle expired session by redirecting to login
    await page.waitForLoadState('networkidle');
    
    // Should be on login page or have cleared invalid session
    const authState = await authHelper.checkAuthState();
    expect(authState.isOnLoginPage || !authState.isAuthenticated).toBeTruthy();
  });

  test('should handle role-based access control', async ({ page }) => {
    // Mock session with CLIENT role
    await page.evaluate(() => {
      // Mock NextAuth session in client
      window.__NEXT_DATA__ = {
        props: {
          session: {
            user: {
              id: 'test-user',
              email: 'test@example.com',
              roles: ['CLIENT'],
              selectedRole: 'CLIENT'
            }
          }
        }
      };
    });

    // Try to access admin route
    await page.goto(`${TEST_BASE_URL}/en/dashboard/admin`);
    
    // Should redirect to appropriate dashboard for user's role
    await page.waitForLoadState('networkidle');
    
    // Should NOT be on admin dashboard
    expect(page.url()).not.toContain('/dashboard/admin');
    
    // Should be redirected to client dashboard or access denied
    const url = page.url();
    expect(url.includes('/dashboard/client') || url.includes('/login')).toBeTruthy();
  });

  test('should verify no legacy JWT tokens are used', async ({ page }) => {
    await authHelper.navigateToLogin();
    
    // Monitor network requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });
    
    // Try to login
    await page.fill('input[type="email"]', TEST_USERS.client.email);
    await page.fill('input[type="password"]', TEST_USERS.client.password);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // Check that NO legacy endpoints were called
    const legacyEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me'
    ];
    
    for (const endpoint of legacyEndpoints) {
      const wasCalled = apiRequests.some(url => url.includes(endpoint));
      expect(wasCalled).toBeFalsy();
    }
    
    // Check that only NextAuth endpoints were used
    const nextAuthCalls = apiRequests.filter(url => 
      url.includes('/api/auth/signin') || 
      url.includes('/api/auth/session') ||
      url.includes('/api/auth/callback')
    );
    
    expect(nextAuthCalls.length).toBeGreaterThan(0);
  });

  test('should handle logout properly', async ({ page }) => {
    // Mock authenticated state
    await page.context().addCookies([{
      name: 'next-auth.session-token',
      value: 'valid-session-token',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto(`${TEST_BASE_URL}/en/dashboard/client`);
    
    // Attempt logout
    await authHelper.logout();
    
    // Should be redirected to home or login
    await page.waitForLoadState('networkidle');
    
    const authState = await authHelper.checkAuthState();
    expect(authState.isAuthenticated).toBeFalsy();
    
    // Check that session cookies were cleared
    const cookieState = await authHelper.checkSessionCookies();
    expect(cookieState.hasSessionCookie).toBeFalsy();
    expect(cookieState.hasAuthTokenCookie).toBeFalsy();
  });

  test('should verify middleware authentication checks', async ({ page }) => {
    // Test protected routes without authentication
    const protectedRoutes = [
      '/en/dashboard/client',
      '/en/dashboard/admin',
      '/en/dashboard/driver',
      '/en/dashboard/editor',
      '/en/booking',
      '/en/profile'
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${TEST_BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login
      expect(page.url()).toContain('/login');
      
      // Should have callback URL
      const url = new URL(page.url());
      expect(url.searchParams.get('callbackUrl')).toContain(route);
    }
  });

  test('should verify secure cookie settings', async ({ page }) => {
    await authHelper.navigateToLogin();
    
    // Perform login (even if it fails, we can check cookie security)
    await page.fill('input[type="email"]', TEST_USERS.client.email);
    await page.fill('input[type="password"]', TEST_USERS.client.password);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    const cookieState = await authHelper.checkSessionCookies();
    
    // Verify NextAuth session cookie security
    if (cookieState.sessionCookie) {
      expect(cookieState.sessionCookie.httpOnly).toBeTruthy();
      expect(cookieState.sessionCookie.sameSite).toBe('lax');
      
      // In production, should be secure
      if (process.env.NODE_ENV === 'production') {
        expect(cookieState.sessionCookie.secure).toBeTruthy();
      }
    }
    
    // Verify NO legacy auth-token cookies exist
    expect(cookieState.hasAuthTokenCookie).toBeFalsy();
  });

  test('should handle multiple roles and role switching', async ({ page }) => {
    // Mock user with multiple roles
    await page.evaluate(() => {
      window.__NEXT_DATA__ = {
        props: {
          session: {
            user: {
              id: 'multi-role-user',
              email: 'multirole@example.com',
              roles: ['CLIENT', 'DRIVER'],
              selectedRole: 'CLIENT'
            }
          }
        }
      };
    });

    await page.goto(`${TEST_BASE_URL}/en/dashboard/client`);
    await page.waitForLoadState('networkidle');
    
    // Look for role switcher UI
    const roleSwitcher = page.locator('[data-testid="role-switcher"], .role-switcher');
    
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      // Select driver role
      await page.click('button:has-text("Driver")');
      
      // Should redirect to driver dashboard
      await authHelper.waitForDashboard('driver');
    }
  });
});

test.describe('Security Validation', () => {
  test('should not expose sensitive data in client-side code', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/en/login`);
    
    // Check that no JWT secrets or sensitive data are exposed
    const pageContent = await page.content();
    
    const sensitivePatterns = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'NEXTAUTH_SECRET',
      'database password',
      'private key'
    ];
    
    for (const pattern of sensitivePatterns) {
      expect(pageContent.toLowerCase()).not.toContain(pattern.toLowerCase());
    }
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    // NextAuth v5 should handle CSRF protection
    const response = await page.request.post(`${TEST_BASE_URL}/api/auth/signin/credentials`, {
      data: {
        email: 'test@example.com',
        password: 'password'
      }
    });
    
    // Should require CSRF token or return appropriate error
    expect(response.status()).not.toBe(200);
  });

  test('should have proper Content Security Policy', async ({ page }) => {
    const response = await page.goto(`${TEST_BASE_URL}/en/login`);
    
    const cspHeader = response?.headers()['content-security-policy'];
    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain("default-src 'self'");
  });
});
