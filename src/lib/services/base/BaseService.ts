import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/LoggingService';
import { CacheService } from '../shared/CacheService';

export abstract class BaseService {
  protected db: PrismaClient;
  protected cache: CacheService;
  protected serviceName: string;

  constructor(db: PrismaClient, cache: CacheService, serviceName: string) {
    this.db = db;
    this.cache = cache;
    this.serviceName = serviceName;
  }

  protected log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
    logger.log(level, `[${this.serviceName}] ${message}`, {
      service: this.serviceName,
      ...meta
    });
  }

  protected async withCache<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    try {
      const cached = await this.cache.get<T>(key);
      if (cached) {
        this.log('info', `Cache hit for key: ${key}`);
        return cached;
      }

      const result = await fetchFn();
      await this.cache.set(key, result, ttl);
      this.log('info', `Cache set for key: ${key}`);
      return result;
    } catch (error) {
      this.log('error', 'Cache operation failed', { key, error });
      return fetchFn();
    }
  }

  protected async invalidateCache(pattern: string): Promise<void> {
    try {
      await this.cache.invalidatePattern(pattern);
      this.log('info', `Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
      this.log('error', 'Cache invalidation failed', { pattern, error });
    }
  }

  protected handleError(error: any, context: string): never {
    this.log('error', `Error in ${context}`, { error });
    throw new ServiceError(
      error.message || 'Internal service error',
      error.code || 'INTERNAL_ERROR',
      this.serviceName,
      context
    );
  }

  protected validateInput<T>(data: T, schema: any): T {
    try {
      return schema.parse(data);
    } catch (error) {
      this.handleError(error, 'input validation');
    }
  }
}

export class ServiceError extends Error {
  public readonly code: string;
  public readonly service: string;
  public readonly context: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string, service: string, context: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.service = service;
    this.context = context;
    this.timestamp = new Date();
  }
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    service: string;
    context: string;
  };
  meta?: {
    timestamp: Date;
    requestId?: string;
    cached?: boolean;
  };
}

export function createServiceResponse<T>(
  success: boolean,
  data?: T,
  error?: ServiceError,
  meta?: any
): ServiceResponse<T> {
  return {
    success,
    data,
    error: error ? {
      code: error.code,
      message: error.message,
      service: error.service,
      context: error.context
    } : undefined,
    meta: {
      timestamp: new Date(),
      ...meta
    }
  };
}