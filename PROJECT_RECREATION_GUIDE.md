# Cross-Border Vehicles Project Recreation Guide

## 📋 Project Overview

### Basic Information
- **Project Name**: CrossBorder Vehicles
- **Package Name**: crossborder-vehicles
- **Version**: 1.0.0
- **Description**: Production-ready CrossBorder Vehicles web application with Next.js 15
- **Primary Language**: TypeScript
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM

### Technology Stack

#### Core Framework & Runtime
- **Next.js**: 15.4.6 (App Router)
- **React**: 19.1.1 
- **TypeScript**: 5.7.2
- **Node.js**: >= 18.18.0

#### Styling & UI
- **Tailwind CSS**: 3.4.7
- **Tailwind Plugins**: @tailwindcss/forms, @tailwindcss/typography
- **Radix UI Components**: Dialog, Dropdown Menu, Select, Slot, Toast
- **Framer Motion**: 12.23.12 (animations)
- **Lucide React**: 0.460.0 (icons)
- **Class Variance Authority**: 0.7.1
- **CLSX**: 2.1.1
- **Tailwind Merge**: 2.5.4

#### Database & ORM
- **Prisma**: 6.14.0
- **@prisma/client**: 6.14.0
- **Database**: PostgreSQL (configured via DATABASE_URL)

#### Authentication & Security
- **NextAuth.js**: 5.0.0-beta.29
- **@auth/prisma-adapter**: 2.10.0
- **bcryptjs**: 3.0.2
- **jsonwebtoken**: 9.0.2
- **jose**: 6.0.13

#### Internationalization
- **next-intl**: 4.3.4
- **Supported Locales**: en, zh-tw, zh-cn, ja, ko

#### Forms & Validation
- **React Hook Form**: 7.54.0
- **@hookform/resolvers**: 3.10.0
- **Zod**: 4.0.17

#### Rich Text Editing
- **CKEditor 5**: 41.4.2
- **@ckeditor/ckeditor5-react**: 11.0.0
- **@ckeditor/ckeditor5-build-classic**: 41.4.2
- **Additional CKEditor plugins**: image, link, upload

#### Maps & Geolocation
- **@googlemaps/js-api-loader**: 1.16.8
- **@amap/amap-jsapi-loader**: 1.0.1

#### Data Visualization
- **Chart.js**: 4.5.0

#### File Handling & Utilities
- **Sharp**: 0.34.3 (image optimization)
- **Multer**: 2.0.2 (file uploads)
- **Axios**: 1.7.9 (HTTP client)
- **date-fns**: 4.1.0 (date utilities)
- **react-datepicker**: 7.5.0

#### Email
- **Nodemailer**: 6.10.1

#### Development & Testing
- **ESLint**: 8.57.1
- **@typescript-eslint/eslint-plugin**: 8.17.0
- **@typescript-eslint/parser**: 8.17.0
- **Jest**: 29.7.0
- **@testing-library/react**: 16.1.0
- **@testing-library/jest-dom**: 6.6.3
- **Playwright**: 1.55.0
- **tsx**: 4.20.4

## 🏗️ Project Architecture

### Directory Structure

```
cross-border-app/
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Database schema definition
│   ├── seed.ts                 # Database seeding script
│   └── migrations/             # Database migration files
├── public/                     # Static assets
│   ├── images/                 # Image assets
│   └── manifest.json           # PWA manifest
├── src/                        # Source code
│   ├── app/                    # Next.js 15 App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── about/         # About page
│   │   │   ├── blog/          # Blog pages
│   │   │   ├── booking/       # Booking system
│   │   │   ├── contact/       # Contact page
│   │   │   ├── dashboard/     # Multi-role dashboards
│   │   │   │   ├── admin/     # Admin dashboard
│   │   │   │   ├── client/    # Client dashboard
│   │   │   │   ├── driver/    # Driver dashboard
│   │   │   │   ├── editor/    # Editor dashboard
│   │   │   │   └── super-admin/ # Super admin dashboard
│   │   │   ├── login/         # Authentication pages
│   │   │   ├── profile/       # User profiles
│   │   │   ├── routes/        # Route information
│   │   │   └── services/      # Service pages
│   │   ├── actions/           # Server Actions
│   │   ├── api/               # API Routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── client/            # Client-specific components
│   │   ├── driver/            # Driver-specific components
│   │   ├── editor/            # Editor-specific components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   ├── profile/           # Profile components
│   │   ├── sections/          # Page sections
│   │   ├── ui/                # Reusable UI components
│   │   └── vehicles/          # Vehicle-related components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Authentication utilities
│   │   ├── data/              # Data access layer
│   │   ├── editor/            # Editor utilities
│   │   ├── services/          # Business services
│   │   ├── utils/             # General utilities
│   │   └── validations/       # Validation schemas
│   ├── locales/               # Internationalization files
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── Design/                    # HTML wireframes and designs
├── DesignSystem/             # Design system documentation
├── docs/                     # Project documentation
└── scripts/                  # Database and utility scripts
```

