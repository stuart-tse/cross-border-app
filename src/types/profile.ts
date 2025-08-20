import { UserType } from '@prisma/client';
import { AuthUser } from './auth';

// Base Profile Data Types
export interface BaseProfileData {
  id: string;
  userId: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  languages: string[];
  socialLinks?: Record<string, string>;
  preferences: Record<string, any>;
  profileCompletion: number;
  lastUpdated: Date;
  isPublic: boolean;
}

// Universal Profile Data - combines all role-specific data
export interface UniversalProfileData extends BaseProfileData {
  user: AuthUser;
  roles: UserType[];
  activeRole: UserType;
  
  // Role-specific profile data
  clientProfile?: ClientProfileData;
  driverProfile?: DriverProfileData;
  editorProfile?: EditorProfileData;
  adminProfile?: AdminProfileData;
  
  // Activity and engagement data
  activityFeed: ActivityEntry[];
  recentActions: ProfileAction[];
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
}

// Client Profile Data
export interface ClientProfileData {
  membershipTier: 'BASIC' | 'PREMIUM' | 'VIP';
  loyaltyPoints: number;
  preferredVehicle?: string;
  travelPreferences: TravelPreferences;
  emergencyContact: EmergencyContact;
  paymentMethods: PaymentMethod[];
  tripHistory: TripSummary[];
  totalTrips: number;
  totalSpent: number;
  averageRating: number;
  documentStatus: DocumentVerificationStatus;
}

// Driver Profile Data  
export interface DriverProfileData {
  licenseNumber: string;
  licenseExpiry: Date;
  licenseClass: string;
  crossBorderPermit: boolean;
  crossBorderExpiry?: Date;
  vehicleInfo: VehicleInfo;
  availability: DriverAvailability;
  performance: DriverPerformance;
  earnings: EarningsData;
  specializations: string[];
  certifications: Certification[];
  workingHours: WorkingHours;
  preferredRoutes: string[];
  emergencyContact: EmergencyContact;
}

// Editor Profile Data
export interface EditorProfileData {
  editorLevel: 'JUNIOR' | 'SENIOR' | 'LEAD' | 'CHIEF';
  specializations: string[];
  contentStats: ContentStats;
  publishingRights: PublishingRights;
  seoPreferences: SEOPreferences;
  editorialTeam?: string;
  contentCategories: string[];
  languageProficiency: LanguageProficiency[];
  workflowPreferences: WorkflowPreferences;
  collaborationSettings: CollaborationSettings;
}

// Admin Profile Data
export interface AdminProfileData {
  adminLevel: 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  managedSections: string[];
  auditTrail: AuditEntry[];
  systemAccess: SystemAccessSettings;
  managementStats: ManagementStats;
}

// Supporting Interfaces

export interface TravelPreferences {
  preferredPickupTime: string;
  preferredVehicleType: string;
  climatePref: 'cool' | 'warm' | 'no_preference';
  musicPref: boolean;
  communicationStyle: 'chatty' | 'quiet' | 'no_preference';
  routePreference: 'fastest' | 'scenic' | 'no_preference';
  specialRequests?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'DIGITAL_WALLET' | 'BANK_ACCOUNT';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryDate?: string;
  isActive: boolean;
}

export interface TripSummary {
  id: string;
  date: Date;
  from: string;
  to: string;
  amount: number;
  rating: number;
  status: 'COMPLETED' | 'CANCELLED';
}

export interface DocumentVerificationStatus {
  passport: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  nationalId: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  proofOfAddress: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  lastVerified?: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vehicleType: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
  maxCapacity: number;
  features: string[];
  insurance: InsuranceInfo;
  inspection: InspectionInfo;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expiryDate: Date;
  coverage: string[];
}

export interface InspectionInfo {
  lastInspection: Date;
  nextInspection: Date;
  status: 'VALID' | 'EXPIRED' | 'PENDING';
}

export interface DriverAvailability {
  isOnline: boolean;
  currentStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_TRIP';
  workingHours: WorkingHours;
  maxTripsPerDay: number;
  blackoutDates: Date[];
}

export interface WorkingHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  available: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface DriverPerformance {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageRating: number;
  totalReviews: number;
  onTimeRate: number;
  completionRate: number;
  clientSatisfactionScore: number;
  responseTime: number; // average in minutes
  badges: PerformanceBadge[];
}

export interface PerformanceBadge {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  category: 'SAFETY' | 'PERFORMANCE' | 'SERVICE' | 'MILESTONE';
}

export interface EarningsData {
  totalEarnings: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
  todayEarnings: number;
  averagePerTrip: number;
  topEarningDay: number;
  payoutSchedule: 'WEEKLY' | 'MONTHLY';
  nextPayoutDate: Date;
  earningsHistory: EarningsEntry[];
}

export interface EarningsEntry {
  date: Date;
  amount: number;
  tripCount: number;
  bonuses?: number;
  deductions?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED';
}

// Editor-specific interfaces
export interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalShares: number;
  averageSeoScore: number;
  topPerformingPost?: string;
  monthlyGrowth: number;
  engagementRate: number;
  contentCategories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  postCount: number;
  views: number;
  avgRating: number;
}

