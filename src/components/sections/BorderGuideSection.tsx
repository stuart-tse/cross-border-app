'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

export const BorderGuideSection: React.FC = () => {
  const guideSteps = [
    {
      step: 1,
      title: 'Document Preparation',
      description: 'Ensure you have all required documents ready before departure.',
      details: [
        'Valid passport or travel document',
        'Valid visa or entry permit for China',
        'Health declaration (if required)',
        'Travel purpose documentation',
      ],
      icon: '📋',
    },
    {
      step: 2,
      title: 'Pre-Departure Check',
      description: 'Our driver will verify documents and provide border crossing briefing.',
      details: [
        'Document verification with driver',
        'Border crossing briefing',
        'Estimated crossing time',
        'Emergency contact information',
      ],
      icon: '✅',
    },
    {
      step: 3,
      title: 'Border Crossing',
      description: 'Professional assistance through Hong Kong and China immigration.',
      details: [
        'Hong Kong immigration clearance',
        'Vehicle and passenger inspection',
        'China customs declaration',
        'Immigration stamp and entry',
      ],
      icon: '🚪',
    },
    {
      step: 4,
      title: 'Arrival Confirmation',
      description: 'Safe arrival notification and final destination delivery.',
      details: [
        'Successful border crossing confirmation',
        'Arrival time notification',
        'Destination delivery',
        'Service completion report',
      ],
      icon: '🎯',
    },
  ];

  const practicalTips = [
    {
      category: 'Best Times to Cross',
      tips: [
        'Weekday mornings (8-10 AM) typically faster',
        'Avoid Friday evenings and Sunday afternoons',
        'Chinese holidays may cause delays',
        'Off-peak times: 10 AM - 4 PM, 8 PM - 12 AM',
      ],
      icon: '⏰',
    },
    {
      category: 'Required Documents',
      tips: [
        'Passport valid for at least 6 months',
        'China visa or entry permit',
        'Health code (if applicable)',
        'Travel insurance (recommended)',
      ],
      icon: '📄',
    },
    {
      category: 'What to Expect',
      tips: [
        'Standard crossing: 15-30 minutes',
        'Peak times may take 45-60 minutes',
        'Random vehicle inspections possible',
        'Customs declaration may be required',
      ],
      icon: '🔍',
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
            Border Crossing Guide
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Navigate cross-border procedures with confidence. Our comprehensive guide 
            and professional assistance ensure a smooth border crossing experience.
          </p>
        </motion.div>

        {/* Step-by-Step Process */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {guideSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                <Card className="p-6 text-center h-full relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-chinese-red text-white rounded-full flex items-center justify-center font-bold text-body-md">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4 mt-4">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-body-lg font-semibold text-charcoal mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-body-md text-gray-600 mb-4">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-2 text-left">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-body-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-electric-blue rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Practical Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-headline-md font-bold text-charcoal mb-4">
              Practical Tips & Information
            </h3>
            <p className="text-body-lg text-gray-600">
              Essential information to help you prepare for your cross-border journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {practicalTips.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="text-body-lg font-semibold text-charcoal">
                      {category.category}
                    </h4>
                  </div>

                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start text-body-sm text-gray-700">
                        <span className="w-4 h-4 bg-success-green rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">•</span>
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-charcoal text-white rounded-lg p-8 lg:p-12 text-center"
        >
          <h3 className="text-headline-md font-bold mb-4">
            Need Border Crossing Assistance?
          </h3>
          <p className="text-body-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our experienced team provides professional guidance and assistance throughout 
            the entire border crossing process. Contact us for personalized support.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '📞', title: '24/7 Hotline', subtitle: '+852-2234-5678' },
              { icon: '💬', title: 'WeChat Support', subtitle: 'CrossBorderHK' },
              { icon: '📧', title: 'Email Assistance', subtitle: 'support@crossborder.com' },
            ].map((contact, index) => (
              <div key={contact.title} className="text-center">
                <div className="text-3xl mb-2">{contact.icon}</div>
                <div className="text-body-md font-semibold mb-1">{contact.title}</div>
                <div className="text-body-sm opacity-75">{contact.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="text-body-sm opacity-75">
            Our support team speaks English, Cantonese, and Mandarin
          </div>
        </motion.div>
      </div>
    </section>
  );
};