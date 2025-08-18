# Tesla-Inspired Navigation Architecture & Design Specifications

## Overview
This document outlines the comprehensive redesign of the cross-border vehicle services website navigation, incorporating Tesla-inspired design principles with advanced multi-user authentication and booking functionality.

## Navigation Structure Hierarchy

### Primary Navigation
```
Home → Booking → Blog → [User Authentication]
```

### User-Specific Navigation (Post-Login)
```
Client Dashboard:
├── My Bookings
├── Profile
├── Payment Methods
├── Trip History
└── Preferences

Driver Dashboard:
├── Trip Assignments
├── Earnings
├── Schedule
├── Documents
├── Vehicle Status
└── Profile

Blog Editor Dashboard:
├── Content Management
├── Create Article
├── Media Library
├── SEO Tools
├── Analytics
└── Profile
```

## Header Design Specifications

### Desktop Header (1024px+)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] CrossBorder    Home  Booking  Blog    [Lang] [Auth Button] [User] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Layout Properties:**
- Height: 64px
- Background: #FFFFFF with 1px bottom border (#F4F4F4)
- Logo: Left-aligned with Chinese red accent dot
- Navigation: Center-aligned with 32px spacing
- Actions: Right-aligned with 16px spacing between elements
- Sticky positioning with backdrop blur on scroll

### Mobile Header (320px-1023px)
```
┌─────────────────────────────────────────┐
│ [Logo] CrossBorder   [Lang] [≡] [User] │
│                                         │
└─────────────────────────────────────────┘
```

**Mobile Menu Drawer:**
```
┌─────────────────┐
│ [✕]           │
│                │
│ → Home         │
│ → Booking      │
│ → Blog         │
│ → Login/Signup │
│ ──────────────│
│ [Contact Info] │
│ [Language]     │
└─────────────────┘
```

## 1. HOME PAGE
**Status:** Keep existing design - it's working well
- Maintain current Tesla-inspired hero section
- Preserve existing layout and components
- No changes required to existing homepage structure

## 2. BOOKING SYSTEM REDESIGN

### Booking Flow Architecture
```
Step 1: Service Type → Step 2: Route & Location → Step 3: Vehicle Selection → 
Step 4: Date & Time → Step 5: Passenger Details → Step 6: Payment → Step 7: Confirmation
```

### Booking Interface Wireframe

#### Desktop Booking Page (1440px)
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌─── Booking Progress ───┐                                                         │
│  │ ●────●────●────○────○ │                                                         │
│  │ Service Location Vehicle Time Confirm │                                         │
│  └─────────────────────────┘                                                       │
│                                                                                     │
│  ┌─── Left Panel (50%) ────┐ ┌─── Right Panel (50%) ──┐                          │
│  │                         │ │                         │                          │
│  │ ┌─ Pickup Location ────┐ │ │ ┌─── Map View ───────┐  │                          │
│  │ │ 🔍 Search location... │ │ │ │                   │  │                          │
│  │ │ 📍 Current location   │ │ │ │   [Interactive    │  │                          │
│  │ │ 📌 Recent locations   │ │ │ │    Amap View]     │  │                          │
│  │ └─────────────────────┘ │ │ │                   │  │                          │
│  │                         │ │ │                   │  │                          │
│  │ ┌─ Destination ────────┐ │ │ │                   │  │                          │
│  │ │ 🔍 Search location... │ │ │ │                   │  │                          │
│  │ │ 🏢 Popular destinations│ │ │ └───────────────────┘  │                          │
│  │ │ 🎯 Suggested routes   │ │ │                         │                          │
│  │ └─────────────────────┘ │ │ ┌─ Route Summary ────┐   │                          │
│  │                         │ │ │ Distance: 45km      │   │                          │
│  │ ┌─ Special Options ───┐  │ │ │ Duration: ~1hr      │   │                          │
│  │ │ ☐ Child seats        │  │ │ │ Border: Lok Ma Chau │   │                          │
│  │ │ ☐ Extra luggage      │  │ │ │ Est. Price: HK$800  │   │                          │
│  │ │ ☐ Meet & Greet       │  │ │ └───────────────────┘   │                          │
│  │ └─────────────────────┘  │ │                         │                          │
│  └─────────────────────────┘ └─────────────────────────┘                          │
│                                                                                     │
│  ┌─── Action Bar ──────────────────────────────────────────────────────────────┐   │
│  │                          [Back] [Continue - Select Vehicle] →             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Booking Interface (375px)
```
┌─────────────────────────────────────┐
│ ●────○────○────○                    │
│ Location Vehicle DateTime Confirm    │
│                                     │
│ ┌─── Current Step ─────────────────┐ │
│ │ Step 1: Service & Location       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Pickup Location ──────────────┐  │
│ │ 🔍 Where are you starting?     │  │
│ │ [Search input with suggestions] │  │
│ │ 📍 Use current location        │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌─ Destination ──────────────────┐  │
│ │ 🎯 Where to?                   │  │
│ │ [Search input with suggestions] │  │
│ │ 🏢 Popular: Shenzhen, Guangzhou│  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌─ Service Type ─────────────────┐  │
│ │ ○ One-way Trip                 │  │
│ │ ● Round Trip                   │  │
│ │ ○ Hourly Service               │  │
│ └───────────────────────────────┘  │
│                                     │
│ [Continue to Vehicle Selection] →   │
└─────────────────────────────────────┘
```

