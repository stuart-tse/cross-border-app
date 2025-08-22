import { UserType } from '@prisma/client';
import { ExtendedUser } from './user-service';

export interface UserDisplayInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
  roleDisplayName: string;
  status: string;
  statusDisplayName: string;
  avatar: string;
  memberSince: string;
  profileCompletion: number;
}

export interface UserStatDisplay {
  label: string;
  value: string | number;
  formatted: string;
  icon?: string;
}

export interface ActivityDisplay {
  type: string;
  typeDisplayName: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  status: string;
  statusColor: string;
  icon: string;
  amount?: string;
}

/**
 * Service for generating user display strings and formatted data
 * This separates presentation logic from components
 */
export class UserDisplayService {
  /**
   * Get formatted user display information
   */
  static getUserDisplayInfo(user: ExtendedUser): UserDisplayInfo {
    const primaryRole = this.getPrimaryRole(user);
    
    return {
      name: user.name || 'Unknown User',
      email: user.email || 'No email',
      phone: user.phone || 'No phone',
      role: primaryRole,
      roleDisplayName: this.getRoleDisplayName(primaryRole),
      status: user.isActive ? 'active' : 'inactive',
      statusDisplayName: user.isActive ? 'Active' : 'Inactive',
      avatar: this.getUserAvatar(user),
      memberSince: this.formatMemberSince(user.createdAt),
      profileCompletion: this.getProfileCompletion(user)
    };
  }

