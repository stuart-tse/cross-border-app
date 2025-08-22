import { UserType } from '@prisma/client';
import { ExtendedUser, UserStatistics, ActivityItem, PerformanceMetrics } from '@/lib/data/user';

/**
 * Service for formatting user data and constructing user-related strings
 * This moves all string construction logic out of components
 */

/**
 * Get user's primary role
 */
export function getUserPrimaryRole(user: ExtendedUser): UserType {
  if (!user?.userRoles || user.userRoles.length === 0) return 'CLIENT';
  return user.userRoles[0].role;
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(user: ExtendedUser | null): string {
  return user?.name || 'Unknown User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: ExtendedUser | null): string {
  if (!user?.name) return 'U';
  return user.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserType): string {
  switch (role) {
    case 'BLOG_EDITOR':
      return 'Blog Editor';
    case 'CLIENT':
      return 'Client';
    case 'DRIVER':
      return 'Driver';
    case 'ADMIN':
      return 'Administrator';
    default:
      return role;
  }
}

/**
 * Get role-specific styling classes
 */
export function getRoleStyleClasses(role: UserType): string {
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
 * Format membership tier display
 */
export function formatMembershipTier(tier?: string | null): string {
  if (!tier) return '';
  return `${tier.charAt(0) + tier.slice(1).toLowerCase()} Member`;
}

/**
 * Get user statistics based on role
 */
export function getUserStatistics(user: ExtendedUser): UserStatistics[] {
  const role = getUserPrimaryRole(user);
  const memberSince = new Date(user.createdAt).getFullYear();
  
  switch (role) {
    case 'CLIENT':
      return [
        { 
          label: 'Total Trips', 
          value: user.clientProfile?.loyaltyPoints ? Math.floor(user.clientProfile.loyaltyPoints / 20) : 0 
        },
        { 
          label: 'Loyalty Points', 
          value: user.clientProfile?.loyaltyPoints || 0 
        },
        { 
          label: 'Total Spent', 
          value: 'HK$45,000' // This would come from actual trip data
        },
        { 
          label: 'Member Since', 
          value: memberSince 
        }
      ];
      
    case 'DRIVER':
      return [
        { 
          label: 'Total Trips', 
          value: user.driverProfile?.totalTrips || 0 
        },
        { 
          label: 'Rating', 
          value: user.driverProfile?.rating || 0 
        },
        { 
          label: 'Earnings', 
          value: 'HK$28,500' // This would come from actual earnings data
        },
        { 
          label: 'Active Since', 
          value: memberSince 
        }
      ];
      
    case 'BLOG_EDITOR':
      return [
        { 
          label: 'Articles Published', 
          value: 24 // This would come from actual article data
        },
        { 
          label: 'Total Views', 
          value: '12.5K' // This would come from analytics
        },
        { 
          label: 'Avg Rating', 
          value: 4.8 // This would come from article ratings
        },
        { 
          label: 'Editor Since', 
          value: memberSince 
        }
      ];
      
    case 'ADMIN':
      return [
        { 
          label: 'Users Managed', 
          value: 267 // This would come from actual data
        },
        { 
          label: 'System Uptime', 
          value: '99.9%' 
        },
        { 
          label: 'Active Since', 
          value: memberSince 
        },
        { 
          label: 'Last Login', 
          value: '2 hours ago' 
        }
      ];
      
    default:
      return [];
  }
}

/**
 * Get performance metrics based on role
 */
export function getPerformanceMetrics(user: ExtendedUser): PerformanceMetrics {
  const role = getUserPrimaryRole(user);
  
  switch (role) {
    case 'CLIENT':
      return {
        'Average Trip Rating': '4.9 ⭐',
        'Booking Frequency': '2.3 trips/month',
        'Preferred Route': 'HK ↔ Shenzhen',
        'Payment Method': 'Credit Card'
      };
      
    case 'DRIVER':
      return {
        'Acceptance Rate': '94%',
        'Completion Rate': '98%',
        'On-time Rate': '96%',
        'Customer Rating': `${user.driverProfile?.rating || 4.8} ⭐`
      };
      
    case 'BLOG_EDITOR':
      return {
        'Articles This Month': '8',
        'Average Views': '1.2K',
        'Engagement Rate': '12.5%',
        'Published Status': '24 live articles'
      };
      
    default:
      return {};
  }
}

/**
 * Get account summary information
 */
export function getAccountSummary(user: ExtendedUser): Record<string, string> {
  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    'Account Age': `${accountAge} days`,
    'Last Login': '2 hours ago', // This would come from session data
    'Profile Completion': '85%', // This would be calculated from actual profile data
    'Email Verified': user.isVerified ? 'Yes' : 'No',
    'Account Status': user.isActive ? 'Active' : 'Inactive'
  };
}

/**
 * Format activity description based on type and role
 */
export function formatActivityDescription(type: ActivityItem['type'], context?: any): string {
  switch (type) {
    case 'trip':
      return context?.destination 
        ? `Trip to ${context.destination} completed`
        : 'Trip completed successfully';
    case 'payment':
      return context?.amount 
        ? `Payment of ${context.amount} processed`
        : 'Payment processed successfully';
    case 'review':
      return context?.rating 
        ? `Left ${context.rating}-star review`
        : 'Left review for service';
    case 'document':
      return context?.documentType 
        ? `${context.documentType} verified`
        : 'Document verification completed';
    case 'article':
      return context?.title 
        ? `Published article: ${context.title}`
        : 'Article published';
    case 'user_registration':
      return context?.email 
        ? `New user registration: ${context.email}`
        : 'New user registered';
    case 'trip_completed':
      return context?.tripId 
        ? `Trip ${context.tripId} completed successfully`
        : 'Trip completed';
    case 'driver_verification':
      return context?.driverName 
        ? `Driver verification pending: ${context.driverName}`
        : 'Driver verification pending';
    case 'support_ticket':
      return context?.ticketId 
        ? `Support ticket #${context.ticketId} opened`
        : 'Support ticket opened';
    default:
      return 'Activity recorded';
  }
}

/**
 * Get activity icon based on type
 */
export function getActivityIcon(type: ActivityItem['type']): string {
  switch (type) {
    case 'trip':
    case 'trip_completed':
      return '🚗';
    case 'payment':
      return '💳';
    case 'review':
      return '⭐';
    case 'document':
      return '📋';
    case 'article':
      return '📝';
    case 'user_registration':
      return '👤';
    case 'driver_verification':
      return '📋';
    case 'support_ticket':
      return '🎫';
    default:
      return '📝';
  }
}

/**
 * Get status color classes for activities
 */
export function getActivityStatusColor(status: ActivityItem['status']): string {
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
 * Format user phone with fallback
 */
export function formatUserPhone(user: ExtendedUser): string {
  return user.phone || 'Not provided';
}

/**
 * Format user email for display
 */
export function formatUserEmail(user: ExtendedUser): string {
  return user.email;
}

/**
 * Get welcome message based on user role and time
 */
export function getWelcomeMessage(user: ExtendedUser): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const role = getUserPrimaryRole(user);
  
  switch (role) {
    case 'CLIENT':
      return `${timeGreeting}, ${getUserDisplayName(user)}! Ready for your next journey?`;
    case 'DRIVER':
      return `${timeGreeting}, ${getUserDisplayName(user)}! Ready to serve passengers today?`;
    case 'BLOG_EDITOR':
      return `${timeGreeting}, ${getUserDisplayName(user)}! Ready to create amazing content?`;
    case 'ADMIN':
      return `${timeGreeting}, ${getUserDisplayName(user)}! System is running smoothly.`;
    default:
      return `${timeGreeting}, ${getUserDisplayName(user)}!`;
  }
}

/**
 * Generate quick actions based on user role
 */
export function getQuickActions(role: UserType): Array<{ label: string; href: string; icon: string; primary?: boolean }> {
  switch (role) {
    case 'CLIENT':
      return [
        { label: 'New Booking', href: '/booking', icon: '🚗', primary: true },
        { label: 'Trip History', href: '/dashboard/client/trips', icon: '📋' },
        { label: 'Payment Methods', href: '/dashboard/client/payment-methods', icon: '💳' },
        { label: 'My Profile', href: '/dashboard/client/profile', icon: '👤' },
        { label: 'Account Settings', href: '/dashboard/client/settings', icon: '⚙️' }
      ];
      
    case 'DRIVER':
      return [
        { label: 'View Requests', href: '/dashboard/driver/requests', icon: '📝', primary: true },
        { label: 'Earnings', href: '/dashboard/driver/earnings', icon: '💰' },
        { label: 'Vehicle Info', href: '/dashboard/driver/vehicle', icon: '🚗' },
        { label: 'Documents', href: '/dashboard/driver/documents', icon: '📋' },
        { label: 'Settings', href: '/dashboard/driver/settings', icon: '⚙️' }
      ];
      
    case 'BLOG_EDITOR':
      return [
        { label: 'Create Post', href: '/dashboard/editor/create', icon: '✍️', primary: true },
        { label: 'My Posts', href: '/dashboard/editor/posts', icon: '📄' },
        { label: 'Media Library', href: '/dashboard/editor/media', icon: '🖼️' },
        { label: 'Analytics', href: '/dashboard/editor/analytics', icon: '📊' },
        { label: 'Profile', href: '/dashboard/editor/profile', icon: '👤' }
      ];
      
    case 'ADMIN':
      return [
        { label: 'User Management', href: '/dashboard/admin/users', icon: '👥', primary: true },
        { label: 'System Analytics', href: '/dashboard/admin/analytics', icon: '📊' },
        { label: 'Support Tickets', href: '/dashboard/admin/support', icon: '🎫' },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️' }
      ];
      
    default:
      return [];
  }
}
