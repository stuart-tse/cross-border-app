import { UserType } from '@prisma/client';

// Base User Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: UserRole[];
  userType: UserType; // Current selected user type for backward compatibility
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  role: UserType;
  isActive: boolean;
  assignedAt: Date;
  assignedBy?: string;
}

// Authentication Request/Response Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserType;
  // Role-specific fields
  driverData?: DriverRegistrationData;
  editorInviteCode?: string;
}

export interface DriverRegistrationData {
  licenseNumber: string;
  licenseExpiry: string;
  languages: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  selectedRole?: UserType; // For users with multiple roles
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  requiresRoleSelection?: boolean;
  availableRoles?: UserType[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Role Management Types
export interface RoleAssignmentRequest {
  userId: string;
  role: UserType;
  assignedBy: string;
}

export interface RoleRemovalRequest {
  userId: string;
  role: UserType;
  removedBy: string;
}

// Session and JWT Types
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  roles: UserType[];
  selectedRole?: UserType;
  isVerified: boolean;
  iat: number;
  exp: number;
}

export interface SessionData {
  user: AuthUser;
  selectedRole: UserType;
  expires: Date;
}

// Validation Types
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: ValidationError[];
}

// Profile Types
export interface ClientProfileData {
  preferredVehicle?: string;
  emergencyContact?: string;
  specialRequests?: string;
}

export interface DriverProfileData {
  licenseNumber: string;
  licenseExpiry: Date;
  languages: string[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface BlogEditorProfileData {
  bio?: string;
  socialLinks?: Record<string, string>;
  permissions: string[];
}

// Authentication State Types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  selectedRole: UserType | null;
  error: string | null;
}

// Action Types for Auth Context
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; selectedRole: UserType } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_SELECTED_ROLE'; payload: UserType }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

// Enhanced AuthUser interface to include userType property for backward compatibility
export interface AuthUserWithType extends AuthUser {
  userType: UserType;
}

// NextAuth Extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      roles: UserType[];
      selectedRole?: UserType;
      isVerified: boolean;
      userType: UserType;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | undefined;
    roles: UserType[];
    selectedRole?: UserType;
    isVerified: boolean;
    userType: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    roles?: UserType[];
    selectedRole?: UserType;
    isVerified?: boolean;
    userType?: UserType;
  }
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Security Types
export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// Invitation System Types
export interface BlogEditorInvitation {
  id: string;
  email: string;
  inviteCode: string;
  invitedBy: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface InvitationRequest {
  email: string;
  invitedBy: string;
  permissions?: string[];
  expiresIn?: number; // hours
}