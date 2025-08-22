import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/context/AuthContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { ClientSessionProvider } from '@/components/providers/SessionProvider';
import { RoleAssigner } from '@/components/dev/RoleAssigner';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return (
    <div lang={locale}>
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
    </div>
  );
}