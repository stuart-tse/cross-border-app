'use client';

import React, { 
  useEffect, 
  useCallback, 
  memo, 
  useRef, 
  useState,
  useMemo,
  startTransition
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Optimized imports for bundle size - only import what we need
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  type PanInfo 
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, USER_TYPE_INFO, LANGUAGES } from '@/lib/constants';
import type { AuthUser } from '@/types/auth';
import type { NavItem } from '@/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onLanguageToggle: () => void;
  isAuthenticated: boolean;
  user: AuthUser | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

// Performance constants - moved outside component to prevent recreation
const DRAG_CONSTRAINTS = { left: 0, right: 320 } as const;
const DRAG_ELASTIC = 0.2;
const SWIPE_CLOSE_THRESHOLD = 150;
const SWIPE_VELOCITY_THRESHOLD = 500;
const FOCUS_TIMEOUT = 100;
const BACKDROP_OPACITY_RANGE: [number, number] = [0.75, 0];
const MENU_TRANSLATE_RANGE: [number, number] = [0, 320];

// Tesla-inspired spring configurations - optimized for 60fps
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
  mass: 0.8, // Lighter feel for mobile
  restDelta: 0.01, // Prevent micro-animations
} as const;

const BOUNCE_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.6,
  restDelta: 0.01,
} as const;

// GPU-accelerated transform configurations
const TRANSFORM_CONFIG = {
  enableHardwareAcceleration: true,
  layoutScroll: false, // Prevent layout thrashing
} as const;

