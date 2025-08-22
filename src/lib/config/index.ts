import { z } from 'zod';

// Environment variable validation schema
const configSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SHADOW_DATABASE_URL: z.string().optional(),

  // Redis Cache
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(0),
  REDIS_KEY_PREFIX: z.string().default('cbv:'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // External APIs
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  AMAP_API_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // File Storage
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default(10 * 1024 * 1024), // 10MB

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // Security
  CORS_ORIGINS: z.string().transform(str => str.split(',')).default('*'),
  SESSION_TIMEOUT_MINUTES: z.string().transform(Number).default(60),

  // Feature Flags
  ENABLE_REGISTRATION: z.string().transform(str => str === 'true').default(true),
  ENABLE_EMAIL_VERIFICATION: z.string().transform(str => str === 'true').default(false),
  ENABLE_REAL_TIME_TRACKING: z.string().transform(str => str === 'true').default(false),

  // Payment (if applicable)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

class Config {
  private static instance: Config;
  private config: z.infer<typeof configSchema>;

  private constructor() {
    try {
      this.config = configSchema.parse(process.env);
      this.validateEnvironment();
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      process.exit(1);
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validateEnvironment() {
    const requiredInProduction = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];

    if (this.config.NODE_ENV === 'production') {
      const missing = requiredInProduction.filter(key => 
        !process.env[key] || process.env[key]?.length === 0
      );

      if (missing.length > 0) {
        throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
      }
    }

    // Validate Redis connection in production
    if (this.config.NODE_ENV === 'production' && !this.config.REDIS_HOST) {
      console.warn('⚠️  Redis host not configured. Caching will be disabled.');
    }

    // Validate email configuration
    if (this.config.ENABLE_EMAIL_VERIFICATION) {
      const emailRequired = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
      const missingEmail = emailRequired.filter(key => !process.env[key]);
      
      if (missingEmail.length > 0) {
        throw new Error(`Email verification enabled but missing: ${missingEmail.join(', ')}`);
      }
    }
  }

  // Application Config
  get app() {
    return {
      env: this.config.NODE_ENV,
      port: this.config.PORT,
      url: this.config.APP_URL,
      isDevelopment: this.config.NODE_ENV === 'development',
      isProduction: this.config.NODE_ENV === 'production',
      isTest: this.config.NODE_ENV === 'test'
    };
  }

  // Database Config
  get database() {
    return {
      url: this.config.DATABASE_URL,
      shadowUrl: this.config.SHADOW_DATABASE_URL
    };
  }

  // Redis Config
  get redis() {
    return {
      host: this.config.REDIS_HOST,
      port: this.config.REDIS_PORT,
      password: this.config.REDIS_PASSWORD,
      db: this.config.REDIS_DB,
      keyPrefix: this.config.REDIS_KEY_PREFIX
    };
  }

  // Authentication Config
  get auth() {
    return {
      nextAuthSecret: this.config.NEXTAUTH_SECRET,
      nextAuthUrl: this.config.NEXTAUTH_URL,
      jwtSecret: this.config.JWT_SECRET,
      jwtRefreshSecret: this.config.JWT_REFRESH_SECRET,
      sessionTimeoutMinutes: this.config.SESSION_TIMEOUT_MINUTES
    };
  }

  // External APIs Config
  get apis() {
    return {
      googleMaps: this.config.GOOGLE_MAPS_API_KEY,
      amap: this.config.AMAP_API_KEY
    };
  }

  // Email Config
  get email() {
    return {
      host: this.config.SMTP_HOST,
      port: this.config.SMTP_PORT,
      user: this.config.SMTP_USER,
      pass: this.config.SMTP_PASS,
      from: this.config.EMAIL_FROM
    };
  }

  // File Upload Config
  get upload() {
    return {
      dir: this.config.UPLOAD_DIR,
      maxFileSize: this.config.MAX_FILE_SIZE
    };
  }

  // Logging Config
  get logging() {
    return {
      level: this.config.LOG_LEVEL,
      dir: this.config.LOG_DIR
    };
  }

  // Security Config
  get security() {
    return {
      corsOrigins: this.config.CORS_ORIGINS,
      rateLimitWindowMs: this.config.RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: this.config.RATE_LIMIT_MAX_REQUESTS
    };
  }

  // Feature Flags
  get features() {
    return {
      enableRegistration: this.config.ENABLE_REGISTRATION,
      enableEmailVerification: this.config.ENABLE_EMAIL_VERIFICATION,
      enableRealTimeTracking: this.config.ENABLE_REAL_TIME_TRACKING
    };
  }

  // Payment Config
  get payment() {
    return {
      stripe: {
        secretKey: this.config.STRIPE_SECRET_KEY,
        publishableKey: this.config.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: this.config.STRIPE_WEBHOOK_SECRET
      }
    };
  }

  // Get all configuration
  get all() {
    return this.config;
  }

  // Print configuration summary (excluding secrets)
  printSummary() {
    const summary = {
      environment: this.app.env,
      features: this.features,
      database: { connected: !!this.database.url },
      redis: { 
        configured: !!this.redis.host,
        host: this.redis.host,
        port: this.redis.port 
      },
      email: { configured: !!this.email.host },
      apis: {
        googleMaps: !!this.apis.googleMaps,
        amap: !!this.apis.amap
      },
      payment: {
        stripe: !!this.payment.stripe.secretKey
      }
    };

    console.log('🔧 Application Configuration:');
    console.table(summary);
  }
}

// Export singleton instance
export const config = Config.getInstance();

// Export individual configs for convenience
export const {
  app: appConfig,
  database: dbConfig,
  redis: redisConfig,
  auth: authConfig,
  apis: apiConfig,
  email: emailConfig,
  upload: uploadConfig,
  logging: loggingConfig,
  security: securityConfig,
  features: featureConfig,
  payment: paymentConfig
} = config;