'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { BOOKING_STEPS } from '@/lib/constants';

export const BookingFlowSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    from: '',
    to: '',
    vehicle: '',
    date: '',
    time: '',
    passengers: '1',
    fullName: '',
    phone: '',
    email: '',
    specialRequests: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < BOOKING_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const serviceOptions = [
    { value: '', label: 'Select a service' },
    { value: 'cross-border', label: 'Cross-Border Transfer' },
    { value: 'corporate', label: 'Corporate Solutions' },
    { value: 'airport', label: 'Airport Service' },
    { value: 'logistics', label: 'Logistics Support' },
  ];

  const routeOptions = [
    { value: '', label: 'Select pickup location' },
    { value: 'hk-central', label: 'Hong Kong Central' },
    { value: 'hk-airport', label: 'Hong Kong Airport' },
    { value: 'hk-tsim', label: 'Tsim Sha Tsui' },
    { value: 'hk-causeway', label: 'Causeway Bay' },
  ];

  const destinationOptions = [
    { value: '', label: 'Select destination' },
    { value: 'sz-futian', label: 'Shenzhen Futian' },
    { value: 'sz-luohu', label: 'Shenzhen Luohu' },
    { value: 'gz-center', label: 'Guangzhou Center' },
    { value: 'custom', label: 'Custom Destination' },
  ];

  const vehicleOptions = [
    { value: '', label: 'Select vehicle type' },
    { value: 'business', label: 'Business Class - From HK$800' },
    { value: 'executive', label: 'Executive SUV - From HK$1,200' },
    { value: 'luxury', label: 'Luxury Premium - From HK$1,800' },
  ];

  const timeOptions = [
    { value: '', label: 'Select time' },
    { value: '08:00', label: '8:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '18:00', label: '6:00 PM' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-title-lg font-semibold text-charcoal">Choose Your Service</h3>
            <Select
              label="Service Type"
              options={serviceOptions}
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'cross-border', title: 'Cross-Border Transfer', desc: 'Point-to-point service' },
                { id: 'corporate', title: 'Corporate Solutions', desc: 'Business transportation' },
                { id: 'airport', title: 'Airport Service', desc: 'Airport connections' },
              ].map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.service === service.id
                      ? 'border-chinese-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('service', service.id)}
                >
                  <div className="text-body-md font-semibold text-charcoal mb-1">
                    {service.title}
                  </div>
                  <div className="text-body-sm text-gray-600">
                    {service.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-title-lg font-semibold text-charcoal">Select Route & Vehicle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Pickup Location"
                options={routeOptions}
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                required
              />
              <Select
                label="Destination"
                options={destinationOptions}
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                required
              />
            </div>
            
            {formData.from && formData.to && (
              <div className="bg-electric-blue/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-body-sm text-electric-blue">
                  <span>⚡</span>
                  <span>Estimated time: 45-60 minutes</span>
                </div>
              </div>
            )}

            <Select
              label="Vehicle Type"
              options={vehicleOptions}
              value={formData.vehicle}
              onChange={(e) => handleInputChange('vehicle', e.target.value)}
              required
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-title-lg font-semibold text-charcoal">Choose Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <Select
                label="Time"
                options={timeOptions}
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
            <Input
              type="number"
              label="Number of Passengers"
              value={formData.passengers}
              onChange={(e) => handleInputChange('passengers', e.target.value)}
              min="1"
              max="8"
              required
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-title-lg font-semibold text-charcoal">Contact Details & Confirmation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
                <Input
                  type="tel"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-body-lg font-semibold text-charcoal mb-4">Booking Summary</h4>
                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-charcoal capitalize">{formData.service.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium text-charcoal">{formData.from} → {formData.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium text-charcoal capitalize">{formData.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-charcoal">{formData.date} {formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium text-charcoal">{formData.passengers}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-body-md font-semibold text-charcoal mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                rows={3}
                placeholder="Any special requests or requirements..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-display-sm font-bold text-charcoal mb-4">
            Easy Booking Process
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Book your premium cross-border journey in just a few simple steps. 
            Our streamlined process makes it easy to arrange your transportation.
          </p>
        </motion.div>

        {/* Booking Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {BOOKING_STEPS.map((step) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step.id <= currentStep
                          ? 'bg-chinese-red text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.id}
                    </div>
                    {step.id < BOOKING_STEPS.length && (
                      <div
                        className={`w-16 h-1 mx-2 transition-all ${
                          step.id < currentStep ? 'bg-chinese-red' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-body-lg font-semibold text-charcoal mb-1">
                  Step {currentStep} of {BOOKING_STEPS.length}: {BOOKING_STEPS[currentStep - 1]?.title}
                </div>
                <div className="text-body-sm text-gray-600">
                  {BOOKING_STEPS[currentStep - 1]?.description}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              
              {currentStep < BOOKING_STEPS.length ? (
                <Button
                  variant="primary"
                  onClick={nextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={() => console.log('Confirm booking', formData)}
                >
                  Confirm Booking
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};