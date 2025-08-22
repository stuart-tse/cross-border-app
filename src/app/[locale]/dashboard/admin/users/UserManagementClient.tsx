'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserFilters, UserListResult, ExtendedUser } from '@/lib/data/user-service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import UserManagementTable from '@/components/admin/UserManagementTable';

interface UserManagementClientProps {
  initialData: UserListResult;
  initialFilters: UserFilters;
  initialPage: number;
  locale: string;
}

/**
 * Client Component for interactive user management features
 * Handles filters, pagination, and user interactions
 */
export default function UserManagementClient({
  initialData,
  initialFilters,
  initialPage,
  locale
}: UserManagementClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialData.users);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filters state
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);

  /**
   * Update URL with new filters and trigger server-side re-fetch
   */
  const updateFilters = useCallback((newFilters: Partial<UserFilters>, newPage: number = 1) => {
    const searchParams = new URLSearchParams();
    
    // Add filters to search params
    if (newFilters.search) searchParams.set('search', newFilters.search);
    if (newFilters.status && newFilters.status !== 'all') searchParams.set('status', newFilters.status);
    if (newFilters.userType && newFilters.userType !== 'ALL') searchParams.set('userType', newFilters.userType);
    if (newFilters.membershipTier && newFilters.membershipTier !== 'all') searchParams.set('membershipTier', newFilters.membershipTier);
    if (newFilters.verificationStatus && newFilters.verificationStatus !== 'all') searchParams.set('verificationStatus', newFilters.verificationStatus);
    if (newPage > 1) searchParams.set('page', newPage.toString());

    // Navigate to update the page with new search params (triggers server re-render)
    router.push(`/${locale}/dashboard/admin/users?${searchParams.toString()}`);
  }, [router, locale]);

  const handleFilterChange = useCallback((key: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters, 1);
  }, [filters, updateFilters]);

  const clearFilters = useCallback(() => {
    const newFilters: UserFilters = {
      search: '',
      status: 'all',
      userType: 'ALL',
      membershipTier: 'all',
      verificationStatus: 'all'
    };
    setFilters(newFilters);
    updateFilters(newFilters, 1);
  }, [updateFilters]);

  const handleUserUpdate = useCallback(async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call API
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state optimistically
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      console.log('User updated:', userId, updates);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleBulkAction = useCallback(async (action: string, userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call API
      const response = await fetch('/api/admin/users/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} users`);
      }

      console.log('Bulk action:', action, userIds);

      // Update local state optimistically
      if (action === 'activate') {
        setUsers(prev => prev.map(user => 
          userIds.includes(user.id) ? { ...user, isActive: true } : user
        ));
      } else if (action === 'deactivate') {
        setUsers(prev => prev.map(user => 
          userIds.includes(user.id) ? { ...user, isActive: false } : user
        ));
      } else if (action === 'delete') {
        setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
      }

      setSelectedUsers([]);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(`Failed to ${action} users`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateFilters(filters, page);
  }, [filters, updateFilters]);

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* User Type Filter */}
          <div>
            <select
              value={filters.userType || 'ALL'}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="ALL">All Types</option>
              <option value="CLIENT">Clients</option>
              <option value="DRIVER">Drivers</option>
              <option value="ADMIN">Admins</option>
              <option value="BLOG_EDITOR">Blog Editors</option>
            </select>
          </div>

          {/* Membership Tier Filter */}
          <div>
            <select
              value={filters.membershipTier || 'all'}
              onChange={(e) => handleFilterChange('membershipTier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="all">All Tiers</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <select
              value={filters.verificationStatus || 'all'}
              onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="w-full text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('activate', selectedUsers)}
                disabled={loading}
              >
                Activate
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('deactivate', selectedUsers)}
                disabled={loading}
              >
                Deactivate
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('delete', selectedUsers)}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <UserManagementTable
        users={users}
        loading={loading}
        onUserUpdate={handleUserUpdate}
        onUserSelect={handleUserSelect}
        onBulkAction={handleBulkAction}
      />

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          {Array.from({ length: initialData.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "primary" : "secondary"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={loading}
              className={
                page === currentPage ? "bg-[#FF69B4] text-white min-w-[40px]" : "min-w-[40px]"
              }
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(Math.min(initialData.totalPages, currentPage + 1))}
            disabled={currentPage === initialData.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
              <p className="text-gray-600 mb-4">User creation form would go here...</p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Create User
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}