import React from 'react';
import { UserType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { getUsers, getAdminMetrics } from '@/lib/data/user';
import { getSystemActivity } from '@/lib/data/activity';
import { getUserDisplayName, getWelcomeMessage } from '@/lib/services/user-formatting';
import AdminDashboardClient from './components/AdminDashboardClient';

// Server Component for Admin Dashboard
// Fetches data on the server and passes it to client components
async function AdminDashboard() {
  // Get current user and verify admin access
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user has admin role
  const hasAdminRole = user.roles.some(role => role.role === UserType.ADMIN);
  if (!hasAdminRole) {
    redirect('/dashboard');
  }
  
  // Fetch all required data on the server
  const [users, recentActivity, metrics] = await Promise.all([
    getUsers({ limit: 50 }),
    getSystemActivity(10),
    getAdminMetrics()
  ]);
  
  // Prepare user display data
  const userData = {
    name: getUserDisplayName(user),
    welcomeMessage: getWelcomeMessage(user)
  };

  
  return (
    <AdminDashboardClient 
      userData={userData}
      users={users}
      recentActivity={recentActivity}
      metrics={metrics}
    />
  );
};

export default AdminDashboard;