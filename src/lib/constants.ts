// Constants for the cross-border vehicle services app
import { Service, Vehicle, Route, Testimonial, Contact, NavItem } from '@/types';

// Company information
export const COMPANY = {
  name: 'CrossBorder Services',
  tagline: 'Premium Cross-Border Vehicle Services',
  description: 'Professional, reliable, and seamless transportation between Hong Kong and Mainland China.',
  established: '2010',
  vehicles: '50+',
  completedTrips: '50,000+',
  onTimeRate: '99.8%',
  support: '24/7',
} as const;

// Navigation items - Wireframe redesign structure (Home, Booking, Blog, Login)
export const NAV_ITEMS: NavItem[] = [
  { 
    label: 'Home', 
    href: '/', 
    description: 'Premium cross-border vehicle services overview' 
  },
  { 
    label: 'Booking', 
    href: '/booking', 
    description: 'Interactive 4-step booking process',
    highlight: true // Primary action
  },
  { 
    label: 'Blog', 
    href: '/blog', 
    description: 'Cross-border travel magazine and insights'
  },
  { 
    label: 'Login', 
    href: '/login', 
    description: 'Multi-user authentication system'
  },
];

// Dashboard navigation items
export const DASHBOARD_NAV_ITEMS = {
  client: [
    { label: 'Dashboard', href: '/dashboard/client', icon: '🏠' },
    { label: 'Book Trip', href: '/booking', icon: '🚗' },
    { label: 'Trip History', href: '/dashboard/client/trips', icon: '📋' },
    { label: 'Profile', href: '/dashboard/client/profile', icon: '👤' },
    { label: 'Settings', href: '/dashboard/client/settings', icon: '⚙️' },
  ],
  driver: [
    { label: 'Dashboard', href: '/dashboard/driver', icon: '🏠' },
    { label: 'Trip Requests', href: '/dashboard/driver/requests', icon: '📱' },
    { label: 'Earnings', href: '/dashboard/driver/earnings', icon: '💰' },
    { label: 'Vehicle', href: '/dashboard/driver/vehicle', icon: '🚙' },
    { label: 'Profile', href: '/dashboard/driver/profile', icon: '👤' },
    { label: 'Documents', href: '/dashboard/driver/documents', icon: '📄' },
    { label: 'Verification', href: '/dashboard/driver/verification', icon: '✅' },
    { label: 'Settings', href: '/dashboard/driver/settings', icon: '⚙️' },
  ],
  blog_editor: [
    { label: 'Dashboard', href: '/dashboard/editor', icon: '🏠' },
    { label: 'Posts', href: '/dashboard/editor/posts', icon: '📝' },
    { label: 'Media', href: '/dashboard/editor/media', icon: '🖼️' },
    { label: 'Analytics', href: '/dashboard/editor/analytics', icon: '📊' },
    { label: 'Profile', href: '/dashboard/editor/profile', icon: '👤' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '🏠' },
    { label: 'User Management', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'System Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: '📊' },
    { label: 'Support Tickets', href: '/dashboard/admin/support', icon: '🎫' },
    { label: 'Reports', href: '/dashboard/admin/reports', icon: '📄' },
  ],
};

// User types for authentication
export const USER_TYPES = {
  CLIENT: 'client',
  DRIVER: 'driver',
  BLOG_EDITOR: 'blog_editor',
  ADMIN: 'admin',
} as const;

// User type display information
export const USER_TYPE_INFO = {
  [USER_TYPES.CLIENT]: {
    label: 'Client',
    description: 'Book rides and manage your trips',
    icon: '👤',
    color: 'hot-pink',
  },
  [USER_TYPES.DRIVER]: {
    label: 'Driver',
    description: 'Manage your driving services',
    icon: '🚗',
    color: 'electric-blue',
  },
  [USER_TYPES.BLOG_EDITOR]: {
    label: 'Blog Editor',
    description: 'Create and manage content',
    icon: '✍️',
    color: 'success-green',
  },
  [USER_TYPES.ADMIN]: {
    label: 'Administrator',
    description: 'System administration and management',
    icon: '👑',
    color: 'charcoal',
  },
} as const;

// Services data
export const SERVICES: Service[] = [
  {
    id: 'cross-border-transfers',
    title: 'Cross-Border Transfers',
    description: 'Professional door-to-door service between Hong Kong and major Mainland China cities. Our experienced drivers handle all border crossing procedures efficiently.',
    features: [
      'Licensed cross-border operators',
      '24/7 booking and support',
      'Real-time tracking',
      'Professional chauffeurs',
    ],
    icon: 'car',
    price: 'From HK$800',
  },
  {
    id: 'corporate-solutions',
    title: 'Corporate Solutions',
    description: 'Executive transportation for business teams, including meeting pickups, airport transfers, and multi-day itinerary support.',
    features: [
      'Dedicated account management',
      'Flexible billing options',
      'Priority booking',
      'Group transportation',
    ],
    icon: 'briefcase',
    price: 'Custom pricing',
  },
  {
    id: 'logistics-support',
    title: 'Logistics Support',
    description: 'Cargo and freight transportation solutions for businesses needing reliable cross-border logistics services.',
    features: [
      'Cargo transportation',
      'Customs assistance',
      'Freight forwarding',
      'Supply chain support',
    ],
    icon: 'truck',
    price: 'Quote on request',
  },
  {
    id: 'airport-services',
    title: 'Airport Services',
    description: 'Direct airport connections and transfers between Hong Kong International Airport and Mainland China destinations.',
    features: [
      'Airport meet & greet',
      'Flight monitoring',
      'Luggage assistance',
      'Express connections',
    ],
    icon: 'plane',
    price: 'From HK$600',
  },
];

// Vehicle fleet data
export const VEHICLES: Vehicle[] = [
  {
    id: 'business-class',
    name: 'Business Class',
    category: 'business',
    capacity: 3,
    luggage: '2-3 pieces',
    price: 'From HK$800',
    features: [
      'Mercedes E-Class or equivalent',
      'Professional chauffeur',
      'Leather seating',
      'Climate control',
      'USB charging ports',
      'Wi-Fi connectivity',
    ],
    image: '/images/business-sedan.jpg',
    description: 'Perfect for business travelers seeking comfort and reliability.',
  },
  {
    id: 'executive-suv',
    name: 'Executive SUV',
    category: 'executive',
    capacity: 6,
    luggage: '4-6 pieces',
    price: 'From HK$1,200',
    features: [
      'BMW X5 or Audi Q7',
      'Premium interior',
      'Captain\'s chairs',
      'Entertainment system',
      'Panoramic sunroof',
      'Advanced safety features',
    ],
    image: '/images/executive-suv.jpg',
    description: 'Spacious and luxurious for groups and executives.',
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    category: 'luxury',
    capacity: 3,
    luggage: '3-4 pieces',
    price: 'From HK$1,800',
    features: [
      'Mercedes S-Class or BMW 7 Series',
      'Premium leather seats',
      'Massage functions',
      'Champagne service',
      'Privacy partition',
      'Concierge service',
    ],
    image: '/images/luxury-sedan.jpg',
    description: 'Ultimate luxury for the most discerning travelers.',
  },
];

// Routes data
export const ROUTES: Route[] = [
  {
    id: 'hk-shenzhen',
    from: 'Hong Kong',
    to: 'Shenzhen',
    duration: '45-60 minutes',
    distance: '~35 km',
    description: 'Our most popular cross-border route connecting Hong Kong with Shenzhen\'s business district and technology hub.',
    borderCrossings: ['Lok Ma Chau', 'Futian Port', 'Shenzhen Bay Port'],
    price: 'From HK$800',
    popular: true,
  },
  {
    id: 'hk-guangzhou',
    from: 'Hong Kong',
    to: 'Guangzhou',
    duration: '2-2.5 hours',
    distance: '~140 km',
    description: 'Premium service to Guangzhou, ideal for business meetings and extended stays in the Greater Bay Area.',
    borderCrossings: ['Lok Ma Chau', 'Shenzhen Bay'],
    price: 'From HK$1,200',
    popular: true,
  },
  {
    id: 'airport-transfers',
    from: 'Hong Kong Airport',
    to: 'Mainland China',
    duration: '30-90 minutes',
    distance: 'Variable',
    description: 'Direct airport connections to major Mainland China destinations with meet & greet service.',
    borderCrossings: ['Hong Kong-Zhuhai-Macao Bridge', 'Shenzhen Bay'],
    price: 'From HK$600',
  },
  {
    id: 'custom-routes',
    from: 'Custom',
    to: 'Custom',
    duration: 'Variable',
    distance: 'Variable',
    description: 'Tailored routes for specific destinations and requirements throughout the Greater Bay Area.',
    borderCrossings: ['All major crossings'],
    price: 'Quote on request',
  },
];

// Testimonials data
export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Michael Chen',
    role: 'Regional Director',
    company: 'Tech Innovations Ltd.',
    content: 'Exceptional service for our executive team\'s regular Hong Kong to Shenzhen trips. Always professional, punctual, and smooth border crossings.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Sarah Wong',
    role: 'CEO',
    company: 'Global Trading Corp',
    content: 'The luxury service exceeded our expectations. Professional drivers, immaculate vehicles, and seamless coordination for our international clients.',
    rating: 5,
  },
  {
    id: '3',
    name: 'David Liu',
    role: 'Operations Manager',
    company: 'Manufacturing Solutions',
    content: 'Reliable corporate solution for our team\'s frequent cross-border travel. The booking system is efficient and customer service is outstanding.',
    rating: 5,
  },
];

