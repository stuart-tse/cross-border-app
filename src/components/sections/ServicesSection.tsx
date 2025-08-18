'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/ui/Card';
import { SERVICES } from '@/lib/constants';

export const ServicesSection: React.FC = () => {
  const getServiceIcon = (iconName: string) => {
    const icons = {
      car: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      briefcase: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 16V8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1zM20 6h-2.18A3 3 0 0016 4H8a3 3 0 00-1.82 2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
        </svg>
      ),
      truck: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      ),
      plane: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
    };
    return icons[iconName as keyof typeof icons] || icons.car;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
            Our Premium Services
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Comprehensive cross-border transportation solutions designed for your comfort, 
            convenience, and peace of mind.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="h-full"
            >
              <ServiceCard
                icon={getServiceIcon(service.icon)}
                title={service.title}
                description={service.description}
                features={service.features}
                price={service.price}
                onBookNow={() => {
                  // Handle booking navigation
                  console.log('Book now for:', service.id);
                }}
                onLearnMore={() => {
                  // Handle learn more navigation
                  console.log('Learn more about:', service.id);
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-title-lg font-semibold text-charcoal mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-body-lg text-gray-600 mb-6">
              We provide tailored transportation solutions for unique requirements. 
              Contact us to discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-primary text-white rounded-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Get Custom Quote
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border border-primary text-primary rounded-sm font-semibold hover:bg-light-gray transition-colors duration-200"
              >
                View All Services
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};