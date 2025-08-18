'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

export const RoutesMapSection: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const routePoints = [
    { id: 'hk', name: 'Hong Kong', x: 20, y: 70, type: 'origin' },
    { id: 'sz', name: 'Shenzhen', x: 80, y: 30, type: 'destination' },
    { id: 'gz', name: 'Guangzhou', x: 80, y: 60, type: 'destination' },
  ];

  const routeConnections = [
    { from: 'hk', to: 'sz', routeId: 'hk-shenzhen', duration: '45-60 min' },
    { from: 'hk', to: 'gz', routeId: 'hk-guangzhou', duration: '2-2.5 hrs' },
  ];

  return (
    <section className="py-20 bg-white">
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
            Interactive Route Network
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive cross-border route network with real-time information 
            on travel times, border crossings, and service availability.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-electric-blue/10 to-chinese-red/10 rounded-lg overflow-hidden">
              {/* Background Map Visual */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,102,204,0.1),transparent_50%)] opacity-50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(230,0,18,0.1),transparent_50%)] opacity-50" />

              {/* Route Points */}
              {routePoints.map((point, index) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => setSelectedRoute(point.id)}
                >
                  <div 
                    className={`w-6 h-6 rounded-full animate-pulse ${
                      point.type === 'origin' ? 'bg-chinese-red' : 'bg-electric-blue'
                    }`}
                  />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className={`px-3 py-1 rounded-full text-body-sm font-semibold text-white ${
                      point.type === 'origin' ? 'bg-chinese-red' : 'bg-electric-blue'
                    }`}>
                      {point.name}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Route Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {routeConnections.map((connection, index) => {
                  const fromPoint = routePoints.find(p => p.id === connection.from);
                  const toPoint = routePoints.find(p => p.id === connection.to);
                  
                  if (!fromPoint || !toPoint) return null;

                  return (
                    <motion.g key={connection.routeId}>
                      <motion.path
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + index * 0.5, duration: 2,  }}
                        d={`M${fromPoint.x}% ${fromPoint.y}% Q50% ${(fromPoint.y + toPoint.y) / 2 - 10}% ${toPoint.x}% ${toPoint.y}%`}
                        stroke="#E60012"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8,4"
                        className="animate-pulse"
                      />
                      
                      {/* Route Duration Label */}
                      <motion.foreignObject
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2 + index * 0.3, duration: 0.6 }}
                        x="40%"
                        y={`${(fromPoint.y + toPoint.y) / 2 - 15}%`}
                        width="120"
                        height="30"
                      >
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border text-center">
                          <div className="text-body-sm font-semibold text-charcoal">
                            {connection.duration}
                          </div>
                        </div>
                      </motion.foreignObject>
                    </motion.g>
                  );
                })}
              </svg>

              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 3, duration: 0.8 }}
                className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm"
              >
                <h4 className="text-body-md font-semibold text-charcoal mb-2">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chinese-red rounded-full"></div>
                    <span className="text-body-sm text-gray-600">Hong Kong (Origin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                    <span className="text-body-sm text-gray-600">China Destinations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-chinese-red" style={{ background: 'repeating-linear-gradient(90deg, #E60012 0, #E60012 4px, transparent 4px, transparent 8px)' }}></div>
                    <span className="text-body-sm text-gray-600">Route Connections</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="absolute top-4 right-4 bg-charcoal text-white rounded-lg p-4 shadow-sm"
              >
                <div className="text-center">
                  <div className="text-title-md font-bold mb-1">4+</div>
                  <div className="text-body-sm">Active Routes</div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Route Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {ROUTES.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">
                  {route.popular ? '⭐' : '🚗'}
                </div>
                
                <h3 className="text-body-lg font-semibold text-charcoal mb-2">
                  {route.from} ↔ {route.to}
                </h3>
                
                <div className="text-body-sm text-gray-600 mb-3">
                  {route.duration} • {route.distance}
                </div>
                
                <div className="text-body-md font-semibold text-chinese-red mb-4">
                  {route.price}
                </div>
                
                <Button variant="primary" size="sm" className="w-full">
                  Book Route
                </Button>
                
                {route.popular && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-chinese-red text-white text-body-sm rounded-full">
                      Popular
                    </span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};