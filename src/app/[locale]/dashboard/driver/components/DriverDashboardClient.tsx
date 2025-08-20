'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, BaseCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import Chart from 'chart.js/auto';
import VehicleManagement from '@/components/vehicles/VehicleManagement';
import PaymentActions from '@/components/driver/PaymentActions';

interface TripRequest {
  id: string;
  from: string;
  fromAddress: string;
  to: string;
  toAddress: string;
  requestedAt: string;
  estimatedEarnings: number;
  passengers: number;
  vehicle: string;
  distance: string;
  duration: string;
  clientName: string;
  urgency: 'low' | 'medium' | 'high';
}

interface EarningsTrend {
  date: string;
  amount: number;
}

interface TripType {
  type: string;
  percentage: number;
  count: number;
  earnings: number;
}

interface PaymentTransaction {
  id: string;
  date: string;
  type: 'earning' | 'payout' | 'fee';
  description: string;
  amount: number;
  status: 'completed' | 'transferred' | 'processed';
}

interface DriverSettings {
  notifications: {
    tripRequests: boolean;
    tripUpdates: boolean;
    soundAlerts: boolean;
    paymentConfirmations: boolean;
    weeklySummary: boolean;
  };
  workingHours: {
    isOnline: boolean;
    schedule: Array<{
      day: string;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }>;
    autoOffline: boolean;
    breakReminders: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    locationTracking: boolean;
    shareProfile: boolean;
  };
}

interface DriverDashboardClientProps {
  initialTripRequests: TripRequest[];
  driverData: {
    dailyEarnings: {
      total: number;
      tripsCompleted: number;
      avgPerTrip: number;
      onlineTime: string;
      acceptRate: number;
    };
    weeklyEarnings: number;
    monthlyEarnings: number;
    performanceScore: number;
    verification: {
      overall: 'pending' | 'verified' | 'rejected';
      documents: {
        driversLicense: 'pending' | 'verified' | 'rejected';
        vehicleRegistration: 'pending' | 'verified' | 'rejected';
        insurance: 'pending' | 'verified' | 'rejected';
        backgroundCheck: 'pending' | 'verified' | 'rejected';
      };
    };
    vehicle: {
      make: string;
      model: string;
      licensePlate: string;
      capacity: number;
      category: string;
    };
    earningsTrend: EarningsTrend[];
    tripTypes: TripType[];
    settings: DriverSettings;
    paymentHistory: PaymentTransaction[];
  };
}