### Vehicle Selection Interface
```
┌─── Vehicle Options ─────────────────────────────────────────────────────────────┐
│                                                                                 │
│ ┌─ Business Class ──┐ ┌─ Executive SUV ───┐ ┌─ Luxury Premium ─┐              │
│ │ [Vehicle Image]   │ │ [Vehicle Image]   │ │ [Vehicle Image]  │              │
│ │ Mercedes E-Class  │ │ BMW X5 / Audi Q7  │ │ Mercedes S-Class │              │
│ │ • 3 passengers    │ │ • 6 passengers    │ │ • 3 passengers   │              │
│ │ • 2-3 luggage     │ │ • 4-6 luggage     │ │ • 3-4 luggage    │              │
│ │ • Wi-Fi, USB      │ │ • Entertainment   │ │ • Massage seats  │              │
│ │                   │ │ • Captain chairs  │ │ • Champagne      │              │
│ │ From HK$800       │ │ From HK$1,200     │ │ From HK$1,800    │              │
│ │ [Select] ○        │ │ [Select] ●        │ │ [Select] ○       │              │
│ └─────────────────┘ └─────────────────┘ └────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Amap Integration Points

#### Location Services Integration
```typescript
interface AmapIntegration {
  // Autocomplete service
  searchLocation: {
    endpoint: "https://restapi.amap.com/v3/place/text"
    features: ["real-time suggestions", "POI search", "address parsing"]
  }
  
  // Geocoding service
  geocoding: {
    endpoint: "https://restapi.amap.com/v3/geocode/geo"
    features: ["address to coordinates", "coordinate to address"]
  }
  
  // Route planning
  routing: {
    endpoint: "https://restapi.amap.com/v3/direction/driving"
    features: ["cross-border routing", "time estimation", "traffic conditions"]
  }
  
  // Map display
  webAPI: {
    version: "2.0"
    features: ["interactive map", "custom markers", "route visualization"]
  }
}
```

#### Location Search Component Specifications
```
┌─── Search Input ──────────────────────────────────────┐
│ 🔍 [Search Hong Kong locations...]                    │
│ ┌─ Dropdown Suggestions ──────────────────────────┐   │
│ │ 📍 Central, Hong Kong                            │   │
│ │ 📍 Tsim Sha Tsui, Kowloon                       │   │
│ │ 📍 Hong Kong International Airport               │   │
│ │ ─────────────────────────────────────────────── │   │
│ │ 📌 Recent Locations                             │   │
│ │ 🏢 Your Office - Central Tower                  │   │
│ │ 🏠 Home - Mid-Levels                           │   │
│ └─────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

**Component Properties:**
- Real-time search with 300ms debounce
- Minimum 2 characters to trigger search
- Maximum 10 suggestions displayed
- Categories: POI, Address, Recent, Favorites
- Loading state with skeleton animation
- Error handling for network failures

## 3. BLOG SECTION DESIGN

