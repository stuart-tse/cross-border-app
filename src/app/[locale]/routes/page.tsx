import type { Metadata } from 'next';
import { RoutesMapSection } from '@/components/sections/RoutesMapSection';
import { RouteDetailsSection } from '@/components/sections/RouteDetailsSection';
import { BorderGuideSection } from '@/components/sections/BorderGuideSection';

export const metadata: Metadata = {
  title: 'Cross-Border Routes | Hong Kong to China Transportation',
  description: 'Explore our cross-border routes between Hong Kong and Mainland China. View travel times, border crossing information, and book your premium transportation service.',
  keywords: [
    'Hong Kong China routes',
    'cross-border transportation',
    'Hong Kong Shenzhen route',
    'Hong Kong Guangzhou route',
    'border crossing guide',
    'travel times',
    'route planning',
  ],
  openGraph: {
    title: 'Cross-Border Routes | Hong Kong to China Transportation',
    description: 'Professional cross-border routes with detailed travel information and booking options.',
    url: 'https://crossborder-services.com/routes',
    images: [
      {
        url: '/og-routes.jpg',
        width: 1200,
        height: 630,
        alt: 'Cross-Border Routes Map',
      },
    ],
  },
};

export default function RoutesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-electric-blue to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <nav className="text-body-sm text-blue-200 mb-4">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span className="text-white font-medium">Routes</span>
            </nav>
            
            <h1 className="text-display-md font-bold mb-6">
              Cross-Border <span className="text-chinese-red">Routes</span>
            </h1>
            
            <p className="text-title-md text-blue-100 leading-relaxed">
              Discover our comprehensive network of cross-border routes connecting 
              Hong Kong with major destinations in Mainland China.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Routes Map */}
      <RoutesMapSection />

      {/* Route Details */}
      <RouteDetailsSection />

      {/* Border Crossing Guide */}
      <BorderGuideSection />
    </>
  );
}