import { PrismaClient, User, UserType, UserRole } from '@prisma/client';
import { BaseService, ServiceResponse, createServiceResponse } from '../base/BaseService';
import { CacheService, CacheKeys, CacheTTL } from '../shared/CacheService';
import { UserRepository } from '../../repositories/UserRepository';
import { StructuredLogger } from '../shared/LoggingService';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
  userType: UserType;
}

export interface AuthUser extends User {
  roles: UserType[];
  permissions: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: UserType[];
  sessionId: string;
  iat: number;
  exp: number;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface SessionData {
  userId: string;
  email: string;
  roles: UserType[];
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional()
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  userType: z.nativeEnum(UserType)
});

export class AuthService extends BaseService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  constructor(db: PrismaClient, cache: CacheService) {
    super(db, cache, 'AuthService');
    this.userRepository = new UserRepository(db);
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  }

  async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<ServiceResponse<LoginResult>> {
    try {
      // Validate input
      const validatedData = this.validateInput(credentials, loginSchema);

      // Check rate limiting
      await this.checkRateLimit(validatedData.email, ipAddress);

      // Find user with password
      const user = await this.findUserWithPassword(validatedData.email);
      if (!user) {
        await this.recordFailedLogin(validatedData.email, ipAddress, 'USER_NOT_FOUND');
        return createServiceResponse(false, undefined, 
          new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' });
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        await this.recordFailedLogin(validatedData.email, ipAddress, 'INVALID_PASSWORD');
        return createServiceResponse(false, undefined,
          new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' });
      }

      // Check if user is active
      if (!user.isActive) {
        await this.recordFailedLogin(validatedData.email, ipAddress, 'INACTIVE_USER');
        return createServiceResponse(false, undefined,
          new Error('Account is deactivated'), { code: 'ACCOUNT_DEACTIVATED' });
      }

      // Get user roles
      const roles = await this.userRepository.getUserRoles(user.id);

      // Create session
      const sessionId = this.generateSessionId();
      const sessionData: SessionData = {
        userId: user.id,
        email: user.email,
        roles,
        lastActivity: new Date(),
        ipAddress,
        userAgent
      };

      // Store session in cache
      await this.cache.set(
        CacheKeys.userSession(sessionId), 
        sessionData, 
        validatedData.remember ? CacheTTL.WEEK : CacheTTL.DAY
      );

      // Generate tokens
      const expiresIn = validatedData.remember ? '7d' : '1d';
      const token = this.generateAccessToken(user, roles, sessionId, expiresIn);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);

      // Create auth user object
      const authUser: AuthUser = {
        ...user,
        roles,
        permissions: this.getRolePermissions(roles)
      };

      // Log successful login
      StructuredLogger.logAuthEvent('login', user.id, {
        ipAddress,
        userAgent,
        roles
      });

      // Clear failed login attempts
      await this.clearFailedLoginAttempts(validatedData.email);

      const result: LoginResult = {
        user: authUser,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + (validatedData.remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000))
      };

      return createServiceResponse(true, result);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async register(data: RegisterData, ipAddress: string, userAgent: string): Promise<ServiceResponse<AuthUser>> {
    try {
      // Validate input
      const validatedData = this.validateInput(data, registerSchema);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        return createServiceResponse(false, undefined,
          new Error('User already exists'), { code: 'USER_EXISTS' });
      }

      // Hash password
      const hashedPassword = await this.hashPassword(validatedData.password);

      // Create user and assign role in transaction
      const user = await this.userRepository.transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            email: validatedData.email,
            name: validatedData.name,
            phone: validatedData.phone,
            isVerified: false,
            isActive: true
          }
        });

        // Create password
        await tx.password.create({
          data: {
            userId: newUser.id,
            hash: hashedPassword
          }
        });

        // Assign role
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            role: validatedData.userType,
            isActive: true
          }
        });

        // Create profile based on user type
        await this.createUserProfile(tx, newUser.id, validatedData.userType);

        return newUser;
      });

      // Get user with roles
      const userWithRoles = await this.userRepository.findByIdWithRoles(user.id);
      
      const authUser: AuthUser = {
        ...userWithRoles!,
        roles: [validatedData.userType],
        permissions: this.getRolePermissions([validatedData.userType])
      };

      // Log registration
      StructuredLogger.logAuthEvent('register', user.id, {
        userType: validatedData.userType,
        ipAddress,
        userAgent
      });

      return createServiceResponse(true, authUser);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse<{ token: string; expiresAt: Date }>> {
    try {
      // Verify refresh token
      const payload = verify(refreshToken, this.jwtRefreshSecret) as any;
      
      // Get session data
      const sessionData = await this.cache.get<SessionData>(CacheKeys.userSession(payload.sessionId));
      if (!sessionData) {
        return createServiceResponse(false, undefined,
          new Error('Session expired'), { code: 'SESSION_EXPIRED' });
      }

      // Get user with current roles
      const user = await this.userRepository.findByIdWithRoles(sessionData.userId);
      if (!user || !user.isActive) {
        return createServiceResponse(false, undefined,
          new Error('User not found or inactive'), { code: 'USER_INACTIVE' });
      }

      const roles = await this.userRepository.getUserRoles(user.id);

      // Generate new access token
      const token = this.generateAccessToken(user, roles, payload.sessionId);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update session activity
      sessionData.lastActivity = new Date();
      await this.cache.set(CacheKeys.userSession(payload.sessionId), sessionData, CacheTTL.DAY);

      return createServiceResponse(true, { token, expiresAt });

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async logout(sessionId: string): Promise<ServiceResponse<void>> {
    try {
      // Get session data for logging
      const sessionData = await this.cache.get<SessionData>(CacheKeys.userSession(sessionId));
      
      // Remove session
      await this.cache.del(CacheKeys.userSession(sessionId));

      if (sessionData) {
        StructuredLogger.logAuthEvent('logout', sessionData.userId);
      }

      return createServiceResponse(true);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async validateToken(token: string): Promise<ServiceResponse<AuthUser>> {
    try {
      // Verify JWT
      const payload = verify(token, this.jwtSecret) as JWTPayload;

      // Check if session exists
      const sessionData = await this.cache.get<SessionData>(CacheKeys.userSession(payload.sessionId));
      if (!sessionData) {
        return createServiceResponse(false, undefined,
          new Error('Session expired'), { code: 'SESSION_EXPIRED' });
      }

      // Get user with current data
      const user = await this.userRepository.findByIdWithRoles(payload.userId);
      if (!user || !user.isActive) {
        return createServiceResponse(false, undefined,
          new Error('User not found or inactive'), { code: 'USER_INACTIVE' });
      }

      // Update last activity
      sessionData.lastActivity = new Date();
      await this.cache.set(CacheKeys.userSession(payload.sessionId), sessionData, CacheTTL.DAY);

      const authUser: AuthUser = {
        ...user,
        roles: payload.roles,
        permissions: this.getRolePermissions(payload.roles)
      };

      return createServiceResponse(true, authUser);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ServiceResponse<void>> {
    try {
      // Get user with password
      const userWithPassword = await this.db.user.findUnique({
        where: { id: userId },
        include: { passwords: { orderBy: { id: 'desc' }, take: 1 } }
      });

      if (!userWithPassword || userWithPassword.passwords.length === 0) {
        return createServiceResponse(false, undefined,
          new Error('User not found'), { code: 'USER_NOT_FOUND' });
      }

      // Verify current password
      const isCurrentValid = await this.verifyPassword(currentPassword, userWithPassword.passwords[0].hash);
      if (!isCurrentValid) {
        return createServiceResponse(false, undefined,
          new Error('Current password is incorrect'), { code: 'INVALID_PASSWORD' });
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await this.db.password.create({
        data: {
          userId,
          hash: hashedNewPassword
        }
      });

      return createServiceResponse(true);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  private async findUserWithPassword(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include: {
        passwords: {
          orderBy: { id: 'desc' },
          take: 1
        }
      }
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateAccessToken(user: any, roles: UserType[], sessionId: string, expiresIn: string = '1d'): string {
    return sign(
      {
        userId: user.id,
        email: user.email,
        roles,
        sessionId
      },
      this.jwtSecret,
      { expiresIn }
    );
  }

  private generateRefreshToken(userId: string, sessionId: string): string {
    return sign(
      {
        userId,
        sessionId
      },
      this.jwtRefreshSecret,
      { expiresIn: '30d' }
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRolePermissions(roles: UserType[]): string[] {
    const permissions: string[] = [];
    
    roles.forEach(role => {
      switch (role) {
        case UserType.ADMIN:
          permissions.push('users:read', 'users:write', 'system:read', 'content:write');
          break;
        case UserType.CLIENT:
          permissions.push('bookings:write', 'profile:write');
          break;
        case UserType.DRIVER:
          permissions.push('bookings:read', 'vehicles:write', 'profile:write');
          break;
        case UserType.BLOG_EDITOR:
          permissions.push('content:write', 'media:write');
          break;
      }
    });

    return [...new Set(permissions)];
  }

  private async createUserProfile(tx: any, userId: string, userType: UserType): Promise<void> {
    switch (userType) {
      case UserType.CLIENT:
        await tx.clientProfile.create({
          data: { userId }
        });
        break;
      case UserType.DRIVER:
        await tx.driverProfile.create({
          data: {
            userId,
            licenseNumber: '',
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
        break;
      case UserType.BLOG_EDITOR:
        await tx.blogEditorProfile.create({
          data: { userId }
        });
        break;
    }
  }

  private async checkRateLimit(email: string, ipAddress: string): Promise<void> {
    const emailKey = `rate_limit:login:email:${email}`;
    const ipKey = `rate_limit:login:ip:${ipAddress}`;

    const [emailAttempts, ipAttempts] = await Promise.all([
      this.cache.get<number>(emailKey),
      this.cache.get<number>(ipKey)
    ]);

    if ((emailAttempts || 0) >= 5) {
      throw new Error('Too many login attempts for this email');
    }

    if ((ipAttempts || 0) >= 10) {
      throw new Error('Too many login attempts from this IP');
    }
  }

  private async recordFailedLogin(email: string, ipAddress: string, reason: string): Promise<void> {
    const emailKey = `rate_limit:login:email:${email}`;
    const ipKey = `rate_limit:login:ip:${ipAddress}`;

    await Promise.all([
      this.cache.increment(emailKey),
      this.cache.increment(ipKey)
    ]);

    await Promise.all([
      this.cache.expire(emailKey, 15 * 60), // 15 minutes
      this.cache.expire(ipKey, 15 * 60)
    ]);

    StructuredLogger.logSecurityEvent('failed_login', {
      email,
      ipAddress,
      reason
    });
  }

  private async clearFailedLoginAttempts(email: string): Promise<void> {
    await this.cache.del(`rate_limit:login:email:${email}`);
  }
}