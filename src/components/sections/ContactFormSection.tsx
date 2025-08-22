'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { DynamicDataService } from '@/lib/services/dynamic-data-service';
import type { DynamicListItem } from '@/lib/services/dynamic-data-service';

export const ContactFormSection: React.FC = () => {
  const [formData, setFormData] = useState({
    inquiryType: '',
    fullName: '',
    phone: '',
    email: '',
    company: '',
    service: '',
    from: '',
    to: '',
    date: '',
    passengers: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dynamicData, setDynamicData] = useState<{
    inquiryTypes: DynamicListItem[];
    serviceOptions: DynamicListItem[];
    locationOptions: DynamicListItem[];
  }>({ inquiryTypes: [], serviceOptions: [], locationOptions: [] });
  const [dataLoading, setDataLoading] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        inquiryType: '',
        fullName: '',
        phone: '',
        email: '',
        company: '',
        service: '',
        from: '',
        to: '',
        date: '',
        passengers: '',
        message: '',
      });
    }, 3000);
  };

  // Load dynamic data on component mount
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setDataLoading(true);
        
        // Note: These list types need to be added to the admin interface
        // Using fallback hardcoded data for now
        const inquiryTypes = [
          { id: '1', key: 'quote', label: 'Get Quote', value: 'quote', sortOrder: 0, isActive: true, isDefault: false },
          { id: '2', key: 'booking', label: 'Make Booking', value: 'booking', sortOrder: 1, isActive: true, isDefault: false },
          { id: '3', key: 'corporate', label: 'Corporate Account', value: 'corporate', sortOrder: 2, isActive: true, isDefault: false },
          { id: '4', key: 'general', label: 'General Inquiry', value: 'general', sortOrder: 3, isActive: true, isDefault: false },
        ];

        const serviceOptions = [
          { id: '1', key: 'cross-border', label: 'Cross-Border Transfer', value: 'cross-border', sortOrder: 0, isActive: true, isDefault: false },
          { id: '2', key: 'corporate', label: 'Corporate Solutions', value: 'corporate', sortOrder: 1, isActive: true, isDefault: false },
          { id: '3', key: 'airport', label: 'Airport Service', value: 'airport', sortOrder: 2, isActive: true, isDefault: false },
          { id: '4', key: 'logistics', label: 'Logistics Support', value: 'logistics', sortOrder: 3, isActive: true, isDefault: false },
          { id: '5', key: 'custom', label: 'Custom Service', value: 'custom', sortOrder: 4, isActive: true, isDefault: false },
        ];

        const locationOptions = [
          { id: '1', key: 'hk-central', label: 'Hong Kong Central', value: 'hk-central', sortOrder: 0, isActive: true, isDefault: false },
          { id: '2', key: 'hk-airport', label: 'Hong Kong Airport', value: 'hk-airport', sortOrder: 1, isActive: true, isDefault: false },
          { id: '3', key: 'hk-tsim', label: 'Tsim Sha Tsui', value: 'hk-tsim', sortOrder: 2, isActive: true, isDefault: false },
          { id: '4', key: 'sz-futian', label: 'Shenzhen Futian', value: 'sz-futian', sortOrder: 3, isActive: true, isDefault: false },
          { id: '5', key: 'gz-center', label: 'Guangzhou Center', value: 'gz-center', sortOrder: 4, isActive: true, isDefault: false },
          { id: '6', key: 'custom', label: 'Other Location', value: 'custom', sortOrder: 5, isActive: true, isDefault: false },
        ];
        
        setDynamicData({
          inquiryTypes,
          serviceOptions,
          locationOptions,
        });
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadDynamicData();
  }, []);

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 text-center bg-success-green/10 border-success-green/20">
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-title-lg font-semibold text-charcoal mb-4">
                  Message Sent Successfully!
                </h3>
                <p className="text-body-lg text-gray-600 mb-6">
                  Thank you for contacting us. Our team will review your inquiry and 
                  respond within 1 hour during business hours.
                </p>
                <div className="bg-white rounded-lg p-4 text-left">
                  <h4 className="text-body-md font-semibold text-charcoal mb-2">What happens next?</h4>
                  <ul className="text-body-sm text-gray-600 space-y-1">
                    <li>• Our team reviews your inquiry</li>
                    <li>• We prepare a customized quote or response</li>
                    <li>• You receive a detailed reply via email or phone</li>
                    <li>• We schedule your service or consultation</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-charcoal mb-4">
              Send Us a Message
            </h2>
            <p className="text-title-md text-gray-600">
              Fill out the form below and our team will get back to you within 1 hour.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              {dataLoading ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Inquiry Type</label>
                  <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <Select
                  label="Inquiry Type"
                  options={[
                    { value: '', label: 'Select inquiry type' },
                    ...DynamicDataService.listItemsToOptions(dynamicData.inquiryTypes)
                  ]}
                  value={formData.inquiryType}
                  onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                  required
                />
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                <Input
                  type="text"
                  label="Company (Optional)"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>

              {/* Service Details */}
              {(formData.inquiryType === 'quote' || formData.inquiryType === 'booking') && (
                <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-body-lg font-semibold text-charcoal">Service Details</h4>
                  
                  {dataLoading ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Service Type</label>
                      <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <Select
                      label="Service Type"
                      options={[
                        { value: '', label: 'Select service' },
                        ...DynamicDataService.listItemsToOptions(dynamicData.serviceOptions)
                      ]}
                      value={formData.service}
                      onChange={(e) => handleInputChange('service', e.target.value)}
                      required
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dataLoading ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Destination</label>
                          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Select
                          label="Pickup Location"
                          options={[
                            { value: '', label: 'Select location' },
                            ...DynamicDataService.listItemsToOptions(dynamicData.locationOptions)
                          ]}
                          value={formData.from}
                          onChange={(e) => handleInputChange('from', e.target.value)}
                          required
                        />
                        <Select
                          label="Destination"
                          options={[
                            { value: '', label: 'Select location' },
                            ...DynamicDataService.listItemsToOptions(dynamicData.locationOptions)
                          ]}
                          value={formData.to}
                          onChange={(e) => handleInputChange('to', e.target.value)}
                          required
                        />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="date"
                      label="Preferred Date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="number"
                      label="Number of Passengers"
                      value={formData.passengers}
                      onChange={(e) => handleInputChange('passengers', e.target.value)}
                      min="1"
                      max="8"
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <Textarea
                label="Message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please provide any additional details about your requirements..."
                rows={5}
                required
              />

              {/* Terms & Privacy */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 text-body-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-chinese-red border-gray-300 rounded focus:ring-2 focus:ring-chinese-red"
                    required
                  />
                  <span>
                    I agree to the <Link href="/legal/privacy" className="text-chinese-red hover:underline">Privacy Policy</Link> and 
                    <Link href="/legal/terms" className="text-chinese-red hover:underline ml-1">Terms of Service</Link>. 
                    I consent to being contacted regarding my inquiry.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || dataLoading}
                  className="px-12"
                >
                  {isSubmitting ? 'Sending Message...' : dataLoading ? 'Loading Form...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Additional Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-body-md text-gray-600 mb-4">
              Prefer to speak directly? We&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+85222345678"
                className="inline-flex items-center justify-center px-6 py-2 text-body-md text-charcoal hover:text-chinese-red transition-colors duration-200"
              >
                📞 +852-2234-5678
              </a>
              <a
                href="mailto:info@crossborder-services.com"
                className="inline-flex items-center justify-center px-6 py-2 text-body-md text-charcoal hover:text-chinese-red transition-colors duration-200"
              >
                📧 info@crossborder-services.com
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};