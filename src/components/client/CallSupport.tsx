'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { format, addMinutes, addHours, startOfHour } from 'date-fns';

interface CallbackRequest {
  phoneNumber: string;
  preferredTime: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  subject: string;
  description: string;
}

interface CallSupportProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
}

export const CallSupport: React.FC<CallSupportProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userPhone
}) => {
  const [callbackData, setCallbackData] = useState<CallbackRequest>({
    phoneNumber: userPhone || '',
    preferredTime: '',
    urgency: 'NORMAL',
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showCallNow, setShowCallNow] = useState(false);

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startTime = addMinutes(startOfHour(now), 60); // Start from next hour

    // Generate slots for next 48 hours, business hours only (9 AM - 6 PM HKT)
    for (let day = 0; day < 2; day++) {
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = addHours(startTime, day * 24 + (hour - startTime.getHours()));
        if (slotTime > now) {
          slots.push({
            value: slotTime.toISOString(),
            label: format(slotTime, 'MMM dd, yyyy • HH:mm'),
            available: Math.random() > 0.3 // Simulate availability
          });
        }
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmitCallback = async () => {
    if (!callbackData.phoneNumber || !callbackData.preferredTime || !callbackData.subject) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/support/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CALLBACK_REQUEST',
          subject: callbackData.subject,
          description: callbackData.description,
          phoneNumber: callbackData.phoneNumber,
          preferredCallTime: callbackData.preferredTime,
          priority: callbackData.urgency,
          callbackRequested: true
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setCallbackData({
            phoneNumber: userPhone || '',
            preferredTime: '',
            urgency: 'NORMAL',
            subject: '',
            description: ''
          });
        }, 3000);
      } else {
        throw new Error('Failed to submit callback request');
      }
    } catch (error) {
      console.error('Error submitting callback request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'text-error-red';
      case 'HIGH':
        return 'text-warning-amber';
      case 'NORMAL':
        return 'text-electric-blue';
      case 'LOW':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const emergencyNumber = '+852 1234-5678';
  const businessHours = 'Mon-Sun: 9:00 AM - 6:00 PM (HKT)';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-hot-pink to-deep-pink text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📞</div>
              <h3 className="text-title-lg font-semibold">Call Support</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-title-lg font-semibold text-success-green mb-2">
                  Callback Requested
                </h3>
                <p className="text-body-md text-gray-600 mb-4">
                  We&apos;ll call you at {callbackData.phoneNumber} at your preferred time. 
                  You&apos;ll also receive an SMS confirmation shortly.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-body-sm text-gray-600">
                    <strong>Reference ID:</strong> CB-{Date.now().toString().slice(-6)}
                  </p>
                  <p className="text-body-sm text-gray-600">
                    <strong>Scheduled:</strong> {format(new Date(callbackData.preferredTime), 'MMM dd, yyyy • HH:mm')}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Call Now Option */}
                <Card className="p-4 bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 border-electric-blue/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-title-sm font-semibold text-charcoal">Need immediate help?</h4>
                      <p className="text-body-sm text-gray-600">Call our support hotline now</p>
                      <p className="text-body-sm text-gray-500">{businessHours}</p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => window.open(`tel:${emergencyNumber}`, '_self')}
                      className="bg-electric-blue hover:bg-blue-600"
                    >
                      Call Now
                    </Button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-title-sm font-bold text-electric-blue">{emergencyNumber}</p>
                  </div>
                </Card>

                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-body-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Callback Request Form */}
                <div>
                  <h4 className="text-title-md font-semibold text-charcoal mb-4">
                    Request a Callback
                  </h4>

                  <div className="space-y-4">
                    {/* Phone Number */}
                    <Input
                      label="Phone Number"
                      value={callbackData.phoneNumber}
                      onChange={(e) => setCallbackData({ ...callbackData, phoneNumber: e.target.value })}
                      placeholder="+852 XXXX XXXX"
                      required
                    />

                    {/* Subject */}
                    <Input
                      label="Subject"
                      value={callbackData.subject}
                      onChange={(e) => setCallbackData({ ...callbackData, subject: e.target.value })}
                      placeholder="What do you need help with?"
                      required
                    />

                    {/* Urgency */}
                    <div>
                      <label className="block text-body-sm font-medium text-charcoal mb-2">
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'LOW', label: 'Low', desc: 'General inquiry' },
                          { value: 'NORMAL', label: 'Normal', desc: 'Standard support' },
                          { value: 'HIGH', label: 'High', desc: 'Urgent issue' },
                          { value: 'URGENT', label: 'Urgent', desc: 'Critical problem' }
                        ].map((urgency) => (
                          <button
                            key={urgency.value}
                            onClick={() => setCallbackData({ ...callbackData, urgency: urgency.value as any })}
                            className={cn(
                              'p-3 border-2 rounded-lg text-left transition-colors',
                              callbackData.urgency === urgency.value
                                ? 'border-hot-pink bg-pink-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className={cn('font-medium', getUrgencyColor(urgency.value))}>
                              {urgency.label}
                            </div>
                            <div className="text-xs text-gray-600">{urgency.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label className="block text-body-sm font-medium text-charcoal mb-2">
                        Preferred Call Time
                      </label>
                      <select
                        value={callbackData.preferredTime}
                        onChange={(e) => setCallbackData({ ...callbackData, preferredTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent"
                        required
                      >
                        <option value="">Select a time slot</option>
                        {timeSlots.map((slot) => (
                          <option
                            key={slot.value}
                            value={slot.value}
                            disabled={!slot.available}
                          >
                            {slot.label} {!slot.available ? '(Unavailable)' : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        All times are in Hong Kong Time (HKT)
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-body-sm font-medium text-charcoal mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={callbackData.description}
                        onChange={(e) => setCallbackData({ ...callbackData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Please provide any additional details about your request..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitCallback}
                      disabled={isSubmitting || !callbackData.phoneNumber || !callbackData.preferredTime || !callbackData.subject}
                      className="bg-gradient-to-r from-hot-pink to-deep-pink"
                    >
                      {isSubmitting ? 'Requesting...' : 'Request Callback'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};