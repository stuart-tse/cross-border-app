'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { TeslaCard } from '@/components/ui/TeslaCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TripRequest {
  id: string;
  type: 'incoming' | 'active' | 'completed';
  client: {
    name: string;
    phone: string;
    rating: number;
    profilePhoto?: string;
  };
  route: {
    from: string;
    fromAddress: string;
    to: string;
    toAddress: string;
    distance: string;
    estimatedDuration: string;
  };
  schedule: {
    requestedAt: string;
    pickupTime: string;
    pickupDate: string;
  };
  service: {
    vehicleType: string;
    passengers: number;
    luggage: number;
    specialRequirements?: string[];
  };
  pricing: {
    estimatedEarnings: number;
    paymentMethod: string;
    currency: 'HKD' | 'CNY';
  };
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  expiresAt?: string; // For incoming requests
}

interface TripHistory {
  date: string;
  trips: TripRequest[];
}

const TripRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'active' | 'history'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<TripRequest[]>([
    {
      id: 'req-001',
      type: 'incoming',
      client: {
        name: 'Sarah Chen',
        phone: '+852-9876-5432',
        rating: 4.8,
      },
      route: {
        from: 'Hong Kong',
        fromAddress: 'IFC Mall, Central, Hong Kong',
        to: 'Shenzhen',
        toAddress: 'Futian District, Shenzhen',
        distance: '45km',
        estimatedDuration: '1h 15min',
      },
      schedule: {
        requestedAt: '3 minutes ago',
        pickupTime: '14:30',
        pickupDate: '2024-01-15',
      },
      service: {
        vehicleType: 'Executive SUV',
        passengers: 2,
        luggage: 3,
        specialRequirements: ['Child seat', 'English speaking driver'],
      },
      pricing: {
        estimatedEarnings: 1200,
        paymentMethod: 'Credit Card',
        currency: 'HKD',
      },
      urgency: 'high',
      status: 'pending',
      notes: 'Important business meeting. Client prefers punctuality.',
      expiresAt: '2024-01-15T10:35:00Z',
    },
    {
      id: 'req-002',
      type: 'incoming',
      client: {
        name: 'Michael Wong',
        phone: '+852-6543-2109',
        rating: 4.6,
      },
      route: {
        from: 'Hong Kong Airport',
        fromAddress: 'Terminal 1, Arrival Hall',
        to: 'Guangzhou',
        toAddress: 'Tianhe District, Guangzhou',
        distance: '140km',
        estimatedDuration: '2h 30min',
      },
      schedule: {
        requestedAt: '8 minutes ago',
        pickupTime: '18:00',
        pickupDate: '2024-01-15',
      },
      service: {
        vehicleType: 'Business Class',
        passengers: 1,
        luggage: 2,
      },
      pricing: {
        estimatedEarnings: 1800,
        paymentMethod: 'Corporate Account',
        currency: 'HKD',
      },
      urgency: 'medium',
      status: 'pending',
      expiresAt: '2024-01-15T10:40:00Z',
    },
  ]);

  const [activeTrips, setActiveTrips] = useState<TripRequest[]>([
    {
      id: 'trip-001',
      type: 'active',
      client: {
        name: 'Jennifer Liu',
        phone: '+852-7654-3210',
        rating: 4.9,
      },
      route: {
        from: 'Hong Kong',
        fromAddress: 'Kowloon Station',
        to: 'Shenzhen',
        toAddress: 'Luohu Port',
        distance: '35km',
        estimatedDuration: '50min',
      },
      schedule: {
        requestedAt: '30 minutes ago',
        pickupTime: '09:30',
        pickupDate: '2024-01-15',
      },
      service: {
        vehicleType: 'Business Class',
        passengers: 1,
        luggage: 1,
      },
      pricing: {
        estimatedEarnings: 800,
        paymentMethod: 'Credit Card',
        currency: 'HKD',
      },
      urgency: 'medium',
      status: 'in_progress',
    },
  ]);

  const [tripHistory, setTripHistory] = useState<TripHistory[]>([
    {
      date: '2024-01-14',
      trips: [
        {
          id: 'hist-001',
          type: 'completed',
          client: {
            name: 'David Zhang',
            phone: '+852-8765-4321',
            rating: 4.7,
          },
          route: {
            from: 'Shenzhen',
            fromAddress: 'Shenzhen North Station',
            to: 'Hong Kong',
            toAddress: 'Tsim Sha Tsui',
            distance: '50km',
            estimatedDuration: '1h 20min',
          },
          schedule: {
            requestedAt: '2024-01-14T16:00:00Z',
            pickupTime: '17:00',
            pickupDate: '2024-01-14',
          },
          service: {
            vehicleType: 'Executive SUV',
            passengers: 3,
            luggage: 4,
          },
          pricing: {
            estimatedEarnings: 1400,
            paymentMethod: 'WeChat Pay',
            currency: 'HKD',
          },
          urgency: 'medium',
          status: 'completed',
        },
      ],
    },
  ]);

  const handleAcceptTrip = (tripId: string) => {
    const trip = incomingRequests.find(req => req.id === tripId);
    if (trip) {
      // Move to active trips
      setActiveTrips(prev => [...prev, { ...trip, status: 'accepted', type: 'active' }]);
      setIncomingRequests(prev => prev.filter(req => req.id !== tripId));
      console.log(`Accepted trip ${tripId}`);
    }
  };

  const handleDeclineTrip = (tripId: string) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== tripId));
    console.log(`Declined trip ${tripId}`);
  };

  const handleStartTrip = (tripId: string) => {
    setActiveTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, status: 'in_progress' }
        : trip
    ));
    console.log(`Started trip ${tripId}`);
  };

  const handleCompleteTrip = (tripId: string) => {
    const trip = activeTrips.find(t => t.id === tripId);
    if (trip) {
      // Move to history
      const today = new Date().toISOString().split('T')[0];
      setTripHistory(prev => {
        const todayHistory = prev.find(h => h.date === today);
        if (todayHistory) {
          todayHistory.trips.push({ ...trip, status: 'completed', type: 'completed' });
          return [...prev];
        } else {
          return [{ date: today, trips: [{ ...trip, status: 'completed', type: 'completed' }] }, ...prev];
        }
      });
      setActiveTrips(prev => prev.filter(t => t.id !== tripId));
      console.log(`Completed trip ${tripId}`);
    }
  };

  const getUrgencyColor = (urgency: TripRequest['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getStatusBadge = (status: TripRequest['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Response', icon: '⏳' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted', icon: '✅' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: 'In Progress', icon: '🚗' },
      completed: { color: 'bg-gray-100 text-gray-800', text: 'Completed', icon: '✔️' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: '❌' },
    };

    const config = statusConfig[status];
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: 'HKD' | 'CNY') => {
    const symbol = currency === 'HKD' ? 'HK$' : '¥';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const TripCard: React.FC<{ trip: TripRequest; showActions?: boolean }> = ({ trip, showActions = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4"
    >
      <Card className={cn('border-l-4', getUrgencyColor(trip.urgency))}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-title-md font-semibold text-charcoal">
                {trip.route.from} → {trip.route.to}
              </h3>
              {getStatusBadge(trip.status)}
            </div>
            <p className="text-body-sm text-gray-600 mb-1">
              {trip.client.name} • {trip.client.rating}⭐ • {trip.schedule.requestedAt}
            </p>
            {trip.expiresAt && (
              <p className="text-body-sm text-red-600 font-medium">
                ⏰ Expires in: {Math.ceil((new Date(trip.expiresAt).getTime() - Date.now()) / 60000)} minutes
              </p>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="text-title-lg font-bold text-[#FF69B4]">
              {formatCurrency(trip.pricing.estimatedEarnings, trip.pricing.currency)}
            </div>
            <div className="text-body-sm text-gray-500">Estimated earnings</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-body-sm">
          <div>
            <span className="text-gray-500">Pickup:</span>
            <p className="text-charcoal font-medium">{trip.route.fromAddress}</p>
          </div>
          <div>
            <span className="text-gray-500">Destination:</span>
            <p className="text-charcoal font-medium">{trip.route.toAddress}</p>
          </div>
          <div>
            <span className="text-gray-500">Schedule:</span>
            <p className="text-charcoal font-medium">
              {trip.schedule.pickupDate} at {trip.schedule.pickupTime}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="text-charcoal font-medium">{trip.service.vehicleType}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-body-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <span>👥 {trip.service.passengers} passengers</span>
            <span>🧳 {trip.service.luggage} luggage</span>
            <span>📍 {trip.route.distance}</span>
            <span>⏱️ {trip.route.estimatedDuration}</span>
          </div>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            trip.urgency === 'high' && 'bg-red-100 text-red-700',
            trip.urgency === 'medium' && 'bg-yellow-100 text-yellow-700',
            trip.urgency === 'low' && 'bg-blue-100 text-blue-700'
          )}>
            {trip.urgency.toUpperCase()} PRIORITY
          </div>
        </div>

        {trip.service.specialRequirements && (
          <div className="mb-4">
            <span className="text-body-sm text-gray-500">Special Requirements:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {trip.service.specialRequirements.map((req, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {trip.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-body-sm text-gray-500">Client Notes:</span>
            <p className="text-body-sm text-charcoal mt-1">{trip.notes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-3">
            {trip.status === 'pending' && (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleDeclineTrip(trip.id)}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 bg-success-green hover:bg-green-600"
                  onClick={() => handleAcceptTrip(trip.id)}
                >
                  Accept Trip
                </Button>
              </>
            )}
            {trip.status === 'accepted' && (
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => handleStartTrip(trip.id)}
              >
                Start Trip
              </Button>
            )}
            {trip.status === 'in_progress' && (
              <div className="flex gap-3 w-full">
                <Button variant="secondary" size="md" className="flex-1">
                  📞 Call Client
                </Button>
                <Button variant="secondary" size="md" className="flex-1">
                  🗺️ Navigation
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleCompleteTrip(trip.id)}
                >
                  Complete Trip
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );

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
              <h1 className="text-3xl font-bold text-charcoal">Trip Requests</h1>
              <p className="text-gray-600">Manage your incoming requests and active trips</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'incoming', label: 'Incoming Requests', count: incomingRequests.length },
            { id: 'active', label: 'Active Trips', count: activeTrips.length },
            { id: 'history', label: 'Trip History', count: tripHistory.reduce((acc, day) => acc + day.trips.length, 0) },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-[#FF69B4] font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-[#FF69B4] text-white'
                    : 'bg-gray-300 text-gray-700'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'incoming' && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-title-lg font-semibold text-charcoal">
                  Incoming Trip Requests ({incomingRequests.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-green rounded-full animate-pulse"></div>
                  <span className="text-body-sm text-gray-600">Listening for new requests</span>
                </div>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-title-md font-semibold text-charcoal mb-2">
                    No pending requests
                  </h3>
                  <p className="text-body-md text-gray-600">
                    New trip requests will appear here when clients book rides.
                  </p>
                </div>
              ) : (
                <div>
                  {incomingRequests.map((request) => (
                    <TripCard key={request.id} trip={request} showActions={true} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-title-lg font-semibold text-charcoal">
                Active Trips ({activeTrips.length})
              </h2>

              {activeTrips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-title-md font-semibold text-charcoal mb-2">
                    No active trips
                  </h3>
                  <p className="text-body-md text-gray-600">
                    Accepted trips will appear here. Check the incoming requests tab for new bookings.
                  </p>
                </div>
              ) : (
                <div>
                  {activeTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} showActions={true} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-title-lg font-semibold text-charcoal">Trip History</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">📅 Filter by Date</Button>
                  <Button variant="secondary" size="sm">📊 Export Report</Button>
                </div>
              </div>

              {tripHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-title-md font-semibold text-charcoal mb-2">
                    No trip history
                  </h3>
                  <p className="text-body-md text-gray-600">
                    Completed trips will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tripHistory.map((dayHistory) => (
                    <div key={dayHistory.date}>
                      <h3 className="text-title-md font-semibold text-charcoal mb-4">
                        {new Date(dayHistory.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="space-y-4">
                        {dayHistory.trips.map((trip) => (
                          <TripCard key={trip.id} trip={trip} showActions={false} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default withAuth(TripRequestsPage, [UserType.DRIVER]);