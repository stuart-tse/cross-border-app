'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

export const SafetyCertificationsSection: React.FC = () => {
  const certifications = [
    {
      title: 'Cross-Border License',
      description: 'Official license to operate cross-border vehicle services between Hong Kong and Mainland China.',
      issuer: 'Hong Kong Transport Department',
      year: '2010',
      icon: '🏛️',
    },
    {
      title: 'Commercial Vehicle Permit',
      description: 'Authorized to operate commercial passenger vehicles with professional insurance coverage.',
      issuer: 'Transport Licensing Authority',
      year: '2010',
      icon: '🚗',
    },
    {
      title: 'Safety Certification',
      description: 'Regular safety inspections and maintenance certification for all fleet vehicles.',
      issuer: 'Vehicle Safety Authority',
      year: '2024',
      icon: '🛡️',
    },
    {
      title: 'Professional Driver Certification',
      description: 'All drivers hold professional driving licenses and cross-border operation permits.',
      issuer: 'Professional Drivers Association',
      year: '2024',
      icon: '👨‍💼',
    },
  ];

  const safetyFeatures = [
    {
      title: 'Vehicle Tracking',
      description: 'Real-time GPS tracking for all vehicles with 24/7 monitoring.',
      icon: '📍',
    },
    {
      title: 'Insurance Coverage',
      description: 'Comprehensive insurance for passengers, vehicles, and third-party liability.',
      icon: '🛡️',
    },
    {
      title: 'Emergency Response',
      description: 'Immediate emergency response system with direct communication channels.',
      icon: '🚨',
    },
    {
      title: 'Driver Training',
      description: 'Ongoing professional development and safety training for all drivers.',
      icon: '🎓',
    },
  ];

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
            Safety & Certifications
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Your safety is our top priority. We maintain the highest standards through 
            proper licensing, certifications, and continuous safety monitoring.
          </p>
        </motion.div>

        {/* Certifications Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{cert.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-title-md font-semibold text-charcoal mb-2">
                      {cert.title}
                    </h3>
                    <p className="text-body-md text-gray-600 mb-3">
                      {cert.description}
                    </p>
                    <div className="text-body-sm text-gray-500">
                      <div>Issued by: {cert.issuer}</div>
                      <div>Valid since: {cert.year}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Safety Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg p-8 lg:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-headline-md font-bold text-charcoal mb-4">
              Safety Features
            </h3>
            <p className="text-body-lg text-gray-600">
              Advanced safety systems and protocols to ensure your peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-body-lg font-semibold text-charcoal mb-2">
                  {feature.title}
                </h4>
                <p className="text-body-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safety Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: 'Zero Accidents', value: '50,000+', description: 'Trips completed safely' },
            { label: 'Response Time', value: '< 2 min', description: 'Emergency response' },
            { label: 'Safety Rating', value: '5-Star', description: 'Authority certification' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="text-center bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="text-headline-lg font-bold text-chinese-red mb-2">
                {stat.value}
              </div>
              <div className="text-body-lg font-semibold text-charcoal mb-1">
                {stat.label}
              </div>
              <div className="text-body-sm text-gray-600">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};