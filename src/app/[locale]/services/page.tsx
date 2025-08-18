import type { Metadata } from 'next';
import { ServiceDetailSection } from '@/components/sections/ServiceDetailSection';
import { VehicleFleetSection } from '@/components/sections/VehicleFleetSection';
import { BookingFlowSection } from '@/components/sections/BookingFlowSection';
import { ServiceFeaturesSection } from '@/components/sections/ServiceFeaturesSection';

export const metadata: Metadata = {
  title: 'Premium Cross-Border Services | Vehicle Fleet & Booking',
  description: 'Explore our comprehensive cross-border vehicle services, premium fleet, and easy booking process. Professional transportation between Hong Kong and Mainland China.',
  keywords: [
    'cross-border vehicle services',
    'vehicle fleet Hong Kong',
    'premium car service',
    'corporate transportation',
    'executive vehicles',
    'luxury car rental',
    'business class vehicles',
  ],
  openGraph: {
    title: 'Premium Cross-Border Services | Vehicle Fleet & Booking',
    description: 'Professional cross-border transportation with premium vehicles and exceptional service.',
    url: 'https://crossborder-services.com/services',
    images: [
      {
        url: '/og-services.jpg',
        width: 1200,
        height: 630,
        alt: 'Premium Cross-Border Vehicle Services',
      },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <nav className="text-body-sm text-gray-500 mb-4">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span className="text-charcoal font-medium">Services</span>
            </nav>
            
            <h1 className="text-display-md font-bold text-charcoal mb-6">
              Professional Cross-Border
              <br />
              <span className="text-chinese-red">Vehicle Services</span>
            </h1>
            
            <p className="text-title-md text-gray-600 leading-relaxed">
              Reliable, professional, and premium transportation solutions
              between Hong Kong and Mainland China
            </p>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <ServiceDetailSection />

      {/* Vehicle Fleet */}
      <VehicleFleetSection />

      {/* Service Features */}
      <ServiceFeaturesSection />

      {/* Booking Flow */}
      <BookingFlowSection />
    </>
  );
}