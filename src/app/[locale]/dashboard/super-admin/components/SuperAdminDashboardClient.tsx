'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ExtendedUser, ActivityItem } from '@/lib/data/user';
import { AdminMetrics as AdminMetricsType } from '@/lib/data/dashboard';
import { 
  getActivityIcon, 
  getActivityStatusColor,
  formatUserRole 
} from '@/lib/services/user-formatting';

interface SystemHealthMetrics {
  serverStatus: string;
  databaseStatus: string;
  apiResponseTime: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
  uptime: string;
  lastBackup: Date;
  securityAlerts: number;
  systemVersion: string;
  pendingUpdates: number;
}

interface SuperAdminDashboardClientProps {
  userData: {
    name: string;
    welcomeMessage: string;
    adminLevel: string;
    permissions: string[];
  };
  users: ExtendedUser[];
  recentActivity: ActivityItem[];
  metrics: AdminMetricsType;
  systemHealth: SystemHealthMetrics;
}

const SuperAdminDashboardClient: React.FC<SuperAdminDashboardClientProps> = ({
  userData,
  users: initialUsers,
  recentActivity,
  metrics,
  systemHealth
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'system' | 'security' | 'finance' | 'developer'>('overview');
  const [users, setUsers] = useState<ExtendedUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const SystemHealthCard = ({ title, value, status, icon }: { title: string; value: string | number; status?: string; icon: string }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 text-6xl opacity-10">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {status && (
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getSystemStatusColor(status))}>
              {status}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Enhanced Header for Super Admin */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 text-white mb-8 relative overflow-hidden"
        >
          {/* Enhanced gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#FF69B4] to-[#FF1493]" />
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-6xl opacity-20">👑</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-10">🛡️</div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">
                  CrossBorder Super Admin
                </h1>
                <span className="px-3 py-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-full">
                  ⚡ SUPER
                </span>
              </div>
              <p className="text-lg opacity-90">
                {userData.welcomeMessage}
              </p>
              <p className="text-sm opacity-75 mt-1">
                System Version: {systemHealth.systemVersion} • Uptime: {systemHealth.uptime}
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="text-3xl font-bold text-[#FFD700]">{metrics.activeUsers}</div>
              <div className="text-sm opacity-75">Active Users</div>
              <div className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                systemHealth.securityAlerts > 0 ? 'bg-red-500' : 'bg-green-500'
              )}>
                {systemHealth.securityAlerts === 0 ? '🔒 Secure' : `⚠️ ${systemHealth.securityAlerts} Alerts`}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-1 mb-8 bg-white rounded-lg p-1 shadow-lg overflow-x-auto"
        >
          {[
            { id: 'overview', label: 'System Overview', icon: '🏠' },
            { id: 'users', label: 'User & Admin Management', icon: '👥' },
            { id: 'analytics', label: 'Platform Analytics', icon: '📊' },
            { id: 'system', label: 'System Config', icon: '⚙️' },
            { id: 'security', label: 'Security & Audit', icon: '🔐' },
            { id: 'finance', label: 'Financial Management', icon: '💰' },
            { id: 'developer', label: 'Developer Tools', icon: '🔧' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
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
                {/* System Health Metrics */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">System Health Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SystemHealthCard title="Server Status" value={systemHealth.serverStatus} status={systemHealth.serverStatus} icon="🖥️" />
                    <SystemHealthCard title="Database" value={systemHealth.databaseStatus} status={systemHealth.databaseStatus} icon="🗄️" />
                    <SystemHealthCard title="API Response" value={`${systemHealth.apiResponseTime}ms`} icon="⚡" />
                    <SystemHealthCard title="Active Connections" value={systemHealth.activeConnections.toLocaleString()} icon="🔗" />
                  </div>
                </div>

                {/* Resource Usage */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Resource Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Memory Usage</span>
                        <span className="text-2xl">🧠</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{systemHealth.memoryUsage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full", systemHealth.memoryUsage > 80 ? "bg-red-500" : systemHealth.memoryUsage > 60 ? "bg-yellow-500" : "bg-green-500")}
                          style={{ width: `${systemHealth.memoryUsage}%` }}
                        ></div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">CPU Usage</span>
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{systemHealth.cpuUsage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full", systemHealth.cpuUsage > 80 ? "bg-red-500" : systemHealth.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500")}
                          style={{ width: `${systemHealth.cpuUsage}%` }}
                        ></div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Storage Usage</span>
                        <span className="text-2xl">💾</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{systemHealth.storageUsage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full", systemHealth.storageUsage > 80 ? "bg-red-500" : systemHealth.storageUsage > 60 ? "bg-yellow-500" : "bg-green-500")}
                          style={{ width: `${systemHealth.storageUsage}%` }}
                        ></div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Quick Actions & Critical Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Critical System Actions */}
                  <div className="lg:col-span-2">
                    <Card>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Super Admin Actions</h2>
                        <span className="text-2xl">⚡</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="primary" size="sm" className="w-full justify-start">
                          🚨 Emergency Maintenance Mode
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          💾 Trigger System Backup
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          🔄 Update System Components
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          👤 Manage Admin Privileges
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          📊 Generate System Report
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          🔐 Security Audit
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {/* System Alerts & Status */}
                  <div className="space-y-6">
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        System Status
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-400">
                          <h4 className="font-medium text-green-800">System Healthy</h4>
                          <p className="text-sm text-green-600 mt-1">All services operational</p>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400">
                          <h4 className="font-medium text-yellow-800">Updates Available</h4>
                          <p className="text-sm text-yellow-600 mt-1">{systemHealth.pendingUpdates} pending updates</p>
                        </div>
                        {systemHealth.securityAlerts > 0 && (
                          <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-400">
                            <h4 className="font-medium text-red-800">Security Alerts</h4>
                            <p className="text-sm text-red-600 mt-1">{systemHealth.securityAlerts} active alerts</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Backups
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Last Backup:</span>
                          <span className="text-green-600">✅ {systemHealth.lastBackup.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Next Scheduled:</span>
                          <span className="text-blue-600">Tomorrow 3:00 AM</span>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">User & Admin Management</h2>
                  <p className="text-gray-600">Comprehensive user management with admin privilege controls and bulk operations.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced User Management</h3>
                    <p className="text-gray-600 mb-6">Manage all users, admins, and system permissions from this centralized interface.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      <Button variant="primary" size="sm">👤 User Management</Button>
                      <Button variant="secondary" size="sm">👨‍💼 Admin Controls</Button>
                      <Button variant="secondary" size="sm">🔐 Role Permissions</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Analytics</h2>
                  <p className="text-gray-600">Advanced business intelligence and platform performance metrics.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Dashboard</h3>
                    <p className="text-gray-600">Comprehensive platform analytics and business intelligence.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder tabs for other sections */}
            {['system', 'security', 'finance', 'developer'].includes(activeTab) && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeTab === 'system' && 'System Configuration'}
                    {activeTab === 'security' && 'Security & Audit'}
                    {activeTab === 'finance' && 'Financial Management'}
                    {activeTab === 'developer' && 'Developer Tools'}
                  </h2>
                  <p className="text-gray-600">
                    {activeTab === 'system' && 'Advanced system configuration and settings management.'}
                    {activeTab === 'security' && 'Security monitoring, audit logs, and compliance management.'}
                    {activeTab === 'finance' && 'Revenue tracking, financial reports, and payment system management.'}
                    {activeTab === 'developer' && 'API management, webhooks, and third-party integrations.'}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">
                      {activeTab === 'system' && '⚙️'}
                      {activeTab === 'security' && '🔐'}
                      {activeTab === 'finance' && '💰'}
                      {activeTab === 'developer' && '🔧'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-600">This section is under development and will be available soon.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboardClient;