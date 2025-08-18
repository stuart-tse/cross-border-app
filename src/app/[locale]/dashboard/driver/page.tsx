'use client';

import React, { useState, useEffect } from 'react';
import DriverDashboardClient from './components/DriverDashboardClient';
import { withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';

// Client Component for fetching initial data
function DriverDashboard() {
  const [driverData, setDriverData] = useState(null);
  const [tripRequests, setTripRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data on component mount
    const fetchData = async () => {
      try {
        // This would typically fetch from your API
        // For now, using mock data
        const mockDriverData = {
          dailyEarnings: {
            total: 1240,
            tripsCompleted: 8,
            avgPerTrip: 155,
            onlineTime: '6.5h',
            acceptRate: 95,
          },
          weeklyEarnings: 8750,
          monthlyEarnings: 28950,
          performanceScore: 4.9,
          verification: {
            overall: 'pending' as const,
            documents: {
              driversLicense: 'verified' as const,
              vehicleRegistration: 'verified' as const,
              insurance: 'pending' as const,
              backgroundCheck: 'verified' as const,
            },
          },
          vehicle: {
            make: 'BMW',
            model: 'X5 2023',
            licensePlate: 'ABC-1234',
            capacity: 6,
            category: 'Executive SUV',
          },
          earningsTrend: [
            { date: '2024-01-08', amount: 800 },
            { date: '2024-01-09', amount: 1100 },
            { date: '2024-01-10', amount: 1500 },
            { date: '2024-01-11', amount: 900 },
            { date: '2024-01-12', amount: 1200 },
            { date: '2024-01-13', amount: 1800 },
            { date: '2024-01-14', amount: 1240 },
          ],
          tripTypes: [
            { type: 'Cross-border (HK-SZ)', percentage: 68, count: 89, earnings: 19692 },
            { type: 'Long distance (HK-GZ)', percentage: 22, count: 29, earnings: 6409 },
            { type: 'Local (HK only)', percentage: 10, count: 13, earnings: 2849 },
          ],
          settings: {
            notifications: {
              tripRequests: true,
              tripUpdates: true,
              soundAlerts: false,
              paymentConfirmations: true,
              weeklySummary: true,
            },
            workingHours: {
              isOnline: true,
              schedule: [
                { day: 'Monday', enabled: true, startTime: '09:00', endTime: '18:00' },
                { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
                { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
                { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
                { day: 'Friday', enabled: true, startTime: '09:00', endTime: '18:00' },
                { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '16:00' },
                { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '16:00' },
              ],
              autoOffline: true,
              breakReminders: false,
            },
            security: {
              twoFactorEnabled: false,
              locationTracking: true,
              shareProfile: true,
            },
          },
          paymentHistory: [
            {
              id: '1',
              date: 'Jan 15, 2024',
              type: 'earning' as const,
              description: 'Trip #TRP-001 (HK → SZ)',
              amount: 1200,
              status: 'completed' as const,
            },
            {
              id: '2',
              date: 'Jan 10, 2024',
              type: 'payout' as const,
              description: 'Weekly earnings payout',
              amount: -8750,
              status: 'completed' as const,
            },
            {
              id: '3',
              date: 'Jan 8, 2024',
              type: 'fee' as const,
              description: 'Platform service fee (5%)',
              amount: -65,
              status: 'completed' as const,
            },
          ],
        };

        const mockTripRequests = [
          {
            id: '1',
            from: 'Hong Kong',
            fromAddress: 'Central, Hong Kong',
            to: 'Guangzhou',
            toAddress: 'Tianhe District',
            requestedAt: '2 minutes ago',
            estimatedEarnings: 1200,
            passengers: 2,
            vehicle: 'Executive SUV',
            distance: '140km',
            duration: '2.5h',
            clientName: 'Sarah Chen',
            urgency: 'high' as const,
          },
          {
            id: '2',
            from: 'Hong Kong Airport',
            fromAddress: 'Terminal 1 Arrival',
            to: 'Shenzhen',
            toAddress: 'Futian CBD',
            requestedAt: '5 minutes ago',
            estimatedEarnings: 650,
            passengers: 1,
            vehicle: 'Business Class',
            distance: '50km',
            duration: '1h',
            clientName: 'Michael Wong',
            urgency: 'medium' as const,
          },
        ];

        setDriverData(mockDriverData);
        setTripRequests(mockTripRequests);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !driverData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hot-pink"></div>
      </div>
    );
  }

  return (
    <DriverDashboardClient 
      initialTripRequests={tripRequests}
      driverData={driverData}
    />
  );
}

// Export the protected version of the component
export default withAuth(DriverDashboard, [UserType.DRIVER]);