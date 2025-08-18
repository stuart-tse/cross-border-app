'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TRUST_INDICATORS } from '@/lib/constants';

export const TrustBarSection: React.FC = () => {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const getIcon = (iconName: string) => {
    const icons = {
      calendar: '📅',
      'check-circle': '✅',
      clock: '🕐',
      headphones: '🎧',
    };
    return icons[iconName as keyof typeof icons] || '●';
  };

  return (
    <section className="py-16 bg-light-gray border-b border-gray-200">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {TRUST_INDICATORS.map((indicator, index) => (
            <motion.div
              key={indicator.label}
              variants={itemVariants}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-3"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <span className="text-2xl">{getIcon(indicator.icon)}</span>
                </div>

                {/* Number/Label */}
                <div className="space-y-1">
                  <div className="text-title-lg font-bold text-charcoal group-hover:text-chinese-red transition-colors duration-300">
                    {indicator.label}
                  </div>
                  <div className="text-body-md text-gray-600 font-medium">
                    {indicator.description}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by businesses and individuals for reliable, professional cross-border transportation services.
          </p>
        </motion.div>
      </div>
    </section>
  );
};