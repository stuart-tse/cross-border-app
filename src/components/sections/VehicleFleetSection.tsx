'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VehicleCard } from '@/components/ui/Card';
import { VEHICLES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const VehicleFleetSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<typeof VEHICLES[0] | null>(null);
  
  const categories = [
    { id: 'all', label: 'All Vehicles' },
    { id: 'business', label: 'Business Class' },
    { id: 'executive', label: 'Executive' },
    { id: 'luxury', label: 'Luxury Premium' },
  ];

  const filteredVehicles = selectedCategory === 'all' 
    ? VEHICLES 
    : VEHICLES.filter(vehicle => vehicle.category === selectedCategory);

  const handleVehicleSelect = (vehicle: typeof VEHICLES[0]) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-display-sm font-bold text-charcoal mb-4">
              Choose Your Vehicle
            </h2>
            <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
              Select from our premium fleet of meticulously maintained vehicles, 
              each designed to provide comfort, safety, and style for your journey.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-chinese-red text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* Vehicle Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <VehicleCard
                  name={vehicle.name}
                  category={vehicle.category}
                  capacity={vehicle.capacity}
                  luggage={vehicle.luggage}
                  price={vehicle.price}
                  features={vehicle.features}
                  image={vehicle.image}
                  onSelect={() => handleVehicleSelect(vehicle)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Fleet Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 bg-white rounded-lg p-8 lg:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Fleet Stats */}
              <div className="space-y-6">
                <h3 className="text-title-lg font-semibold text-charcoal">Fleet Statistics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Vehicles', value: '50+' },
                    { label: 'Average Age', value: '< 3 years' },
                    { label: 'Maintenance', value: 'Monthly' },
                    { label: 'Safety Rating', value: '5-Star' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="flex justify-between items-center"
                    >
                      <span className="text-body-md text-gray-600">{stat.label}:</span>
                      <span className="text-body-md font-semibold text-charcoal">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Safety Features */}
              <div className="space-y-6">
                <h3 className="text-title-lg font-semibold text-charcoal">Safety Standards</h3>
                <ul className="space-y-3">
                  {[
                    'GPS tracking systems',
                    'Regular safety inspections',
                    'Comprehensive insurance',
                    'Emergency communication',
                    'Professional driver training',
                    'Vehicle maintenance records',
                  ].map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="flex items-center text-body-sm text-gray-600"
                    >
                      <span className="w-4 h-4 bg-success-green rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Booking CTA */}
              <div className="space-y-6">
                <h3 className="text-title-lg font-semibold text-charcoal">Ready to Book?</h3>
                <p className="text-body-md text-gray-600">
                  Select your preferred vehicle and schedule your premium cross-border journey today.
                </p>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Book Now
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Get Custom Quote
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vehicle Detail Modal */}
      <Modal
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title={selectedVehicle?.name}
        size="lg"
      >
        {selectedVehicle && (
          <div className="space-y-6">
            {/* Vehicle Image */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-chinese-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🚗</span>
                  </div>
                  <div className="text-body-md font-medium text-gray-600">
                    {selectedVehicle.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-body-lg font-semibold text-charcoal mb-3">Vehicle Specifications</h4>
                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-charcoal capitalize">{selectedVehicle.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium text-charcoal">{selectedVehicle.capacity} passengers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Luggage:</span>
                    <span className="font-medium text-charcoal">{selectedVehicle.luggage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-chinese-red">{selectedVehicle.price}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-body-lg font-semibold text-charcoal mb-3">Features & Amenities</h4>
                <ul className="space-y-2">
                  {selectedVehicle.features.map((feature, index) => (
                    <li key={index} className="text-body-sm text-gray-600 flex items-center">
                      <span className="w-4 h-4 bg-success-green rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-body-lg font-semibold text-charcoal mb-3">Description</h4>
              <p className="text-body-md text-gray-600">{selectedVehicle.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="primary" className="flex-1">
                Book This Vehicle
              </Button>
              <Button variant="secondary" className="flex-1">
                Get Quote
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};