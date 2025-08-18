'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

export const ServiceFeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🚗',
      title: 'Professional Drivers',
      description: 'Experienced, licensed chauffeurs with cross-border expertise and local knowledge of Hong Kong and Mainland China routes.',
      benefits: ['Licensed professionals', 'Border crossing expertise', 'Multilingual support', 'Local knowledge'],
    },
    {
      icon: '📱',
      title: 'Real-Time Tracking',
      description: 'Advanced GPS tracking system provides real-time location updates and journey progress via SMS and mobile app.',
      benefits: ['Live GPS tracking', 'SMS updates', 'Mobile app access', 'Journey notifications'],
    },
    {
      icon: '🛡️',
      title: 'Border Expertise',
      description: 'Specialized knowledge of cross-border procedures, documentation requirements, and optimal crossing times.',
      benefits: ['Document assistance', 'Optimal timing', 'Procedure guidance', 'Compliance support'],
    },
    {
      icon: '⏰',
      title: 'Flexible Scheduling',
      description: '24/7 availability with flexible booking options to accommodate your schedule and last-minute changes.',
      benefits: ['24/7 availability', 'Last-minute booking', 'Schedule changes', 'Emergency service'],
    },
    {
      icon: '💼',
      title: 'Corporate Solutions',
      description: 'Dedicated account management for businesses with flexible billing, priority booking, and customized service packages.',
      benefits: ['Account management', 'Flexible billing', 'Priority service', 'Custom packages'],
    },
    {
      icon: '🌟',
      title: 'Premium Service',
      description: 'Tesla-inspired attention to detail with premium amenities, professional presentation, and exceptional customer service.',
      benefits: ['Premium amenities', 'Professional service', 'Quality assurance', 'Customer focus'],
    },
  ];

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
            Service Features
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Discover the features and benefits that set our cross-border vehicle services apart 
            from traditional transportation providers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="h-full"
            >
              <Card variant="feature" className="h-full flex flex-col">
                {/* Icon */}
                <div className="text-5xl mb-6">{feature.icon}</div>

                {/* Title */}
                <h3 className="text-title-md font-semibold text-charcoal mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-body-md text-gray-600 mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-2 mt-auto">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <motion.li
                      key={benefitIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + benefitIndex * 0.1, duration: 0.4 }}
                      className="flex items-center text-body-sm text-gray-700"
                    >
                      <span className="w-4 h-4 bg-electric-blue rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-white text-xs">•</span>
                      </span>
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <Card className="p-8 lg:p-12 bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <h3 className="text-headline-md font-bold text-charcoal mb-6">
                  Why Choose Our Services?
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      title: 'Proven Track Record',
                      description: 'Over 50,000 successful cross-border trips with a 99.8% on-time delivery rate.',
                    },
                    {
                      title: 'Licensed & Certified',
                      description: 'Fully licensed cross-border operators with all necessary permits and certifications.',
                    },
                    {
                      title: 'Tesla-Inspired Excellence',
                      description: 'Attention to detail and premium service quality inspired by Tesla\'s commitment to excellence.',
                    },
                    {
                      title: 'Customer-Centric Approach',
                      description: 'Personalized service tailored to your specific needs and preferences.',
                    },
                  ].map((reason, index) => (
                    <motion.div
                      key={reason.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      className="border-l-4 border-chinese-red pl-6"
                    >
                      <h4 className="text-body-lg font-semibold text-charcoal mb-2">
                        {reason.title}
                      </h4>
                      <p className="text-body-md text-gray-600">
                        {reason.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '10+', label: 'Years Experience' },
                  { number: '50K+', label: 'Trips Completed' },
                  { number: '99.8%', label: 'On-Time Rate' },
                  { number: '24/7', label: 'Availability' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="text-center p-6 bg-white rounded-lg shadow-sm"
                  >
                    <div className="text-headline-lg font-bold text-chinese-red mb-2">
                      {stat.number}
                    </div>
                    <div className="text-body-sm text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};