'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType, User, ClientProfile, DriverProfile, BlogEditorProfile } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ExtendedUser extends User {
  clientProfile?: ClientProfile | null;
  driverProfile?: DriverProfile | null;
  blogEditorProfile?: BlogEditorProfile | null;
  userRoles?: { role: UserType }[];
}

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'suspended';
  userType: UserType | 'ALL';
  membershipTier: string;
  verificationStatus: string;
}

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    userType: 'ALL',
    membershipTier: 'all',
    verificationStatus: 'all'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Selected users for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock users data - in production this would come from API
  const mockUsers: ExtendedUser[] = [
    {
      id: '1',
      email: 'michael.chen@email.com',
      name: 'Michael Chen',
      phone: '+852 9876 5432',
      avatar: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date('2023-06-15T00:00:00.000Z'),
      updatedAt: new Date('2024-01-15T00:00:00.000Z'),
      userRoles: [{ role: 'CLIENT' as UserType }],
      clientProfile: {
        id: '1',
        userId: '1',
        preferredVehicle: 'LUXURY' as any,
        loyaltyPoints: 2450,
        membershipTier: 'VIP',
        emergencyContact: 'Jane Chen (+852 8765 4321)',
        emergencyContactPhone: '+852 8765 4321',
        emergencyContactRelation: 'spouse',
        dateOfBirth: new Date('1985-03-15T00:00:00.000Z'),
        gender: 'female',
        nationality: 'Canadian',
        passportNumber: 'CA123456789',
        profileCompletion: 95,
        documentVerified: true,
        specialRequests: 'Prefers luxury vehicles, always requests child seat for 6-year-old daughter',
        createdAt: new Date('2023-06-15T00:00:00.000Z'),
        updatedAt: new Date('2024-01-15T00:00:00.000Z')
      },
      driverProfile: null,
      blogEditorProfile: null
    },
    {
      id: '2',
      email: 'li.wei@email.com',
      name: 'Li Wei',
      phone: '+852 6543 2109',
      avatar: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date('2023-08-20T00:00:00.000Z'),
      updatedAt: new Date('2024-01-14T00:00:00.000Z'),
      userRoles: [{ role: 'DRIVER' as UserType }],
      clientProfile: null,
      driverProfile: {
        id: '1',
        userId: '2',
        licenseNumber: 'HK123456789',
        licenseExpiry: new Date('2025-08-20T00:00:00.000Z'),
        isApproved: false,
        rating: 4.8,
        totalTrips: 456,
        languages: ['English', 'Cantonese', 'Mandarin'],
        isAvailable: true,
        currentLocation: null,
        createdAt: new Date('2023-08-20T00:00:00.000Z'),
        updatedAt: new Date('2024-01-14T00:00:00.000Z')
      },
      blogEditorProfile: null
    },
    {
      id: '3',
      email: 'sarah.wong@company.com',
      name: 'Sarah Wong',
      phone: '+852 8765 4321',
      avatar: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date('2023-09-10T00:00:00.000Z'),
      updatedAt: new Date('2024-01-13T00:00:00.000Z'),
      userRoles: [{ role: 'CLIENT' as UserType }],
      clientProfile: {
        id: '2',
        userId: '3',
        preferredVehicle: 'BUSINESS' as any,
        loyaltyPoints: 1820,
        membershipTier: 'PREMIUM',
        emergencyContact: null,
        emergencyContactPhone: null,
        emergencyContactRelation: null,
        dateOfBirth: new Date('1978-07-22T00:00:00.000Z'),
        gender: 'male',
        nationality: 'American',
        passportNumber: 'US987654321',
        profileCompletion: 85,
        documentVerified: false,
        specialRequests: null,
        createdAt: new Date('2023-09-10T00:00:00.000Z'),
        updatedAt: new Date('2024-01-13T00:00:00.000Z')
      },
      driverProfile: null,
      blogEditorProfile: null
    },
    {
      id: '4',
      email: 'david.lee@crossborder.com',
      name: 'David Lee',
      phone: '+852 7654 3210',
      avatar: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date('2023-07-05T00:00:00.000Z'),
      updatedAt: new Date('2024-01-12T00:00:00.000Z'),
      userRoles: [{ role: 'BLOG_EDITOR' as UserType }],
      clientProfile: null,
      driverProfile: null,
      blogEditorProfile: {
        id: '1',
        userId: '4',
        bio: 'Senior content editor with 8+ years of experience in travel and transportation content.',
        socialLinks: { linkedin: 'https://linkedin.com/in/davidlee' },
        isApproved: true,
        permissions: ['WRITE', 'EDIT', 'PUBLISH', 'DELETE'],
        createdAt: new Date('2023-07-05T00:00:00.000Z'),
        updatedAt: new Date('2024-01-12T00:00:00.000Z')
      }
    },
    {
      id: '5',
      email: 'admin@crossborder.com',
      name: 'System Admin',
      phone: '+852 9999 0000',
      avatar: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-18T00:00:00.000Z'),
      userRoles: [{ role: 'ADMIN' as UserType }],
      clientProfile: null,
      driverProfile: null,
      blogEditorProfile: null
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [filters, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call API with filters
      // const params = new URLSearchParams({
      //   page: currentPage.toString(),
      //   pageSize: '10',
      //   ...filters
      // });
      // const response = await fetch(`/api/admin/users?${params}`);
      // const data = await response.json();

      // Filter mock data based on current filters
      let filteredUsers = mockUsers;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.status !== 'all') {
        if (filters.status === 'active') {
          filteredUsers = filteredUsers.filter(user => user.isActive);
        } else if (filters.status === 'inactive') {
          filteredUsers = filteredUsers.filter(user => !user.isActive);
        }
      }

      if (filters.userType !== 'ALL') {
        filteredUsers = filteredUsers.filter(user => 
          user.userRoles?.some(role => role.role === filters.userType)
        );
      }

      setUsers(filteredUsers);
      setTotalUsers(filteredUsers.length);
      setTotalPages(Math.ceil(filteredUsers.length / 10));
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = useCallback(async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call API
      // const response = await fetch(`/api/admin/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });

      // Mock update
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
      // const response = await fetch('/api/admin/users/bulk-actions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action, userIds })
      // });

      console.log('Bulk action:', action, userIds);

      // Mock bulk actions
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

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      userType: 'ALL',
      membershipTier: 'all',
      verificationStatus: 'all'
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage clients, drivers, and blog editors with advanced filtering and bulk operations</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create New User
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#FF69B4] mb-1">{totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {users.filter(u => u.userRoles?.[0]?.role === 'CLIENT').length}
            </div>
            <div className="text-sm text-gray-600">Clients</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {users.filter(u => u.userRoles?.[0]?.role === 'DRIVER').length}
            </div>
            <div className="text-sm text-gray-600">Drivers</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4] text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
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
                  value={filters.userType}
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
                  value={filters.membershipTier}
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
                  value={filters.verificationStatus}
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
        </motion.div>

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserManagementTable
            users={users}
            loading={loading}
            onUserUpdate={handleUserUpdate}
            onUserSelect={handleUserSelect}
            onBulkAction={handleBulkAction}
            selectedUsers={selectedUsers}
          />
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-center space-x-2"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "primary" : "secondary"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                disabled={loading}
                className={cn(
                  "min-w-[40px]",
                  page === currentPage && "bg-[#FF69B4] text-white"
                )}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>

      {/* Create User Modal - Would be implemented as a separate component */}
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
};

export default withAuth(AdminUsersPage, [UserType.ADMIN]);