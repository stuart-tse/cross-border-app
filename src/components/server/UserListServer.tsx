import { UserService, UserFilters } from '@/lib/data/user-service';
import { UserDisplayService } from '@/lib/data/user-display-service';
import { Card } from '@/components/ui/Card';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { UserType } from '@prisma/client';

interface UserListServerProps {
  filters?: UserFilters;
  page?: number;
  pageSize?: number;
  viewMode?: 'table' | 'cards';
  className?: string;
}

/**
 * Server Component for displaying user list
 * Fetches and renders user data server-side
 */
export default async function UserListServer({
  filters = {},
  page = 1,
  pageSize = 10,
  viewMode = 'table',
  className
}: UserListServerProps) {
  // Fetch users data on the server
  const result = await UserService.getUsers(filters, page, pageSize);
  
  if (result.users.length === 0) {
    return <EmptyUsersList filters={filters} className={className} />;
  }

  if (viewMode === 'cards') {
    return <UserCardsView users={result.users} className={className} />;
  }

  return <UserTableView users={result.users} className={className} />;
}

/**
 * Server Component for table view of users
 */
async function UserTableView({ 
  users, 
  className 
}: { 
  users: Awaited<ReturnType<typeof UserService.getUsers>>['users'];
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Activity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const displayInfo = UserDisplayService.getUserDisplayInfo(user);
              const primaryRole = UserDisplayService.getPrimaryRole(user);
              
              return (
                <tr key={user.id} className="hover:bg-[#FF69B4]/5 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {displayInfo.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{displayInfo.name}</div>
                        <div className="text-sm text-gray-500">{displayInfo.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {displayInfo.email}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${UserDisplayService.getRoleBadgeStyle(primaryRole)}`}>
                      {displayInfo.roleDisplayName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <UserStatusBadge
                      status={user.isActive ? 'active' : 'inactive'}
                      verified={user.isVerified}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {UserDisplayService.getTableDisplayValue(user, 'trips')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {UserDisplayService.getTableDisplayValue(user, 'createdDate')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * Server Component for cards view of users
 */
async function UserCardsView({ 
  users, 
  className 
}: { 
  users: Awaited<ReturnType<typeof UserService.getUsers>>['users'];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {users.map((user) => {
        const displayInfo = UserDisplayService.getUserDisplayInfo(user);
        const primaryRole = UserDisplayService.getPrimaryRole(user);
        
        return (
          <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full flex items-center justify-center text-white text-lg font-bold">
                {displayInfo.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{displayInfo.name}</h3>
                <p className="text-sm text-gray-500 truncate">{displayInfo.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Role</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${UserDisplayService.getRoleBadgeStyle(primaryRole)}`}>
                  {displayInfo.roleDisplayName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {primaryRole === 'CLIENT' ? 'Trips' : 
                   primaryRole === 'DRIVER' ? 'Trips' : 'Articles'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {UserDisplayService.getTableDisplayValue(user, 'trips')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <UserStatusBadge
                  status={user.isActive ? 'active' : 'inactive'}
                  verified={user.isVerified}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Joined</span>
                <span className="text-sm text-gray-900">
                  {UserDisplayService.getTableDisplayValue(user, 'createdDate')}
                </span>
              </div>

              {user.clientProfile?.membershipTier && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tier</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${UserDisplayService.getMembershipTierStyle(user.clientProfile.membershipTier)}`}>
                    {user.clientProfile.membershipTier}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Server Component for empty state
 */
async function EmptyUsersList({ 
  filters, 
  className 
}: { 
  filters: UserFilters;
  className?: string;
}) {
  const hasFilters = filters.search || 
    (filters.status && filters.status !== 'all') || 
    (filters.userType && filters.userType !== 'ALL') ||
    (filters.membershipTier && filters.membershipTier !== 'all') ||
    (filters.verificationStatus && filters.verificationStatus !== 'all');

  return (
    <Card className={`text-center py-12 ${className || ''}`}>
      <div className="text-6xl mb-4">👥</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-500">
        {hasFilters
          ? 'Try adjusting your filters to see more results.'
          : 'No users have been added yet.'}
      </p>
    </Card>
  );
}

/**
 * Server Component for user statistics
 */
export async function UserStatsServer({ className }: { className?: string }) {
  const stats = await UserService.getUserStats();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className || ''}`}>
      <Card className="text-center">
        <div className="text-2xl font-bold text-[#FF69B4] mb-1">{stats.totalUsers}</div>
        <div className="text-sm text-gray-600">Total Users</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalClients}</div>
        <div className="text-sm text-gray-600">Clients</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalDrivers}</div>
        <div className="text-sm text-gray-600">Drivers</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">{stats.activeUsers}</div>
        <div className="text-sm text-gray-600">Active Users</div>
      </Card>
    </div>
  );
}