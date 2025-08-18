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
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  type PanInfo 
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, USER_TYPE_INFO, LANGUAGES } from '@/lib/constants';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { useToast } from '@/components/ui/Toast';
import type { User, UserType } from '@/types';

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onLanguageToggle: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}

type AuthView = 'none' | 'login' | 'userTypeSelection' | 'register';

// Performance constants
const DRAG_CONSTRAINTS = { left: 0, right: 320 } as const;
const DRAG_ELASTIC = 0.2;
const SWIPE_CLOSE_THRESHOLD = 150;
const SWIPE_VELOCITY_THRESHOLD = 500;
const FOCUS_TIMEOUT = 100;
const BACKDROP_OPACITY_RANGE: [number, number] = [0.75, 0];
const MENU_TRANSLATE_RANGE: [number, number] = [0, 320];

// Tesla-inspired spring configurations
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
  mass: 0.8,
  restDelta: 0.01,
} as const;

const BOUNCE_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.6,
  restDelta: 0.01,
} as const;

const TRANSFORM_CONFIG = {
  enableHardwareAcceleration: true,
  layoutScroll: false,
} as const;

const EnhancedMobileMenuComponent: React.FC<EnhancedMobileMenuProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageToggle,
  isAuthenticated,
  user,
  onLogout,
}) => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('none');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const { success: showSuccess } = useToast();

  // Preserve auth state when menu reopens
  const [preservedAuthState, setPreservedAuthState] = useState<{
    view: AuthView;
    userType: UserType | null;
  }>({ view: 'none', userType: null });

  // Transform for swipe-to-close
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

  // Restore auth state when menu reopens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      setAuthView(preservedAuthState.view);
      setSelectedUserType(preservedAuthState.userType);
    } else if (isOpen && isAuthenticated) {
      // Clear auth forms if user is now authenticated
      setAuthView('none');
      setSelectedUserType(null);
      setPreservedAuthState({ view: 'none', userType: null });
    }
  }, [isOpen, isAuthenticated, preservedAuthState]);

  // Preserve auth state when menu closes
  const handleClose = useCallback(() => {
    if (!isAuthenticated) {
      setPreservedAuthState({ view: authView, userType: selectedUserType });
    }
    onClose();
  }, [onClose, authView, selectedUserType, isAuthenticated]);

  // Auth navigation handlers
  const handleShowLogin = useCallback(() => {
    setAuthView('login');
    setSelectedUserType(null);
  }, []);

  const handleShowRegister = useCallback(() => {
    setAuthView('userTypeSelection');
    setSelectedUserType(null);
  }, []);

  const handleUserTypeSelection = useCallback((userType: UserType) => {
    setSelectedUserType(userType);
    setAuthView('register');
  }, []);

  const handleBackToUserSelection = useCallback(() => {
    setAuthView('userTypeSelection');
    setSelectedUserType(null);
  }, []);

  const handleBackToMain = useCallback(() => {
    setAuthView('none');
    setSelectedUserType(null);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    // Clear auth state and close menu on successful auth
    setAuthView('none');
    setSelectedUserType(null);
    setPreservedAuthState({ view: 'none', userType: null });
    showSuccess('Welcome!', 'You have been successfully logged in.');
    onClose();
  }, [showSuccess, onClose]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPaddingRight = originalStyle.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    const applyScrollLock = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    };
    
    requestAnimationFrame(applyScrollLock);
    
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const menu = menuRef.current;
      const content = contentRef.current;
      
      if (!menu || !target) {
        e.preventDefault();
        return;
      }
      
      if (content && (menu.contains(target) || content.contains(target))) {
        const isScrollable = content.scrollHeight > content.clientHeight;
        const isAtTop = content.scrollTop === 0;
        const isAtBottom = content.scrollTop >= content.scrollHeight - content.clientHeight;
        
        if (!isScrollable || 
            (isAtTop && e.touches[0].clientY > e.changedTouches[0].clientY) ||
            (isAtBottom && e.touches[0].clientY < e.changedTouches[0].clientY)) {
          e.preventDefault();
        }
        return;
      }
      
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('wheel', preventTouchMove, { passive: false });
    
    return () => {
      requestAnimationFrame(() => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.documentElement.style.overflow = '';
      });
      
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('wheel', preventTouchMove);
    };
  }, [isOpen]);

  // Keyboard handlers
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      if (authView !== 'none') {
        handleBackToMain();
      } else {
        handleClose();
      }
    }
  }, [isOpen, authView, handleClose, handleBackToMain]);

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

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
      
      const focusFirstElement = () => {
        const firstFocusable = menuRef.current?.querySelector(
          'button:not([disabled]), a[href]:not([disabled])'
        ) as HTMLElement;
        firstFocusable?.focus();
      };
      
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(focusFirstElement);
      }, FOCUS_TIMEOUT);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [isOpen, handleEscape, handleFocusTrap]);

  // Swipe gesture handlers
  const handleDragStart = useCallback(() => {
    startTransition(() => {
      setIsDragging(true);
    });
  }, []);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    startTransition(() => {
      setIsDragging(false);
    });
    
    const shouldClose = (
      info.offset.x > SWIPE_CLOSE_THRESHOLD || 
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    );
    
    if (shouldClose) {
      handleClose();
    } else {
      dragX.set(0);
    }
  }, [handleClose, dragX]);

  // Animation variants
  const animationVariants = useMemo(() => ({
    backdrop: {
      hidden: { 
        opacity: 0,
        transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
      },
      visible: { 
        opacity: 0.75,
        transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
      }
    },
    menu: {
      hidden: { 
        x: '100%',
        transition: { 
          type: 'spring',
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

  // Language info
  const languageInfo = useMemo(() => {
    const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang);
    const nextLanguageIndex = LANGUAGES.findIndex(lang => lang.code === currentLang);
    const nextLanguage = LANGUAGES[(nextLanguageIndex + 1) % LANGUAGES.length];
    
    return { currentLanguage, nextLanguage };
  }, [currentLang]);
  
  const { currentLanguage, nextLanguage } = languageInfo;

  // Render auth content
  const renderAuthContent = () => {
    if (authView === 'login') {
      return (
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Sign In</h3>
            <button
              onClick={handleBackToMain}
              className="p-1 text-gray-400 hover:text-charcoal rounded-md"
              aria-label="Back to menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <LoginForm
            onSwitchToRegister={handleShowRegister}
            onSuccess={handleAuthSuccess}
            className="space-y-4"
          />
        </div>
      );
    }

    if (authView === 'userTypeSelection') {
      return (
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Choose Account Type</h3>
            <button
              onClick={handleBackToMain}
              className="p-1 text-gray-400 hover:text-charcoal rounded-md"
              aria-label="Back to menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            {Object.entries(USER_TYPE_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => handleUserTypeSelection(key as UserType)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg text-left transition-all duration-200 hover:border-hot-pink hover:bg-pink-tint/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg flex items-center justify-center text-white text-sm">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-charcoal">{info.label}</h4>
                    <p className="text-xs text-gray-600">{info.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleShowLogin}
            className="w-full text-center text-sm text-gray-600 hover:text-hot-pink transition-colors"
          >
            ← Back to login
          </button>
        </div>
      );
    }

    if (authView === 'register' && selectedUserType) {
      return (
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Create Account</h3>
            <button
              onClick={handleBackToMain}
              className="p-1 text-gray-400 hover:text-charcoal rounded-md"
              aria-label="Back to menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <RegistrationForm
            selectedUserType={selectedUserType}
            onBack={handleBackToUserSelection}
            onSuccess={handleAuthSuccess}
            className="space-y-4"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden"
            variants={animationVariants.backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ opacity: backgroundOpacity }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu */}
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
            tabIndex={-1}
          >
            {/* Drag indicator */}
            <div 
              className="absolute top-6 left-4 w-1 h-12 bg-gray-300 rounded-full"
              aria-hidden="true"
            />
            
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={BOUNCE_CONFIG}
                  >
                    <div className="w-2 h-2 bg-[#FF69B4] rounded-full"></div>
                    <span className="ml-2 font-bold text-[#171A20] text-lg">CrossBorder</span>
                  </motion.div>
                </div>
                
                <motion.button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-hot-pink focus:ring-offset-2"
                  aria-label="Close navigation menu"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={BOUNCE_CONFIG}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <motion.div
                ref={contentRef}
                className="flex-1 overflow-y-auto py-6"
                variants={animationVariants.content}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="wait">
                  {authView !== 'none' ? (
                    <motion.div
                      key="auth-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderAuthContent()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="main-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Main Navigation */}
                      <nav className="px-6 space-y-2">
                        {NAV_ITEMS.map((item) => (
                          <motion.div key={item.href} variants={animationVariants.item}>
                            <Link
                              href={item.href}
                              onClick={handleClose}
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
                                  <p className={cn(
                                    'text-sm mt-1',
                                    pathname === item.href 
                                      ? 'text-[#FF69B4]/70' 
                                      : item.highlight 
                                      ? 'text-white/80' 
                                      : 'text-gray-500'
                                  )}>
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={BOUNCE_CONFIG}
                          >
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
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Footer */}
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
                          {USER_TYPE_INFO[user.userType as keyof typeof USER_TYPE_INFO]?.icon || '👤'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {USER_TYPE_INFO[user.userType as keyof typeof USER_TYPE_INFO]?.label || 'User'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Sign Out */}
                    <motion.button
                      onClick={() => {
                        onLogout();
                        handleClose();
                      }}
                      className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={BOUNCE_CONFIG}
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {authView === 'none' && (
                      <>
                        {/* Primary CTA - Book Now */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={BOUNCE_CONFIG}
                        >
                          <Link
                            href="/booking"
                            onClick={handleClose}
                            className="block w-full p-4 bg-[#FF69B4] text-white rounded-xl font-bold text-center shadow-lg hover:shadow-xl hover:bg-[#FF1493] transition-all duration-200"
                          >
                            Book Now
                          </Link>
                        </motion.div>
                        
                        {/* Authentication buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            onClick={handleShowLogin}
                            className="p-3 text-[#171A20] hover:text-[#FF69B4] hover:bg-[#FFF0F5] rounded-xl transition-all duration-200 font-semibold border border-gray-200 hover:border-[#FF69B4]/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={BOUNCE_CONFIG}
                          >
                            Sign In
                          </motion.button>
                          <motion.button
                            onClick={handleShowRegister}
                            className="p-3 bg-[#FF69B4] text-white rounded-xl font-semibold hover:bg-[#FF1493] transition-all duration-200 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={BOUNCE_CONFIG}
                          >
                            Register
                          </motion.button>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-4 text-center text-sm text-gray-600">
                          <div className="mb-1">📞 +852-2234-5678</div>
                          <div>💬 WeChat Support</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Swipe indicator */}
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

export const EnhancedMobileMenu = memo(EnhancedMobileMenuComponent);