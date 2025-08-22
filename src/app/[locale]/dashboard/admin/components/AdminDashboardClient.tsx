'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AdminMetrics from '@/components/admin/AdminMetrics';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { cn } from '@/lib/utils';
import { ExtendedUser, ActivityItem } from '@/lib/data/user';
import { AdminMetrics as AdminMetricsType } from '@/lib/data/dashboard';
import { 
  getActivityIcon, 
  getActivityStatusColor,
  formatUserRole 
} from '@/lib/services/user-formatting';

interface AdminDashboardClientProps {
  userData: {
    name: string;
    welcomeMessage: string;
  };
  users: ExtendedUser[];
  recentActivity: ActivityItem[];
  metrics: AdminMetricsType;
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  userData,
  users: initialUsers,
  recentActivity,
  metrics
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');
  const [users, setUsers] = useState<ExtendedUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserUpdate = async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      setLoading(true);
      
      // Call API to update user
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      
    } catch (error) {
      console.error('Failed to update user:', error);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    console.log('User selected:', userId);
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }
      
      // Refresh users list or update state accordingly
      // This would depend on the specific action
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      setError('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'warning':
        return 'bg-orange-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF69B4] to-[#FF1493]" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                CrossBorder Admin
              </h1>
              <p className="text-lg opacity-90">
                {userData.welcomeMessage}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#FF69B4]">{metrics.activeUsers}</div>
              <div className="text-sm opacity-75">Active Users</div>
            </div>
          </div>
        </motion.section>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm"
        >
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'User Management', icon: '👥' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-[#FF69B4] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-800 hover:text-red-900"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics Dashboard */}
                <AdminMetrics />

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2">
                    <Card>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                        <Button variant="secondary" size="sm">
                          View All
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg',
                              getStatusColor(activity.status)
                            )}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            </div>
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              activity.status === 'success' && 'bg-green-100 text-green-800',
                              activity.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                              activity.status === 'warning' && 'bg-orange-100 text-orange-800',
                              activity.status === 'error' && 'bg-red-100 text-red-800'
                            )}>
                              {activity.status}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Quick Actions & System Status */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('users')}
                        >
                          👤 User Management
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          🚗 Driver Verification
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('analytics')}
                        >
                          📊 Analytics Report
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          🎫 Support Tickets
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          ⚙️ System Settings
                        </Button>
                      </div>
                    </Card>

                    {/* System Alerts */}
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        System Alerts
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400">
                          <h4 className="font-medium text-yellow-800">High Support Volume</h4>
                          <p className="text-sm text-yellow-600 mt-1">Support tickets increased by 35% today</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-400">
                          <h4 className="font-medium text-green-800">Revenue Target Met</h4>
                          <p className="text-sm text-green-600 mt-1">Monthly revenue target achieved!</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600">Manage clients, drivers, and blog editors with advanced filtering and bulk operations.</p>
                </div>
                
                <UserManagementTable
                  users={users}
                  loading={loading}
                  onUserUpdate={handleUserUpdate}
                  onUserSelect={handleUserSelect}
                  onBulkAction={handleBulkAction}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
                  <p className="text-gray-600">Detailed insights and performance metrics for your platform.</p>
                </div>
                
                <AdminMetrics />
                
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trends</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart visualization would go here</p>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Revenue chart would go here</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboardClient;
