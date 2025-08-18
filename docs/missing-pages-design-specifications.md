# CrossBorder Vehicle Services - Missing Pages Design Specifications

## Overview

This document provides comprehensive UI/UX design specifications for the five critical missing pages in the CrossBorder Vehicle Services web application. Each design maintains consistency with the existing light pink theme (#FF69B4) and Tesla-inspired aesthetic while ensuring accessibility and responsive functionality.

## Design System Overview

### Color Palette (Light Pink Theme)
```
Primary Pink: #FF69B4 (hot-pink)
Secondary Pink: #FFB6C1 (light-pink)  
Accent Pink: #FF1493 (deep-pink)
Background Tint: #FFF0F5 (pink-tint)
Rose Gold: #F7C6C7 (elegant accent)

Supporting Colors:
- Primary Black: #000000
- Pure White: #FFFFFF
- Charcoal: #171A20
- Electric Blue: #0066CC (focus states)
- Success Green: #00D563
- Warning Amber: #FFB800
- Error Red: #FF4B4B
```

### Typography Scale
```
Display Large: 72px/Bold/-2px (Hero titles)
Display Medium: 56px/Bold/-1.5px (Section headers)
Headline Large: 40px/Bold/-0.5px (Page titles)
Title Large: 24px/SemiBold/0px (Card titles)
Title Medium: 20px/SemiBold/0.1px (Subsections)
Body Large: 16px/Regular/0.15px (Main content)
Body Medium: 14px/Regular/0.25px (Secondary content)
Caption: 11px/Medium/0.5px (Meta info)
```

---

## 1. Login/Authentication Page Design

### Layout Structure
```
Header (64px height)
├── Authentication Container (max-width: 480px, centered)
    ├── Logo Section (Company branding)
    ├── Welcome Message (Dynamic based on mode)
    ├── User Type Selection (Registration only)
    ├── Form Fields (Email, Password, etc.)
    ├── Social Login Options (Google, WeChat)
    ├── Mode Toggle (Login ↔ Register)
    └── Footer Links (Privacy, Terms)
```

### User Type Selection (Registration Step 1)
```html
<!-- User Type Cards Layout -->
<div className="grid grid-cols-1 gap-4 mb-6">
  
  <!-- Client Card -->
  <button className="p-6 border-2 rounded-lg hover:border-hot-pink transition-all duration-200 
                   hover:bg-pink-tint focus:ring-2 focus:ring-hot-pink">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-hot-pink rounded-full flex items-center justify-center">
        <span className="text-white text-xl">👤</span>
      </div>
      <div className="text-left">
        <h3 className="text-title-md font-semibold text-charcoal">Client</h3>
        <p className="text-body-md text-gray-600">Book premium cross-border transportation services</p>
        <ul className="mt-2 text-body-sm text-gray-500">
          <li>• Instant booking and real-time tracking</li>
          <li>• Trip history and analytics</li>
          <li>• 24/7 customer support</li>
        </ul>
      </div>
    </div>
  </button>

  <!-- Driver Card -->
  <button className="p-6 border-2 rounded-lg hover:border-electric-blue transition-all duration-200 
                   hover:bg-blue-50 focus:ring-2 focus:ring-electric-blue">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-electric-blue rounded-full flex items-center justify-center">
        <span className="text-white text-xl">🚗</span>
      </div>
      <div className="text-left">
        <h3 className="text-title-md font-semibold text-charcoal">Driver</h3>
        <p className="text-body-md text-gray-600">Join our professional driver network</p>
        <ul className="mt-2 text-body-sm text-gray-500">
          <li>• Manage trip requests and earnings</li>
          <li>• Document verification system</li>
          <li>• Performance analytics</li>
        </ul>
      </div>
    </div>
  </button>

  <!-- Blog Editor Card -->
  <button className="p-6 border-2 rounded-lg hover:border-success-green transition-all duration-200 
                   hover:bg-green-50 focus:ring-2 focus:ring-success-green">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-success-green rounded-full flex items-center justify-center">
        <span className="text-white text-xl">✍️</span>
      </div>
      <div className="text-left">
        <h3 className="text-title-md font-semibold text-charcoal">Blog Editor</h3>
        <p className="text-body-md text-gray-600">Create and manage travel content</p>
        <ul className="mt-2 text-body-sm text-gray-500">
          <li>• Content management system</li>
          <li>• SEO optimization tools</li>
          <li>• Analytics dashboard</li>
        </ul>
      </div>
    </div>
  </button>
</div>
```

### Form Fields (Registration Step 2 & Login)
```html
<form className="space-y-6">
  <!-- Selected User Type Indicator (Registration only) -->
  <div className="flex items-center justify-center mb-6">
    <div className="flex items-center space-x-2 px-4 py-2 bg-pink-tint rounded-full">
      <span className="text-lg">👤</span>
      <span className="text-body-md font-medium text-hot-pink">Client Account</span>
    </div>
  </div>

  <!-- Form Fields -->
  <Input label="Full Name" type="text" placeholder="Enter your full name" required />
  <Input label="Email Address" type="email" placeholder="Enter your email" required />
  <Input label="Password" type="password" placeholder="Enter your password" required />
  <Input label="Confirm Password" type="password" placeholder="Confirm your password" required />
  
  <!-- Action Buttons -->
  <div className="space-y-4">
    <Button variant="primary" size="lg" className="w-full">
      Create Account
    </Button>
    
    <!-- Social Login -->
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Or continue with</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md 
                        hover:bg-gray-50 transition-colors duration-200">
        <span className="mr-2">🌐</span>
        Google
      </button>
      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md 
                        hover:bg-gray-50 transition-colors duration-200">
        <span className="mr-2">💬</span>
        WeChat
      </button>
    </div>
  </div>
</form>
```

---

## 2. Client Dashboard Design

### Layout Structure
```
Header (64px)
├── Dashboard Container
    ├── Welcome Section (Quick stats + greeting)
    ├── Quick Booking Widget (Prominent CTA)
    ├── Recent Trips Section (Card grid)
    ├── Trip Analytics (Charts + insights)
    ├── Notifications Center
    └── Profile Management
```

### Dashboard Components

#### Welcome Section
```html
<section className="bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg p-6 text-white mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-headline-md font-bold">Welcome back, Michael!</h1>
      <p className="text-body-lg opacity-90">Ready for your next journey?</p>
    </div>
    <div className="text-right">
      <div className="text-title-lg font-semibold">12</div>
      <div className="text-body-sm opacity-75">Total Trips</div>
    </div>
  </div>
  
  <!-- Quick Stats -->
  <div className="grid grid-cols-3 gap-4 mt-6">
    <div className="bg-white/10 rounded-lg p-4 text-center">
      <div className="text-title-md font-semibold">HK$12,450</div>
      <div className="text-body-sm opacity-75">Total Spent</div>
    </div>
    <div className="bg-white/10 rounded-lg p-4 text-center">
      <div className="text-title-md font-semibold">98.5%</div>
      <div className="text-body-sm opacity-75">On-Time Rate</div>
    </div>
    <div className="bg-white/10 rounded-lg p-4 text-center">
      <div className="text-title-md font-semibold">4.9★</div>
      <div className="text-body-sm opacity-75">Avg Rating</div>
    </div>
  </div>
</section>
```

#### Quick Booking Widget
```html
<Card className="mb-8 bg-gradient-to-br from-pink-tint to-white border-hot-pink/20">
  <div className="text-center mb-6">
    <h2 className="text-title-lg font-semibold text-charcoal mb-2">Quick Booking</h2>
    <p className="text-body-md text-gray-600">Book your next trip in seconds</p>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Select label="From" options={locationOptions} />
    <Select label="To" options={locationOptions} />
    <Input label="Date" type="date" />
  </div>
  
  <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-hot-pink to-deep-pink">
    Find Available Vehicles
  </Button>
</Card>
```

#### Recent Trips Section
```html
<section className="mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-title-lg font-semibold text-charcoal">Recent Trips</h2>
    <Button variant="ghost" size="sm">View All</Button>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Trip Card -->
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success-green rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <h3 className="text-title-sm font-medium text-charcoal">Hong Kong → Shenzhen</h3>
            <p className="text-body-sm text-gray-500">March 15, 2024</p>
          </div>
        </div>
        <span className="text-title-sm font-semibold text-hot-pink">HK$850</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-body-sm">
        <div>
          <span className="text-gray-500">Vehicle:</span>
          <span className="text-charcoal ml-1">Business Class</span>
        </div>
        <div>
          <span className="text-gray-500">Duration:</span>
          <span className="text-charcoal ml-1">45 min</span>
        </div>
        <div>
          <span className="text-gray-500">Driver:</span>
          <span className="text-charcoal ml-1">Wong Chi-Ming</span>
        </div>
        <div>
          <span className="text-gray-500">Rating:</span>
          <span className="text-charcoal ml-1">5.0 ⭐</span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button variant="secondary" size="sm" className="flex-1">View Details</Button>
        <Button variant="primary" size="sm" className="flex-1">Book Again</Button>
      </div>
    </Card>
  </div>
</section>
```

---

## 3. Driver Dashboard Design

### Layout Structure
```
Header (64px)
├── Driver Dashboard Container
    ├── Status Toggle (Online/Offline)
    ├── Earnings Overview
    ├── Active Trip Requests
    ├── Verification Status
    ├── Vehicle Information
    └── Performance Analytics
```

#### Driver Status & Earnings
```html
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  <!-- Online Status Toggle -->
  <Card className="bg-gradient-to-br from-electric-blue to-blue-600 text-white">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-title-lg font-semibold">Driver Status</h2>
      <div className="flex items-center space-x-2">
        <span className="text-body-md">Offline</span>
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 
                          transition-colors focus:outline-none focus:ring-2 focus:ring-white">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
        </button>
        <span className="text-body-md font-medium">Online</span>
      </div>
    </div>
    <p className="text-body-md opacity-90">
      You're currently offline. Toggle online to start receiving trip requests.
    </p>
  </Card>

  <!-- Earnings Overview -->
  <Card>
    <h2 className="text-title-lg font-semibold text-charcoal mb-4">Today's Earnings</h2>
    <div className="text-center">
      <div className="text-display-sm font-bold text-hot-pink">HK$1,240</div>
      <div className="text-body-md text-gray-600 mb-4">8 trips completed</div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-title-sm font-semibold text-charcoal">HK$155</div>
          <div className="text-body-sm text-gray-500">Avg per trip</div>
        </div>
        <div>
          <div className="text-title-sm font-semibold text-charcoal">6.5h</div>
          <div className="text-body-sm text-gray-500">Online time</div>
        </div>
        <div>
          <div className="text-title-sm font-semibold text-charcoal">95%</div>
          <div className="text-body-sm text-gray-500">Accept rate</div>
        </div>
      </div>
    </div>
  </Card>
</div>
```

#### Trip Requests Queue
```html
<section className="mb-8">
  <h2 className="text-title-lg font-semibold text-charcoal mb-6">Active Trip Requests</h2>
  
  <!-- Trip Request Card -->
  <Card className="border-l-4 border-l-warning-amber mb-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-title-md font-semibold text-charcoal">Hong Kong → Guangzhou</h3>
        <p className="text-body-md text-gray-600">Requested 2 minutes ago</p>
      </div>
      <div className="text-right">
        <div className="text-title-lg font-bold text-hot-pink">HK$1,200</div>
        <div className="text-body-sm text-gray-500">Estimated earnings</div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-body-sm">
      <div>
        <span className="text-gray-500">Pickup:</span>
        <p className="text-charcoal font-medium">Central, Hong Kong</p>
      </div>
      <div>
        <span className="text-gray-500">Destination:</span>
        <p className="text-charcoal font-medium">Tianhe District</p>
      </div>
      <div>
        <span className="text-gray-500">Passengers:</span>
        <p className="text-charcoal font-medium">2 adults</p>
      </div>
      <div>
        <span className="text-gray-500">Vehicle:</span>
        <p className="text-charcoal font-medium">Executive SUV</p>
      </div>
    </div>
    
    <div className="flex gap-3">
      <Button variant="secondary" size="md" className="flex-1">Decline</Button>
      <Button variant="primary" size="md" className="flex-1 bg-success-green hover:bg-green-600">
        Accept Trip
      </Button>
    </div>
  </Card>
</section>
```

---

## 4. Blog Editor Dashboard Design

### Layout Structure
```
Header (64px)
├── Blog Dashboard Container
    ├── Content Overview (Stats + quick actions)
    ├── Recent Posts Management
    ├── Content Creation Tools
    ├── SEO Performance
    ├── Media Library
    └── Publishing Workflow
```

#### Content Overview
```html
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <Card className="text-center">
    <div className="text-display-sm font-bold text-success-green">24</div>
    <div className="text-body-md text-gray-600">Published Posts</div>
  </Card>
  
  <Card className="text-center">
    <div className="text-display-sm font-bold text-warning-amber">6</div>
    <div className="text-body-md text-gray-600">Draft Posts</div>
  </Card>
  
  <Card className="text-center">
    <div className="text-display-sm font-bold text-hot-pink">12.5K</div>
    <div className="text-body-md text-gray-600">Total Views</div>
  </Card>
  
  <Card className="text-center">
    <div className="text-display-sm font-bold text-electric-blue">85%</div>
    <div className="text-body-md text-gray-600">SEO Score</div>
  </Card>
</div>
```

#### Content Management Table
```html
<Card className="mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-title-lg font-semibold text-charcoal">Recent Posts</h2>
    <Button variant="primary" size="md" leftIcon="+" className="bg-success-green hover:bg-green-600">
      New Post
    </Button>
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left p-4 text-body-md font-semibold text-gray-600">Title</th>
          <th className="text-left p-4 text-body-md font-semibold text-gray-600">Status</th>
          <th className="text-left p-4 text-body-md font-semibold text-gray-600">Views</th>
          <th className="text-left p-4 text-body-md font-semibold text-gray-600">Last Modified</th>
          <th className="text-left p-4 text-body-md font-semibold text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-gray-100 hover:bg-gray-50">
          <td className="p-4">
            <h3 className="text-body-lg font-medium text-charcoal">Cross-Border Travel Guide 2024</h3>
            <p className="text-body-sm text-gray-500">Complete guide for seamless border crossings...</p>
          </td>
          <td className="p-4">
            <span className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-body-sm">
              Published
            </span>
          </td>
          <td className="p-4 text-body-md text-gray-600">2,341</td>
          <td className="p-4 text-body-md text-gray-600">2 hours ago</td>
          <td className="p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</Card>
```

---

## 5. Booking Page Design

### Layout Structure
```
Header (64px)
├── Booking Container
    ├── Step Indicator (4 steps)
    ├── Location Selection (Step 1)
    ├── Vehicle Selection (Step 2)
    ├── Date/Time Selection (Step 3)
    ├── Contact Information (Step 4)
    ├── Pricing Summary (Sidebar)
    └── Confirmation (Final step)
```

#### Step Indicator
```html
<div className="flex items-center justify-center mb-8">
  <div className="flex items-center space-x-4">
    <!-- Step 1 -->
    <div className="flex items-center">
      <div className="w-8 h-8 bg-hot-pink text-white rounded-full flex items-center justify-center text-sm font-medium">
        1
      </div>
      <span className="ml-2 text-body-md font-medium text-hot-pink">Route</span>
    </div>
    
    <div className="w-12 h-0.5 bg-hot-pink"></div>
    
    <!-- Step 2 -->
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
        2
      </div>
      <span className="ml-2 text-body-md text-gray-600">Vehicle</span>
    </div>
    
    <!-- Continue pattern for steps 3 & 4 -->
  </div>
</div>
```

#### Location Selection (Step 1)
```html
<Card className="mb-6">
  <h2 className="text-title-lg font-semibold text-charcoal mb-6">Choose Your Route</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <!-- From Location -->
    <div>
      <label className="block text-body-md font-semibold text-charcoal mb-3">From</label>
      <div className="relative">
        <input type="text" placeholder="Enter pickup location" 
               className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-hot-pink" />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-gray-400">📍</span>
        </div>
      </div>
      <!-- Location suggestions dropdown would appear here -->
    </div>
    
    <!-- To Location -->
    <div>
      <label className="block text-body-md font-semibold text-charcoal mb-3">To</label>
      <div className="relative">
        <input type="text" placeholder="Enter destination" 
               className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-hot-pink" />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-gray-400">🎯</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Popular Routes -->
  <div>
    <h3 className="text-title-sm font-semibold text-charcoal mb-3">Popular Routes</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <button className="p-3 border border-gray-200 rounded-lg hover:border-hot-pink hover:bg-pink-tint transition-all duration-200">
        <div className="text-left">
          <div className="text-body-md font-medium text-charcoal">Hong Kong → Shenzhen</div>
          <div className="text-body-sm text-gray-500">45-60 min • From HK$800</div>
        </div>
      </button>
      
      <button className="p-3 border border-gray-200 rounded-lg hover:border-hot-pink hover:bg-pink-tint transition-all duration-200">
        <div className="text-left">
          <div className="text-body-md font-medium text-charcoal">Hong Kong → Guangzhou</div>
          <div className="text-body-sm text-gray-500">2-2.5 hours • From HK$1,200</div>
        </div>
      </button>
    </div>
  </div>
</Card>
```

#### Vehicle Selection (Step 2)
```html
<Card className="mb-6">
  <h2 className="text-title-lg font-semibold text-charcoal mb-6">Select Your Vehicle</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Business Class Vehicle -->
    <div className="border-2 border-hot-pink bg-pink-tint rounded-lg p-4">
      <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
        <img src="/images/business-sedan.jpg" alt="Business Class" className="w-full h-full object-cover" />
      </div>
      
      <div className="text-center mb-4">
        <h3 className="text-title-md font-semibold text-charcoal">Business Class</h3>
        <p className="text-body-sm text-gray-600">Mercedes E-Class or equivalent</p>
      </div>
      
      <div className="flex justify-center space-x-4 mb-4 text-body-sm text-gray-600">
        <span>👥 3 passengers</span>
        <span>🧳 2-3 pieces</span>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-title-lg font-bold text-hot-pink">HK$800</div>
        <div className="text-body-sm text-gray-500">Estimated price</div>
      </div>
      
      <ul className="space-y-1 mb-4">
        <li className="text-body-sm text-gray-600 flex items-center">
          <span className="w-1.5 h-1.5 bg-success-green rounded-full mr-2"></span>
          Professional chauffeur
        </li>
        <li className="text-body-sm text-gray-600 flex items-center">
          <span className="w-1.5 h-1.5 bg-success-green rounded-full mr-2"></span>
          Wi-Fi connectivity
        </li>
        <li className="text-body-sm text-gray-600 flex items-center">
          <span className="w-1.5 h-1.5 bg-success-green rounded-full mr-2"></span>
          Climate control
        </li>
      </ul>
      
      <div className="text-center">
        <span className="px-3 py-1 bg-hot-pink text-white rounded-full text-body-sm font-medium">
          Selected
        </span>
      </div>
    </div>
    
    <!-- Executive SUV & Luxury Premium cards follow similar pattern -->
  </div>
</Card>
```

---

## Responsive Design Specifications

### Mobile (320px - 767px)
- Single column layouts
- Stacked cards and form elements
- Touch-optimized button sizes (min 44px)
- Collapsible navigation sections
- Reduced padding and margins
- Simplified data visualizations

### Tablet (768px - 1023px)
- Two-column layouts where appropriate
- Card grids (2 columns)
- Side navigation for dashboards
- Optimized form layouts
- Medium spacing and typography

### Desktop (1024px+)
- Full multi-column layouts
- Complex data visualizations
- Hover states and micro-interactions
- Full-featured navigation
- Maximum content density

---

## Accessibility Standards

### WCAG 2.1 AA Compliance
- Minimum 4.5:1 color contrast ratio
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on all interactive elements
- Semantic HTML structure
- Alt text for all images
- ARIA labels for complex interactions

### Focus Management
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-hot-pink focus:ring-offset-2;
}
```

### Keyboard Navigation
- Tab order follows logical reading pattern
- Enter/Space activates buttons and links
- Escape key closes modals and dropdowns
- Arrow keys navigate between related elements

---

## Multilingual Support

### Language Toggle Implementation
```html
<button className="flex items-center space-x-2 p-2 rounded-md hover:bg-pink-tint/50 transition-colors">
  <span className="text-body-md">🌐</span>
  <span className="text-body-md font-medium">EN</span>
  <ChevronDownIcon className="w-4 h-4" />
