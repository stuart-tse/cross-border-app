'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { VEHICLES, ROUTES } from '@/lib/constants';
import { 
  routeSelectionSchema, 
  vehicleSelectionSchema, 
  dateTimeSchema, 
  contactInfoSchema,
  type RouteSelectionData,
  type VehicleSelectionData,
  type DateTimeData,
  type ContactInfoData
} from '@/lib/validations/booking';
import { cn } from '@/lib/utils';

type BookingStep = 'route' | 'vehicle' | 'datetime' | 'contact' | 'confirmation';

interface BookingData {
  route: Partial<RouteSelectionData>;
  vehicle: Partial<VehicleSelectionData>;
  datetime: Partial<DateTimeData>;
  contact: Partial<ContactInfoData>;
  pricing: {
    basePrice: number;
    surcharges: Array<{ name: string; amount: number }>;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>('route');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [bookingData, setBookingData] = useState<BookingData>({
    route: {
      from: {
        address: searchParams?.get('from') || '',
        latitude: 0,
        longitude: 0,
      },
      to: {
        address: searchParams?.get('to') || '',
        latitude: 0,
        longitude: 0,
      },
      distance: 0,
      estimatedDuration: 0,
    },
    vehicle: {},
    datetime: {
      date: searchParams?.get('date') || '',
      time: '',
      timeZone: 'Asia/Hong_Kong',
    },
    contact: {},
    pricing: {
      basePrice: 0,
      surcharges: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  });

  const steps = [
    { id: 'route', title: 'Location & Route', description: 'Pickup and destination with Amap integration' },
    { id: 'vehicle', title: 'Vehicle Selection', description: 'Choose your preferred vehicle' },
    { id: 'datetime', title: 'Date & Time', description: 'Schedule your journey' },
    { id: 'contact', title: 'Payment & Confirm', description: 'Complete booking and payment' },
  ];

  const locationOptions = [
    { value: '', label: 'Select location' },
    { value: 'hong-kong-central', label: 'Hong Kong - Central' },
    { value: 'hong-kong-airport', label: 'Hong Kong - Airport' },
    { value: 'hong-kong-tsim-sha-tsui', label: 'Hong Kong - Tsim Sha Tsui' },
    { value: 'shenzhen-futian', label: 'Shenzhen - Futian' },
    { value: 'shenzhen-luohu', label: 'Shenzhen - Luohu' },
    { value: 'shenzhen-nanshan', label: 'Shenzhen - Nanshan' },
    { value: 'guangzhou-tianhe', label: 'Guangzhou - Tianhe' },
    { value: 'guangzhou-pazhou', label: 'Guangzhou - Pazhou' },
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const handleStepChange = (step: BookingStep) => {
    setCurrentStep(step);
    setErrors({});
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (validateCurrentStep() && currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as BookingStep);
    } else if (currentIndex === steps.length - 1) {
      setCurrentStep('confirmation');
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as BookingStep);
    }
  };

  const validateCurrentStep = () => {
    setErrors({});
    
    switch (currentStep) {
      case 'route':
        if (!bookingData.route.from?.address || !bookingData.route.to?.address) {
          setErrors({ route: 'Please select both pickup and destination locations' });
          return false;
        }
        break;
      case 'vehicle':
        if (!bookingData.vehicle.vehicleId) {
          setErrors({ vehicle: 'Please select a vehicle' });
          return false;
        }
        break;
      case 'datetime':
        if (!bookingData.datetime.date || !bookingData.datetime.time) {
          setErrors({ datetime: 'Please select both date and time' });
          return false;
        }
        break;
      case 'contact':
        const contactErrors: Record<string, string> = {};
        if (!bookingData.contact.fullName) contactErrors.fullName = 'Full name is required';
        if (!bookingData.contact.email) contactErrors.email = 'Email is required';
        if (!bookingData.contact.phone) contactErrors.phone = 'Phone number is required';
        
        if (Object.keys(contactErrors).length > 0) {
          setErrors(contactErrors);
          return false;
        }
        break;
    }
    
    return true;
  };

  const updateBookingData = (section: keyof BookingData, data: any) => {
    setBookingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
    
    // Calculate pricing when route or vehicle changes
    if (section === 'route' || section === 'vehicle') {
      calculatePricing();
    }
  };

  const calculatePricing = () => {
    // Simple pricing calculation - in real app this would be an API call
    const basePrice = bookingData.vehicle.basePrice || 800;
    const distanceMultiplier = (bookingData.route.distance || 35) / 35;
    const subtotal = Math.round(basePrice * distanceMultiplier);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    updateBookingData('pricing', {
      basePrice,
      surcharges: [],
      subtotal,
      tax,
      total,
    });
  };

  const handleVehicleSelect = (vehicle: typeof VEHICLES[0]) => {
    updateBookingData('vehicle', {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      category: vehicle.category,
      capacity: vehicle.capacity,
      basePrice: parseInt(vehicle.price.replace(/[^\d]/g, '')),
    });
  };

  const handleSubmitBooking = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to confirmation page or show success message
      alert('Booking submitted successfully!');
    } catch (error) {
      setErrors({ submit: 'Failed to submit booking. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    calculatePricing();
  }, [bookingData.route, bookingData.vehicle]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-headline-lg font-bold text-charcoal mb-4">
            Book Your Journey
          </h1>
          <p className="text-body-lg text-gray-600">
            Complete your booking in a few simple steps
          </p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      getCurrentStepIndex() >= index
                        ? 'bg-[#FF69B4] text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      'ml-2 text-body-md font-medium transition-colors',
                      getCurrentStepIndex() >= index
                        ? 'text-[#FF69B4]'
                        : 'text-gray-600'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 transition-colors',
                      getCurrentStepIndex() > index
                        ? 'bg-[#FF69B4]'
                        : 'bg-gray-200'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <AnimatePresence mode="wait">
                {currentStep === 'route' && (
                  <motion.div
                    key="route"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                      Location & Route (Amap Integration)
                    </h2>
                    
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        🗺️ Powered by Amap - Real-time location autocomplete and route optimization
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-body-md font-semibold text-charcoal mb-3">
                          From
                        </label>
                        <Select
                          options={locationOptions}
                          value={bookingData.route.from?.address || ''}
                          onChange={(e) => updateBookingData('route', {
                            from: { address: e.target.value, latitude: 0, longitude: 0 }
                          })}
                          placeholder="Select pickup location"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-body-md font-semibold text-charcoal mb-3">
                          To
                        </label>
                        <Select
                          options={locationOptions}
                          value={bookingData.route.to?.address || ''}
                          onChange={(e) => updateBookingData('route', {
                            to: { address: e.target.value, latitude: 0, longitude: 0 }
                          })}
                          placeholder="Select destination"
                        />
                      </div>
                    </div>

                    {/* Popular Routes */}
                    <div>
                      <h3 className="text-title-sm font-semibold text-charcoal mb-3">
                        Popular Routes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ROUTES.filter(route => route.popular).map((route) => (
                          <button
                            key={route.id}
                            onClick={() => updateBookingData('route', {
                              from: { address: route.from, latitude: 0, longitude: 0 },
                              to: { address: route.to, latitude: 0, longitude: 0 },
                              distance: parseInt(route.distance.replace(/[^\d]/g, '')),
                              estimatedDuration: parseInt(route.duration.split('-')[0]),
                            })}
                            className="p-3 border border-gray-200 rounded-lg hover:border-[#FF69B4] hover:bg-[#FFF0F5] transition-all duration-200 text-left"
                          >
                            <div className="text-body-md font-medium text-charcoal">
                              {route.from} → {route.to}
                            </div>
                            <div className="text-body-sm text-gray-500">
                              {route.duration} • {route.price}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {errors.route && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
                        {errors.route}
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 'vehicle' && (
                  <motion.div
                    key="vehicle"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                      Select Your Vehicle
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {VEHICLES.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={cn(
                            'border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer',
                            bookingData.vehicle.vehicleId === vehicle.id
                              ? 'border-[#FF69B4] bg-[#FFF0F5]'
                              : 'border-gray-200 hover:border-[#FF69B4]/50'
                          )}
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="text-center mb-4">
                            <h3 className="text-title-md font-semibold text-charcoal">
                              {vehicle.name}
                            </h3>
                            <p className="text-body-sm text-gray-600">
                              {vehicle.description}
                            </p>
                          </div>

                          <div className="flex justify-center space-x-4 mb-4 text-body-sm text-gray-600">
                            <span>👥 {vehicle.capacity} passengers</span>
                            <span>🧳 {vehicle.luggage}</span>
                          </div>

                          <div className="text-center mb-4">
                            <div className="text-title-lg font-bold text-[#FF69B4]">
                              {vehicle.price}
                            </div>
                            <div className="text-body-sm text-gray-500">Estimated price</div>
                          </div>

                          <ul className="space-y-1 mb-4">
                            {vehicle.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-body-sm text-gray-600 flex items-center">
                                <span className="w-1.5 h-1.5 bg-success-green rounded-full mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          {bookingData.vehicle.vehicleId === vehicle.id && (
                            <div className="text-center">
                              <span className="px-3 py-1 bg-[#FF69B4] text-white rounded-full text-body-sm font-medium">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {errors.vehicle && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
                        {errors.vehicle}
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 'datetime' && (
                  <motion.div
                    key="datetime"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                      Select Date & Time
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Date"
                        type="date"
                        value={bookingData.datetime.date || ''}
                        onChange={(e) => updateBookingData('datetime', { date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />

                      <Input
                        label="Time"
                        type="time"
                        value={bookingData.datetime.time || ''}
                        onChange={(e) => updateBookingData('datetime', { time: e.target.value })}
                        required
                      />
                    </div>

                    {errors.datetime && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
                        {errors.datetime}
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 'contact' && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                      Contact Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="Enter your full name"
                        value={bookingData.contact.fullName || ''}
                        onChange={(e) => updateBookingData('contact', { fullName: e.target.value })}
                        error={errors.fullName}
                        required
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        value={bookingData.contact.email || ''}
                        onChange={(e) => updateBookingData('contact', { email: e.target.value })}
                        error={errors.email}
                        required
                      />

                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={bookingData.contact.phone || ''}
                        onChange={(e) => updateBookingData('contact', { phone: e.target.value })}
                        error={errors.phone}
                        required
                      />

                      <Input
                        label="WeChat ID (Optional)"
                        type="text"
                        placeholder="Enter your WeChat ID"
                        value={bookingData.contact.wechatId || ''}
                        onChange={(e) => updateBookingData('contact', { wechatId: e.target.value })}
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-body-md font-semibold text-charcoal mb-3">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                        rows={4}
                        placeholder="Any special requirements or requests..."
                        value={bookingData.contact.specialRequests || ''}
                        onChange={(e) => updateBookingData('contact', { specialRequests: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 'confirmation' && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                      Booking Confirmation
                    </h2>

                    <div className="space-y-6">
                      {/* Route Summary */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-title-sm font-semibold text-charcoal mb-2">Route</h3>
                        <p className="text-body-md">
                          {bookingData.route.from?.address} → {bookingData.route.to?.address}
                        </p>
                      </div>

                      {/* Vehicle Summary */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-title-sm font-semibold text-charcoal mb-2">Vehicle</h3>
                        <p className="text-body-md">{bookingData.vehicle.vehicleName}</p>
                      </div>

                      {/* DateTime Summary */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-title-sm font-semibold text-charcoal mb-2">Date & Time</h3>
                        <p className="text-body-md">
                          {bookingData.datetime.date} at {bookingData.datetime.time}
                        </p>
                      </div>

                      {/* Contact Summary */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-title-sm font-semibold text-charcoal mb-2">Contact</h3>
                        <p className="text-body-md">{bookingData.contact.fullName}</p>
                        <p className="text-body-sm text-gray-600">{bookingData.contact.email}</p>
                        <p className="text-body-sm text-gray-600">{bookingData.contact.phone}</p>
                      </div>

                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-[#FF69B4] hover:bg-[#FF1493]"
                        onClick={handleSubmitBooking}
                        isLoading={isSubmitting}
                      >
                        Confirm Booking
                      </Button>
                    </div>

                    {errors.submit && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
                        {errors.submit}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep !== 'confirmation' && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={getCurrentStepIndex() === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    className="bg-[#FF69B4] hover:bg-[#FF1493]"
                  >
                    {getCurrentStepIndex() === steps.length - 1 ? 'Review' : 'Next'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-body-md">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">HK${bookingData.pricing.basePrice.toLocaleString()}</span>
                </div>
                
                {bookingData.pricing.surcharges.map((surcharge, index) => (
                  <div key={index} className="flex justify-between text-body-md">
                    <span className="text-gray-600">{surcharge.name}</span>
                    <span className="font-medium">HK${surcharge.amount.toLocaleString()}</span>
                  </div>
                ))}

                <div className="flex justify-between text-body-md">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">HK${bookingData.pricing.tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-title-md font-bold">
                  <span className="text-charcoal">Total</span>
                  <span className="text-[#FF69B4]">HK${bookingData.pricing.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Selected Details */}
              {bookingData.route.from?.address && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-body-md font-semibold text-charcoal mb-3">Selected Route</h4>
                  <p className="text-body-sm text-gray-600">
                    {bookingData.route.from.address} → {bookingData.route.to?.address}
                  </p>
                </div>
              )}

              {bookingData.vehicle.vehicleName && (
                <div className="mt-4">
                  <h4 className="text-body-md font-semibold text-charcoal mb-1">Vehicle</h4>
                  <p className="text-body-sm text-gray-600">{bookingData.vehicle.vehicleName}</p>
                </div>
              )}

              {bookingData.datetime.date && (
                <div className="mt-4">
                  <h4 className="text-body-md font-semibold text-charcoal mb-1">Date & Time</h4>
                  <p className="text-body-sm text-gray-600">
                    {bookingData.datetime.date} {bookingData.datetime.time && `at ${bookingData.datetime.time}`}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}