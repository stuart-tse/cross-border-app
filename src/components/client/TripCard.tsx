'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

interface TripCardProps {
  trip: Trip;
  onRebook: (trip: Trip) => void;
  onReview: (tripId: string, review: { rating: number; title?: string; comment?: string }) => Promise<void>;
  onDownloadReceipt: (tripId: string) => void;
  onViewDetails: (tripId: string) => void;
  isLoading?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onRebook,
  onReview,
  onDownloadReceipt,
  onViewDetails,
  isLoading = false
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: trip.review?.rating || 5,
    title: trip.review?.title || '',
    comment: trip.review?.comment || ''
  });
  const [expandedDetails, setExpandedDetails] = useState(false);

  const getStatusColor = (status: Trip['status']) => {
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

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '✓';
      case 'IN_PROGRESS':
        return '🚗';
      case 'CONFIRMED':
        return '📋';
      case 'PENDING':
        return '⏳';
      case 'CANCELLED':
        return '✕';
      case 'NO_SHOW':
        return '❌';
      default:
        return '?';
    }
  };

  const handleReview = async () => {
    try {
      await onReview(trip.id, reviewData);
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatLocation = (location: any) => {
    if (typeof location === 'string') return location;
    return location?.address || 'Unknown location';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
              getStatusColor(trip.status)
            )}>
              {getStatusIcon(trip.status)}
            </div>
            <div>
              <h3 className="text-title-sm font-semibold text-charcoal">
                {formatLocation(trip.pickupLocation)} → {formatLocation(trip.dropoffLocation)}
              </h3>
              <p className="text-body-sm text-gray-500">
                {format(new Date(trip.scheduledDate), 'MMM dd, yyyy • HH:mm')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-title-sm font-semibold text-hot-pink">
              {trip.currency} {trip.totalPrice.toLocaleString()}
            </div>
            <div className={cn(
              'text-body-sm capitalize',
              trip.paymentStatus === 'COMPLETED' ? 'text-success-green' : 'text-warning-amber'
            )}>
              {trip.paymentStatus.toLowerCase().replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm mb-4">
          <div>
            <span className="text-gray-500">Distance:</span>
            <span className="text-charcoal ml-1 font-medium">{trip.distance} km</span>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="text-charcoal ml-1 font-medium">{formatDuration(trip.estimatedDuration)}</span>
          </div>
          <div>
            <span className="text-gray-500">Passengers:</span>
            <span className="text-charcoal ml-1 font-medium">{trip.passengerCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <span className="text-charcoal ml-1 font-medium capitalize">
              {trip.vehicle?.vehicleType?.toLowerCase() || 'TBD'}
            </span>
          </div>
        </div>

        {/* Driver & Vehicle Info (if available) */}
        {trip.driver && trip.vehicle && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-hot-pink text-white flex items-center justify-center text-sm font-medium">
                  {trip.driver.name.charAt(0)}
                </div>
                <div>
                  <p className="text-body-md font-medium text-charcoal">{trip.driver.name}</p>
                  <p className="text-body-sm text-gray-600">
                    {trip.vehicle.make} {trip.vehicle.model} • {trip.vehicle.plateNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-warning-amber">
                  <span className="mr-1">⭐</span>
                  <span className="text-body-sm font-medium">{trip.driver.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Section */}
        {trip.review && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="flex text-warning-amber mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= trip.review!.rating ? 'text-warning-amber' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-body-sm text-gray-600">
                    {format(new Date(trip.review.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                {trip.review.title && (
                  <h4 className="text-body-md font-medium text-charcoal mb-1">{trip.review.title}</h4>
                )}
                {trip.review.comment && (
                  <p className="text-body-sm text-gray-600">{trip.review.comment}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {expandedDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-200 pt-4 mt-4"
            >
              <div className="space-y-3 text-body-sm">
                {trip.actualPickupTime && (
                  <div>
                    <span className="text-gray-500">Actual Pickup:</span>
                    <span className="text-charcoal ml-1">{format(new Date(trip.actualPickupTime), 'MMM dd, yyyy • HH:mm')}</span>
                  </div>
                )}
                {trip.actualDropoffTime && (
                  <div>
                    <span className="text-gray-500">Actual Dropoff:</span>
                    <span className="text-charcoal ml-1">{format(new Date(trip.actualDropoffTime), 'MMM dd, yyyy • HH:mm')}</span>
                  </div>
                )}
                {trip.specialRequests && (
                  <div>
                    <span className="text-gray-500">Special Requests:</span>
                    <span className="text-charcoal ml-1">{trip.specialRequests}</span>
                  </div>
                )}
                {trip.payment && (
                  <div>
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="text-charcoal ml-1 capitalize">{trip.payment.method.toLowerCase().replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpandedDetails(!expandedDetails)}
          >
            {expandedDetails ? 'Hide Details' : 'View Details'}
          </Button>
          
          {trip.status === 'COMPLETED' && trip.paymentStatus === 'COMPLETED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownloadReceipt(trip.id)}
            >
              Receipt
            </Button>
          )}
          
          {trip.status === 'COMPLETED' && !trip.review && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowReviewModal(true)}
              className="bg-gradient-to-r from-hot-pink to-deep-pink"
            >
              Rate Trip
            </Button>
          )}
          
          {trip.status === 'COMPLETED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRebook(trip)}
            >
              Book Again
            </Button>
          )}
        </div>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 m-4 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-title-md font-semibold text-charcoal mb-4">
                  Rate Your Trip
                </h3>
                
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-body-sm font-medium text-charcoal mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={cn(
                          'text-2xl transition-colors',
                          star <= reviewData.rating ? 'text-warning-amber' : 'text-gray-300'
                        )}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <div className="mb-4">
                  <label className="block text-body-sm font-medium text-charcoal mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent"
                    placeholder="Great service!"
                  />
                </div>

                {/* Review Comment */}
                <div className="mb-6">
                  <label className="block text-body-sm font-medium text-charcoal mb-2">Comment (Optional)</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowReviewModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleReview}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-hot-pink to-deep-pink"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};