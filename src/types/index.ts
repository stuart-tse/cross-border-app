// Common types for the cross-border vehicle services app

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  price?: string;
  image?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  category: 'business' | 'executive' | 'luxury';
  capacity: number;
  luggage: string;
  price: string;
  features: string[];
  image: string;
  description: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  description: string;
  borderCrossings: string[];
  price: string;
  popular?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

export interface Contact {
  phone: string;
  email: string;
  wechat: string;
  whatsapp?: string;
  address: string;
  hours: string;
}

export interface BookingRequest {
  service: string;
  route: string;
  vehicle: string;
  date: string;
  time: string;
  passengers: number;
  fullName: string;
  phone: string;
  email: string;
  wechatId?: string;
  specialRequests?: string;
}

export interface Language {
  code: 'en' | 'zh-tw' | 'zh-cn' | 'ja' | 'ko';
  label: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  description?: string;
  highlight?: boolean;
  isNew?: boolean;
  children?: NavItem[];
}

// User authentication types
export type UserType = 'client' | 'driver' | 'blog_editor';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  avatar?: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'time';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: string;
    max?: string;
  };
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: Record<string, string>;
  values: Record<string, string>;
}