'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { TripCard } from '@/components/client/TripCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Trip {
  id: string;
  pickupLocation: any;
  dropoffLocation: any;
  scheduledDate: string;
  actualPickupTime?: string;
  actualDropoffTime?: string;
  estimatedDuration: number;
  distance: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND';
  totalPrice: number;
  currency: string;
  passengerCount: number;
  specialRequests?: string;
  driver?: {
    name: string;
    avatar?: string;
    rating: number;
  };
  vehicle?: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
    vehicleType: string;
  };
  payment?: {
    amount: number;
    currency: string;
    status: string;
    method: string;
  };
  review?: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
  };
  createdAt: string;
}

interface TripAnalytics {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSpent: number;
  avgRating: number;
  completionRate: number;
  cancellationRate: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ClientTripsPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [analytics, setAnalytics] = useState<TripAnalytics | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'scheduledDate',
    sortOrder: 'desc'
  });

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...filters
        });

        // Remove empty values
        const entriesToDelete: string[] = [];
        params.forEach((value, key) => {
          if (!value || value === 'all') {
            entriesToDelete.push(key);
          }
        });
        entriesToDelete.forEach(key => params.delete(key));

        const response = await fetch(`/api/client/trips?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips);
          setAnalytics(data.analytics);
          setPagination(data.pagination);
        } else {
          throw new Error('Failed to fetch trips');
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        setToast({ type: 'error', message: 'Failed to load trip history' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [pagination.page, filters]);

  const handleRebook = (trip: Trip) => {
    const searchParams = new URLSearchParams({
      from: JSON.stringify(trip.pickupLocation),
      to: JSON.stringify(trip.dropoffLocation),
      vehicle: trip.vehicle?.vehicleType || '',
      passengers: trip.passengerCount.toString()
    });
    window.location.href = `/booking?${searchParams.toString()}`;
  };

  const handleReview = async (tripId: string, reviewData: { rating: number; title?: string; comment?: string }) => {
    setIsProcessing(true);
    try {
      // Create review API call - this would need to be implemented
      const response = await fetch(`/api/client/trips/${tripId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const data = await response.json();
        // Update trip with new review
        setTrips(trips =>
          trips.map(trip =>
            trip.id === tripId ? { ...trip, review: data.review } : trip
          )
        );
        setToast({ type: 'success', message: 'Review submitted successfully' });
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setToast({ type: 'error', message: 'Failed to submit review' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = async (tripId: string) => {
    try {
      const response = await fetch(`/api/client/trips/${tripId}/receipt`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${tripId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setToast({ type: 'error', message: 'Failed to download receipt' });
    }
  };

  const handleViewDetails = (tripId: string) => {
    // Navigate to trip details page or open modal
    window.location.href = `/dashboard/client/trips/${tripId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success-green text-white';
      case 'IN_PROGRESS':
        return 'bg-electric-blue text-white';
      case 'CONFIRMED':
        return 'bg-warning-amber text-white';
      case 'PENDING':
        return 'bg-gray-400 text-white';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-error-red text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const setDateFilter = (period: string) => {
    const now = new Date();
    let dateFrom = '';
    let dateTo = '';

    switch (period) {
      case 'this-month':
        dateFrom = format(startOfMonth(now), 'yyyy-MM-dd');
        dateTo = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        dateFrom = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        dateTo = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'last-3-months':
        dateFrom = format(subMonths(now, 3), 'yyyy-MM-dd');
        dateTo = format(now, 'yyyy-MM-dd');
        break;
      case 'all':
      default:
        dateFrom = '';
        dateTo = '';
        break;
    }

    setFilters({ ...filters, dateFrom, dateTo });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-gray-600">Loading your trip history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-headline-md font-bold text-charcoal mb-2">Trip History</h1>
          <p className="text-body-lg text-gray-600">
            View your past trips, download receipts, and rebook your favorite routes
          </p>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="p-6 text-center">
              <div className="text-title-xl font-bold text-hot-pink mb-2">
                {analytics.totalTrips}
              </div>
              <div className="text-body-sm text-gray-600">Total Trips</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-title-xl font-bold text-success-green mb-2">
                {analytics.totalSpent.toLocaleString()}
              </div>
              <div className="text-body-sm text-gray-600">Total Spent (HKD)</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-title-xl font-bold text-electric-blue mb-2">
                {analytics.completionRate.toFixed(1)}%
              </div>
              <div className="text-body-sm text-gray-600">Completion Rate</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-title-xl font-bold text-warning-amber mb-2">
                {analytics.avgRating.toFixed(1)}★
              </div>
              <div className="text-body-sm text-gray-600">Average Rating</div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-body-sm font-medium text-charcoal mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="flex items-center space-x-2">
                  <div>
                    <label className="block text-body-sm font-medium text-charcoal mb-1">From</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-charcoal mb-1">To</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Date Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All Time', value: 'all' },
                  { label: 'This Month', value: 'this-month' },
                  { label: 'Last Month', value: 'last-month' },
                  { label: 'Last 3 Months', value: 'last-3-months' }
                ].map((period) => (
                  <Button
                    key={period.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateFilter(period.value)}
                    className={cn(
                      'text-body-sm',
                      (period.value === 'all' && !filters.dateFrom && !filters.dateTo) ||
                      (period.value !== 'all' && filters.dateFrom && filters.dateTo)
                        ? 'bg-hot-pink text-white'
                        : 'text-gray-600'
                    )}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trips List */}
        <div className="space-y-6">
          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-title-lg font-semibold text-charcoal mb-2">
                No Trips Found
              </h3>
              <p className="text-body-md text-gray-600 mb-6">
                {filters.status !== 'all' || filters.dateFrom || filters.dateTo
                  ? 'No trips match your current filters. Try adjusting your search criteria.'
                  : 'You haven\'t booked any trips yet. Start your first journey!'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {(filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
                  <Button
                    variant="secondary"
                    onClick={() => setFilters({
                      status: 'all',
                      dateFrom: '',
                      dateTo: '',
                      sortBy: 'scheduledDate',
                      sortOrder: 'desc'
                    })}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/booking'}
                  className="bg-gradient-to-r from-hot-pink to-deep-pink"
                >
                  Book Your First Trip
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TripCard
                    trip={trip}
                    onRebook={handleRebook}
                    onReview={handleReview}
                    onDownloadReceipt={handleDownloadReceipt}
                    onViewDetails={handleViewDetails}
                    isLoading={isProcessing}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = pagination.page <= 3 
                  ? i + 1
                  : pagination.page >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : pagination.page - 2 + i;
                
                if (pageNum < 1 || pageNum > pagination.pages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    className={pageNum === pagination.page ? "bg-hot-pink" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Toast Notification */}
        {toast && (
          <SimpleToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(ClientTripsPage, [UserType.CLIENT]);