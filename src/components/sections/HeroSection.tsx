'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.02)_25%,rgba(0,0,0,.02)_50%,transparent_50%,transparent_75%,rgba(0,0,0,.02)_75%,rgba(0,0,0,.02))] bg-[length:60px_60px] opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.0, 0.0, 0.2, 1] }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-chinese-red/10 text-chinese-red rounded-full text-body-sm font-medium"
            >
              <span className="w-2 h-2 bg-chinese-red rounded-full animate-pulse" />
              Licensed Cross-Border Operator
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-display-lg md:text-display-lg font-bold text-charcoal leading-tight"
              >
                Premium Cross-Border
                <br />
                <span className="text-chinese-red">Vehicle Services</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-title-md text-gray-600 font-light"
              >
                Between Hong Kong & Mainland China
              </motion.p>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-headline-sm font-light text-gray-700 tracking-wider"
            >
              Professional. Reliable. Seamless.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-4"
              >
                Book Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-4"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="space-y-3 pt-4"
            >
              {[
                'Licensed Cross-Border Operators',
                '24/7 Professional Service',
                'Real-Time Tracking & Updates',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                  className="flex items-center gap-3 text-body-lg text-gray-700"
                >
                  <span className="w-5 h-5 bg-success-green rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </span>
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.0, 0.0, 0.2, 1] }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: [0.0, 0.0, 0.2, 1] }}
                className="w-full h-full"
              >
                {/* Placeholder for hero image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-chinese-red rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white text-2xl">🚗</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-body-md font-medium text-gray-600">
                        Tesla-Style Luxury Vehicle
                      </div>
                      <div className="text-body-sm text-gray-500">
                        Professional Cross-Border Service
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success-green rounded-full animate-pulse" />
                  <div>
                    <div className="text-body-sm font-semibold text-charcoal">
                      Ready to Serve
                    </div>
                    <div className="text-body-sm text-gray-600">
                      24/7 Available
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-chinese-red/10 rounded-full flex items-center justify-center"
            >
              <span className="text-chinese-red text-xl">→</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: 10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center"
            >
              <span className="text-electric-blue text-lg">○</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0.0, 0.2, 1] }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-body-sm">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0.0, 0.2, 1] }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};