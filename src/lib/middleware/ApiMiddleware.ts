import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '../services/shared/CacheService';
import { StructuredLogger, generateRequestId } from '../services/shared/LoggingService';
import { AuthService } from '../services/auth/AuthService';
import { z } from 'zod';

export interface ApiContext {
  requestId: string;
  userId?: string;
  userEmail?: string;
  roles?: string[];
  ipAddress: string;
  userAgent: string;
  startTime: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest, context: ApiContext) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiMiddleware {
  private cache: CacheService;
  private authService: AuthService;

  constructor(cache: CacheService, authService: AuthService) {
    this.cache = cache;
    this.authService = authService;
  }

  // Create API context from request
  createContext(req: NextRequest): ApiContext {
    const requestId = generateRequestId();
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    return {
      requestId,
      ipAddress,
      userAgent,
      startTime: Date.now()
    };
  }

  // Rate limiting middleware
  rateLimit(config: RateLimitConfig) {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      try {
        const key = config.keyGenerator ? 
          config.keyGenerator(req, context) : 
          `rate_limit:${context.ipAddress}`;

        // Get current request count
        const current = await this.cache.get<number>(key) || 0;

        if (current >= config.maxRequests) {
          StructuredLogger.logSecurityEvent('rate_limit_exceeded', {
            key,
            current,
            limit: config.maxRequests,
            requestId: context.requestId,
            ipAddress: context.ipAddress
          });

          return this.createErrorResponse(
            'Rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            429,
            context
          );
        }

        // Increment counter
        await this.cache.increment(key);
        
        // Set expiry if this is the first request
        if (current === 0) {
          await this.cache.expire(key, Math.ceil(config.windowMs / 1000));
        }

        return null; // Continue to next middleware
      } catch (error) {
        StructuredLogger.logError(error as Error, 'rate_limit_middleware', {
          requestId: context.requestId
        });
        return null; // Continue on cache errors
      }
    };
  }

  // Authentication middleware
  authenticate(required: boolean = true) {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      try {
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader) {
          if (required) {
            return this.createErrorResponse(
              'Authorization header missing',
              'AUTH_HEADER_MISSING',
              401,
              context
            );
          }
          return null;
        }

        const token = authHeader.replace('Bearer ', '');
        const authResult = await this.authService.validateToken(token);

        if (!authResult.success) {
          if (required) {
            return this.createErrorResponse(
              authResult.error?.message || 'Invalid token',
              authResult.error?.code || 'INVALID_TOKEN',
              401,
              context
            );
          }
          return null;
        }

        // Add user info to context
        context.userId = authResult.data!.id;
        context.userEmail = authResult.data!.email;
        context.roles = authResult.data!.roles;

        return null; // Continue to next middleware
      } catch (error) {
        StructuredLogger.logError(error as Error, 'auth_middleware', {
          requestId: context.requestId
        });
        
        if (required) {
          return this.createErrorResponse(
            'Authentication failed',
            'AUTH_FAILED',
            401,
            context
          );
        }
        return null;
      }
    };
  }

  // Role-based authorization middleware
  authorize(requiredRoles: string[]) {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      if (!context.userId) {
        return this.createErrorResponse(
          'Authentication required',
          'AUTH_REQUIRED',
          401,
          context
        );
      }

      if (!context.roles || context.roles.length === 0) {
        return this.createErrorResponse(
          'No roles assigned',
          'NO_ROLES',
          403,
          context
        );
      }

      const hasRequiredRole = requiredRoles.some(role => 
        context.roles!.includes(role)
      );

      if (!hasRequiredRole) {
        StructuredLogger.logSecurityEvent('unauthorized_access', {
          userId: context.userId,
          requiredRoles,
          userRoles: context.roles,
          requestId: context.requestId,
          url: req.url
        });

        return this.createErrorResponse(
          'Insufficient permissions',
          'INSUFFICIENT_PERMISSIONS',
          403,
          context
        );
      }

      return null; // Continue to next middleware
    };
  }

  // Request validation middleware
  validateRequest<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      try {
        let data: any;

        switch (source) {
          case 'body':
            data = await req.json();
            break;
          case 'query':
            data = Object.fromEntries(new URL(req.url).searchParams);
            break;
          case 'params':
            // This would be handled by Next.js route params
            data = {};
            break;
        }

        const result = schema.safeParse(data);
        
        if (!result.success) {
          return this.createErrorResponse(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            context,
            result.error.errors
          );
        }

        // Store validated data in context for later use
        (context as any).validatedData = result.data;

        return null; // Continue to next middleware
      } catch (error) {
        return this.createErrorResponse(
          'Invalid request format',
          'INVALID_REQUEST_FORMAT',
          400,
          context
        );
      }
    };
  }

  // CORS middleware
  cors(options: {
    origins?: string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {}) {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      const {
        origins = ['*'],
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers = ['Content-Type', 'Authorization'],
        credentials = true
      } = options;

      const origin = req.headers.get('origin');
      const response = new NextResponse(null);

      // Check origin
      if (origins.includes('*') || (origin && origins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
      }

      response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
      
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return response;
      }

      return null; // Continue to next middleware
    };
  }

  // Request logging middleware
  logRequest() {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      StructuredLogger.logApiRequest({
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        userId: context.userId
      });

      return null; // Continue to next middleware
    };
  }

  // Response logging middleware (to be called after handler)
  logResponse(response: NextResponse, context: ApiContext) {
    const duration = Date.now() - context.startTime;
    
    StructuredLogger.logApiResponse(
      {
        method: 'unknown', // Would need to be passed in
        url: 'unknown',    // Would need to be passed in
        userId: context.userId
      },
      { status: response.status },
      duration
    );
  }

  // Security headers middleware
  securityHeaders() {
    return async (req: NextRequest, context: ApiContext): Promise<NextResponse | null> => {
      // This will be applied to the response in the compose function
      return null;
    };
  }

  // Compose multiple middlewares
  compose(middlewares: Array<(req: NextRequest, context: ApiContext) => Promise<NextResponse | null>>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const context = this.createContext(req);

      for (const middleware of middlewares) {
        const result = await middleware(req, context);
        if (result) {
          return result; // Return early response from middleware
        }
      }

      // If no middleware returned a response, return a default success
      return this.createSuccessResponse(null, context);
    };
  }

  // Helper to create standardized API responses
  createSuccessResponse<T>(data: T, context: ApiContext, meta?: any): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
        ...meta
      }
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    this.addSecurityHeaders(nextResponse);
    return nextResponse;
  }

  createErrorResponse(
    message: string,
    code: string,
    status: number,
    context: ApiContext,
    details?: any
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    };

    const nextResponse = NextResponse.json(response, { status });
    this.addSecurityHeaders(nextResponse);
    return nextResponse;
  }

  private addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }

  private getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const real = req.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return real;
    }
    
    return 'unknown';
  }
}

// Pre-configured middleware instances
export const createStandardMiddleware = (cache: CacheService, authService: AuthService) => {
  const middleware = new ApiMiddleware(cache, authService);

  return {
    // Public API middleware (no auth required)
    public: middleware.compose([
      middleware.cors(),
      middleware.logRequest(),
      middleware.rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      }),
      middleware.securityHeaders()
    ]),

    // Protected API middleware (auth required)
    protected: middleware.compose([
      middleware.cors(),
      middleware.logRequest(),
      middleware.rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
        keyGenerator: (req, ctx) => `rate_limit:user:${ctx.userId}`
      }),
      middleware.authenticate(true),
      middleware.securityHeaders()
    ]),

    // Admin API middleware
    admin: middleware.compose([
      middleware.cors(),
      middleware.logRequest(),
      middleware.rateLimit({
        windowMs: 15 * 60 * 1000,
        maxRequests: 2000,
        keyGenerator: (req, ctx) => `rate_limit:admin:${ctx.userId}`
      }),
      middleware.authenticate(true),
      middleware.authorize(['ADMIN']),
      middleware.securityHeaders()
    ])
  };
};