## 🎨 Design System & HTML Templates

### Core Design Principles

The project uses a comprehensive design system based on:
- **Color Scheme**: Light pink (#FF69B4) primary with dark gray (#171A20) text
- **Typography**: Inter font family
- **Layout**: Grid-based responsive design
- **Components**: Modular, reusable component architecture

### HTML Wire Themes Available

#### Dashboard Design System (`Design/dashboard-design-system.html`)
- Complete dashboard layout with sidebar navigation
- Color palette and component specifications
- Responsive grid systems
- Form styles and input components

#### Admin Dashboard Designs
- `admin-dashboard.html` - Main admin interface
- `admin-dashboard-design-system.html` - Admin-specific design system
- `admin-dashboard-component-specs.html` - Component specifications
- `user-management.html` - User management interface

#### Driver Dashboard Designs
- `driver-dashboard-wireframes.html` - Driver interface wireframes
- `driver-dashboard-design-specifications.html` - Design specifications
- `car-management-design-specifications.html` - Vehicle management UI

#### Editor Dashboard Designs
- `editor-dashboard-comprehensive-design.html` - Editor interface
- `create-new-post-comprehensive-design.html` - Blog post creation
- `ckeditor-integration-specifications.html` - Rich text editor specs

#### Client Dashboard Designs
- `client-dashboard-comprehensive-design.html` - Client interface
- `booking-system-interface-mockups.html` - Booking system UI

#### Design System Documentation
- `DesignSystem/design-system-light-pink.html` - Main design system
- `DesignSystem/authentication-flows-design.html` - Auth flow designs
- `DesignSystem/user-flow-diagrams.html` - User journey maps

## 📊 Database Schema (Prisma)

### Core Models

#### User Management
- **User**: Main user table with multi-role support
- **UserRole**: Junction table for role assignments
- **Account/Session**: NextAuth.js authentication tables
- **Password**: Password management

#### User Profiles
- **ClientProfile**: Client-specific profile data
- **DriverProfile**: Driver-specific profile with verification
- **BlogEditorProfile**: Editor profile and permissions

#### Vehicle Management
- **Vehicle**: Vehicle information and specifications
- **VehiclePermit**: Cross-border permits and documentation
- **VehicleLicense**: Vehicle licensing and compliance
- **DriverVerificationDoc**: Driver verification documents

#### Booking System
- **Booking**: Trip booking and management
- **TrackingHistory**: Real-time trip tracking
- **Payment**: Payment processing and records
- **Review**: Trip reviews and ratings

#### Content Management
- **BlogPost**: Blog content with SEO features
- **BlogCategory/BlogTag**: Content organization
- **Comment**: Blog comments system
- **BlogAnalytics**: Content performance tracking

#### Support System
- **SupportTicket**: Customer support tickets
- **SupportMessage**: Support chat messages
- **PaymentMethod**: Client payment options
- **ClientSettings**: User preferences and settings

#### Configuration
- **SystemConfig**: System-wide configuration
- **AppSetting**: Application settings by environment
- **ListItem**: Dynamic lists and options
- **ContentItem**: CMS content management
- **PricingRule**: Dynamic pricing rules
- **Location/Route**: Geographic and route data
- **FeatureFlag**: Feature toggle management
- **AuditLog**: System audit trail

### Key Enums
- **UserType**: CLIENT, DRIVER, BLOG_EDITOR, ADMIN
- **VehicleType**: BUSINESS, EXECUTIVE, LUXURY, SUV, VAN
- **BookingStatus**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, COMPLETED, FAILED, REFUNDED
- **PostStatus**: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED

## 🛠️ Key Functions & Components

### Authentication System
```typescript
// Located in: src/lib/auth/
- config.ts: NextAuth.js configuration
- utils.ts: Authentication utilities
- edge-auth.ts: Edge runtime auth functions
- node-utils.ts: Node.js auth utilities
```

### Data Access Layer
```typescript
// Located in: src/lib/data/
- user.ts: User management functions
  - getUserById()
  - getUsers()
  - getUserCountByRole()
  - getAdminMetrics()

- dashboard.ts: Dashboard data functions
  - getClientStats()
  - getDriverData()
  - getAdminMetrics()
  - getUserNotifications()

- activity.ts: Activity tracking functions
  - getUserActivity()
  - getSystemActivity()
  - getActivityStats()
```

### Editor System
```typescript
// Located in: src/lib/editor/
- utils.ts: Editor utility functions
  - generateSlug()
  - calculateContentStats()
  - calculateKeywordDensity()
  - generateAiAltText()

- constants.ts: Editor configuration
  - categories: Blog categories
  - contentTemplates: Post templates
  - ckeditorConfig: CKEditor settings

- types.ts: Editor type definitions
  - publishSchema: Zod validation schema
  - FormData interfaces
```

### Vehicle Management
```typescript
// Located in: src/lib/utils/vehicleValidation.ts
- validateVehiclePhotos(): File validation
- checkExpiringDocuments(): Document expiry checks
```

### Utility Functions
```typescript
// Located in: src/lib/utils.ts
- cn(): Tailwind class name merger
- formatCurrency(): Currency formatting
- formatPhone(): Phone number formatting
- isValidEmail(): Email validation
- debounce(): Function debouncing
- generateSlug(): URL slug generation
- formatDate(): Date formatting
```

### Server Actions
```typescript
// Located in: src/app/actions/
- blog.ts: Blog post management actions
- driver.ts: Driver profile actions
- profile.ts: User profile actions
- vehicle.ts: Vehicle management actions
```

### API Routes Structure
```typescript
// Located in: src/app/api/
/auth/
  /[...nextauth]/ - NextAuth.js handler
  /login/ - Custom login endpoint
  /register/ - User registration
  /me/ - Current user info

/admin/
  /users/ - User management
  /analytics/ - Admin analytics
  /settings/ - System settings

/client/
  /profile/ - Client profile management
  /trips/ - Trip management
  /payment-methods/ - Payment management

/drivers/
  /vehicles/ - Vehicle management
  /earnings/ - Driver earnings
  /verification/ - Document verification

/blog/
  /posts/ - Blog post management

/bookings/
  /estimate/ - Price estimation
```

### Component Architecture

#### UI Components (`src/components/ui/`)
- **BaseCard**: Flexible card component
- **Button**: Styled button with variants
- **Input/Select/Textarea**: Form controls
- **Modal/Dialog**: Modal system
- **Toast**: Notification system
- **StatusBadge**: Status indicators

#### Feature Components
- **Admin Components**: User management, metrics, analytics
- **Auth Components**: Login forms, user menus, role switching
- **Client Components**: Trip cards, payment methods, support
- **Driver Components**: Document upload, earnings, settings
- **Editor Components**: Post editor, media management, SEO tools

## 🚀 Setup & Installation

### Prerequisites
```bash
Node.js >= 18.18.0
npm >= 10.0.0
PostgreSQL database
```

### Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google Maps API
GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Optional: Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

### Installation Steps
```bash
# Clone and install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Build Commands
```bash
# Development
npm run dev          # Start dev server
npm run dev:turbo    # Start with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality Assurance
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm run test         # Run Jest tests
npm run test:coverage # Test coverage report
```

## 🌐 Internationalization

### Supported Locales
- **en**: English (default)
- **zh-tw**: Traditional Chinese
- **zh-cn**: Simplified Chinese  
- **ja**: Japanese
- **ko**: Korean

### Locale Files
Located in `src/locales/`:
- `en.json`: English translations
- `zh-tw.json`: Traditional Chinese
- `zh-cn.json`: Simplified Chinese
- `ja.json`: Japanese
- `ko.json`: Korean

## 🔧 Configuration Files

### Next.js Configuration (`next.config.js`)
- App Router enabled
- Internationalization setup
- Image optimization
- Custom webpack config

### Tailwind Configuration (`tailwind.config.js`)
- Custom color palette
- Typography plugin
- Forms plugin
- Component paths

### TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- Next.js optimizations

### Playwright Configuration (`playwright.config.ts`)
- E2E testing setup
- Multiple browser testing
- Screenshot on failure

## 📝 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode, proper typing
- **ESLint**: Standard configuration with Next.js rules
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks
- **File Naming**: kebab-case for files, PascalCase for components

### Architecture Patterns
- **Server Components**: Default for data fetching
- **Client Components**: Only when interactivity needed
- **Server Actions**: For form submissions and mutations
- **API Routes**: For external API integrations
- **Database**: Prisma ORM with connection pooling
- **Authentication**: NextAuth.js with JWT tokens
- **State Management**: React state + Server state
- **Styling**: Tailwind CSS with component variants

### Security Considerations
- **Input Validation**: Zod schemas for all forms
- **Authentication**: JWT with secure httpOnly cookies
- **Authorization**: Role-based access control
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: React built-in escaping
- **CSRF Protection**: NextAuth.js built-in

## 📚 Key Dependencies Explanation

### Production Dependencies
- **@ckeditor/**: Rich text editor for blog posts
- **@googlemaps/js-api-loader**: Google Maps integration
- **@hookform/resolvers**: Form validation with Zod
- **@prisma/client**: Database ORM client
- **@radix-ui/**: Accessible UI components
- **axios**: HTTP client for API calls
- **bcryptjs**: Password hashing
- **chart.js**: Data visualization
- **date-fns**: Date manipulation utilities
- **framer-motion**: Animation library
- **jose**: JWT handling
- **lucide-react**: Icon library
- **next-auth**: Authentication solution
- **next-intl**: Internationalization
- **nodemailer**: Email sending
- **react-hook-form**: Form management
- **sharp**: Image processing
- **tailwindcss**: Utility-first CSS framework
- **zod**: Schema validation

### Development Dependencies
- **@playwright/test**: E2E testing framework
- **@testing-library/**: Component testing utilities
- **@typescript-eslint/**: TypeScript linting
- **jest**: Unit testing framework
- **tsx**: TypeScript execution

## 🎯 Feature Highlights

### Multi-Role Dashboard System
- **Client Dashboard**: Trip booking, payment management, trip history
- **Driver Dashboard**: Trip requests, vehicle management, earnings
- **Admin Dashboard**: User management, system analytics, content management
- **Editor Dashboard**: Blog post creation, media management, SEO optimization
- **Super Admin Dashboard**: System configuration, feature flags, audit logs

### Cross-Border Vehicle Services
- **Booking System**: Route planning with border crossing support
- **Vehicle Fleet**: Multiple vehicle categories (Business, Executive, Luxury)
- **Document Management**: Permit and license tracking with expiry alerts
- **Payment Processing**: Multiple payment methods including digital wallets
- **Real-time Tracking**: Trip progress and location updates

### Content Management System
- **Blog Platform**: Rich text editing with CKEditor 5
- **SEO Optimization**: Meta tags, keywords, content analysis
- **Media Management**: Image upload with optimization
- **Multi-language Support**: Content translation system
- **Analytics**: Post performance tracking

### Advanced Features
- **Internationalization**: 5 language support
- **Progressive Web App**: Manifest and offline capabilities
- **Real-time Updates**: WebSocket integration ready
- **File Upload System**: Secure document handling
- **Audit Logging**: Complete system activity tracking
- **Feature Flags**: A/B testing and gradual rollouts
- **Dynamic Pricing**: Rule-based pricing engine

## 🔄 Data Flow Architecture

### Authentication Flow
1. User logs in via NextAuth.js
2. JWT token stored in httpOnly cookie
3. Middleware validates token on protected routes
4. User roles determined from database
5. UI components render based on permissions

### Booking Flow
1. Client selects route and vehicle
2. System calculates pricing with rules engine
3. Booking created in database
4. Driver receives notification
5. Real-time tracking during trip
6. Payment processing on completion
7. Review system for feedback

### Content Creation Flow
1. Editor creates post in rich text editor
2. Auto-save drafts every 30 seconds
3. SEO analysis runs on content
4. Media uploads processed and optimized
5. Preview mode for content review
6. Publication triggers cache invalidation
7. Analytics tracking begins

This comprehensive guide provides everything needed to recreate the Cross-Border Vehicles project with exact specifications, complete architecture understanding, and detailed implementation guidelines.