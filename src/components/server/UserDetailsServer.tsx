import { UserService } from '@/lib/data/user-service';
import { UserDisplayService } from '@/lib/data/user-display-service';
import { Card } from '@/components/ui/Card';
import { notFound } from 'next/navigation';
import { UserType } from '@prisma/client';
import UserStatusBadge from '@/components/admin/UserStatusBadge';

interface UserDetailsServerProps {
  userId: string;
  className?: string;
}

/**
 * Server Component for displaying user details
 * Fetches data server-side and renders without client-side JS
 */
export default async function UserDetailsServer({ 
  userId, 
  className 
}: UserDetailsServerProps) {
  // Fetch user data on the server
  const user = await UserService.getUserById(userId);
  
  if (!user) {
    notFound();
  }

  // Generate display data using the display service
  const displayInfo = UserDisplayService.getUserDisplayInfo(user);
  const userStats = UserDisplayService.getUserStatsDisplay(user);
  const performanceMetrics = UserDisplayService.getPerformanceMetrics(user);
  const accountSummary = UserDisplayService.getAccountSummary(user);
  const recentActivity = UserDisplayService.getFormattedActivity(user);

  return (
    <div className={className}>
      {/* User Header */}
      <Card className="mb-6">
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {displayInfo.avatar}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{displayInfo.name}</h3>
              <UserStatusBadge 
                status={user.isActive ? 'active' : 'inactive'} 
                verified={user.isVerified}
              />
            </div>
            
            <div className="space-y-1 text-gray-600">
              <p>{displayInfo.email}</p>
              {displayInfo.phone !== 'No phone' && <p>{displayInfo.phone}</p>}
              <p className="text-sm">
                {displayInfo.roleDisplayName} • Member since {displayInfo.memberSince}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${UserDisplayService.getRoleBadgeStyle(user.userRoles?.[0]?.role || 'CLIENT')}`}>
                {displayInfo.roleDisplayName}
              </span>
              
              {user.clientProfile?.membershipTier && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${UserDisplayService.getMembershipTierStyle(user.clientProfile.membershipTier)}`}>
                  {user.clientProfile.membershipTier} Member
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Profile Completion</div>
            <div className="text-2xl font-bold text-[#FF69B4]">{displayInfo.profileCompletion}%</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {userStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className="text-2xl font-bold text-[#FF69B4] mb-1">
              {stat.formatted}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Performance and Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {performanceMetrics.length > 0 && (
          <Card>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-semibold">{metric.formatted}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h4>
          <div className="space-y-4">
            {accountSummary.map((summary, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{summary.label}</span>
                <span className="font-semibold">{summary.formatted}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Profile Details */}
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-gray-900">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <p className="text-gray-900">{user.phone || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Status
            </label>
            <UserStatusBadge 
              status={user.isActive ? 'active' : 'inactive'} 
              verified={user.isVerified}
            />
          </div>
        </div>
      </Card>

      {/* Role-specific Information */}
      <RoleSpecificInfo user={user} />

      {/* Recent Activity */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${activity.statusColor}`}>
                {activity.icon}
              </div>
              
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">{activity.timeAgo}</p>
              </div>
              
              {activity.amount && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{activity.amount}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Server Component for role-specific user information
 */
async function RoleSpecificInfo({ user }: { user: Awaited<ReturnType<typeof UserService.getUserById>> }) {
  if (!user) return null;

  const primaryRole = UserDisplayService.getPrimaryRole(user);

  if (primaryRole === 'CLIENT' && user.clientProfile) {
    return (
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Tier
            </label>
            <p className="text-gray-900">{user.clientProfile.membershipTier}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loyalty Points
            </label>
            <p className="text-gray-900">{user.clientProfile.loyaltyPoints?.toLocaleString() || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact
            </label>
            <p className="text-gray-900">{user.clientProfile.emergencyContact || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Verification
            </label>
            <p className="text-gray-900">
              {user.clientProfile.documentVerified ? '✅ Verified' : '⏳ Pending'}
            </p>
          </div>
        </div>

        {user.clientProfile.specialRequests && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <p className="text-gray-900">{user.clientProfile.specialRequests}</p>
          </div>
        )}
      </Card>
    );
  }

  if (primaryRole === 'DRIVER' && user.driverProfile) {
    return (
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <p className="text-gray-900">{user.driverProfile.licenseNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Expiry
            </label>
            <p className="text-gray-900">
              {new Date(user.driverProfile.licenseExpiry).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages
            </label>
            <p className="text-gray-900">
              {user.driverProfile.languages.join(', ') || 'Not specified'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <UserStatusBadge 
              status={user.driverProfile.isApproved ? 'active' : 'pending'} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Trips
            </label>
            <p className="text-gray-900">{user.driverProfile.totalTrips?.toLocaleString() || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <p className="text-gray-900">{user.driverProfile.rating}⭐</p>
          </div>
        </div>
      </Card>
    );
  }

  if (primaryRole === 'BLOG_EDITOR' && user.blogEditorProfile) {
    return (
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Blog Editor Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <UserStatusBadge 
              status={user.blogEditorProfile.isApproved ? 'active' : 'pending'} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissions
            </label>
            <p className="text-gray-900">
              {user.blogEditorProfile.permissions?.join(', ') || 'None'}
            </p>
          </div>
        </div>

        {user.blogEditorProfile.bio && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <p className="text-gray-900">{user.blogEditorProfile.bio}</p>
          </div>
        )}
      </Card>
    );
  }

  return null;
}