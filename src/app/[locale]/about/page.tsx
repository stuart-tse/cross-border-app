import type { Metadata } from 'next';
import { CompanyStorySection } from '@/components/sections/CompanyStorySection';
import { SafetyCertificationsSection } from '@/components/sections/SafetyCertificationsSection';
import { TeamSection } from '@/components/sections/TeamSection';

export const metadata: Metadata = {
  title: 'About Us | Professional Cross-Border Transportation Leaders',
  description: 'Learn about our company story, safety certifications, and professional team. Trusted cross-border vehicle services between Hong Kong and Mainland China since 2010.',
  keywords: [
    'about cross-border services',
    'company story Hong Kong',
    'transportation company',
    'professional team',
    'safety certifications',
    'licensed operators',
    'cross-border expertise',
  ],
  openGraph: {
    title: 'About Us | Professional Cross-Border Transportation Leaders',
    description: 'Trusted cross-border vehicle services with professional team and safety certifications.',
    url: 'https://crossborder-services.com/about',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About CrossBorder Services',
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-charcoal to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <nav className="text-body-sm text-gray-400 mb-4">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span className="text-white font-medium">About</span>
            </nav>
            
            <h1 className="text-display-md font-bold mb-6">
              About <span className="text-chinese-red">CrossBorder Services</span>
            </h1>
            
            <p className="text-title-md text-gray-300 leading-relaxed">
              Your trusted partner for premium cross-border transportation 
              between Hong Kong and Mainland China since 2010.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <CompanyStorySection />

      {/* Safety & Certifications */}
      <SafetyCertificationsSection />

      {/* Team */}
      <TeamSection />
    </>
  );
}