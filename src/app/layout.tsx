import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/context/AuthContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { ClientSessionProvider } from '@/components/providers/SessionProvider';
import { RoleAssigner } from '@/components/dev/RoleAssigner';
import '@/styles/globals.css';

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://crossborder-services.com'),
  title: {
    default: 'CrossBorder Services - Premium Cross-Border Vehicle Services',
    template: '%s | CrossBorder Services',
  },
  description: 'Professional, reliable, and seamless transportation between Hong Kong and Mainland China. Premium cross-border vehicle services for business executives and discerning travelers.',
  keywords: [
    'cross-border vehicle services',
    'Hong Kong China transport',
    'premium car service',
    'business transfer services',
    'airport transfer Hong Kong',
    'executive transportation',
    'Shenzhen Guangzhou transport',
  ],
  authors: [{ name: 'CrossBorder Services' }],
  creator: 'CrossBorder Services',
  publisher: 'CrossBorder Services',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_HK',
    alternateLocale: 'zh_HK',
    url: 'https://crossborder-services.com',
    siteName: 'CrossBorder Services',
    title: 'Premium Cross-Border Vehicle Services | Hong Kong & China',
    description: 'Professional transportation between Hong Kong and Mainland China. Tesla-inspired premium service for business executives.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CrossBorder Services - Premium Vehicle Transport',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Cross-Border Vehicle Services',
    description: 'Professional transportation between Hong Kong and Mainland China',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-site-verification',
  },
  alternates: {
    canonical: 'https://crossborder-services.com',
    languages: {
      'en-HK': 'https://crossborder-services.com/en',
      'zh-HK': 'https://crossborder-services.com/zh',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Additional meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CrossBorder Services',
              description: 'Premium cross-border vehicle services between Hong Kong and Mainland China',
              url: 'https://crossborder-services.com',
              logo: 'https://crossborder-services.com/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+852-2234-5678',
                contactType: 'customer service',
                areaServed: ['HK', 'CN'],
                availableLanguage: ['English', 'Chinese'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Suite 1588, Central Tower, 28 Queen\'s Road Central',
                addressLocality: 'Hong Kong',
                addressCountry: 'HK',
              },
              sameAs: [
                'https://www.wechat.com/crossborderhk',
              ],
            }),
          }}
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        {/* Skip links for accessibility */}
        <a
          href="#main-content"
          className="skip-link focus:top-6 focus:left-6 absolute bg-primary text-white px-4 py-2 rounded-sm z-[9999]"
        >
          Skip to main content
        </a>
        <a
          href="#main-navigation"
          className="skip-link focus:top-6 focus:left-32 absolute bg-primary text-white px-4 py-2 rounded-sm z-[9999]"
        >
          Skip to navigation
        </a>

        {/* Global Providers */}
        <NotificationProvider>
          <ClientSessionProvider>
            <AuthProvider>
              {/* Header */}
              <Header />

              {/* Main Content */}
              <main id="main-content" className="pt-16">
                {children}
              </main>

              {/* Development tools */}
              <RoleAssigner />
            </AuthProvider>
          </ClientSessionProvider>
        </NotificationProvider>

        {/* Footer */}
        <Footer />

        {/* Performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Basic performance monitoring
              window.addEventListener('load', function() {
                if ('performance' in window) {
                  const perfData = performance.getEntriesByType('navigation')[0];
                  if (perfData) {
                    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
                  }
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}