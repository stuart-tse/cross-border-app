'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export const TeamSection: React.FC = () => {
  const teamStats = [
    { label: 'Professional Drivers', value: '50+', icon: '👨‍💼' },
    { label: 'Support Staff', value: '15+', icon: '🎧' },
    { label: 'Average Experience', value: '8+ years', icon: '⭐' },
    { label: 'Languages Spoken', value: '5+', icon: '🗣️' },
  ];

  const departments = [
    {
      title: 'Customer Service',
      description: 'Our dedicated customer service team provides 24/7 support in multiple languages, ensuring seamless communication throughout your journey.',
      features: ['24/7 availability', 'Multilingual support', 'Booking assistance', 'Real-time updates'],
      icon: '🎧',
    },
    {
      title: 'Professional Drivers',
      description: 'Licensed and experienced chauffeurs with extensive knowledge of cross-border routes and procedures.',
      features: ['Licensed professionals', 'Border expertise', 'Local knowledge', 'Safety training'],
      icon: '🚗',
    },
    {
      title: 'Operations Team',
      description: 'Behind-the-scenes coordination ensuring vehicle maintenance, route optimization, and service quality.',
      features: ['Fleet management', 'Route planning', 'Quality assurance', 'Safety monitoring'],
      icon: '⚙️',
    },
    {
      title: 'Account Management',
      description: 'Dedicated account managers for corporate clients, providing personalized service and flexible solutions.',
      features: ['Corporate accounts', 'Custom solutions', 'Billing management', 'Priority service'],
      icon: '💼',
    },
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
            Our Professional Team
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Meet the professionals behind our exceptional service. Our team is committed 
            to providing safe, reliable, and premium cross-border transportation.
          </p>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {teamStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <Card className="p-6">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-headline-lg font-bold text-chinese-red mb-2">
                  {stat.value}
                </div>
                <div className="text-body-md font-medium text-charcoal">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Departments */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {departments.map((dept, index) => (
            <motion.div
              key={dept.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <Card className="p-8 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{dept.icon}</div>
                  <h3 className="text-title-lg font-semibold text-charcoal">
                    {dept.title}
                  </h3>
                </div>

                <p className="text-body-md text-gray-600 mb-6">
                  {dept.description}
                </p>

                <ul className="space-y-2">
                  {dept.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-body-sm text-gray-700">
                      <span className="w-4 h-4 bg-electric-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">•</span>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Hiring CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-gradient-to-r from-charcoal to-gray-700 text-white rounded-lg p-8 lg:p-12 text-center"
        >
          <h3 className="text-headline-md font-bold mb-4">
            Join Our Team
          </h3>
          <p className="text-body-lg mb-6 opacity-90 max-w-2xl mx-auto">
            We&apos;re always looking for professional drivers and customer service representatives 
            who share our commitment to excellence and customer satisfaction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/careers"
              className="inline-flex items-center justify-center px-6 py-3 bg-chinese-red text-white rounded-sm font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              View Open Positions
            </Link>
            <a
              href="mailto:careers@crossborder-services.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-sm font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              Send Your Resume
            </a>
          </div>

          <div className="mt-8 text-body-sm opacity-75">
            We offer competitive salaries, professional development opportunities, and comprehensive benefits.
          </div>
        </motion.div>
      </div>
    </section>
  );
};