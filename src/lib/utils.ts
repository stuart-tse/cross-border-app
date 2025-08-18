import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'HKD'): string {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format phone number
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format Hong Kong phone numbers
  if (digits.startsWith('852')) {
    const number = digits.slice(3);
    if (number.length === 8) {
      return `+852-${number.slice(0, 4)}-${number.slice(4)}`;
    }
  }
  
  return phone;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\-\(\)\s]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Smooth scroll to element
export function scrollToElement(elementId: string, offset: number = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Format time
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
}

// Check if device is mobile
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

// Check if device is tablet
export function isTablet(): boolean {
  return typeof window !== 'undefined' && 
         window.innerWidth >= 768 && 
         window.innerWidth < 1024;
}

// Check if device is desktop
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= 1024;
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

// Intersection observer helper
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

// Animation delay helper
export function getStaggerDelay(index: number, baseDelay: number = 100): string {
  return `${index * baseDelay}ms`;
}

// Random ID generator
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}