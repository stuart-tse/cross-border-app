'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { COMPANY } from '@/lib/constants';

export const CompanyStorySection: React.FC = () => {
  const milestones = [
    {
      year: '2010',
      title: 'Company Founded',
      description: 'Started as a small cross-border transportation service with a vision to provide premium, reliable connections between Hong Kong and Mainland China.',
    },
    {
      year: '2013',
      title: 'Fleet Expansion',
      description: 'Expanded our fleet to include luxury vehicles and established partnerships with premium automotive brands.',
    },
    {
      year: '2016',
      title: 'Technology Integration',
      description: 'Launched real-time tracking system and mobile booking platform to enhance customer experience.',
    },
    {
      year: '2019',
      title: 'Corporate Solutions',
      description: 'Introduced dedicated corporate services and account management for business clients.',
    },
    {
      year: '2022',
      title: 'Tesla-Inspired Service',
      description: 'Adopted Tesla-inspired service excellence standards, focusing on precision, innovation, and customer satisfaction.',
    },
    {
      year: '2024',
      title: 'Market Leadership',
      description: 'Achieved recognition as a leading premium cross-border transportation provider in the Greater Bay Area.',
    },
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for perfection in every aspect of our service, from vehicle maintenance to customer interaction.',
      icon: '⭐',
    },
    {
      title: 'Reliability',
      description: 'Our clients depend on us for punctual, consistent service. We take this responsibility seriously.',
      icon: '🎯',
    },
    {
      title: 'Innovation',
      description: 'We continuously invest in technology and processes to improve our service and customer experience.',
      icon: '🚀',
    },
    {
      title: 'Integrity',
      description: 'Honest, transparent business practices and ethical treatment of all stakeholders.',
      icon: '🤝',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Company Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-charcoal mb-4">
              Our Story
            </h2>
            <p className="text-title-md text-gray-600">
              From humble beginnings to becoming a trusted leader in cross-border transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Story Content */}
            <div className="space-y-6">
              <p className="text-body-lg text-gray-700 leading-relaxed">
                Founded in {COMPANY.established}, CrossBorder Services began with a simple mission: 
                to provide reliable, professional transportation between Hong Kong and Mainland China 
                for business executives and discerning travelers.
              </p>
              
              <p className="text-body-lg text-gray-700 leading-relaxed">
                What started as a small operation with a handful of vehicles has grown into 
                a premium service provider with a fleet of {COMPANY.vehicles} vehicles, 
                serving thousands of clients across the Greater Bay Area.
              </p>
              
              <p className="text-body-lg text-gray-700 leading-relaxed">
                Today, we&apos;re proud to have completed over {COMPANY.completedTrips} successful 
                journeys, maintaining our commitment to excellence, reliability, and innovation 
                that has earned us the trust of our clients.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mt-8">
                <blockquote className="text-title-md text-charcoal font-medium italic">
                  &ldquo;Our vision is to be the Tesla of cross-border transportation &ndash; 
                  setting new standards for quality, innovation, and customer experience.&rdquo;
                </blockquote>
                <div className="text-body-md text-gray-600 mt-4">
                  — Founder & CEO
                </div>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="aspect-square bg-gradient-to-br from-chinese-red/10 to-electric-blue/10 rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🏢</div>
                  <div className="space-y-2">
                    <div className="text-title-lg font-bold text-charcoal">
                      Established {COMPANY.established}
                    </div>
                    <div className="text-body-md text-gray-600">
                      Building Trust Since Day One
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm"
                >
                  <div className="text-body-sm font-semibold text-charcoal">{COMPANY.vehicles}</div>
                  <div className="text-body-sm text-gray-600">Vehicles</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-4 right-4 bg-chinese-red text-white rounded-lg p-3 shadow-sm"
                >
                  <div className="text-body-sm font-semibold">{COMPANY.onTimeRate}</div>
                  <div className="text-body-sm opacity-90">On-Time</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-charcoal mb-4">
              Our Journey
            </h2>
            <p className="text-title-md text-gray-600">
              Key milestones in our evolution to become a premium service provider.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1 px-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-chinese-red text-white rounded-full flex items-center justify-center font-bold text-body-lg">
                          {milestone.year.slice(-2)}
                        </div>
                        <h3 className="text-title-md font-semibold text-charcoal">
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-body-md text-gray-600">
                        {milestone.description}
                      </p>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-chinese-red rounded-full border-4 border-white shadow-sm z-10"></div>
                  
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-charcoal mb-4">
              Our Values
            </h2>
            <p className="text-title-md text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                <Card variant="feature" className="text-center h-full">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-title-md font-semibold text-charcoal mb-3">
                    {value.title}
                  </h3>
                  <p className="text-body-md text-gray-600">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};