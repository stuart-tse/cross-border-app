'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/constants';
import { Card } from '@/components/ui/Card';

export const TestimonialsSection: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Auto-advance testimonials
  React.useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

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
            What Our Clients Say
          </h2>
          <p className="text-title-md text-gray-600 max-w-3xl mx-auto">
            Trusted by business executives and discerning travelers across the Greater Bay Area.
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8 lg:p-12 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-chinese-red/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-electric-blue/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6,  }}
                  className="text-center"
                >
                  {/* Quote Icon */}
                  <div className="text-6xl text-chinese-red/20 mb-6">
                    &ldquo;
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-title-md text-charcoal mb-8 leading-relaxed">
                    {TESTIMONIALS[activeTestimonial].content}
                  </blockquote>

                  {/* Rating */}
                  <div className="flex justify-center mb-6">
                    {renderStars(TESTIMONIALS[activeTestimonial].rating)}
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <div className="text-body-lg font-semibold text-charcoal">
                      {TESTIMONIALS[activeTestimonial].name}
                    </div>
                    <div className="text-body-md text-gray-600">
                      {TESTIMONIALS[activeTestimonial].role}
                    </div>
                    <div className="text-body-sm text-chinese-red">
                      {TESTIMONIALS[activeTestimonial].company}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-center mt-12 space-x-6">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-chinese-red hover:text-chinese-red transition-colors duration-200"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="flex space-x-2">
                  {TESTIMONIALS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === activeTestimonial ? 'bg-chinese-red' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-chinese-red hover:text-chinese-red transition-colors duration-200"
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Review Platform Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { platform: 'Google', rating: '4.8/5.0', reviews: '150+ reviews' },
            { platform: 'TripAdvisor', rating: '4.9/5.0', reviews: '89 reviews' },
            { platform: 'Yelp', rating: '4.7/5.0', reviews: '203 reviews' },
            { platform: 'WeChat', rating: '98% Positive', reviews: '500+ ratings' },
          ].map((review, index) => (
            <motion.div
              key={review.platform}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-body-md font-semibold text-charcoal mb-1">
                {review.platform}
              </div>
              <div className="text-title-sm font-bold text-chinese-red mb-1">
                {review.rating}
              </div>
              <div className="text-body-sm text-gray-600">
                {review.reviews}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-body-lg text-gray-600 mb-6">
            Join hundreds of satisfied customers who trust us with their cross-border travel needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-primary text-white rounded-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
            >
              Book Your Journey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 border border-primary text-primary rounded-sm font-semibold hover:bg-light-gray transition-colors duration-200"
            >
              Read All Reviews
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};