### Blog Homepage Layout
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│ ┌─── Hero Article ─────────────────────────────────────────────────────────────┐   │
│ │                              [Large Featured Image]                          │   │
│ │                                                                               │   │
│ │ ┌─ Article Overlay ──────────────────────────────────────────────────────┐   │   │
│ │ │ Travel Tips                                                             │   │   │
│ │ │ Essential Guide to Cross-Border Travel in 2025                         │   │   │
│ │ │ Your complete guide to seamless travel between Hong Kong and China...  │   │   │
│ │ │ By Sarah Chen • Jan 15, 2025 • 8 min read                             │   │   │
│ │ └─────────────────────────────────────────────────────────────────────┘   │   │
│ └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│ ┌─── Category Filter ─────────────────────────────────────────────────────────┐   │
│ │ ● All  ○ Travel Tips  ○ Cross-Border Guide  ○ News  ○ Company Updates     │   │
│ └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│ ┌─── Article Grid ─────────────────────────────────────────────────────────────┐   │
│ │                                                                               │   │
│ │ ┌─ Article Card ─┐ ┌─ Article Card ─┐ ┌─ Article Card ─┐                   │   │
│ │ │ [Image]        │ │ [Image]        │ │ [Image]        │                   │   │
│ │ │ Category       │ │ Category       │ │ Category       │                   │   │
│ │ │ Article Title  │ │ Article Title  │ │ Article Title  │                   │   │
│ │ │ Excerpt...     │ │ Excerpt...     │ │ Excerpt...     │                   │   │
│ │ │ Author • Date  │ │ Author • Date  │ │ Author • Date  │                   │   │
│ │ │ 5 min read     │ │ 3 min read     │ │ 7 min read     │                   │   │
│ │ └────────────────┘ └────────────────┘ └────────────────┘                   │   │
│ └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│ [Load More Articles]                                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Article Card Specifications
```
Card Dimensions:
- Desktop: 384px width x 520px height
- Tablet: 320px width x 480px height  
- Mobile: Full width x 400px height

Image:
- Aspect ratio: 16:9
- Lazy loading with blur placeholder
- Alt text required for accessibility

Content Structure:
- Category tag (12px, Medium, Chinese Red background)
- Title (20px, SemiBold, 2-line max with ellipsis)
- Excerpt (14px, Regular, 3-line max with ellipsis)
- Meta info (12px, Medium, Gray-600)

Interactions:
- Hover: Lift effect with shadow-md
- Focus: 2px Electric Blue outline
- Click: Navigate to full article
```

### Individual Article Layout
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│ ┌─── Article Header ──────────────────────────────────────────────────────────────┐ │
│ │ Travel Tips                                                                     │ │
│ │ # Essential Guide to Cross-Border Travel in 2025                               │ │
│ │                                                                                 │ │
│ │ Your complete guide to seamless travel between Hong Kong and China,            │ │
│ │ covering everything from documentation to customs procedures.                   │ │
│ │                                                                                 │ │
│ │ 👤 Sarah Chen • 📅 January 15, 2025 • ⏱️ 8 min read • 🏷️ Travel, Guide       │ │
│ │ [Share] [Bookmark] [Print]                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─── Featured Image ──────────────────────────────────────────────────────────────┐ │
│ │                        [Hero Image - Border Crossing]                          │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─── Article Content (Max-width: 768px, Centered) ───────────────────────────────┐ │
│ │                                                                                 │ │
│ │ ## Introduction                                                                 │ │
│ │                                                                                 │ │
│ │ Cross-border travel between Hong Kong and Mainland China has evolved           │ │
│ │ significantly in recent years. With new policies, updated procedures...        │ │
│ │                                                                                 │ │
│ │ [Rich content with images, lists, quotes, etc.]                               │ │
│ │                                                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─── Article Footer ──────────────────────────────────────────────────────────────┐ │
│ │ Tags: #CrossBorder #Travel #HongKong #China                                    │ │
│ │                                                                                 │ │
│ │ ┌─ Author Bio ───────────────────────────────────────────────────────────────┐  │ │
│ │ │ 👤 [Photo] Sarah Chen - Senior Travel Writer                                │  │ │
│ │ │    Sarah has over 10 years of experience covering cross-border travel...    │  │ │
│ │ │    [Social Links]                                                           │  │ │
│ │ └─────────────────────────────────────────────────────────────────────────────┘  │ │
│ │                                                                                 │ │
│ │ ┌─ Related Articles ─────────────────────────────────────────────────────────┐  │ │
│ │ │ [Article 1] [Article 2] [Article 3]                                        │  │ │
│ │ └─────────────────────────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 4. MULTI-USER AUTHENTICATION SYSTEM

### Authentication Modal Design
```
┌─── Authentication Modal (480px width) ──────────────────────────────────────────┐
│                                                                                 │
│ ┌─── Header ─────────────────────────────────────────────────────────────────┐  │
│ │ Welcome to CrossBorder                                              [✕]    │  │
│ │ Sign in to your account or create a new one                               │  │
│ └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│ ┌─── User Type Selection ───────────────────────────────────────────────────┐  │
│ │ I am a:                                                                   │  │
│ │ ● Client (Book rides)  ○ Driver (Provide service)  ○ Editor (Manage blog)│  │
│ └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│ ┌─── Login Form ────────────────────────────────────────────────────────────┐  │
│ │ Email Address                                                             │  │
│ │ [___________________________]                                            │  │
│ │                                                                           │  │
│ │ Password                                                                  │  │
│ │ [___________________________]                                            │  │
│ │                                                                           │  │
│ │ ☐ Remember me                                      Forgot password?       │  │
│ │                                                                           │  │
│ │ [Sign In →]                                                              │  │
│ │                                                                           │  │
│ │ ─────────────────── or ───────────────────                              │  │
│ │                                                                           │  │
│ │ [Continue with WeChat]  [Continue with Google]                           │  │
│ │                                                                           │  │
│ │ Don't have an account? Create Account                                    │  │
│ └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Client Registration Flow
```
Step 1: Basic Information
┌─────────────────────────────────────────┐
│ Create Your Account                     │
│                                         │
│ Full Name                               │
│ [_________________________]            │
│                                         │
│ Email Address                           │
│ [_________________________]            │
│                                         │
│ Phone Number                            │
│ [+852] [___________________]            │
│                                         │
│ Password                                │
│ [_________________________]            │
│                                         │
│ Confirm Password                        │
│ [_________________________]            │
│                                         │
│ ☐ I agree to Terms & Conditions        │
│ ☐ Subscribe to travel updates          │
│                                         │
│ [Create Account →]                      │
└─────────────────────────────────────────┘

