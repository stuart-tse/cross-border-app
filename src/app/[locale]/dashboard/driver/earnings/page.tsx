import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import EarningsChart from './components/EarningsChart';
import PaymentHistory from './components/PaymentHistory';

// Server Component for fetching earnings data
async function getEarningsData() {
  // This would typically fetch from your database
  return {
    dailyEarnings: {
      total: 1240,
      trips: 8,
      avgPerTrip: 155,
      onlineTime: 6.5,
      acceptRate: 95,
    },
    weeklyEarnings: {
      total: 8750,
      trips: 47,
    },
    monthlyEarnings: {
      total: 28950,
      trips: 156,
      avgPerDay: 965,
    },
    performance: {
      rating: 4.9,
      acceptRate: 95,
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
    taxInfo: {
      ytdEarnings: 28950,
      platformFees: 1448,
      vehicleExpenses: 2150,
    },
  };
}

async function getPaymentHistory() {
  return [
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
  ];
}

function EarningsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function EarningsPage() {
  const [earningsData, paymentHistory] = await Promise.all([
    getEarningsData(),
    getPaymentHistory(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/driver"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Driver Earnings</h1>
              <p className="text-gray-600">Comprehensive earnings dashboard with charts, payment history, and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Earnings */}
          <Card className="tesla-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md font-semibold text-charcoal">Today&apos;s Earnings</h3>
              <div className="w-10 h-10 bg-hot-pink bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-hot-pink text-xl">💰</span>
              </div>
            </div>
            <div className="text-display-sm font-bold text-hot-pink mb-2">
              HK${earningsData.dailyEarnings.total.toLocaleString()}
            </div>
            <div className="text-body-sm text-gray-600">+18% from yesterday</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="progress-bar" style={{ width: '75%' }}></div>
            </div>
            <div className="text-body-sm text-gray-500 mt-2">Goal: HK$1,600</div>
          </Card>

          {/* This Week */}
          <Card className="tesla-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md font-semibold text-charcoal">This Week</h3>
              <div className="w-10 h-10 bg-electric-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-electric-blue text-xl">📊</span>
              </div>
            </div>
            <div className="text-display-sm font-bold text-charcoal mb-2">
              HK${earningsData.weeklyEarnings.total.toLocaleString()}
            </div>
            <div className="text-body-sm text-success-green">+12% from last week</div>
            <div className="text-body-sm text-gray-600 mt-2">
              {earningsData.weeklyEarnings.trips} trips completed
            </div>
          </Card>

          {/* This Month */}
          <Card className="tesla-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md font-semibold text-charcoal">This Month</h3>
              <div className="w-10 h-10 bg-success-green bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-success-green text-xl">📈</span>
              </div>
            </div>
            <div className="text-display-sm font-bold text-charcoal mb-2">
              HK${earningsData.monthlyEarnings.total.toLocaleString()}
            </div>
            <div className="text-body-sm text-gray-600">Average: HK${earningsData.monthlyEarnings.avgPerDay}/day</div>
            <div className="text-body-sm text-gray-600">{earningsData.monthlyEarnings.trips} trips completed</div>
          </Card>

          {/* Performance Score */}
          <Card className="tesla-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md font-semibold text-charcoal">Performance</h3>
              <div className="w-10 h-10 bg-warning-amber bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-warning-amber text-xl">⭐</span>
              </div>
            </div>
            <div className="text-display-sm font-bold text-charcoal mb-2">
              {earningsData.performance.rating}
            </div>
            <div className="text-body-sm text-gray-600">Average rating</div>
            <div className="text-body-sm text-success-green mt-2">
              {earningsData.performance.acceptRate}% acceptance rate
            </div>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Chart */}
          <Suspense fallback={
            <Card className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded"></div>
            </Card>
          }>
            <EarningsChart data={earningsData.earningsTrend} />
          </Suspense>

          {/* Trip Types Breakdown */}
          <Card className="tesla-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title-lg font-semibold text-charcoal">Trip Types</h3>
              <span className="text-body-sm text-gray-500">This month</span>
            </div>
            <div className="space-y-4">
              {earningsData.tripTypes.map((tripType, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      index === 0 ? 'bg-hot-pink' : 
                      index === 1 ? 'bg-electric-blue' : 'bg-success-green'
                    }`}></div>
                    <span className="text-body-md">{tripType.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-title-sm font-semibold">{tripType.percentage}%</div>
                    <div className="text-body-sm text-gray-500">{tripType.count} trips</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <Suspense fallback={
          <Card className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
          </Card>
        }>
          <PaymentHistory payments={paymentHistory} />
        </Suspense>

        {/* Tax Information */}
        <Card className="tesla-card">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-title-md font-semibold text-charcoal mb-2">YTD Earnings</h4>
              <div className="text-title-lg font-bold text-hot-pink">
                HK${earningsData.taxInfo.ytdEarnings.toLocaleString()}
              </div>
              <div className="text-body-sm text-gray-600">Taxable income</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-title-md font-semibold text-charcoal mb-2">Platform Fees</h4>
              <div className="text-title-lg font-bold text-charcoal">
                HK${earningsData.taxInfo.platformFees.toLocaleString()}
              </div>
              <div className="text-body-sm text-gray-600">Deductible expenses</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-title-md font-semibold text-charcoal mb-2">Vehicle Expenses</h4>
              <div className="text-title-lg font-bold text-charcoal">
                HK${earningsData.taxInfo.vehicleExpenses.toLocaleString()}
              </div>
              <div className="text-body-sm text-gray-600">Fuel, maintenance, etc.</div>
            </div>
          </div>
          <Button variant="secondary" size="md" className="mt-6">
            Download Tax Summary
          </Button>
        </Card>
      </div>
    </div>
  );
}