// Contact information
export const CONTACT: Contact = {
  phone: '+852-2234-5678',
  email: 'info@crossborder-services.com',
  wechat: 'CrossBorderHK',
  whatsapp: '+852-9876-5432',
  address: 'Suite 1588, Central Tower, 28 Queen\'s Road Central, Hong Kong',
  hours: '24/7 Service Available',
};

// Languages
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-tw', label: '中文 (繁體)' },
  { code: 'zh-cn', label: '中文 (简体)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

// Design system colors - Tesla-inspired with light pink accent
export const DESIGN_COLORS = {
  LIGHT_PINK: '#FF69B4',
  LIGHT_PINK_TINT: '#FFF0F5',
  CHARCOAL: '#171A20',
  WHITE: '#FFFFFF',
  GRAY_100: '#F0F0F0',
  GRAY_600: '#666666',
} as const;

// Booking form steps - Wireframe 4-step process
export const BOOKING_STEPS = [
  { id: 1, title: 'Location & Route', description: 'Pickup and destination with Amap integration' },
  { id: 2, title: 'Vehicle Selection', description: 'Choose your preferred vehicle' },
  { id: 3, title: 'Date & Time', description: 'Schedule your journey' },
  { id: 4, title: 'Payment & Confirm', description: 'Complete booking and payment' },
] as const;

// Trust indicators
export const TRUST_INDICATORS = [
  {
    label: '10+ Years',
    description: 'Experience',
    icon: 'calendar',
  },
  {
    label: '50,000+ Trips',
    description: 'Completed',
    icon: 'check-circle',
  },
  {
    label: '99.8% On-Time',
    description: 'Delivery Rate',
    icon: 'clock',
  },
  {
    label: '24/7 Support',
    description: 'Available',
    icon: 'headphones',
  },
] as const;