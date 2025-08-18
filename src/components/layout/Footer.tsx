'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COMPANY, CONTACT } from '@/lib/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Services',
      links: [
        { label: 'Cross-Border Transfers', href: '/services' },
        { label: 'Corporate Solutions', href: '/services#corporate' },
        { label: 'Airport Services', href: '/services#airport' },
        { label: 'Logistics Support', href: '/services#logistics' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Our Routes', href: '/routes' },
        { label: 'Safety Standards', href: '/about#safety' },
        { label: 'Careers', href: '/about#careers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/support/faq' },
        { label: 'Terms of Service', href: '/legal/terms' },
        { label: 'Privacy Policy', href: '/legal/privacy' },
      ],
    },
  ];

  const socialLinks = [
    {
      label: 'WeChat',
      icon: '💬',
      href: '#',
      ariaLabel: 'Follow us on WeChat',
    },
    {
      label: 'WhatsApp',
      icon: '📱',
      href: `https://wa.me/${CONTACT.whatsapp?.replace(/[^\d]/g, '')}`,
      ariaLabel: 'Contact us on WhatsApp',
    },
    {
      label: 'Email',
      icon: '📧',
      href: `mailto:${CONTACT.email}`,
      ariaLabel: 'Send us an email',
    },
    {
      label: 'Phone',
      icon: '📞',
      href: `tel:${CONTACT.phone}`,
      ariaLabel: 'Call us',
    },
  ];

  return (
    <footer
      className="bg-charcoal text-white"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center font-bold text-title-lg hover:text-chinese-red transition-colors duration-fast mb-4"
            >
              <span className="text-chinese-red mr-1">●</span>
              CrossBorder
            </Link>
            
            <p className="text-body-md text-gray-300 mb-6 leading-relaxed">
              {COMPANY.description}
            </p>

            <div className="space-y-2 text-body-sm text-gray-400">
              <p>Licensed Cross-Border Operator</p>
              <p>Established {COMPANY.established}</p>
              <p>{COMPANY.support} Professional Service</p>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-body-lg mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-gray-300 hover:text-white hover:text-chinese-red transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact & Social Links */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            {/* Contact Information */}
            <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
              <div>
                <h4 className="font-semibold text-body-md mb-2">Get in Touch</h4>
                <div className="space-y-1 text-body-sm text-gray-300">
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="block hover:text-chinese-red transition-colors duration-fast"
                  >
                    {CONTACT.phone}
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="block hover:text-chinese-red transition-colors duration-fast"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-body-md mb-2">Office</h4>
                <p className="text-body-sm text-gray-300 max-w-xs leading-relaxed">
                  {CONTACT.address}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-body-md mb-3">Connect With Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex items-center justify-center w-10 h-10 rounded-sm bg-gray-700 hover:bg-chinese-red transition-all duration-fast hover:scale-105"
                    aria-label={social.ariaLabel}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="border-t border-gray-700 pt-8 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center text-body-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>{COMPANY.completedTrips} Trips Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>{COMPANY.onTimeRate} On-Time Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-green rounded-full"></span>
              <span>{COMPANY.support} Service Available</span>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-body-sm text-gray-400">
              © {currentYear} {COMPANY.name}. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-body-sm">
              <Link
                href="/legal/privacy"
                className="text-gray-400 hover:text-chinese-red transition-colors duration-fast"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/terms"
                className="text-gray-400 hover:text-chinese-red transition-colors duration-fast"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/cookies"
                className="text-gray-400 hover:text-chinese-red transition-colors duration-fast"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};