Step 2: Email Verification
┌─────────────────────────────────────────┐
│ Verify Your Email                       │
│                                         │
│ We've sent a verification code to:      │
│ user@example.com                        │
│                                         │
│ Enter the 6-digit code:                 │
│ [_] [_] [_] [_] [_] [_]                │
│                                         │
│ [Verify Email]                          │
│                                         │
│ Didn't receive it? Resend Code          │
└─────────────────────────────────────────┘
```

### Driver Registration Flow
```
Step 1: Personal Information
┌─────────────────────────────────────────┐
│ Driver Application - Step 1 of 4        │
│                                         │
│ Full Name (as on license)               │
│ [_________________________]            │
│                                         │
│ Hong Kong ID Number                     │
│ [_________________________]            │
│                                         │
│ Email Address                           │
│ [_________________________]            │
│                                         │
│ Mobile Number                           │
│ [+852] [___________________]            │
│                                         │
│ Date of Birth                           │
│ [DD/MM/YYYY________________]            │
│                                         │
│ Address                                 │
│ [_________________________]            │
│ [_________________________]            │
│                                         │
│ [Continue →]                            │
└─────────────────────────────────────────┘

Step 2: Profile Photo
┌─────────────────────────────────────────┐
│ Driver Application - Step 2 of 4        │
│                                         │
│ Profile Photo                           │
│ ┌─ Upload Area ─────────────────────┐   │
│ │                                   │   │
│ │     📷 Click to upload or        │   │
│ │        drag photo here           │   │
│ │                                   │   │
│ │   Accepted: JPG, PNG (max 5MB)   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Requirements:                           │
│ • Clear headshot photo                  │
│ • Face clearly visible                  │
│ • Recent photo (within 6 months)       │
│                                         │
│ [← Back]            [Continue →]        │
└─────────────────────────────────────────┘

Step 3: Document Upload
┌─────────────────────────────────────────┐
│ Driver Application - Step 3 of 4        │
│                                         │
│ Required Documents:                     │
│                                         │
│ ✓ Hong Kong Driving License             │
│ ┌─ Upload Status: Uploaded ────────┐    │
│ │ HK_License_JohnChan_2025.pdf     │    │
│ │ [View] [Replace]                 │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ○ Vehicle Registration                  │
│ ┌─ Upload Area ────────────────────┐    │
│ │ 📄 Drag files or click to upload │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ○ HK Insurance Certificate             │
│ ┌─ Upload Area ────────────────────┐    │
│ │ 📄 Drag files or click to upload │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ○ China Insurance Certificate          │
│ ┌─ Upload Area ────────────────────┐    │
│ │ 📄 Drag files or click to upload │    │
│ └─────────────────────────────────┘    │
│                                         │
│ [← Back]            [Submit Application]│
└─────────────────────────────────────────┘
```

### Blog Editor Registration
```
Step 1: Editor Information  
┌─────────────────────────────────────────┐
│ Blog Editor Application                  │
│                                         │
│ Full Name                               │
│ [_________________________]            │
│                                         │
│ Professional Email                      │
│ [_________________________]            │
│                                         │
│ Job Title                               │
│ [_________________________]            │
│                                         │
│ Company/Organization                    │
│ [_________________________]            │
│                                         │
│ Writing Experience (years)              │
│ [< 1] [1-3] [3-5] [5+]                 │
│                                         │
│ Portfolio/Writing Samples               │
│ [_________________________]            │
│                                         │
│ Brief Bio (500 chars max)               │
│ [_________________________]            │
│ [_________________________]            │
│ [_________________________]            │
│                                         │
│ [Submit Application →]                  │
└─────────────────────────────────────────┘
```

This completes the first part of the comprehensive design specifications. The navigation architecture has been redesigned to support the multi-user authentication system while maintaining the Tesla-inspired aesthetic. The booking system incorporates Amap integration points, and the blog section follows a magazine-style layout.
