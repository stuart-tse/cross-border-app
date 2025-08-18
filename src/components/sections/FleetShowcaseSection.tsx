'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VehicleCard } from '@/components/ui/Card';
import { VEHICLES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

export const FleetShowcaseSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

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
            Premium Fleet Selection
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Choose from our meticulously maintained fleet of premium vehicles, 
            each equipped with modern amenities and driven by professional chauffeurs.
          </p>
        </motion.div>

        {/* Vehicle Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {VEHICLES.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              variants={itemVariants}
              className="h-full"
            >
              <VehicleCard
                name={vehicle.name}
                category={vehicle.category}
                capacity={vehicle.capacity}
                luggage={vehicle.luggage}
                price={vehicle.price}
                features={vehicle.features}
                image={vehicle.image}
                onSelect={() => {
                  console.log('Selected vehicle:', vehicle.id);
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Fleet Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gray-50 rounded-lg p-8 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-headline-md font-bold text-charcoal">
                Why Choose Our Fleet?
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    title: 'Premium Vehicles',
                    description: 'Latest models from Mercedes, BMW, and Audi with luxury amenities and safety features.',
                  },
                  {
                    title: 'Professional Maintenance',
                    description: 'Regular inspections and maintenance ensure optimal performance and safety standards.',
                  },
                  {
                    title: 'Advanced Technology',
                    description: 'GPS tracking, Wi-Fi connectivity, and real-time communication systems.',
                  },
                  {
                    title: 'Certified Drivers',
                    description: 'Experienced, licensed chauffeurs with cross-border expertise and local knowledge.',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="flex space-x-4"
                  >
                    <div className="w-8 h-8 bg-chinese-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-body-lg font-semibold text-charcoal mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-body-md text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4">
                <Button variant="primary" size="lg">
                  View Full Fleet
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden relative"
              >
                {/* Placeholder for fleet image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['🚗', '🚙', '🚐'].map((emoji, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2, duration: 0.6 }}
                          className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm"
                        >
                          <span className="text-2xl">{emoji}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-body-lg font-semibold text-gray-700">
                        Premium Fleet
                      </div>
                      <div className="text-body-sm text-gray-600">
                        50+ Vehicles Available
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute top-4 left-4 bg-success-green text-white px-3 py-1 rounded-full text-body-sm font-medium"
                >
                  ✓ Certified Safe
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="absolute top-4 right-4 bg-electric-blue text-white px-3 py-1 rounded-full text-body-sm font-medium"
                >
                  24/7 Available
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-chinese-red text-white px-4 py-2 rounded-full text-body-sm font-medium"
                >
                  Tesla-Inspired Service
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};