export interface PublishingRights {
  canPublishDirectly: boolean;
  requiresReview: boolean;
  maxPostsPerDay: number;
  allowedCategories: string[];
  canSchedulePosts: boolean;
  canEditOthersContent: boolean;
  canDeleteContent: boolean;
  canManageMedia: boolean;
}

export interface SEOPreferences {
  defaultKeywords: string[];
  targetAudience: string;
  contentTone: 'PROFESSIONAL' | 'CASUAL' | 'FRIENDLY' | 'FORMAL';
  focusRegions: string[];
  preferredPostLength: 'SHORT' | 'MEDIUM' | 'LONG';
  seoTools: string[];
  autoOptimization: boolean;
}

export interface LanguageProficiency {
  language: string;
  level: 'NATIVE' | 'FLUENT' | 'CONVERSATIONAL' | 'BASIC';
  canWrite: boolean;
  canEdit: boolean;
  canTranslate: boolean;
}

export interface WorkflowPreferences {
  preferredEditingTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  notificationFrequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  collaborationStyle: 'INDEPENDENT' | 'COLLABORATIVE' | 'REVIEW_BASED';
  deadlineReminders: boolean;
  autoSaveDrafts: boolean;
  contentBackup: boolean;
}

export interface CollaborationSettings {
  allowComments: boolean;
  allowSuggestions: boolean;
  shareContentByDefault: boolean;
  allowGuestWriters: boolean;
  reviewWorkflow: 'NONE' | 'PEER' | 'SENIOR' | 'MANAGER';
  mentorshipRole: 'MENTOR' | 'MENTEE' | 'BOTH' | 'NONE';
}

// Activity and Engagement
export interface ActivityEntry {
  id: string;
  type: 'LOGIN' | 'PROFILE_UPDATE' | 'TRIP' | 'CONTENT' | 'PAYMENT' | 'REVIEW' | 'ACHIEVEMENT';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProfileAction {
  id: string;
  action: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: string;
  category: 'PROFILE' | 'SETTINGS' | 'CONTENT' | 'BOOKING' | 'PAYMENT';
  requiresRole?: UserType[];
  isPrimary?: boolean;
}

// Settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number; // minutes
  allowedDevices: TrustedDevice[];
  lastPasswordChange: Date;
  securityQuestions: SecurityQuestion[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  lastUsed: Date;
  isActive: boolean;
  location?: string;
}

export interface SecurityQuestion {
  question: string;
  isAnswered: boolean;
  lastUpdated: Date;
}

export interface NotificationSettings {
  email: EmailNotifications;
  sms: SMSNotifications;
  push: PushNotifications;
  inApp: InAppNotifications;
}

export interface EmailNotifications {
  marketing: boolean;
  transactional: boolean;
  security: boolean;
  updates: boolean;
  newsletter: boolean;
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface SMSNotifications {
  bookingUpdates: boolean;
  emergencyAlerts: boolean;
  paymentConfirmations: boolean;
  securityAlerts: boolean;
  promotions: boolean;
}

export interface PushNotifications {
  enabled: boolean;
  booking: boolean;
  messages: boolean;
  promotions: boolean;
  updates: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface InAppNotifications {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
  categories: string[];
}

// Admin-specific interfaces
export interface AuditEntry {
  id: string;
  action: string;
  targetType: 'USER' | 'CONTENT' | 'SYSTEM' | 'BOOKING';
  targetId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

export interface SystemAccessSettings {
  dashboardAccess: string[];
  apiAccess: string[];
  databaseAccess: string[];
  fileSystemAccess: string[];
  userManagement: boolean;
  contentManagement: boolean;
  systemConfiguration: boolean;
  auditLogAccess: boolean;
}

export interface ManagementStats {
  usersManaged: number;
  contentModerated: number;
  issuesResolved: number;
  systemChanges: number;
  lastActivity: Date;
  activeIncidents: number;
}

// Profile Component Props
export interface ProfileComponentProps {
  user: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// Profile Form Data
export interface ProfileFormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    bio: string;
    languages: string[];
  };
  preferences: Record<string, any>;
  roleSpecific: Record<string, any>;
  privacy: {
    isPublic: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowContact: boolean;
  };
}

// API Response Types
export interface ProfileApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  meta?: {
    profileCompletion: number;
    lastUpdated: Date;
    nextUpdateReminder?: Date;
  };
}

// Profile Analytics
export interface ProfileAnalytics {
  viewsThisMonth: number;
  profileInteractions: number;
  completionScore: number;
  engagementMetrics: EngagementMetrics;
  comparisonData: ComparisonData;
}

export interface EngagementMetrics {
  totalViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  popularSections: string[];
}

export interface ComparisonData {
  industryAverage: number;
  percentile: number;
  improvementSuggestions: string[];
}

// Profile Completion Tracking
export interface ProfileCompletionTracker {
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  missingFields: MissingField[];
  suggestions: CompletionSuggestion[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MissingField {
  field: string;
  section: string;
  importance: 'OPTIONAL' | 'RECOMMENDED' | 'REQUIRED';
  points: number;
}

export interface CompletionSuggestion {
  title: string;
  description: string;
  action: string;
  benefit: string;
  estimatedTime: number; // minutes
  priority: number;
}