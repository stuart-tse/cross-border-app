'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const ServiceDetailSection: React.FC = () => {
  const getServiceIcon = (iconName: string) => {
    const icons = {
      car: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      briefcase: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 16V8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1zM20 6h-2.18A3 3 0 0016 4H8a3 3 0 00-1.82 2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
        </svg>
      ),
      truck: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      ),
      plane: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
    };
    return icons[iconName as keyof typeof icons] || icons.car;
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {SERVICES.map((service, index) => {
            const isReversed = index % 2 === 1;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <div className={`grid lg:grid-cols-2 gap-0 ${isReversed ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Content */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${isReversed ? 'lg:col-start-2' : ''}`}>
                      <div className="text-chinese-red mb-6">
                        {getServiceIcon(service.icon)}
                      </div>

                      <h2 className="text-headline-lg font-bold text-charcoal mb-4">
                        {service.title}
                      </h2>

                      <p className="text-body-lg text-gray-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Features List */}
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + featureIndex * 0.1, duration: 0.6 }}
                            className="flex items-center text-body-md text-gray-700"
                          >
                            <span className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-white text-sm font-bold">✓</span>
                            </span>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>

                      {/* Price and CTAs */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {service.price && (
                          <div className="text-title-lg font-bold text-chinese-red">
                            {service.price}
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <Button variant="primary" size="sm">
                            Book Now
                          </Button>
                          <Button variant="secondary" size="sm">
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Image/Visual */}
                    <div className={`relative bg-gray-100 min-h-[400px] ${isReversed ? 'lg:col-start-1' : ''}`}>
                      <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center"
                      >
                        {/* Service visualization placeholder */}
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-chinese-red rounded-full flex items-center justify-center mx-auto">
                            <span className="text-white text-3xl">
                              {service.icon === 'car' ? '🚗' : 
                               service.icon === 'briefcase' ? '💼' :
                               service.icon === 'truck' ? '🚚' : '✈️'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-body-lg font-semibold text-gray-600">
                              {service.title}
                            </div>
                            <div className="text-body-sm text-gray-500">
                              Professional Service
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Floating elements */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-success-green rounded-full animate-pulse" />
                          <span className="text-body-sm font-medium text-charcoal">Available Now</span>
                        </div>
                      </motion.div>

                      {service.price && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.2, duration: 0.6 }}
                          className="absolute top-4 right-4 bg-chinese-red text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                          <span className="text-body-sm font-semibold">{service.price}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};