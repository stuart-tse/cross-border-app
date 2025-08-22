import { PrismaClient } from '@prisma/client';
import { CacheService, type CacheConfig } from './shared/CacheService';
import { AuthService } from './auth/AuthService';
import { BookingService } from './booking/BookingService';
import { UserRepository } from '../repositories/UserRepository';

// Service container for dependency injection
export class ServiceContainer {
  private static instance: ServiceContainer;
  private _db: PrismaClient;
  private _cache: CacheService;
  private _authService: AuthService;
  private _bookingService: BookingService;
  private _userRepository: UserRepository;

  private constructor() {
    // Initialize database connection
    this._db = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Initialize cache service
    const cacheConfig: CacheConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'cbv:',
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true
    };

    this._cache = new CacheService(cacheConfig);

    // Initialize repositories
    this._userRepository = new UserRepository(this._db);

    // Initialize services
    this._authService = new AuthService(this._db, this._cache);
    this._bookingService = new BookingService(this._db, this._cache);
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // Database access
  get db(): PrismaClient {
    return this._db;
  }

  // Cache service
  get cache(): CacheService {
    return this._cache;
  }

  // Repositories
  get userRepository(): UserRepository {
    return this._userRepository;
  }

  // Services
  get authService(): AuthService {
    return this._authService;
  }

  get bookingService(): BookingService {
    return this._bookingService;
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    await this._cache.disconnect();
    await this._db.$disconnect();
  }

  // Health check
  async healthCheck(): Promise<{
    database: boolean;
    cache: boolean;
    timestamp: Date;
  }> {
    try {
      const results = await Promise.allSettled([
        this._db.$queryRaw`SELECT 1`,
        this._cache.get('health-check')
      ]);

      return {
        database: results[0].status === 'fulfilled',
        cache: results[1].status === 'fulfilled' || this._cache.getConnectionStatus(),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        database: false,
        cache: false,
        timestamp: new Date()
      };
    }
  }
}

// Singleton instance getter
export const getServices = () => ServiceContainer.getInstance();

// Individual service getters for convenience
export const getDb = () => getServices().db;
export const getCache = () => getServices().cache;
export const getAuthService = () => getServices().authService;
export const getBookingService = () => getServices().bookingService;
export const getUserRepository = () => getServices().userRepository;