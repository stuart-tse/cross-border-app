'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const RouteShowcaseSection: React.FC = () => {
  const popularRoutes = ROUTES.filter(route => route.popular);

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
            Popular Routes & Destinations
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Efficient cross-border connections between Hong Kong and major Mainland China cities.
          </p>
        </motion.div>

        {/* Interactive Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-16"
        >
          <Card className="p-8 bg-white">
            <div className="aspect-video bg-gradient-to-br from-electric-blue/10 to-chinese-red/10 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Map Visualization */}
              <div className="relative w-full max-w-2xl">
                {/* Hong Kong */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute left-8 bottom-12 flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-chinese-red rounded-full animate-pulse" />
                  <span className="text-body-md font-semibold text-charcoal">Hong Kong</span>
                </motion.div>

                {/* Routes */}
                <motion.div
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 2,  }}
                  className="absolute inset-0"
                >
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Route lines */}
                    <motion.path
                      d="M50 160 Q200 100 350 80"
                      stroke="#E60012"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    <motion.path
                      d="M50 160 Q200 140 350 140"
                      stroke="#E60012"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                </motion.div>

                {/* Shenzhen */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="absolute right-12 top-8 flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-electric-blue rounded-full animate-pulse" />
                  <span className="text-body-md font-semibold text-charcoal">Shenzhen</span>
                  <div className="text-body-sm text-gray-600 ml-2">45-60 mins</div>
                </motion.div>

                {/* Guangzhou */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2, duration: 0.6 }}
                  className="absolute right-8 bottom-20 flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-electric-blue rounded-full animate-pulse" />
                  <span className="text-body-md font-semibold text-charcoal">Guangzhou</span>
                  <div className="text-body-sm text-gray-600 ml-2">2-2.5 hours</div>
                </motion.div>

                {/* Center Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.5, duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm"
                >
                  <div className="text-title-md font-bold text-charcoal mb-2">
                    Greater Bay Area
                  </div>
                  <div className="text-body-sm text-gray-600">
                    Seamless Cross-Border Connections
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Route Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {popularRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <h3 className="text-title-lg font-semibold text-charcoal">
                      {route.from} ↔ {route.to}
                    </h3>
                    <div className="flex items-center space-x-4 text-body-sm text-gray-600">
                      <span className="flex items-center">
                        🕐 {route.duration}
                      </span>
                      <span className="flex items-center">
                        📍 {route.distance}
                      </span>
                    </div>
                  </div>
                  <div className="text-title-sm font-semibold text-chinese-red">
                    {route.price}
                  </div>
                </div>

                <p className="text-body-md text-gray-600 mb-4 leading-relaxed">
                  {route.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-body-sm font-semibold text-charcoal">Border Crossings:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {route.borderCrossings.map((crossing) => (
                        <span
                          key={crossing}
                          className="px-2 py-1 bg-gray-100 text-body-sm text-gray-700 rounded-sm"
                        >
                          {crossing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" size="sm" className="flex-1">
                    Book Route
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    Get Quote
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Button variant="accent" size="lg">
            View All Routes
          </Button>
        </motion.div>
      </div>
    </section>
  );
};