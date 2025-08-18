'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CONTACT } from '@/lib/constants';

export const ContactCTASection: React.FC = () => {
  const contactMethods = [
    {
      icon: '📞',
      title: 'Call',
      subtitle: 'Speak with our team',
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone}`,
      description: 'Immediate assistance available',
    },
    {
      icon: '💬',
      title: 'WeChat',
      subtitle: 'Scan QR Code',
      value: CONTACT.wechat,
      href: '#wechat',
      description: 'Preferred for Chinese customers',
    },
    {
      icon: '📧',
      title: 'Email',
      subtitle: 'Send us a message',
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      description: '24h response guarantee',
    },
  ];

  return (
    <section className="py-20 bg-charcoal text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(0,102,204,0.2),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-display-sm font-bold mb-4">
            Ready to Book Your Journey?
          </h2>
          <p className="text-title-md text-gray-300 max-w-3xl mx-auto">
            Contact our professional team to arrange your premium cross-border transportation. 
            Available 24/7 for your convenience.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="block group"
            >
              <div className="bg-gray-800 rounded-lg p-6 text-center h-full transition-all duration-300 group-hover:bg-gray-700 group-hover:shadow-lg">
                <div className="text-4xl mb-4">
                  {method.icon}
                </div>
                <h3 className="text-title-md font-semibold mb-2 group-hover:text-chinese-red transition-colors duration-300">
                  {method.title}
                </h3>
                <p className="text-body-md text-gray-300 mb-3">
                  {method.subtitle}
                </p>
                <div className="text-body-lg font-medium text-white mb-2">
                  {method.value}
                </div>
                <p className="text-body-sm text-gray-400">
                  {method.description}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Quick Booking CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-chinese-red to-red-600 rounded-lg p-8 lg:p-12 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-headline-md font-bold mb-4">
              Need Immediate Service?
            </h3>
            <p className="text-body-lg mb-8 opacity-95">
              Get an instant quote and book your premium cross-border transfer in minutes. 
              Our professional team is standing by to serve you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-chinese-red border-white hover:bg-gray-100"
              >
                Get Quote Now
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                Call +852-2234-5678
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Business Hours */}
          <div className="text-center md:text-left">
            <h4 className="text-body-lg font-semibold mb-4">Business Hours</h4>
            <div className="space-y-2 text-body-md text-gray-300">
              <div className="flex justify-between md:justify-start md:gap-8">
                <span>Monday - Friday:</span>
                <span>24/7 Available</span>
              </div>
              <div className="flex justify-between md:justify-start md:gap-8">
                <span>Weekend:</span>
                <span>24/7 Available</span>
              </div>
              <div className="flex justify-between md:justify-start md:gap-8">
                <span>Holidays:</span>
                <span>24/7 Available</span>
              </div>
            </div>
          </div>

          {/* Office Location */}
          <div className="text-center md:text-left">
            <h4 className="text-body-lg font-semibold mb-4">Office Location</h4>
            <div className="text-body-md text-gray-300 leading-relaxed">
              <p>{CONTACT.address}</p>
              <p className="mt-2 text-body-sm text-gray-400">
                Conveniently located in Central Hong Kong
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center text-body-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>Licensed Cross-Border Operator</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>Fully Insured & Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>Professional Chauffeurs</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};