import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = format;

// Create Winston logger instance
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'cross-border-vehicles',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // File transport for all logs
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      simple()
    )
  }));
}

// Structured logging helpers
export class StructuredLogger {
  static logApiRequest(req: {
    method: string;
    url: string;
    headers: any;
    userId?: string;
  }) {
    logger.info('API Request', {
      type: 'api_request',
      method: req.method,
      url: req.url,
      userId: req.userId,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip']
    });
  }

  static logApiResponse(req: any, res: any, duration: number) {
    logger.info('API Response', {
      type: 'api_response',
      method: req.method,
      url: req.url,
      statusCode: res.status,
      duration: `${duration}ms`,
      userId: req.userId
    });
  }

  static logDatabaseQuery(operation: string, table: string, duration: number, userId?: string) {
    logger.info('Database Query', {
      type: 'database_query',
      operation,
      table,
      duration: `${duration}ms`,
      userId
    });
  }

  static logCacheOperation(operation: 'hit' | 'miss' | 'set' | 'invalidate', key: string) {
    logger.info('Cache Operation', {
      type: 'cache_operation',
      operation,
      key
    });
  }

  static logAuthEvent(event: 'login' | 'logout' | 'register' | 'role_change', userId: string, metadata?: any) {
    logger.info('Authentication Event', {
      type: 'auth_event',
      event,
      userId,
      ...metadata
    });
  }

  static logBusinessEvent(event: string, data: any) {
    logger.info('Business Event', {
      type: 'business_event',
      event,
      data
    });
  }

  static logError(error: Error, context: string, metadata?: any) {
    logger.error('Application Error', {
      type: 'application_error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      ...metadata
    });
  }

  static logSecurityEvent(event: 'failed_login' | 'rate_limit_exceeded' | 'unauthorized_access', metadata: any) {
    logger.warn('Security Event', {
      type: 'security_event',
      event,
      ...metadata
    });
  }
}

// Performance monitoring
export class PerformanceLogger {
  private startTime: number;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.startTime = Date.now();
  }

  end(metadata?: any) {
    const duration = Date.now() - this.startTime;
    logger.info('Performance Metric', {
      type: 'performance',
      context: this.context,
      duration: `${duration}ms`,
      ...metadata
    });
    return duration;
  }
}

// Request correlation ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default logger;