</button>
```

### Supported Languages
- English (EN)
- Traditional Chinese (繁體中文)
- Simplified Chinese (简体中文)
- Japanese (日本語)
- Korean (한국어)

### RTL Support Considerations
- Text alignment adjustments
- Icon positioning
- Layout mirroring for RTL languages
- Date/time format localization

---

## Dark Mode Specifications

### Color Adaptations
```css
:root[data-theme="dark"] {
  --color-background: #0F0F0F;
  --color-surface: #1A1A1A;
  --color-primary-text: #FFFFFF;
  --color-secondary-text: #B0B0B0;
  --color-hot-pink: #FF69B4;
  --color-border: #333333;
}
```

### Component Adjustments
- Card backgrounds: Dark gray (#1A1A1A)
- Text colors: White/light gray
- Border colors: Subtle gray
- Accent colors remain consistent
- Increased contrast for readability

---

## Performance Considerations

### Image Optimization
- WebP format with JPEG fallback
- Responsive image sizes
- Lazy loading for below-fold content
- Proper aspect ratios to prevent layout shift

### Animation Performance
- CSS transforms over layout changes
- RequestAnimationFrame for JavaScript animations
- Reduced motion preferences respect
- Hardware acceleration when beneficial

### Loading States
- Skeleton screens for content loading
- Progressive image loading
- Optimistic UI updates
- Error boundary implementations

---

## Integration with Backend APIs

### Authentication Flow
```javascript
// Login API integration
const handleLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const user = await response.json();
      // Redirect based on user type
      redirectToDashboard(user.userType);
    }
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};
```

### Real-time Updates
- WebSocket connections for live data
- Optimistic updates for better UX
- Error handling and retry mechanisms
- Offline state management

---

## Testing Specifications

### Unit Testing
- Component rendering tests
- User interaction simulations
- Accessibility compliance tests
- Cross-browser compatibility

### Integration Testing
- API integration tests
- End-to-end user flows
- Performance benchmarks
- Security vulnerability scans

### User Testing
- Usability testing with target users
- A/B testing for conversion optimization
- Mobile device testing
- Accessibility testing with screen readers

---

This comprehensive design specification provides all the necessary details for implementing the five missing pages while maintaining consistency with your existing design system and ensuring accessibility, performance, and user experience standards are met.