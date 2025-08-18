'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CONTACT } from '@/lib/constants';
import { Card } from '@/components/ui/Card';

export const ContactInfoSection: React.FC = () => {
  const contactMethods = [
    {
      icon: '📞',
      title: 'Phone',
      subtitle: 'Call for immediate assistance',
      primary: CONTACT.phone,
      secondary: 'Available 24/7',
      href: `tel:${CONTACT.phone}`,
      color: 'bg-electric-blue',
    },
    {
      icon: '💬',
      title: 'WeChat',
      subtitle: 'Preferred by Chinese clients',
      primary: CONTACT.wechat,
      secondary: 'Scan QR code to connect',
      href: '#wechat-qr',
      color: 'bg-success-green',
    },
    {
      icon: '📧',
      title: 'Email',
      subtitle: 'Send detailed inquiries',
      primary: CONTACT.email,
      secondary: '24-hour response guarantee',
      href: `mailto:${CONTACT.email}`,
      color: 'bg-chinese-red',
    },
    {
      icon: '📱',
      title: 'WhatsApp',
      subtitle: 'Quick messaging support',
      primary: CONTACT.whatsapp || CONTACT.phone,
      secondary: 'Instant chat available',
      href: `https://wa.me/${(CONTACT.whatsapp || CONTACT.phone).replace(/[^\d]/g, '')}`,
      color: 'bg-green-500',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Contact Methods Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="block group"
            >
              <Card className="text-center p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{method.icon}</span>
                </div>
                
                <h3 className="text-title-md font-semibold text-charcoal mb-2 group-hover:text-chinese-red transition-colors duration-300">
                  {method.title}
                </h3>
                
                <p className="text-body-sm text-gray-600 mb-3">
                  {method.subtitle}
                </p>
                
                <div className="text-body-md font-medium text-charcoal mb-2">
                  {method.primary}
                </div>
                
                <p className="text-body-sm text-gray-500">
                  {method.secondary}
                </p>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* Office Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Office Details */}
          <Card className="p-8">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">
              Office Location
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-chinese-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">📍</span>
                </div>
                <div>
                  <div className="text-body-md font-medium text-charcoal mb-1">Address</div>
                  <div className="text-body-md text-gray-600">{CONTACT.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-electric-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">⏰</span>
                </div>
                <div>
                  <div className="text-body-md font-medium text-charcoal mb-1">Business Hours</div>
                  <div className="text-body-md text-gray-600">{CONTACT.hours}</div>
                  <div className="text-body-sm text-gray-500 mt-1">
                    Office visits by appointment only
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">🚗</span>
                </div>
                <div>
                  <div className="text-body-md font-medium text-charcoal mb-1">Service Area</div>
                  <div className="text-body-md text-gray-600">
                    Hong Kong, Shenzhen, Guangzhou & Greater Bay Area
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Map Placeholder */}
          <Card className="p-0 overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-chinese-red rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white text-2xl">📍</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-body-lg font-semibold text-gray-700">
                      Central Hong Kong Office
                    </div>
                    <div className="text-body-sm text-gray-600">
                      Conveniently located in the heart of Hong Kong
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm"
              >
                <div className="text-body-sm font-medium text-charcoal">Central Business District</div>
                <div className="text-body-sm text-gray-600">Easy MTR Access</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute bottom-4 right-4 bg-chinese-red text-white rounded-lg p-3 shadow-sm"
              >
                <div className="text-body-sm font-medium">Premium Location</div>
                <div className="text-body-sm opacity-90">Professional Service</div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-charcoal text-white rounded-lg p-8 text-center"
        >
          <h3 className="text-title-lg font-semibold mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-body-lg mb-6 opacity-90">
            Our 24/7 emergency hotline is always available for urgent bookings and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${CONTACT.phone}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-chinese-red text-white rounded-sm font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              📞 Call Now: {CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${(CONTACT.whatsapp || CONTACT.phone).replace(/[^\d]/g, '')}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-sm font-semibold hover:bg-green-600 transition-colors duration-200"
            >
              💬 WhatsApp Chat
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};