export default function DriverDashboardClient({ 
  initialTripRequests, 
  driverData 
}: DriverDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'earnings' | 'settings' | 'upload' | 'verification' | 'vehicles'>('earnings');
  const [isOnline, setIsOnline] = useState(driverData.settings.workingHours.isOnline);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>(initialTripRequests);
  const [settings, setSettings] = useState<DriverSettings>(driverData.settings);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const initializeEarningsChart = useCallback(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: driverData.earningsTrend.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Daily Earnings (HK$)',
          data: driverData.earningsTrend.map(item => item.amount),
          borderColor: '#FF69B4',
          backgroundColor: 'rgba(255, 105, 180, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FF69B4',
          pointBorderColor: '#FF1493',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#FF69B4',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `HK$${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
              callback: function(value) {
                return `HK$${Number(value).toLocaleString()}`;
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }, [driverData.earningsTrend]);

  // Initialize earnings chart when earnings tab is active
  useEffect(() => {
    if (activeTab === 'earnings' && chartRef.current) {
      initializeEarningsChart();
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [activeTab, selectedTimePeriod, initializeEarningsChart]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        isOnline: !isOnline
      }
    }));
  };

  const handleSettingToggle = (category: keyof DriverSettings, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      if (file.size <= 10 * 1024 * 1024 && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded'
        }]);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return 'text-success-green bg-green-100';
      case 'pending':
        return 'text-warning-amber bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-error-red bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-charcoal">Driver Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className={cn(
                'flex items-center space-x-2 px-3 py-1 rounded-full text-sm',
                isOnline ? 'bg-success-green text-white' : 'bg-gray-200 text-gray-600'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isOnline ? 'bg-white' : 'bg-gray-400'
                )}></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'earnings', label: 'Earnings', icon: '💰' },
              { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'upload', label: 'Document Upload', icon: '📋' },
              { id: 'verification', label: 'Verification', icon: '✅' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-hot-pink text-hot-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Earnings Page */}
          {activeTab === 'earnings' && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal mb-2">Driver Earnings</h1>
                <p className="text-gray-600">Comprehensive earnings dashboard with charts, payment history, and performance metrics</p>
              </div>

              {/* Earnings Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Today's Earnings */}
                <BaseCard className="hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Today&apos;s Earnings</h3>
                    <div className="w-10 h-10 bg-hot-pink bg-opacity-10 rounded-lg flex items-center justify-center">
                      <span className="text-hot-pink text-xl">💰</span>
                    </div>
                  </div>
                  <div className="text-display-sm font-bold text-hot-pink mb-2">HK${driverData.dailyEarnings.total.toLocaleString()}</div>
                  <div className="text-body-sm text-gray-600">+18% from yesterday</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-gradient-to-r from-hot-pink to-deep-pink h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="text-body-sm text-gray-500 mt-2">Goal: HK$1,600</div>
                </BaseCard>

                {/* This Week */}
                <BaseCard className="hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">This Week</h3>
                    <div className="w-10 h-10 bg-electric-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                      <span className="text-electric-blue text-xl">📊</span>
                    </div>
                  </div>
                  <div className="text-display-sm font-bold text-charcoal mb-2">HK${driverData.weeklyEarnings.toLocaleString()}</div>
                  <div className="text-body-sm text-success-green">+12% from last week</div>
                  <div className="text-body-sm text-gray-600 mt-2">{driverData.dailyEarnings.tripsCompleted} trips completed</div>
                </BaseCard>

                {/* This Month */}
                <BaseCard className="hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">This Month</h3>
                    <div className="w-10 h-10 bg-success-green bg-opacity-10 rounded-lg flex items-center justify-center">
                      <span className="text-success-green text-xl">📈</span>
                    </div>
                  </div>
                  <div className="text-display-sm font-bold text-charcoal mb-2">HK${driverData.monthlyEarnings.toLocaleString()}</div>
                  <div className="text-body-sm text-gray-600">Average: HK$965/day</div>
                  <div className="text-body-sm text-gray-600">156 trips completed</div>
                </BaseCard>

                {/* Performance Score */}
                <BaseCard className="hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Performance</h3>
                    <div className="w-10 h-10 bg-warning-amber bg-opacity-10 rounded-lg flex items-center justify-center">
                      <span className="text-warning-amber text-xl">⭐</span>
                    </div>
                  </div>
                  <div className="text-display-sm font-bold text-charcoal mb-2">{driverData.performanceScore}</div>
                  <div className="text-body-sm text-gray-600">Average rating</div>
                  <div className="text-body-sm text-success-green mt-2">{driverData.dailyEarnings.acceptRate}% acceptance rate</div>
                </BaseCard>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Earnings Chart */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-title-lg font-semibold text-charcoal">Earnings Trend</h3>
                    <div className="flex space-x-2">
                      {['7d', '30d', '90d'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedTimePeriod(period as any)}
                          className={cn(
                            'px-3 py-1 text-sm rounded-md transition-colors',
                            selectedTimePeriod === period
                              ? 'bg-hot-pink text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          )}
                        >
                          {period.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-80">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </BaseCard>

                {/* Trip Types Breakdown */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-title-lg font-semibold text-charcoal">Trip Types</h3>
                    <span className="text-body-sm text-gray-500">This month</span>
                  </div>
                  <div className="space-y-4">
                    {driverData.tripTypes.map((tripType, index) => {
                      const colors = ['bg-hot-pink', 'bg-electric-blue', 'bg-success-green'];
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={cn('w-4 h-4 rounded-full mr-3', colors[index])}></div>
                            <span className="text-body-md">{tripType.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-title-sm font-semibold">{tripType.percentage}%</div>
                            <div className="text-body-sm text-gray-500">{tripType.count} trips</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </BaseCard>
              </div>

              {/* Payment History */}
              <BaseCard className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-title-lg font-semibold text-charcoal">Payment History</h3>
                  <PaymentActions 
                    availableBalance={3450}
                    currency="HK$"
                  />
                </div>
                
                {/* Available Balance */}
                <div className="bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-title-md font-semibold mb-2">Available Balance</h4>
                      <div className="text-display-md font-bold">HK$3,450</div>
                      <div className="text-body-sm opacity-90 mt-2">Last payout: Jan 10, 2024</div>
                    </div>
                    <div className="text-right">
                      <div className="text-body-sm opacity-90">Next auto-payout</div>
                      <div className="text-title-sm font-semibold">Jan 17, 2024</div>
                      <div className="text-body-sm opacity-90">Weekly schedule</div>
                    </div>
                  </div>
                </div>

                {/* Payment Transactions */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-body-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 text-body-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 text-body-sm font-medium text-gray-500">Description</th>
                        <th className="text-right py-3 text-body-sm font-medium text-gray-500">Amount</th>
                        <th className="text-right py-3 text-body-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {driverData.paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="py-4 text-body-md">{payment.date}</td>
                          <td className="py-4">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs',
                              payment.type === 'earning' && 'bg-green-100 text-green-800',
                              payment.type === 'payout' && 'bg-blue-100 text-blue-800',
                              payment.type === 'fee' && 'bg-red-100 text-red-800'
                            )}>
                              {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 text-body-md">{payment.description}</td>
                          <td className={cn(
                            'py-4 text-right text-body-md font-medium',
                            payment.amount > 0 ? 'text-success-green' : 'text-error-red'
                          )}>
                            {payment.amount > 0 ? '+' : ''}HK${Math.abs(payment.amount).toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs',
                              getStatusColor(payment.status)
                            )}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </BaseCard>

              {/* Tax Information */}
              <BaseCard>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-title-md font-semibold text-charcoal mb-2">YTD Earnings</h4>
                    <div className="text-title-lg font-bold text-hot-pink">HK${driverData.monthlyEarnings.toLocaleString()}</div>
                    <div className="text-body-sm text-gray-600">Taxable income</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-title-md font-semibold text-charcoal mb-2">Platform Fees</h4>
                    <div className="text-title-lg font-bold text-charcoal">HK$1,448</div>
                    <div className="text-body-sm text-gray-600">Deductible expenses</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-title-md font-semibold text-charcoal mb-2">Vehicle Expenses</h4>
                    <div className="text-title-lg font-bold text-charcoal">HK$2,150</div>
                    <div className="text-body-sm text-gray-600">Fuel, maintenance, etc.</div>
                  </div>
                </div>
                <Button variant="secondary" className="mt-6">Download Tax Summary</Button>
              </BaseCard>
            </motion.div>
          )}

          {/* Vehicle Management Page */}
          {activeTab === 'vehicles' && (
            <motion.div
              key="vehicles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <VehicleManagement />
            </motion.div>
          )}

          {/* Settings Page */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal mb-2">Driver Settings</h1>
                <p className="text-gray-600">Manage your preferences, availability, and account security</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                  <BaseCard>
                    <h3 className="text-title-lg font-semibold text-charcoal mb-4">Settings</h3>
                    <nav className="space-y-2">
                      {[
                        { id: 'notifications', icon: '🔔', label: 'Notifications' },
                        { id: 'working-hours', icon: '⏰', label: 'Working Hours' },
                        { id: 'security', icon: '🔒', label: 'Security' },
                        { id: 'payment-methods', icon: '💳', label: 'Payment Methods' },
                        { id: 'language', icon: '🌐', label: 'Language & Region' },
                        { id: 'app-preferences', icon: '📱', label: 'App Preferences' }
                      ].map((item, index) => (
                        <a key={item.id} href="#" className={cn(
                          'flex items-center px-3 py-2 rounded-md transition-colors',
                          index === 0 ? 'text-hot-pink bg-pink-tint' : 'text-gray-600 hover:text-charcoal hover:bg-gray-50'
                        )}>
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </BaseCard>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Notification Settings */}
                  <BaseCard>
                    <h3 className="text-title-lg font-semibold text-charcoal mb-6">Notification Preferences</h3>
                    
                    <div className="space-y-6">
                      {/* Trip Notifications */}
                      <div>
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Trip Notifications</h4>
                        <div className="space-y-4">
                          {[
                            { key: 'tripRequests', label: 'New trip requests', description: 'Get notified when new trips are available', checked: settings.notifications.tripRequests },
                            { key: 'tripUpdates', label: 'Trip updates', description: 'Updates about accepted trips', checked: settings.notifications.tripUpdates },
                            { key: 'soundAlerts', label: 'Sound alerts', description: 'Audio notifications for urgent requests', checked: settings.notifications.soundAlerts }
                          ].map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-body-md font-medium">{setting.label}</div>
                                <div className="text-body-sm text-gray-600">{setting.description}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={setting.checked}
                                  onChange={(e) => handleSettingToggle('notifications', setting.key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Earnings Notifications */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Earnings & Payments</h4>
                        <div className="space-y-4">
                          {[
                            { key: 'paymentConfirmations', label: 'Payment confirmations', description: 'When payments are processed', checked: settings.notifications.paymentConfirmations },
                            { key: 'weeklySummary', label: 'Weekly earnings summary', description: 'Summary of weekly performance', checked: settings.notifications.weeklySummary }
                          ].map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-body-md font-medium">{setting.label}</div>
                                <div className="text-body-sm text-gray-600">{setting.description}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={setting.checked}
                                  onChange={(e) => handleSettingToggle('notifications', setting.key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </BaseCard>

                  {/* Working Hours */}
                  <BaseCard>
                    <h3 className="text-title-lg font-semibold text-charcoal mb-6">Working Hours & Availability</h3>
                    
                    <div className="space-y-6">
                      {/* Availability Status */}
                      <div className={cn(
                        'rounded-lg p-4 text-white',
                        optimisticOnlineStatus ? 'bg-gradient-to-r from-success-green to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      )}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-title-md font-semibold mb-1">Current Status</h4>
                            <div className="text-body-md">{optimisticOnlineStatus ? 'Online and available for trips' : 'Currently offline'}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={optimisticOnlineStatus}
                              onChange={handleToggleOnline}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white bg-opacity-30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:bg-opacity-40"></div>
                          </label>
                        </div>
                      </div>

                      {/* Weekly Schedule */}
                      <div>
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Weekly Schedule</h4>
                        <div className="space-y-3">
                          {settings.workingHours.schedule.map((daySchedule, index) => (
                            <div key={daySchedule.day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={daySchedule.enabled}
                                  className="mr-3 text-hot-pink"
                                  onChange={(e) => {
                                    const newSchedule = [...settings.workingHours.schedule];
                                    newSchedule[index].enabled = e.target.checked;
                                    setSettings(prev => ({
                                      ...prev,
                                      workingHours: {
                                        ...prev.workingHours,
                                        schedule: newSchedule
                                      }
                                    }));
                                  }}
                                />
                                <span className="text-body-md font-medium">{daySchedule.day}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <select 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={daySchedule.startTime}
                                  onChange={(e) => {
                                    const newSchedule = [...settings.workingHours.schedule];
                                    newSchedule[index].startTime = e.target.value;
                                    setSettings(prev => ({
                                      ...prev,
                                      workingHours: {
                                        ...prev.workingHours,
                                        schedule: newSchedule
                                      }
                                    }));
                                  }}
                                >
                                  {Array.from({length: 24}, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                                  })}
                                </select>
                                <span className="text-gray-500">to</span>
                                <select 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={daySchedule.endTime}
                                  onChange={(e) => {
                                    const newSchedule = [...settings.workingHours.schedule];
                                    newSchedule[index].endTime = e.target.value;
                                    setSettings(prev => ({
                                      ...prev,
                                      workingHours: {
                                        ...prev.workingHours,
                                        schedule: newSchedule
                                      }
                                    }));
                                  }}
                                >
                                  {Array.from({length: 24}, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                                  })}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Auto-offline Settings */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Auto-offline Settings</h4>
                        <div className="space-y-4">
                          {[
                            { key: 'autoOffline', label: 'Go offline after work hours', description: 'Automatically stop receiving requests', checked: settings.workingHours.autoOffline },
                            { key: 'breakReminders', label: 'Break reminders', description: 'Remind to take breaks after 4 hours', checked: settings.workingHours.breakReminders }
                          ].map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-body-md font-medium">{setting.label}</div>
                                <div className="text-body-sm text-gray-600">{setting.description}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={setting.checked}
                                  onChange={(e) => handleSettingToggle('workingHours', setting.key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </BaseCard>

                  {/* Security Settings */}
                  <BaseCard>
                    <h3 className="text-title-lg font-semibold text-charcoal mb-6">Security & Privacy</h3>
                    
                    <div className="space-y-6">
                      {/* Password */}
                      <div>
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Password & Authentication</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-body-md font-medium">Change password</div>
                              <div className="text-body-sm text-gray-600">Last changed 3 months ago</div>
                            </div>
                            <Button variant="secondary" size="sm">Change</Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-body-md font-medium">Two-factor authentication</div>
                              <div className="text-body-sm text-gray-600">Add extra security to your account</div>
                            </div>
                            <Button className="bg-hot-pink hover:bg-deep-pink" size="sm">
                              {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Privacy Settings</h4>
                        <div className="space-y-4">
                          {[
                            { key: 'locationTracking', label: 'Location tracking', description: 'Allow location tracking during trips', checked: settings.security.locationTracking },
                            { key: 'shareProfile', label: 'Share profile with clients', description: 'Show your name and rating to clients', checked: settings.security.shareProfile }
                          ].map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-body-md font-medium">{setting.label}</div>
                                <div className="text-body-sm text-gray-600">{setting.description}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={setting.checked}
                                  onChange={(e) => handleSettingToggle('security', setting.key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data Management */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-title-md font-semibold text-charcoal mb-4">Data Management</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-body-md font-medium">Download my data</div>
                              <div className="text-body-sm text-gray-600">Get a copy of your account data</div>
                            </div>
                            <Button variant="secondary" size="sm">Request</Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-body-md font-medium">Delete account</div>
                              <div className="text-body-sm text-gray-600">Permanently delete your account</div>
                            </div>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BaseCard>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button className="bg-hot-pink hover:bg-deep-pink font-medium">Save All Changes</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Document Upload Page */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal mb-2">Document Upload</h1>
                <p className="text-gray-600">Upload and manage your driver verification documents</p>
              </div>

              {/* Upload Progress Overview */}
              <BaseCard className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-title-lg font-semibold text-charcoal">Document Upload Progress</h3>
                  <span className="text-body-sm text-gray-500">3 of 4 documents uploaded</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-hot-pink to-deep-pink h-3 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
                </div>
                
                <div className="text-body-sm text-gray-600">
                  You&apos;re almost done! Please upload your vehicle insurance document to complete verification.
                </div>
              </BaseCard>

              {/* Document Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Driver's License */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Driver&apos;s License</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✅ Uploaded
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xl">📄</span>
                      </div>
                      <div>
                        <div className="text-body-md font-medium">drivers_license_front.jpg</div>
                        <div className="text-body-sm text-gray-600">Uploaded Jan 10, 2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-body-sm text-gray-600 mb-4">
                    Requirements: Clear photo of front and back, valid and not expired
                  </div>
                  
                  <Button variant="secondary" size="sm" className="w-full">Replace Document</Button>
                </BaseCard>

                {/* Vehicle Registration */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Vehicle Registration</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✅ Uploaded
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xl">🚗</span>
                      </div>
                      <div>
                        <div className="text-body-md font-medium">vehicle_registration.pdf</div>
                        <div className="text-body-sm text-gray-600">Uploaded Jan 10, 2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-body-sm text-gray-600 mb-4">
                    Requirements: Valid registration certificate, vehicle must be registered in your name
                  </div>
                  
                  <Button variant="secondary" size="sm" className="w-full">Replace Document</Button>
                </BaseCard>

                {/* Vehicle Insurance */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Vehicle Insurance</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      ⏳ Required
                    </span>
                  </div>
                  
                  {/* Upload Zone */}
                  <div 
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-all duration-300 cursor-pointer',
                      dragOver ? 'border-deep-pink bg-pink-tint' : 'border-gray-300 hover:border-hot-pink hover:bg-pink-tint'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('insurance-upload')?.click()}
                  >
                    <div className="w-16 h-16 bg-hot-pink bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-hot-pink text-2xl">📋</span>
                    </div>
                    <h4 className="text-title-md font-semibold text-charcoal mb-2">Upload Insurance Certificate</h4>
                    <p className="text-body-sm text-gray-600 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Button className="bg-hot-pink hover:bg-deep-pink">Browse Files</Button>
                    <input 
                      id="insurance-upload"
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                    />
                  </div>
                  
                  <div className="text-body-sm text-gray-600">
                    Requirements: Valid comprehensive insurance, cross-border coverage required
                  </div>
                </BaseCard>

                {/* Background Check */}
                <BaseCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title-md font-semibold text-charcoal">Background Check</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✅ Uploaded
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xl">🛡️</span>
                      </div>
                      <div>
                        <div className="text-body-md font-medium">background_check.pdf</div>
                        <div className="text-body-sm text-gray-600">Uploaded Jan 12, 2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-body-sm text-gray-600 mb-4">
                    Requirements: Clean criminal record check from authorized agency
                  </div>
                  
                  <Button variant="secondary" size="sm" className="w-full">Replace Document</Button>
                </BaseCard>
              </div>

              {/* Upload Guidelines */}
              <BaseCard className="mb-8">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Upload Guidelines</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-title-md font-semibold text-charcoal mb-3">File Requirements</h4>
                    <ul className="space-y-2 text-body-sm text-gray-600">
                      {[
                        'Maximum file size: 10MB',
                        'Supported formats: PDF, JPG, PNG',
                        'High resolution and clear text',
                        'No blurred or cropped images'
                      ].map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-hot-pink rounded-full mr-3"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-title-md font-semibold text-charcoal mb-3">Processing Time</h4>
                    <ul className="space-y-2 text-body-sm text-gray-600">
                      {[
                        'Documents reviewed within 24-48 hours',
                        'Email notifications for status updates',
                        'Expedited review for complete submissions',
                        'Resubmission allowed if rejected'
                      ].map((time, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-electric-blue rounded-full mr-3"></span>
                          {time}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </BaseCard>

              {/* Recent Uploads */}
              <BaseCard>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Recent Upload Activity</h3>
                
                <div className="space-y-4">
                  {[
                    { doc: 'Background Check', status: 'Approved', date: 'Jan 12, 2024 at 2:30 PM', icon: '✅', color: 'text-green-600' },
                    { doc: 'Vehicle Registration', status: 'Approved', date: 'Jan 10, 2024 at 4:15 PM', icon: '✅', color: 'text-green-600' },
                    { doc: "Driver&apos;s License", status: 'Approved', date: 'Jan 10, 2024 at 9:45 AM', icon: '✅', color: 'text-green-600' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className={activity.color}>{activity.icon}</span>
                        </div>
                        <div>
                          <div className="text-body-md font-medium">{activity.doc} - {activity.status}</div>
                          <div className="text-body-sm text-gray-600">{activity.date}</div>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">View Details</Button>
                    </div>
                  ))}
                </div>
              </BaseCard>
            </motion.div>
          )}

          {/* Document Verification Page */}
          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal mb-2">Document Verification</h1>
                <p className="text-gray-600">Track your verification status and compliance requirements</p>
              </div>

              {/* Verification Status Overview */}
              <BaseCard className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-title-lg font-semibold text-charcoal">Verification Status</h3>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    ⏳ In Progress
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-2xl">✅</span>
                    </div>
                    <div className="text-title-sm font-semibold text-charcoal">3 Approved</div>
                    <div className="text-body-sm text-gray-600">Documents verified</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-yellow-600 text-2xl">⏳</span>
                    </div>
                    <div className="text-title-sm font-semibold text-charcoal">1 Pending</div>
                    <div className="text-body-sm text-gray-600">Under review</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-600 text-2xl">📋</span>
                    </div>
                    <div className="text-title-sm font-semibold text-charcoal">0 Missing</div>
                    <div className="text-body-sm text-gray-600">All submitted</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-hot-pink to-deep-pink h-3 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
                </div>
                
                <div className="text-center">
                  <div className="text-body-md text-gray-600 mb-2">
                    Verification Progress: 75% Complete
                  </div>
                  <div className="text-body-sm text-gray-500">
                    Estimated completion: 1-2 business days
                  </div>
                </div>
              </BaseCard>

              {/* Verification Timeline */}
              <BaseCard className="mb-8">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Verification Timeline</h3>
                
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  <div className="space-y-6">
                    {[
                      { 
                        step: 1, 
                        title: 'Documents Submitted', 
                        description: 'All required documents uploaded successfully', 
                        status: 'completed', 
                        date: 'Jan 12, 2024', 
                        icon: '✓', 
                        color: 'bg-success-green' 
                      },
                      { 
                        step: 2, 
                        title: 'Initial Review', 
                        description: 'Documents format and quality validation', 
                        status: 'completed', 
                        date: 'Jan 12, 2024', 
                        icon: '✓', 
                        color: 'bg-success-green' 
                      },
                      { 
                        step: 3, 
                        title: 'Background Verification', 
                        description: 'Conducting background checks and document authentication', 
                        status: 'in_progress', 
                        date: 'Started Jan 13, 2024', 
                        icon: '⏳', 
                        color: 'bg-warning-amber' 
                      },
                      { 
                        step: 4, 
                        title: 'Final Approval', 
                        description: 'Final review and account activation', 
                        status: 'pending', 
                        date: 'Pending', 
                        icon: '4', 
                        color: 'bg-gray-300' 
                      }
                    ].map((timelineItem, index) => (
                      <div key={index} className="flex items-start">
                        <div className="relative">
                          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold', timelineItem.color)}>
                            {timelineItem.icon}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className={cn(
                            'text-title-md font-semibold',
                            timelineItem.status === 'pending' ? 'text-gray-600' : 'text-charcoal'
                          )}>
                            {timelineItem.title}
                          </h4>
                          <p className="text-body-sm text-gray-600">{timelineItem.description}</p>
                          <div className={cn(
                            'text-body-sm font-medium',
                            timelineItem.status === 'completed' && 'text-success-green',
                            timelineItem.status === 'in_progress' && 'text-warning-amber',
                            timelineItem.status === 'pending' && 'text-gray-500'
                          )}>
                            {timelineItem.status === 'completed' && 'Completed - '}
                            {timelineItem.status === 'in_progress' && 'In Progress - '}
                            {timelineItem.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BaseCard>

              {/* Document Status Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Approved Documents */}
                <BaseCard>
                  <h3 className="text-title-lg font-semibold text-charcoal mb-6">Approved Documents</h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: "Driver&apos;s License", date: 'Jan 10, 2024', icon: '📄' },
                      { name: 'Vehicle Registration', date: 'Jan 10, 2024', icon: '🚗' },
                      { name: 'Background Check', date: 'Jan 12, 2024', icon: '🛡️' }
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-success-green rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white">{doc.icon}</span>
                          </div>
                          <div>
                            <div className="text-body-md font-medium">{doc.name}</div>
                            <div className="text-body-sm text-gray-600">Verified on {doc.date}</div>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-success-green text-white rounded-full text-xs">✓ Approved</span>
                      </div>
                    ))}
                  </div>
                </BaseCard>

                {/* Pending Documents */}
                <BaseCard>
                  <h3 className="text-title-lg font-semibold text-charcoal mb-6">Pending Review</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-warning-amber rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white">📋</span>
                        </div>
                        <div>
                          <div className="text-body-md font-medium">Vehicle Insurance</div>
                          <div className="text-body-sm text-gray-600">Submitted on Jan 13, 2024</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-warning-amber text-white rounded-full text-xs">⏳ Reviewing</span>
                    </div>
                    
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="text-gray-500 mb-2">All documents submitted</div>
                      <div className="text-body-sm text-gray-600">
                        Great job! You&apos;ve uploaded all required documents. 
                        We&apos;ll notify you once the review is complete.
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>

              {/* Compliance Checklist */}
              <BaseCard className="mb-8">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Compliance Checklist</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver Requirements */}
                  <div>
                    <h4 className="text-title-md font-semibold text-charcoal mb-4">Driver Requirements</h4>
                    <div className="space-y-3">
                      {[
                        'Valid driver&apos;s license (HK/Mainland)',
                        'Minimum 3 years driving experience',
                        'Clean criminal background check',
                        'Age 25-65 years old'
                      ].map((req, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs">✓</span>
                          </span>
                          <span className="text-body-md">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vehicle Requirements */}
                  <div>
                    <h4 className="text-title-md font-semibold text-charcoal mb-4">Vehicle Requirements</h4>
                    <div className="space-y-3">
                      {[
                        { req: 'Valid vehicle registration', status: 'success' },
                        { req: 'Comprehensive insurance coverage', status: 'pending' },
                        { req: 'Vehicle year 2018 or newer', status: 'success' },
                        { req: 'Cross-border permit (if applicable)', status: 'success' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <span className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center mr-3',
                            item.status === 'success' ? 'bg-success-green' : 'bg-warning-amber'
                          )}>
                            <span className="text-white text-xs">
                              {item.status === 'success' ? '✓' : '⏳'}
                            </span>
                          </span>
                          <span className="text-body-md">{item.req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </BaseCard>

              {/* Next Steps */}
              <BaseCard>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Next Steps</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-electric-blue rounded-lg flex items-center justify-center mr-3 mt-1">
                      <span className="text-white">ℹ️</span>
                    </div>
                    <div>
                      <h4 className="text-title-md font-semibold text-charcoal mb-2">What happens next?</h4>
                      <div className="text-body-md text-gray-700 space-y-2">
                        <p>1. Our verification team will review your insurance document within 24-48 hours</p>
                        <p>2. You&apos;ll receive an email notification once the review is complete</p>
                        <p>3. If approved, your driver account will be activated immediately</p>
                        <p>4. You can start accepting trip requests right away</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button className="bg-hot-pink hover:bg-deep-pink">Contact Support</Button>
                  <Button variant="secondary">View FAQ</Button>
                </div>
              </BaseCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}