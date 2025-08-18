'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  startTransition,
  memo
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, USER_TYPE_INFO, LANGUAGES } from '@/lib/constants';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { locales } from '@/i18n';
import type { Locale } from '@/i18n';
import type { AuthUser } from '@/types/auth';
import { useAuth } from '@/lib/context/AuthContext';

// Memoized constants for performance

const HeaderComponent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract locale from pathname (more reliable than useLocale for Header component)
  const currentLocale = useMemo(() => {
    const segments = pathname.split('/');
    const pathLocale = segments[1];
    return locales.includes(pathLocale as Locale) ? (pathLocale as Locale) : 'en';
  }, [pathname]);

  // Real authentication state from AuthContext
  const { isAuthenticated, user, selectedRole, logout } = useAuth();

  // Handle scroll effect - disable when mobile menu is open
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobileMenuOpen) {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Enhanced scroll lock with no layout shift - handled by MobileMenu component
  // This ensures bulletproof scroll locking without header interference

  const toggleMobileMenu = useCallback(() => {
    startTransition(() => {
      setIsMobileMenuOpen(prev => !prev);
    });
  }, []);

  // Optimized language switching with next-intl
  const toggleLanguage = useCallback(() => {
    const locales = LANGUAGES.map(lang => lang.code);
    const currentIndex = locales.indexOf(currentLocale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];
    
    // Remove locale prefix from current pathname
    const segments = pathname.split('/');
    const pathnameWithoutLocale = segments.length > 2 ? `/${segments.slice(2).join('/')}` : '/';
    
    // Navigate to new locale
    router.push(`/${nextLocale}${pathnameWithoutLocale}`);
  }, [currentLocale, pathname, router]);

  // Memoized current language info
  const currentLanguageInfo = useMemo(() => 
    LANGUAGES.find(lang => lang.code === currentLocale) || LANGUAGES[0],
    [currentLocale]
  );

  const openAuthModal = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Get dashboard path based on user's selected role
  const getDashboardPath = useCallback((user: AuthUser, currentSelectedRole?: string | null) => {
    if (!user.roles || user.roles.length === 0) {
      return '/dashboard/client'; // default fallback
    }
    
    const role = currentSelectedRole || user.roles[0]?.role || 'CLIENT';
    const routes: Record<string, string> = {
      'CLIENT': '/dashboard/client',
      'DRIVER': '/dashboard/driver',
      'BLOG_EDITOR': '/dashboard/editor',
      'ADMIN': '/dashboard/admin',
    };
    
    return routes[role.toUpperCase()] || '/dashboard/client';
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 transition-all duration-300 z-50',
          // Solid header approach - no transparency issues
          isScrolled || isMobileMenuOpen
            ? 'bg-white shadow-sm border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-sm'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Wireframe Design with Pink Accent Dot */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center">
                  {/* Pink accent dot - matching wireframe */}
                  <div className="w-2 h-2 bg-[#FF69B4] rounded-full"></div>
                  <span className="ml-2 font-bold text-[#171A20] text-lg lg:text-xl">
                    CrossBorder
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {NAV_ITEMS.filter(item => 
                // Filter out Login when authenticated, show Dashboard instead
                !(isAuthenticated && item.href === '/login')
              ).map((item) => (
                <motion.div
                  key={item.href}
                  className="relative"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-3 py-2 rounded text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'text-[#FF69B4] bg-[#FFF0F5]'
                        : 'text-[#171A20] hover:text-[#FF69B4] hover:bg-[#FFF0F5]'
                    )}
                  >
                    {item.label}
                    {item.isNew && (
                      <span className="absolute -top-2 -right-2 bg-success-green text-white text-xs px-1 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              
              {/* Dashboard Link when authenticated */}
              {isAuthenticated && user && (
                <motion.div
                  className="relative"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={getDashboardPath(user, selectedRole)}
                    className={cn(
                      'relative px-3 py-2 rounded text-sm font-medium transition-all duration-200',
                      pathname.startsWith('/dashboard')
                        ? 'text-[#FF69B4] bg-[#FFF0F5]'
                        : 'text-[#171A20] hover:text-[#FF69B4] hover:bg-[#FFF0F5]'
                    )}
                  >
                    Dashboard
                  </Link>
                </motion.div>
              )}
            </nav>

            {/* Desktop Actions - Tesla-inspired Clean Design */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Language Toggle - Clean Tesla-inspired Design */}
              <motion.button
                onClick={toggleLanguage}
                className="px-3 py-2 border border-[#FF69B4] text-[#FF69B4] rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#FF69B4] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
                aria-label={`Switch language from ${currentLanguageInfo.label}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                EN
              </motion.button>


              {/* Authentication */}
              {isAuthenticated && user ? (
                <UserMenu user={user} selectedRole={selectedRole} onLogout={handleLogout} />
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-[#FF69B4] border border-[#FF69B4] rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#FF69B4] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 bg-[#FF69B4] text-white rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle - Tesla-inspired hamburger */}
            <motion.button
              type="button"
              onClick={toggleMobileMenu}
              className={cn(
                'lg:hidden p-3 rounded-lg transition-all duration-200 relative',
                'hover:bg-gray-100 active:scale-95',
                isMobileMenuOpen 
                  ? 'bg-gray-100 text-[#171A20]' 
                  : 'text-[#171A20] hover:text-[#FF69B4]'
              )}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-6 h-6 flex flex-col justify-center items-center"
                animate={isMobileMenuOpen ? 'open' : 'closed'}
              >
                <motion.span
                  className="w-6 h-0.5 bg-current block rounded-full"
                  variants={{
                    closed: { 
                      rotate: 0, 
                      y: 0,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    },
                    open: { 
                      rotate: 45, 
                      y: 2,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    }
                  }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-current block mt-1.5 rounded-full"
                  variants={{
                    closed: { 
                      opacity: 1,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    },
                    open: { 
                      opacity: 0,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    }
                  }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-current block mt-1.5 rounded-full"
                  variants={{
                    closed: { 
                      rotate: 0, 
                      y: 0,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    },
                    open: { 
                      rotate: -45, 
                      y: -10,
                      transition: { type: 'spring', stiffness: 260, damping: 20 }
                    }
                  }}
                />
              </motion.div>
              {/* Tesla-style haptic feedback indicator */}
              {isMobileMenuOpen && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-[#FF69B4]/10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentLang={currentLocale}
          onLanguageToggle={toggleLanguage}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={() => openAuthModal('login')}
          onRegister={() => openAuthModal('register')}
          onLogout={handleLogout}
        />
      </motion.header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={closeAuthModal}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        onSuccess={() => {
          closeAuthModal();
        }}
      />
    </>
  );
};

// Memoized component for performance
export const Header = memo(HeaderComponent);