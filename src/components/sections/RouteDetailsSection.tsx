'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const RouteDetailsSection: React.FC = () => {
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
            Route Details & Information
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Comprehensive information about each route including travel times, 
            border crossings, and booking options.
          </p>
        </motion.div>

        {/* Route Cards */}
        <div className="space-y-12">
          {ROUTES.filter(route => route.popular).map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                  {/* Route Information */}
                  <div className={`p-8 lg:p-12 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-headline-lg font-bold text-charcoal mb-2">
                          {route.from} ↔ {route.to}
                        </h3>
                        <div className="flex items-center gap-4 text-body-md text-gray-600">
                          <span className="flex items-center gap-1">
                            🕐 {route.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            📍 {route.distance}
                          </span>
                        </div>
                      </div>
                      {route.popular && (
                        <span className="bg-chinese-red text-white px-3 py-1 rounded-full text-body-sm font-medium">
                          Popular Route
                        </span>
                      )}
                    </div>

                    <p className="text-body-lg text-gray-700 mb-6 leading-relaxed">
                      {route.description}
                    </p>

                    {/* Route Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="text-body-lg font-semibold text-charcoal mb-3">
                          Key Features
                        </h4>
                        <ul className="space-y-2">
                          {[
                            'Professional drivers',
                            'Real-time tracking',
                            'Border assistance',
                            'Flexible scheduling',
                          ].map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-body-sm text-gray-700">
                              <span className="w-4 h-4 bg-success-green rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                              </span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-body-lg font-semibold text-charcoal mb-3">
                          Border Crossings
                        </h4>
                        <div className="space-y-2">
                          {route.borderCrossings.map((crossing, crossingIndex) => (
                            <div key={crossingIndex} className="flex items-center text-body-sm text-gray-700">
                              <span className="w-2 h-2 bg-electric-blue rounded-full mr-3 flex-shrink-0"></span>
                              {crossing}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-title-lg font-bold text-chinese-red mb-1">
                          {route.price}
                        </div>
                        <div className="text-body-sm text-gray-600">
                          Starting price per vehicle
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="primary" size="sm">
                          Book Route
                        </Button>
                        <Button variant="secondary" size="sm">
                          Get Quote
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Visual/Map Section */}
                  <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 min-h-[400px] flex items-center justify-center ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-chinese-red rounded-full flex items-center justify-center mx-auto">
                        <span className="text-white text-3xl">🗺️</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-title-lg font-bold text-gray-700">
                          {route.from} → {route.to}
                        </div>
                        <div className="text-body-md text-gray-600">
                          Optimized Route Planning
                        </div>
                      </div>
                    </div>

                    {/* Floating Info Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm"
                    >
                      <div className="text-body-sm font-semibold text-charcoal">{route.duration}</div>
                      <div className="text-body-sm text-gray-600">Travel Time</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="absolute bottom-4 right-4 bg-electric-blue text-white rounded-lg p-3 shadow-sm"
                    >
                      <div className="text-body-sm font-semibold">Available 24/7</div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* All Routes CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <Card className="p-8 bg-white">
            <h3 className="text-title-lg font-semibold text-charcoal mb-4">
              Need a Different Route?
            </h3>
            <p className="text-body-lg text-gray-600 mb-6">
              We also provide custom routes throughout the Greater Bay Area. 
              Contact us to discuss your specific transportation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg">
                Request Custom Route
              </Button>
              <Button variant="secondary" size="lg">
                View All Routes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};