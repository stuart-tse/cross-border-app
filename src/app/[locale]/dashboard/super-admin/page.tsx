import React from 'react';
import { UserType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { getUsers, getAdminMetrics } from '@/lib/data/user';
import { getSystemActivity } from '@/lib/data/activity';
import { getUserDisplayName, getWelcomeMessage } from '@/lib/services/user-formatting';
import SuperAdminDashboardClient from './components/SuperAdminDashboardClient';

// Server Component for Super Admin Dashboard
// Fetches data on the server and passes it to client components
async function SuperAdminDashboard() {
  // Get current user and verify super admin access
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user has super admin role
  const hasSuperAdminRole = user.roles.some(role => role.role === UserType.ADMIN);
  const userProfile = user.adminProfile;
  
  if (!hasSuperAdminRole || !userProfile || userProfile.adminLevel !== 'SUPER_ADMIN') {
    redirect('/dashboard/admin');
  }
  
  // Fetch enhanced data for super admin
  const [users, recentActivity, metrics, systemHealth] = await Promise.all([
    getUsers({ limit: 100 }), // Super admin sees more users
    getSystemActivity(20), // More activity items
    getAdminMetrics(),
    getSystemHealthMetrics() // Additional system metrics
  ]);
  
  // Prepare user display data
  const userData = {
    name: getUserDisplayName(user),
    welcomeMessage: getWelcomeMessage(user),
    adminLevel: userProfile.adminLevel,
    permissions: userProfile.permissions
  };

  return (
    <SuperAdminDashboardClient 
      userData={userData}
      users={users}
      recentActivity={recentActivity}
      metrics={metrics}
      systemHealth={systemHealth}
    />
  );
}

// Mock function for system health metrics (to be implemented)
async function getSystemHealthMetrics() {
  return {
    serverStatus: 'online',
    databaseStatus: 'healthy', 
    apiResponseTime: 142,
    activeConnections: 1247,
    memoryUsage: 68.5,
    cpuUsage: 23.7,
    storageUsage: 45.2,
    uptime: '15 days, 7 hours',
    lastBackup: new Date('2024-01-15T03:00:00Z'),
    securityAlerts: 2,
    systemVersion: '2.1.4',
    pendingUpdates: 3
  };
}

export default SuperAdminDashboard;