  /**
   * Get user role display name
   */
  static getRoleDisplayName(role: UserType): string {
    switch (role) {
      case 'CLIENT':
        return 'Client';
      case 'DRIVER':
        return 'Driver';
      case 'BLOG_EDITOR':
        return 'Blog Editor';
      case 'ADMIN':
        return 'Administrator';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get user's primary role
   */
  static getPrimaryRole(user: ExtendedUser): UserType {
    if (!user.userRoles || user.userRoles.length === 0) return 'CLIENT';
    return user.userRoles[0].role;
  }

  /**
   * Get user avatar letter
   */
  static getUserAvatar(user: ExtendedUser): string {
    return user.name?.charAt(0)?.toUpperCase() || 'U';
  }

  /**
   * Format member since date
   */
  static formatMemberSince(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  static getProfileCompletion(user: ExtendedUser): number {
    let completionScore = 0;
    let totalFields = 0;

    // Basic fields
    const basicFields = [
      user.name,
      user.email,
      user.phone,
      user.isVerified
    ];
    
    basicFields.forEach(field => {
      totalFields++;
      if (field) completionScore++;
    });

    // Role-specific fields
    const role = this.getPrimaryRole(user);
    
    if (role === 'CLIENT' && user.clientProfile) {
      const clientFields = [
        user.clientProfile.dateOfBirth,
        user.clientProfile.gender,
        user.clientProfile.nationality,
        user.clientProfile.emergencyContact,
        user.clientProfile.membershipTier
      ];
      
      clientFields.forEach(field => {
        totalFields++;
        if (field) completionScore++;
      });
    } else if (role === 'DRIVER' && user.driverProfile) {
      const driverFields = [
        user.driverProfile.licenseNumber,
        user.driverProfile.licenseExpiry,
        user.driverProfile.languages?.length > 0,
        user.driverProfile.isApproved
      ];
      
      driverFields.forEach(field => {
        totalFields++;
        if (field) completionScore++;
      });
    } else if (role === 'BLOG_EDITOR' && user.blogEditorProfile) {
      const editorFields = [
        user.blogEditorProfile.bio,
        user.blogEditorProfile.isApproved,
        user.blogEditorProfile.permissions?.length > 0
      ];
      
      editorFields.forEach(field => {
        totalFields++;
        if (field) completionScore++;
      });
    }

    return Math.round((completionScore / totalFields) * 100);
  }

  /**
   * Get user statistics display data
   */
  static getUserStatsDisplay(user: ExtendedUser): UserStatDisplay[] {
    const role = this.getPrimaryRole(user);

    switch (role) {
      case 'CLIENT':
        return [
          {
            label: 'Total Trips',
            value: user.clientProfile?.loyaltyPoints ? Math.floor(user.clientProfile.loyaltyPoints / 20) : 0,
            formatted: user.clientProfile?.loyaltyPoints ? Math.floor(user.clientProfile.loyaltyPoints / 20).toString() : '0',
            icon: '🚗'
          },
          {
            label: 'Loyalty Points',
            value: user.clientProfile?.loyaltyPoints || 0,
            formatted: (user.clientProfile?.loyaltyPoints || 0).toLocaleString(),
            icon: '⭐'
          },
          {
            label: 'Total Spent',
            value: 'HK$45,000',
            formatted: 'HK$45,000',
            icon: '💰'
          },
          {
            label: 'Member Since',
            value: new Date(user.createdAt).getFullYear(),
            formatted: new Date(user.createdAt).getFullYear().toString(),
            icon: '📅'
          }
        ];

      case 'DRIVER':
        return [
          {
            label: 'Total Trips',
            value: user.driverProfile?.totalTrips || 0,
            formatted: (user.driverProfile?.totalTrips || 0).toLocaleString(),
            icon: '🚗'
          },
          {
            label: 'Rating',
            value: user.driverProfile?.rating || 0,
            formatted: `${user.driverProfile?.rating || 0}⭐`,
            icon: '⭐'
          },
          {
            label: 'Earnings',
            value: 'HK$28,500',
            formatted: 'HK$28,500',
            icon: '💰'
          },
          {
            label: 'Active Since',
            value: new Date(user.createdAt).getFullYear(),
            formatted: new Date(user.createdAt).getFullYear().toString(),
            icon: '📅'
          }
        ];

      case 'BLOG_EDITOR':
        return [
          {
            label: 'Articles Published',
            value: 24,
            formatted: '24',
            icon: '📝'
          },
          {
            label: 'Total Views',
            value: '12.5K',
            formatted: '12.5K',
            icon: '👁️'
          },
          {
            label: 'Avg Rating',
            value: 4.8,
            formatted: '4.8⭐',
            icon: '⭐'
          },
          {
            label: 'Editor Since',
            value: new Date(user.createdAt).getFullYear(),
            formatted: new Date(user.createdAt).getFullYear().toString(),
            icon: '📅'
          }
        ];

      default:
        return [
          {
            label: 'Account Age',
            value: this.getAccountAgeInDays(user.createdAt),
            formatted: `${this.getAccountAgeInDays(user.createdAt)} days`,
            icon: '📅'
          },
          {
            label: 'Profile Completion',
            value: this.getProfileCompletion(user),
            formatted: `${this.getProfileCompletion(user)}%`,
            icon: '✅'
          }
        ];
    }
  }

  /**
   * Get performance metrics display
   */
  static getPerformanceMetrics(user: ExtendedUser): UserStatDisplay[] {
    const role = this.getPrimaryRole(user);

    switch (role) {
      case 'CLIENT':
        return [
          {
            label: 'Average Trip Rating',
            value: 4.9,
            formatted: '4.9 ⭐',
            icon: '⭐'
          },
          {
            label: 'Booking Frequency',
            value: '2.3 trips/month',
            formatted: '2.3 trips/month',
            icon: '📅'
          },
          {
            label: 'Preferred Route',
            value: 'HK ↔ Shenzhen',
            formatted: 'HK ↔ Shenzhen',
            icon: '🗺️'
          }
        ];

      case 'DRIVER':
        return [
          {
            label: 'Acceptance Rate',
            value: 94,
            formatted: '94%',
            icon: '✅'
          },
          {
            label: 'Completion Rate',
            value: 98,
            formatted: '98%',
            icon: '✅'
          },
          {
            label: 'On-time Rate',
            value: 96,
            formatted: '96%',
            icon: '⏰'
          }
        ];

      case 'BLOG_EDITOR':
        return [
          {
            label: 'Articles This Month',
            value: 8,
            formatted: '8',
            icon: '📝'
          },
          {
            label: 'Engagement Rate',
            value: 85,
            formatted: '85%',
            icon: '📈'
          },
          {
            label: 'Avg. Reading Time',
            value: '4.2 min',
            formatted: '4.2 min',
            icon: '⏱️'
          }
        ];

      default:
        return [];
    }
  }

  /**
   * Get account summary metrics
   */
  static getAccountSummary(user: ExtendedUser): UserStatDisplay[] {
    return [
      {
        label: 'Account Age',
        value: this.getAccountAgeInDays(user.createdAt),
        formatted: `${this.getAccountAgeInDays(user.createdAt)} days`,
        icon: '📅'
      },
      {
        label: 'Last Login',
        value: '2 hours ago',
        formatted: '2 hours ago',
        icon: '🕒'
      },
      {
        label: 'Profile Completion',
        value: this.getProfileCompletion(user),
        formatted: `${this.getProfileCompletion(user)}%`,
        icon: '✅'
      },
      {
        label: 'Verification Status',
        value: user.isVerified ? 'Verified' : 'Pending',
        formatted: user.isVerified ? '✅ Verified' : '⏳ Pending',
        icon: user.isVerified ? '✅' : '⏳'
      }
    ];
  }

  /**
   * Format recent activity
   */
  static getFormattedActivity(user: ExtendedUser): ActivityDisplay[] {
    const role = this.getPrimaryRole(user);
    
    // Mock activity data - in production this would come from database
    const baseActivities = [
      {
        type: 'login',
        description: 'Logged into account',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'success'
      },
      {
        type: 'profile_update',
        description: 'Updated profile information',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'success'
      }
    ];

    // Add role-specific activities
    let roleActivities: any[] = [];
    
    if (role === 'CLIENT') {
      roleActivities = [
        {
          type: 'trip',
          description: 'Trip to Shenzhen completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success',
          amount: 'HK$450'
        },
        {
          type: 'payment',
          description: 'Payment processed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success',
          amount: 'HK$450'
        },
        {
          type: 'review',
          description: 'Left 5-star review for driver',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          status: 'success'
        }
      ];
    } else if (role === 'DRIVER') {
      roleActivities = [
        {
          type: 'trip',
          description: 'Completed trip to Hong Kong',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'success',
          amount: 'HK$380'
        },
        {
          type: 'document',
          description: 'License verification pending',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'pending'
        }
      ];
    } else if (role === 'BLOG_EDITOR') {
      roleActivities = [
        {
          type: 'article',
          description: 'Published "Travel Tips for Cross-Border Trips"',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          type: 'article',
          description: 'Draft "Best Routes Guide" saved',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'pending'
        }
      ];
    }

    const allActivities = [...roleActivities, ...baseActivities];

    return allActivities.map(activity => ({
      type: activity.type,
      typeDisplayName: this.getActivityTypeDisplayName(activity.type),
      description: activity.description,
      timestamp: activity.timestamp.toISOString(),
      timeAgo: this.formatTimeAgo(activity.timestamp),
      status: activity.status,
      statusColor: this.getStatusColor(activity.status),
      icon: this.getActivityIcon(activity.type),
      amount: activity.amount
    }));
  }

  /**
   * Get activity type display name
   */
  static getActivityTypeDisplayName(type: string): string {
    switch (type) {
      case 'trip':
        return 'Trip';
      case 'payment':
        return 'Payment';
      case 'review':
        return 'Review';
      case 'document':
        return 'Document';
      case 'article':
        return 'Article';
      case 'login':
        return 'Login';
      case 'profile_update':
        return 'Profile Update';
      default:
        return 'Activity';
    }
  }

  /**
   * Get activity icon
   */
  static getActivityIcon(type: string): string {
    switch (type) {
      case 'trip':
        return '🚗';
      case 'payment':
        return '💳';
      case 'review':
        return '⭐';
      case 'document':
        return '📋';
      case 'article':
        return '📝';
      case 'login':
        return '🔐';
      case 'profile_update':
        return '👤';
      default:
        return '📋';
    }
  }

  /**
   * Get status color class
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Format time ago
   */
  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get account age in days
   */
  static getAccountAgeInDays(createdAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get role badge styling
   */
  static getRoleBadgeStyle(role: UserType): string {
    switch (role) {
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800';
      case 'DRIVER':
        return 'bg-green-100 text-green-800';
      case 'BLOG_EDITOR':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get membership tier badge styling
   */
  static getMembershipTierStyle(tier: string): string {
    switch (tier) {
      case 'VIP':
        return 'bg-[#FF69B4]/20 text-[#FF69B4] border-[#FF69B4]/30';
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'BASIC':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  /**
   * Get table display value for a specific field
   */
  static getTableDisplayValue(user: ExtendedUser, field: string): string | number {
    switch (field) {
      case 'trips':
        if (user.clientProfile?.loyaltyPoints) {
          return Math.floor(user.clientProfile.loyaltyPoints / 20);
        }
        return user.driverProfile?.totalTrips || 0;
      case 'rating':
        return user.driverProfile?.rating || 'N/A';
      case 'loyaltyPoints':
        return user.clientProfile?.loyaltyPoints || 0;
      case 'membershipTier':
        return user.clientProfile?.membershipTier || 'N/A';
      case 'licenseNumber':
        return user.driverProfile?.licenseNumber || 'N/A';
      case 'createdDate':
        return new Date(user.createdAt).toLocaleDateString();
      case 'lastActive':
        return '2 hours ago'; // Mock data
      default:
        return 'N/A';
    }
  }
}