const MobileMenuComponent: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageToggle,
  isAuthenticated,
  user,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // Transform for swipe-to-close resistance - memoized for performance
  const backgroundOpacity = useTransform(
    dragX, 
    MENU_TRANSLATE_RANGE, 
    BACKDROP_OPACITY_RANGE
  );
  const menuTranslateX = useTransform(
    dragX, 
    MENU_TRANSLATE_RANGE, 
    MENU_TRANSLATE_RANGE
  );

  // Bulletproof scroll lock with no layout shift - optimized for performance
  useEffect(() => {
    if (!isOpen) return;

    // Batch DOM reads to prevent layout thrashing
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPaddingRight = originalStyle.paddingRight;
    
    // Calculate scrollbar width efficiently
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Use requestAnimationFrame for smooth style changes
    const applyScrollLock = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    };
    
    requestAnimationFrame(applyScrollLock);
    
    // Optimized touch event handler with improved iOS handling
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const menu = menuRef.current;
      const content = contentRef.current;
      
      // Early return for performance
      if (!menu || !target) {
        e.preventDefault();
        return;
      }
      
      // Allow scrolling within menu content only
      if (content && (menu.contains(target) || content.contains(target))) {
        const isScrollable = content.scrollHeight > content.clientHeight;
        const isAtTop = content.scrollTop === 0;
        const isAtBottom = content.scrollTop >= content.scrollHeight - content.clientHeight;
        
        // Prevent overscroll bounce on iOS
        if (!isScrollable || 
            (isAtTop && e.touches[0].clientY > e.changedTouches[0].clientY) ||
            (isAtBottom && e.touches[0].clientY < e.changedTouches[0].clientY)) {
          e.preventDefault();
        }
        return;
      }
      
      e.preventDefault();
    };
    
    // Use passive: false only where needed for better performance
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('wheel', preventTouchMove, { passive: false });
    
    return () => {
      // Restore original state efficiently
      requestAnimationFrame(() => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.documentElement.style.overflow = '';
      });
      
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('wheel', preventTouchMove);
    };
  }, [isOpen]);

  // Enhanced escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, onClose]);

  // Focus trap implementation
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Tab') {
      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }, [isOpen]);

  // Event listeners setup
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
      
      // Auto-focus first focusable element with requestAnimationFrame
      const focusFirstElement = () => {
        const firstFocusable = menuRef.current?.querySelector(
          'button:not([disabled]), a[href]:not([disabled])'
        ) as HTMLElement;
        firstFocusable?.focus();
      };
      
      // Use setTimeout with RAF for better performance
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(focusFirstElement);
      }, FOCUS_TIMEOUT);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleFocusTrap);
      };

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [isOpen, handleEscape, handleFocusTrap]);

  // Optimized swipe gesture handlers with React 19 concurrent features
  const handleDragStart = useCallback(() => {
    startTransition(() => {
      setIsDragging(true);
    });
  }, []);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    startTransition(() => {
      setIsDragging(false);
    });
    
    // Enhanced gesture detection with better thresholds
    const shouldClose = (
      info.offset.x > SWIPE_CLOSE_THRESHOLD || 
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    );
    
    if (shouldClose) {
      onClose();
    } else {
      // Smooth snap back with optimized spring
      dragX.set(0);
    }
  }, [onClose, dragX]);

  // Tesla-inspired animation variants - memoized for performance
  const animationVariants = useMemo(() => ({
    backdrop: {
      hidden: { 
        opacity: 0,
        transition: { duration: 0.2 }
      },
      visible: { 
        opacity: 0.75,
        transition: { duration: 0.3 }
      }
    },
    menu: {
      hidden: { 
        x: '100%',
        transition: { 
          type: 'spring' as const,
          stiffness: 300,
          damping: 30,
          restDelta: 0.01
        }
      },
      visible: { 
        x: 0,
        transition: SPRING_CONFIG
      }
    },
    content: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
          when: 'beforeChildren'
        }
      }
    },
    item: {
      hidden: { 
        x: 30, 
        opacity: 0
      },
      visible: { 
        x: 0, 
        opacity: 1,
        transition: BOUNCE_CONFIG
      }
    }
  }), []);

  // Memoized language calculations for performance
  const languageInfo = useMemo(() => {
    const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang);
    const nextLanguageIndex = LANGUAGES.findIndex(lang => lang.code === currentLang);
    const nextLanguage = LANGUAGES[(nextLanguageIndex + 1) % LANGUAGES.length];
    
    return { currentLanguage, nextLanguage };
  }, [currentLang]);
  
  const { currentLanguage, nextLanguage } = languageInfo;

  // Get dashboard path based on user's primary role
  const getDashboardPath = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) {
      return '/dashboard/client'; // default fallback
    }
    
    const primaryRole = user.roles[0]?.role || 'CLIENT';
    const routes: Record<string, string> = {
      'CLIENT': '/dashboard/client',
      'DRIVER': '/dashboard/driver',
      'BLOG_EDITOR': '/dashboard/editor',
      'ADMIN': '/dashboard/admin',
    };
    
    return routes[primaryRole.toUpperCase()] || '/dashboard/client';
  }, [user?.roles]);

  // Create navigation items including dashboard when authenticated
  const navigationItems = useMemo(() => {
    const baseItems = NAV_ITEMS.filter(item => 
      // Filter out Login when authenticated
      !(isAuthenticated && item.href === '/login')
    );
    
    // Add dashboard link when authenticated
    if (isAuthenticated && user) {
      const dashboardItem: NavItem = {
        label: 'Dashboard',
        href: getDashboardPath,
        description: 'Manage your account and activities',
        highlight: false,
        isNew: false
      };
      
      // Insert dashboard after Home, before other items
      return [baseItems[0], dashboardItem, ...baseItems.slice(1)];
    }
    
    return baseItems;
  }, [isAuthenticated, user, getDashboardPath]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden"
            variants={animationVariants.backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ opacity: backgroundOpacity }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Tesla-inspired slide-out drawer */}
          <motion.div
            ref={menuRef}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl lg:hidden"
            variants={animationVariants.menu}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ 
              x: menuTranslateX,
              boxShadow: '0 0 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
              ...TRANSFORM_CONFIG
            }}
            drag="x"
            dragConstraints={DRAG_CONSTRAINTS}
            dragElastic={DRAG_ELASTIC}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            aria-describedby="mobile-menu-description"
            tabIndex={-1}
          >
            {/* Drag indicator with accessibility */}
            <div 
              className="absolute top-6 left-4 w-1 h-12 bg-gray-300 rounded-full"
              aria-hidden="true"
              role="presentation"
            />
            
            {/* Screen reader description */}
            <div id="mobile-menu-description" className="sr-only">
              Mobile navigation menu with swipe-to-close functionality. Use Tab to navigate, Escape to close.
            </div>
            
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={BOUNCE_CONFIG}
                  >
                    {/* Pink accent dot - matching wireframe */}
                    <div className="w-2 h-2 bg-[#FF69B4] rounded-full"></div>
                    <span className="ml-2 font-bold text-[#171A20] text-lg">CrossBorder</span>
                  </motion.div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-hot-pink focus:ring-offset-2"
                  aria-label="Close navigation menu"
                  aria-keyshortcuts="Escape"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={BOUNCE_CONFIG}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Scrollable content */}
              <motion.div
                ref={contentRef}
                className="flex-1 overflow-y-auto py-6"
                variants={animationVariants.content}
                initial="hidden"
                animate="visible"
              >
                {/* Main Navigation */}
                <nav 
                  className="px-6 space-y-2" 
                  role="navigation" 
                  aria-label="Primary navigation"
                  aria-describedby="nav-description"
                >
                  <div id="nav-description" className="sr-only">
                    Primary navigation menu with {navigationItems.length} items
                  </div>
                  {navigationItems.map((item, index) => (
                    <motion.div key={item.href} variants={animationVariants.item}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center justify-between p-4 rounded-xl transition-all duration-200',
                          'hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]',
                          'focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2',
                          pathname === item.href
                            ? 'bg-[#FFF0F5] border border-[#FF69B4]/20 text-[#FF69B4] shadow-sm'
                            : 'text-[#171A20]',
                          item.highlight && pathname !== item.href && 
                            'bg-[#FF69B4] text-white shadow-lg hover:shadow-xl'
                        )}
                        aria-current={pathname === item.href ? 'page' : undefined}
                        aria-describedby={`nav-item-${item.href.replace(/\//g, '-')}`}
                      >
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold">{item.label}</span>
                            {item.isNew && (
                              <span className="bg-success-green text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p 
                              id={`nav-item-${item.href.replace(/\//g, '-')}`}
                              className={cn(
                                'text-sm mt-1',
                                pathname === item.href 
                                  ? 'text-[#FF69B4]/70' 
                                  : item.highlight 
                                  ? 'text-white/80' 
                                  : 'text-gray-500'
                              )}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <motion.svg
                          className={cn(
                            'w-5 h-5 transition-colors duration-200',
                            pathname === item.href 
                              ? 'text-[#FF69B4]' 
                              : item.highlight 
                              ? 'text-white' 
                              : 'text-gray-400 group-hover:text-[#FF69B4]'
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: 0 }}
                          whileHover={{ x: 3 }}
                          transition={BOUNCE_CONFIG}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Language Switcher */}
                <motion.div className="px-6 mt-8" variants={animationVariants.item}>
                  <div className="border-t border-gray-100 pt-6">
                    <motion.button
                      onClick={onLanguageToggle}
                      className="flex items-center justify-between w-full p-4 text-gray-600 hover:text-[#FF69B4] hover:bg-[#FFF0F5] rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
                      aria-label={`Switch language from ${currentLanguage?.label} to ${nextLanguage?.label}`}
                      aria-describedby="language-switch-description"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={BOUNCE_CONFIG}
                    >
                      <div id="language-switch-description" className="sr-only">
                        Current language: {currentLanguage?.label}. Click to switch to {nextLanguage?.label}.
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-lg">🌐</span>
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-charcoal block">Language</span>
                          <span className="text-sm text-gray-500">
                            {currentLanguage?.label} → {nextLanguage?.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-full font-medium text-charcoal">
                        {currentLang.toUpperCase()}
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Footer with authentication */}
              <motion.div 
                className="p-6 border-t border-gray-100 bg-gray-50/50"
                variants={animationVariants.item}
              >
                {isAuthenticated && user ? (
                  <div className="space-y-4">
                    {/* User Profile */}
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="w-12 h-12 bg-[#FF69B4] rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white text-lg">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                          ) : (
                            (() => {
                              const primaryRole = user.roles?.[0]?.role || 'CLIENT';
                              const userTypeKey = primaryRole.toLowerCase() as keyof typeof USER_TYPE_INFO;
                              return USER_TYPE_INFO[userTypeKey]?.icon || '👤';
                            })()
                          )}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const primaryRole = user.roles?.[0]?.role || 'CLIENT';
                            const userTypeKey = primaryRole.toLowerCase() as keyof typeof USER_TYPE_INFO;
                            return USER_TYPE_INFO[userTypeKey]?.label || 'User';
                          })()}
                        </p>
                        {user.isVerified && (
                          <p className="text-xs text-success-green">✓ Verified</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sign Out */}
                    <motion.button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Sign out of your account"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={BOUNCE_CONFIG}
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Primary CTA - Book Now */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={BOUNCE_CONFIG}
                    >
                      <Link
                        href="/booking"
                        onClick={onClose}
                        className="block w-full p-4 bg-[#FF69B4] text-white rounded-xl font-bold text-center shadow-lg hover:shadow-xl hover:bg-[#FF1493] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FF69B4]"
                        aria-label="Book a cross-border vehicle service now"
                      >
                        Book Now
                      </Link>
                    </motion.div>
                    
                    {/* Authentication buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => {
                          onLogin();
                          onClose();
                        }}
                        className="p-3 text-[#171A20] hover:text-[#FF69B4] hover:bg-[#FFF0F5] rounded-xl transition-all duration-200 font-semibold border border-gray-200 hover:border-[#FF69B4]/30 focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
                        aria-label="Sign in to your account"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={BOUNCE_CONFIG}
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          onRegister();
                          onClose();
                        }}
                        className="p-3 bg-[#FF69B4] text-white rounded-xl font-semibold hover:bg-[#FF1493] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
                        aria-label="Register for a new account"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={BOUNCE_CONFIG}
                      >
                        Register
                      </motion.button>
                    </div>

                    {/* Contact Info - Wireframe Design */}
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <div className="mb-1">📞 +852-2234-5678</div>
                      <div>💬 WeChat Support</div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Swipe indicator when dragging */}
            {isDragging && (
              <motion.div
                className="absolute right-full top-1/2 -translate-y-1/2 mr-4 text-white/70 text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                Swipe to close
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Memoized component for performance
export const MobileMenu = memo(MobileMenuComponent);