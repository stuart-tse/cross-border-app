import type { Metadata } from 'next';
import { ContactFormSection } from '@/components/sections/ContactFormSection';
import { ContactInfoSection } from '@/components/sections/ContactInfoSection';

export const metadata: Metadata = {
  title: 'Contact Us | Get Quote & Book Premium Cross-Border Service',
  description: 'Contact our professional team for premium cross-border vehicle services. Get instant quotes, book your journey, or speak with our customer service representatives.',
  keywords: [
    'contact cross-border services',
    'get quote Hong Kong China',
    'book premium transport',
    'customer service',
    'phone booking',
    'WeChat contact',
    '24/7 support',
  ],
  openGraph: {
    title: 'Contact Us | Get Quote & Book Premium Cross-Border Service',
    description: 'Contact our professional team for instant quotes and booking assistance.',
    url: 'https://crossborder-services.com/contact',
    images: [
      {
        url: '/og-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact CrossBorder Services',
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <nav className="text-body-sm text-gray-500 mb-4">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span className="text-charcoal font-medium">Contact</span>
            </nav>
            
            <h1 className="text-display-md font-bold text-charcoal mb-6">
              Get in <span className="text-chinese-red">Touch</span>
            </h1>
            
            <p className="text-title-md text-gray-600 leading-relaxed">
              Ready to experience premium cross-border transportation? 
              Contact our professional team for instant quotes and booking assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <ContactInfoSection />

      {/* Contact Form */}
      <ContactFormSection />
    </>
  );
}