'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import UserStatusBadge from './UserStatusBadge';
import UserActionMenu from './UserActionMenu';
import UserDetailModal from './UserDetailModal';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/lib/data/user-service';
import { UserDisplayService } from '@/lib/data/user-display-service';


interface UserFilters {
  search: string;
  status: string;
  userType: UserType | 'ALL';
  membershipTier?: string;
  verificationStatus?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

interface UserManagementTableProps {
  users: ExtendedUser[];
  loading?: boolean;
  onUserUpdate: (userId: string, updates: Partial<ExtendedUser>) => Promise<void>;
  onUserSelect: (userId: string) => void;
  onBulkAction: (action: string, userIds: string[]) => Promise<void>;
  className?: string;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  loading = false,
  onUserUpdate,
  onUserSelect,
  onBulkAction,
  className
}) => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    userType: 'ALL',
    membershipTier: 'all',
    verificationStatus: 'all'
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc'
  });

  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const [internalSelectedUsers, setInternalSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          user.name,
          user.email,
          user.phone,
          user.driverProfile?.licenseNumber,
        ].filter(Boolean);
        
        if (!searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all') {
        const status = user.isActive ? 'active' : 'inactive';
        if (status !== filters.status) return false;
      }

      // User type filter
      if (filters.userType !== 'ALL') {
        const userRoles = user.userRoles?.map(ur => ur.role) || [];
        if (!userRoles.includes(filters.userType)) return false;
      }

      // Membership tier filter (for clients)
      if (filters.membershipTier && filters.membershipTier !== 'all') {
        if (user.clientProfile?.membershipTier !== filters.membershipTier) {
          return false;
        }
      }

      // Verification status filter (for drivers)
      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        const isApproved = user.driverProfile?.isApproved;
        const verificationStatus = isApproved ? 'approved' : 'pending';
        if (verificationStatus !== filters.verificationStatus) {
          return false;
        }
      }

      return true;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'trips':
          aValue = a.clientProfile?.loyaltyPoints ? Math.floor(a.clientProfile.loyaltyPoints / 20) : 
                   a.driverProfile?.totalTrips || 0;
          bValue = b.clientProfile?.loyaltyPoints ? Math.floor(b.clientProfile.loyaltyPoints / 20) : 
                   b.driverProfile?.totalTrips || 0;
          break;
        case 'rating':
          aValue = a.driverProfile?.rating || 0;
          bValue = b.driverProfile?.rating || 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, filters, sortConfig]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    setPagination(prev => ({ ...prev, total: filteredAndSortedUsers.length }));
    
    return filteredAndSortedUsers.slice(startIndex, endIndex);
  }, [filteredAndSortedUsers, pagination.page, pagination.pageSize]);

  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilterChange = useCallback((key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleUserSelect = useCallback((userId: string, selected: boolean) => {
    setInternalSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setInternalSelectedUsers(selected ? paginatedUsers.map(user => user.id) : []);
  }, [paginatedUsers]);

  const handleUserClick = useCallback((user: ExtendedUser) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
    onUserSelect(user.id);
  }, [onUserSelect]);


  const getSortIcon = useCallback((field: string) => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }, [sortConfig]);


  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  // Loading state
  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters and Controls */}
      <Card>
        <div className="space-y-4">
          {/* Top Row - Search and View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  📊 Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'cards' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  🗃️ Cards
                </button>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filters.userType}
              onChange={(e) => handleFilterChange('userType', e.target.value as UserType | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="ALL">All User Types</option>
              <option value="CLIENT">Clients</option>
              <option value="DRIVER">Drivers</option>
              <option value="BLOG_EDITOR">Blog Editors</option>
              <option value="ADMIN">Admins</option>
            </select>

            {filters.userType === 'CLIENT' && (
              <select
                value={filters.membershipTier || 'all'}
                onChange={(e) => handleFilterChange('membershipTier', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
              >
                <option value="all">All Tiers</option>
                <option value="BASIC">Basic</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            )}

            {filters.userType === 'DRIVER' && (
              <select
                value={filters.verificationStatus || 'all'}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
              >
                <option value="all">All Verification</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}

            <Button
              onClick={() => setFilters({
                search: '',
                status: 'all',
                userType: 'ALL',
                membershipTier: 'all',
                verificationStatus: 'all'
              })}
              variant="secondary"
              size="sm"
            >
              Clear Filters
            </Button>
          </div>

          {/* Bulk Actions */}
          {internalSelectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-3 bg-[#FF69B4]/10 border border-[#FF69B4]/20 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                {internalSelectedUsers.length} user{internalSelectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onBulkAction('export', internalSelectedUsers)}
                  variant="secondary"
                  size="sm"
                >
                  📥 Export
                </Button>
                <Button
                  onClick={() => onBulkAction('notify', internalSelectedUsers)}
                  variant="secondary"
                  size="sm"
                >
                  📧 Send Message
                </Button>
                <Button
                  onClick={() => onBulkAction('deactivate', internalSelectedUsers)}
                  variant="secondary"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  🚫 Deactivate
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} users
        </span>
        <span>
          {internalSelectedUsers.length > 0 && `${internalSelectedUsers.length} selected`}
        </span>
      </div>

      {/* User List */}
      <Card className="overflow-hidden">
        {viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && internalSelectedUsers.length === paginatedUsers.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      <span className="text-xs">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      <span className="text-xs">{getSortIcon('email')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Role
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('trips')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Trips/Articles</span>
                      <span className="text-xs">{getSortIcon('trips')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedUsers.map((user, index) => {
                    const displayInfo = UserDisplayService.getUserDisplayInfo(user);
                    const primaryRole = UserDisplayService.getPrimaryRole(user);
                    const isSelected = internalSelectedUsers.includes(user.id);

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'hover:bg-[#FF69B4]/5 transition-colors duration-150 cursor-pointer',
                          isSelected && 'bg-[#FF69B4]/10'
                        )}
                        onClick={() => handleUserClick(user)}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                            className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                          />
                        </td>
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
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            UserDisplayService.getRoleBadgeStyle(primaryRole)
                          )}>
                            {displayInfo.roleDisplayName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {UserDisplayService.getTableDisplayValue(user, 'trips')}
                        </td>
                        <td className="px-4 py-4">
                          <UserStatusBadge
                            status={user.isActive ? 'active' : 'inactive'}
                            verified={user.isVerified}
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {UserDisplayService.getTableDisplayValue(user, 'createdDate')}
                        </td>
                        <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <UserActionMenu
                            userId={user.id}
                            userType={primaryRole}
                            userStatus={user.isActive ? 'active' : 'inactive'}
                            onViewProfile={() => handleUserClick(user)}
                            onEditUser={() => handleUserClick(user)}
                            onViewBookings={() => {}}
                            onManagePermissions={() => {}}
                            onToggleStatus={() => {}}
                            onSuspendUser={() => {}}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <AnimatePresence>
              {paginatedUsers.map((user, index) => {
                const displayInfo = UserDisplayService.getUserDisplayInfo(user);
                const primaryRole = UserDisplayService.getPrimaryRole(user);
                const isSelected = internalSelectedUsers.includes(user.id);

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'relative bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer',
                      isSelected && 'border-[#FF69B4] bg-[#FF69B4]/5'
                    )}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <div onClick={(e) => e.stopPropagation()}>
                        <UserActionMenu
                          userId={user.id}
                          userType={primaryRole}
                          userStatus={user.isActive ? 'active' : 'inactive'}
                          onViewProfile={() => handleUserClick(user)}
                          onEditUser={() => handleUserClick(user)}
                          onViewBookings={() => {}}
                          onManagePermissions={() => {}}
                          onToggleStatus={() => {}}
                          onSuspendUser={() => {}}
                        />
                      </div>
                    </div>

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
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          UserDisplayService.getRoleBadgeStyle(primaryRole)
                        )}>
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
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            UserDisplayService.getMembershipTierStyle(user.clientProfile.membershipTier)
                          )}>
                            {user.clientProfile.membershipTier}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {paginatedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status !== 'all' || filters.userType !== 'ALL'
                ? 'Try adjusting your filters to see more results.'
                : 'No users have been added yet.'}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pagination.pageSize}
              onChange={(e) => setPagination(prev => ({ 
                ...prev, 
                pageSize: Number(e.target.value),
                page: 1 
              }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="secondary"
              size="sm"
            >
              ← Previous
            </Button>

            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else {
                  const start = Math.max(1, pagination.page - 2);
                  const end = Math.min(totalPages, start + 4);
                  pageNumber = start + i;
                  if (pageNumber > end) return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      pagination.page === pageNumber
                        ? 'bg-[#FF69B4] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === totalPages}
              variant="secondary"
              size="sm"
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={async (updates) => {
          if (selectedUser) {
            await onUserUpdate(selectedUser.id, updates);
          }
        }}
      />
    </div>
  );
};

export default UserManagementTable;