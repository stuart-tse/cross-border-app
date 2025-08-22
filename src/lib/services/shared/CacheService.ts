import Redis from 'ioredis';
import { logger } from './LoggingService';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}

export class CacheService {
  private redis: Redis;
  private keyPrefix: string;
  private isConnected: boolean = false;

  constructor(config: CacheConfig) {
    this.keyPrefix = config.keyPrefix || 'cbv:';
    
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      retryDelayOnFailover: config.retryDelayOnFailover || 100,
      enableReadyCheck: config.enableReadyCheck ?? true,
      lazyConnect: config.lazyConnect ?? true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected');
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis error', { error });
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get', { key });
        return null;
      }

      const result = await this.redis.get(this.getKey(key));
      if (result) {
        return JSON.parse(result);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set', { key });
        return false;
      }

      const result = await this.redis.setex(
        this.getKey(key),
        ttl,
        JSON.stringify(value)
      );
      return result === 'OK';
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache delete', { key });
        return false;
      }

      const result = await this.redis.del(this.getKey(key));
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache invalidation', { pattern });
        return 0;
      }

      const keys = await this.redis.keys(this.getKey(pattern));
      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
    } catch (error) {
      logger.error('Cache invalidation error', { pattern, error });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check error', { key, error });
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.redis.expire(this.getKey(key), ttl);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire error', { key, error });
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      return await this.redis.incrby(this.getKey(key), value);
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      return null;
    }
  }

  async setHash(key: string, field: string, value: any): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.redis.hset(
        this.getKey(key),
        field,
        JSON.stringify(value)
      );
      return result >= 0;
    } catch (error) {
      logger.error('Cache hash set error', { key, field, error });
      return false;
    }
  }

  async getHash<T>(key: string, field: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const result = await this.redis.hget(this.getKey(key), field);
      if (result) {
        return JSON.parse(result);
      }
      return null;
    } catch (error) {
      logger.error('Cache hash get error', { key, field, error });
      return null;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      await this.redis.flushall();
      return true;
    } catch (error) {
      logger.error('Cache flush all error', { error });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
      this.isConnected = false;
    } catch (error) {
      logger.error('Redis disconnect error', { error });
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Cache key generators
export class CacheKeys {
  static user(userId: string): string {
    return `user:${userId}`;
  }

  static userProfile(userId: string): string {
    return `profile:${userId}`;
  }

  static userSession(sessionToken: string): string {
    return `session:${sessionToken}`;
  }

  static vehicle(vehicleId: string): string {
    return `vehicle:${vehicleId}`;
  }

  static booking(bookingId: string): string {
    return `booking:${bookingId}`;
  }

  static pricingRules(): string {
    return 'pricing:rules';
  }

  static blogPost(slug: string): string {
    return `blog:${slug}`;
  }

  static systemConfig(): string {
    return 'system:config';
  }

  static rateLimit(identifier: string): string {
    return `rate_limit:${identifier}`;
  }
}

// TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes  
  LONG: 3600,      // 1 hour
  DAY: 86400,      // 24 hours
  WEEK: 604800,    // 7 days
  SESSION: 900     // 15 minutes
} as const;