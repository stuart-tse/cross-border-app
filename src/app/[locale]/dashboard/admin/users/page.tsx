import React, { Suspense } from 'react';
import { UserType } from '@prisma/client';
import { UserService, UserFilters } from '@/lib/data/user-service';
import { UserStatsServer } from '@/components/server/UserListServer';
import { Card } from '@/components/ui/Card';
import UserManagementClient from './UserManagementClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    userType?: string;
    membershipTier?: string;
    verificationStatus?: string;
  }>;
}

/**
 * Server Component for Admin Users Page
 * Uses Next.js 15 App Router with async params and searchParams
 */
export default async function AdminUsersPage({
  params,
  searchParams
}: AdminUsersPageProps) {
  // Await params and searchParams as required in Next.js 15
  const { locale } = await params;
  const {
    page = '1',
    search = '',
    status = 'all',
    userType = 'ALL',
    membershipTier = 'all',
    verificationStatus = 'all'
  } = await searchParams;

  // Build filters from search params
  const filters: UserFilters = {
    search: search || undefined,
    status: status as any || 'all',
    userType: userType as any || 'ALL',
    membershipTier: membershipTier || undefined,
    verificationStatus: verificationStatus || undefined
  };

  const currentPage = parseInt(page, 10) || 1;

  // Fetch users data on the server
  const result = await UserService.getUsers(filters, currentPage, 10);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/admin`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-4"
          >
            ← Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage clients, drivers, and blog editors with advanced filtering and bulk operations</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-[#FF69B4]">{result.total}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <Suspense fallback={<StatsLoadingSkeleton />}>
            <UserStatsServer />
          </Suspense>
        </div>

        {/* User Management Client Component */}
        <UserManagementClient
          initialData={result}
          initialFilters={filters}
          initialPage={currentPage}
          locale={locale}
        />
      </div>
    </div>
  );
};

}

/**
 * Loading skeleton for stats
 */
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded" />
        </Card>
      ))}
    </div>
  );
}

// Note: Auth protection would be handled by middleware or layout in Next.js 15
// export const metadata = {
//   title: 'User Management - Admin Dashboard',
//   description: 'Manage clients, drivers, and blog editors'
// };