import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/HeroSection';
import { TrustBarSection } from '@/components/sections/TrustBarSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { ServiceDetailSection } from '@/components/sections/ServiceDetailSection';
import { ServiceFeaturesSection } from '@/components/sections/ServiceFeaturesSection';
import { RouteShowcaseSection } from '@/components/sections/RouteShowcaseSection';
import { FleetShowcaseSection } from '@/components/sections/FleetShowcaseSection';
import { BookingFlowSection } from '@/components/sections/BookingFlowSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ContactCTASection } from '@/components/sections/ContactCTASection';

export const metadata: Metadata = {
  title: 'Premium Cross-Border Vehicle Services | Hong Kong & China | CrossBorder',
  description: 'Professional cross-border transportation between Hong Kong and Mainland China. Complete service overview, premium fleet, interactive booking, and expert insights. Tesla-inspired luxury for business executives.',
  keywords: [
    'cross-border vehicle services',
    'Hong Kong China transport',
    'premium car service Hong Kong',
    'business transfer services',
    'executive transportation',
    'airport transfer Hong Kong China',
    'Shenzhen Guangzhou transport',
    'professional chauffeur service',
    'luxury vehicle fleet',
    'corporate transportation',
    'interactive booking system',
  ],
  openGraph: {
    title: 'Premium Cross-Border Vehicle Services | Hong Kong & China',
    description: 'Professional transportation between Hong Kong and Mainland China with Tesla-inspired premium service.',
    url: 'https://crossborder-services.com',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Premium Cross-Border Vehicle Services',
      },
    ],
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Bar Section */}
      <TrustBarSection />

      {/* Services Overview Section */}
      <ServicesSection />

      {/* Service Details Section - Migrated from Services page */}
      <ServiceDetailSection />

      {/* Service Features Section - Migrated from Services page */}
      <ServiceFeaturesSection />

      {/* Route Showcase Section */}
      <RouteShowcaseSection />

      {/* Fleet Showcase Section */}
      <FleetShowcaseSection />

      {/* Booking Flow Section - Migrated from Services page */}
      <BookingFlowSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact CTA Section */}
      <ContactCTASection />
    </>
  );
}