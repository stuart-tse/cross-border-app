'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LiveChatSupport } from '@/components/client/LiveChatSupport';
import { CallSupport } from '@/components/client/CallSupport';

interface TripData {
  id: string;
  from: string;
  to: string;
  date: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  amount: number;
  vehicle: string;
  duration: string;
  driver: string;
  rating: number;
}

interface DashboardStats {
  totalTrips: number;
  totalSpent: number;
  onTimeRate: number;
  avgRating: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

const ClientDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 12,
    totalSpent: 12450,
    onTimeRate: 98.5,
    avgRating: 4.9,
  });
  const [recentTrips, setRecentTrips] = useState<TripData[]>([
    {
      id: '1',
      from: 'Hong Kong',
      to: 'Shenzhen',
      date: 'March 15, 2024',
      status: 'completed',
      amount: 850,
      vehicle: 'Business Class',
      duration: '45 min',
      driver: 'Wong Chi-Ming',
      rating: 5.0,
    },
    {
      id: '2',
      from: 'Hong Kong',
      to: 'Guangzhou',
      date: 'March 10, 2024',
      status: 'completed',
      amount: 1200,
      vehicle: 'Executive SUV',
      duration: '2.5 hours',
      driver: 'Li Wei',
      rating: 4.8,
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Trip Completed',
      message: 'Your trip to Shenzhen has been completed successfully.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'New Promotion',
      message: '20% off on your next executive booking this month!',
      type: 'info',
      timestamp: '1 day ago',
      read: false,
    },
  ]);
  const [quickBookingData, setQuickBookingData] = useState({
    from: '',
    to: '',
    date: '',
  });
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showCallSupport, setShowCallSupport] = useState(false);

  const locationOptions = [
    { value: '', label: 'Select location' },
    { value: 'hong-kong-central', label: 'Hong Kong - Central' },
    { value: 'hong-kong-airport', label: 'Hong Kong - Airport' },
    { value: 'shenzhen-futian', label: 'Shenzhen - Futian' },
    { value: 'shenzhen-luohu', label: 'Shenzhen - Luohu' },
    { value: 'guangzhou-tianhe', label: 'Guangzhou - Tianhe' },
  ];

  const handleQuickBooking = () => {
    if (quickBookingData.from && quickBookingData.to && quickBookingData.date) {
      // Redirect to booking page with pre-filled data
      const searchParams = new URLSearchParams(quickBookingData);
      window.location.href = `/booking?${searchParams.toString()}`;
    }
  };

  const handleBookAgain = (trip: TripData) => {
    const searchParams = new URLSearchParams({
      from: trip.from,
      to: trip.to,
      vehicle: trip.vehicle,
    });
    window.location.href = `/booking?${searchParams.toString()}`;
  };

  const getStatusColor = (status: TripData['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-green';
      case 'in_progress':
        return 'bg-warning-amber';
      case 'cancelled':
        return 'bg-error-red';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: TripData['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '🚗';
      case 'cancelled':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg p-6 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-headline-md font-bold">
                Welcome back, {user?.name || 'Michael'}!
              </h1>
              <p className="text-body-lg opacity-90">Ready for your next journey?</p>
            </div>
            <div className="text-right">
              <div className="text-title-lg font-semibold">{stats.totalTrips}</div>
              <div className="text-body-sm opacity-75">Total Trips</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-title-md font-semibold">HK${stats.totalSpent.toLocaleString()}</div>
              <div className="text-body-sm opacity-75">Total Spent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-title-md font-semibold">{stats.onTimeRate}%</div>
              <div className="text-body-sm opacity-75">On-Time Rate</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-title-md font-semibold">{stats.avgRating}★</div>
              <div className="text-body-sm opacity-75">Avg Rating</div>
            </div>
          </div>
        </motion.section>

        {/* Quick Booking Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-pink-tint to-white border-hot-pink/20">
            <div className="text-center mb-6">
              <h2 className="text-title-lg font-semibold text-charcoal mb-2">Quick Booking</h2>
              <p className="text-body-md text-gray-600">Book your next trip in seconds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">From</label>
                <Select
                  value={quickBookingData.from}
                  onValueChange={(value) => setQuickBookingData({ ...quickBookingData, from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">To</label>
                <Select
                  value={quickBookingData.to}
                  onValueChange={(value) => setQuickBookingData({ ...quickBookingData, to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Date"
                type="date"
                value={quickBookingData.date}
                onChange={(e) => setQuickBookingData({ ...quickBookingData, date: e.target.value })}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-hot-pink to-deep-pink"
              onClick={handleQuickBooking}
            >
              Find Available Vehicles
            </Button>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trips */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title-lg font-semibold text-charcoal">Recent Trips</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm',
                          getStatusColor(trip.status)
                        )}>
                          {getStatusIcon(trip.status)}
                        </div>
                        <div>
                          <h3 className="text-title-sm font-medium text-charcoal">
                            {trip.from} → {trip.to}
                          </h3>
                          <p className="text-body-sm text-gray-500">{trip.date}</p>
                        </div>
                      </div>
                      <span className="text-title-sm font-semibold text-hot-pink">
                        HK${trip.amount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-body-sm mb-4">
                      <div>
                        <span className="text-gray-500">Vehicle:</span>
                        <span className="text-charcoal ml-1">{trip.vehicle}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="text-charcoal ml-1">{trip.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Driver:</span>
                        <span className="text-charcoal ml-1">{trip.driver}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <span className="text-charcoal ml-1">{trip.rating} ⭐</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBookAgain(trip)}
                      >
                        Book Again
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Notifications */}
            <Card>
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Notifications
              </h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 rounded-lg border-l-4 transition-colors duration-200',
                      notification.type === 'success' && 'bg-green-50 border-l-success-green',
                      notification.type === 'info' && 'bg-blue-50 border-l-electric-blue',
                      notification.type === 'warning' && 'bg-yellow-50 border-l-warning-amber',
                      !notification.read && 'bg-opacity-100',
                      notification.read && 'bg-opacity-50'
                    )}
                  >
                    <h4 className="text-body-md font-medium text-charcoal">
                      {notification.title}
                    </h4>
                    <p className="text-body-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-body-sm text-gray-400 mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/booking" className="block">
                  <Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-hot-pink to-deep-pink">
                    New Booking
                  </Button>
                </Link>
                <Link href="/dashboard/client/trips" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Trip History
                  </Button>
                </Link>
                <Link href="/dashboard/client/payment-methods" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Payment Methods
                  </Button>
                </Link>
                <Link href="/dashboard/client/profile" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    My Profile
                  </Button>
                </Link>
                <Link href="/dashboard/client/settings" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Account Settings
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Support */}
            <Card>
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Need Help?
              </h3>
              <p className="text-body-sm text-gray-600 mb-4">
                Our 24/7 support team is here to assist you.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowLiveChat(true)}
                >
                  💬 Live Chat
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowCallSupport(true)}
                >
                  📞 Call Support
                </Button>
              </div>
            </Card>
          </motion.aside>
        </div>

        {/* Support Components */}
        <LiveChatSupport
          isOpen={showLiveChat}
          onClose={() => setShowLiveChat(false)}
          userId={user?.id || ''}
          userName={user?.name || 'Guest'}
        />

        <CallSupport
          isOpen={showCallSupport}
          onClose={() => setShowCallSupport(false)}
          userId={user?.id || ''}
          userName={user?.name || 'Guest'}
          userPhone={user?.phone}
        />
      </div>
    </div>
  );
};

export default withAuth(ClientDashboard, [UserType.CLIENT]);