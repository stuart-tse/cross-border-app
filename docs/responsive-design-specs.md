# Responsive Design Specifications

## Breakpoint Strategy

### Device Categories & Breakpoints
```
Mobile:           320px - 767px   (Primary mobile optimization)
Mobile Large:     375px - 414px   (iPhone 6+ to iPhone 12 Pro Max)
Tablet:           768px - 1023px  (iPad, Android tablets)
Desktop Small:    1024px - 1199px (Small laptops, desktop)
Desktop Large:    1200px - 1439px (Standard desktop)
Desktop XL:       1440px+         (Large monitors, 4K displays)
```

### Container Widths
```
Mobile:           100% (16px margins)
Mobile Large:     100% (20px margins)  
Tablet:           100% (32px margins)
Desktop Small:    960px centered
Desktop Large:    1200px centered
Desktop XL:       1200px centered (never exceed)
```

## Homepage Responsive Behavior

### Header Navigation Responsive Transformation

#### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO: CrossBorder]    [Home] [Services] [Routes] [About]    [EN/中文] │
│                                                              [Contact] │  
└─────────────────────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────────┐
│ [LOGO]  [Home] [Services] [Routes] [About]      [EN/中文] │
│                                                [Contact] │  
└─────────────────────────────────────────────────────────┘
```

#### Mobile (320px - 767px)
```
┌─────────────────────────────────────┐
│ [☰]  CrossBorder          [EN/中文]  │
└─────────────────────────────────────┘

Mobile Menu (Slide-in from right):
┌─────────────────────────────────────┐
│                              [×]   │
│                                     │
│  Home                              │
│  Services                          │
│  Routes                            │
│  About                             │
│  Contact                           │
│                                     │
│  ──────────────────────────────────  │
│                                     │
│  📞 +852-XXXX-XXXX                 │
│  💬 WeChat Support                  │
│  📧 info@crossborder.com           │
└─────────────────────────────────────┘
```

### Hero Section Responsive Layout

#### Desktop Large (1200px+)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│    Premium Cross-Border Vehicle Services    [HERO IMAGE: 50% width] │
│    Between Hong Kong & Mainland China      Tesla-style luxury      │
│                                           vehicle crossing bridge   │
│    Professional. Reliable. Seamless.      HK→China - High quality] │
│                                                                     │
│    ┌─────────────┐  ┌─────────────┐                                │
│    │  Book Now   │  │ Learn More  │                                │
│    └─────────────┘  └─────────────┘                                │
│                                                                     │
│    ✓ Licensed Cross-Border Operators                               │
│    ✓ 24/7 Professional Service                                     │
│    ✓ Real-Time Tracking & Updates                                  │
└─────────────────────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Premium Cross-Border Vehicle Services          │
│         Between Hong Kong & Mainland China             │
│                                                         │
│         Professional. Reliable. Seamless.              │
│                                                         │
│         ┌─────────────┐  ┌─────────────┐               │
│         │  Book Now   │  │ Learn More  │               │
│         └─────────────┘  └─────────────┘               │
│                                                         │
│         [HERO IMAGE: Full width, reduced height]       │
│                                                         │
│         ✓ Licensed Cross-Border Operators               │
│         ✓ 24/7 Professional Service                     │
│         ✓ Real-Time Tracking & Updates                  │
└─────────────────────────────────────────────────────────┘
```

#### Mobile (320px - 767px)
```
┌─────────────────────────────────────┐
│                                     │
│  Premium Cross-Border               │
│  Vehicle Services                   │
│                                     │
│  Between Hong Kong &                │
│  Mainland China                     │
│                                     │
│  Professional. Reliable.            │
│  Seamless.                          │
│                                     │
│  ┌─────────────┐                   │
│  │  Book Now   │                   │
│  └─────────────┘                   │
│  ┌─────────────┐                   │
│  │ Learn More  │                   │
│  └─────────────┘                   │
│                                     │
│  [HERO IMAGE: Full width]          │
│                                     │
│  ✓ Licensed Operators               │
│  ✓ 24/7 Service                     │
│  ✓ Real-Time Tracking              │
└─────────────────────────────────────┘
```

### Service Cards Responsive Grid

#### Desktop (1024px+): 4-Column Grid
```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│   [ICON]   │ │   [ICON]   │ │   [ICON]   │ │   [ICON]   │
│Cross-Border│ │ Corporate  │ │ Logistics  │ │  Airport   │
│ Transfers  │ │ Solutions  │ │ Support    │ │ Services   │
│            │ │            │ │            │ │            │
│Professional│ │Executive   │ │Cargo &     │ │Direct      │
│transfers...|  │transport...│ │freight...  │ │connections │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

#### Tablet (768px - 1023px): 2-Column Grid
```
┌──────────────────────┐ ┌──────────────────────┐
│       [ICON]         │ │       [ICON]         │
│   Cross-Border       │ │   Corporate          │
│    Transfers         │ │   Solutions          │
│                      │ │                      │
│ Professional door-to │ │ Executive transport  │
│ door service...      │ │ for business teams.. │
└──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│       [ICON]         │ │       [ICON]         │
│    Logistics         │ │     Airport          │
│     Support          │ │     Services         │
│                      │ │                      │
│ Cargo & freight      │ │ Direct airport       │
│ solutions...         │ │ connections...       │
└──────────────────────┘ └──────────────────────┘
```

#### Mobile (320px - 767px): 1-Column Stack
```
┌─────────────────────────────────────┐
│            [ICON]                   │
│        Cross-Border                 │
│         Transfers                   │
│                                     │
│ Professional door-to-door service   │
│ between Hong Kong and major         │
│ Mainland China cities...            │
│                                     │
│        ┌─────────────┐              │
│        │ Learn More  │              │
│        └─────────────┘              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│            [ICON]                   │
│         Corporate                   │
│         Solutions                   │
│                                     │
│ Executive transportation for        │
│ business teams, including...        │
│                                     │
│        ┌─────────────┐              │
│        │ Learn More  │              │
│        └─────────────┘              │
└─────────────────────────────────────┘
```

### Fleet Showcase Responsive Layout

#### Desktop (1024px+): 3-Column Layout
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │  │                  │
│  [VEHICLE IMAGE] │  │  [VEHICLE IMAGE] │  │  [VEHICLE IMAGE] │
│                  │  │                  │  │                  │
│  Business Class  │  │  Executive SUV   │  │  Luxury Premium  │
│  Mercedes E-Class│  │  BMW X5 Series   │  │  Mercedes S-Class│
│                  │  │                  │  │                  │
│  Capacity: 3     │  │  Capacity: 6     │  │  Capacity: 3     │
│  From HK$800     │  │  From HK$1,200   │  │  From HK$1,800   │
│                  │  │                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │Select Fleet│  │  │  │Select Fleet│  │  │  │Select Fleet│  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

#### Tablet (768px - 1023px): 2-Column + Centered 1
```
┌────────────────────────────┐  ┌────────────────────────────┐
│                            │  │                            │
│     [VEHICLE IMAGE]        │  │     [VEHICLE IMAGE]        │
│                            │  │                            │
│     Business Class         │  │     Executive SUV          │
│     Mercedes E-Class       │  │     BMW X5 Series          │
│     Capacity: 3            │  │     Capacity: 6            │
│     From HK$800            │  │     From HK$1,200          │
│                            │  │                            │
│     ┌────────────────┐     │  │     ┌────────────────┐     │
│     │  Select Fleet  │     │  │     │  Select Fleet  │     │
│     └────────────────┘     │  │     └────────────────┘     │
└────────────────────────────┘  └────────────────────────────┘

              ┌────────────────────────────┐
              │                            │
              │     [VEHICLE IMAGE]        │
              │                            │
              │     Luxury Premium         │
              │     Mercedes S-Class       │
              │     Capacity: 3            │
              │     From HK$1,800          │
              │                            │
              │     ┌────────────────┐     │
              │     │  Select Fleet  │     │
              │     └────────────────┘     │
              └────────────────────────────┘
```

#### Mobile (320px - 767px): Horizontal Scroll Cards
```
┌─────────────────────────────────────┐
│          Premium Fleet              │
│                                     │
│ ←→ Swipe to see all options         │
│                                     │
│ ┌─────────┐┌─────────┐┌─────────┐   │
│ │[IMAGE]  ││[IMAGE]  ││[IMAGE]  │   │
│ │Business ││Executive││Luxury   │   │
│ │Class    ││SUV      ││Premium  │   │
│ │         ││         ││         │   │
│ │3 pax    ││6 pax    ││3 pax    │   │
│ │HK$800   ││HK$1,200 ││HK$1,800 │   │
│ │         ││         ││         │   │
│ │[Select] ││[Select] ││[Select] │   │
│ └─────────┘└─────────┘└─────────┘   │
│                                     │
│ ●○○                                 │
└─────────────────────────────────────┘
```

## Booking Flow Responsive Behavior

### Multi-Step Form Layout Adaptations

#### Desktop: Horizontal Progress + Side-by-Side Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Book Your Journey                            │
│                                                                     │
│ Step 2 of 4: Select Route & Vehicle                                │
│ ●●○○                                                               │
│                                                                     │
│ ┌─────────────────────┐  ┌─────────────────────────────────────┐   │
│ │  Route Selection    │  │  Vehicle Selection                  │   │
│ │                     │  │                                     │   │
│ │ From: [HK Central▼] │  │ ┌─────────┐┌─────────┐┌─────────┐   │   │
│ │ To: [Shenzhen ▼]    │  │ │Business ││Executive││Luxury   │   │   │
│ │                     │  │ │Class    ││SUV      ││Premium  │   │   │
│ │ Time: 45-60 mins    │  │ │HK$800   ││HK$1,200 ││HK$1,800 │   │   │
│ │ Distance: ~35 km    │  │ └─────────┘└─────────┘└─────────┘   │   │
│ └─────────────────────┘  └─────────────────────────────────────┘   │
│                                                                     │
│                 ┌─────────────┐  ┌─────────────┐                   │
│                 │    Back     │  │    Next     │                   │
│                 └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Tablet: Stacked Sections
```
┌─────────────────────────────────────────────────────┐
│                Book Your Journey                    │
│                                                     │
│ Step 2 of 4: Select Route & Vehicle                │
│ ●●○○                                               │
│                                                     │
│ Route Selection:                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ From: [Hong Kong Central          ▼]           │ │
│ │ To:   [Shenzhen Futian District   ▼]           │ │
│ │                                                 │ │
│ │ ⚡ Estimated Time: 45-60 minutes                │ │
│ │ 🚗 Distance: ~35 km                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Vehicle Selection:                                  │
│ ┌─────────────┐  ┌─────────────┐                  │
│ │ ○ Business  │  │ ● Executive │                  │
│ │   Class     │  │   SUV       │                  │
│ │   HK$800    │  │   HK$1,200  │                  │
│ └─────────────┘  └─────────────┘                  │
│                                                     │
│ ┌─────────────┐                                    │
│ │ ○ Luxury    │                                    │
│ │   Premium   │                                    │
│ │   HK$1,800  │                                    │
│ └─────────────┘                                    │
│                                                     │
│         ┌─────────┐  ┌─────────┐                   │
│         │  Back   │  │  Next   │                   │
│         └─────────┘  └─────────┘                   │
└─────────────────────────────────────────────────────┘
```

#### Mobile: Full Stacked, One Section at a Time
```
┌─────────────────────────────────────┐
│        Book Your Journey            │
│                                     │
│ Step 2 of 4: Route & Vehicle        │
│ ●●○○                               │
│                                     │
│ Route Selection:                    │
│ ┌─────────────────────────────────┐ │
│ │ From:                           │ │
│ │ [Hong Kong Central        ▼]   │ │
│ │                                 │ │
│ │ To:                             │ │
│ │ [Shenzhen Futian District ▼]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚡ Time: 45-60 minutes              │
│ 🚗 Distance: ~35 km                │
│                                     │
│ Vehicle Selection:                  │
│ ┌─────────────────────────────────┐ │
│ │ ○ Business Class                │ │
│ │   Mercedes E-Class              │ │
│ │   👥 3 passengers               │ │
│ │   💰 HK$800                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ● Executive SUV                 │ │
│ │   BMW X5 Series                 │ │
│ │   👥 6 passengers               │ │
│ │   💰 HK$1,200                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│   ┌─────────┐  ┌─────────┐         │
│   │  Back   │  │  Next   │         │
│   └─────────┘  └─────────┘         │
└─────────────────────────────────────┘
```

## Typography Responsive Scaling

### Heading Sizes by Breakpoint
```
Display Large:
Desktop:    72px / Line-height: 1.1 / Letter-spacing: -2px
Tablet:     56px / Line-height: 1.1 / Letter-spacing: -1.5px  
Mobile:     40px / Line-height: 1.2 / Letter-spacing: -1px

Headline Large:
Desktop:    40px / Line-height: 1.2 / Letter-spacing: -0.5px
Tablet:     32px / Line-height: 1.2 / Letter-spacing: -0.25px
Mobile:     28px / Line-height: 1.3 / Letter-spacing: 0px

Body Text:
Desktop:    16px / Line-height: 1.6 / Letter-spacing: 0.15px
Tablet:     16px / Line-height: 1.6 / Letter-spacing: 0.15px
Mobile:     16px / Line-height: 1.5 / Letter-spacing: 0.25px
```

### Button Sizes by Breakpoint
```
Primary Buttons:
Desktop:    Padding: 12px 24px / Font: 14px SemiBold
Tablet:     Padding: 12px 24px / Font: 14px SemiBold  
Mobile:     Padding: 14px 24px / Font: 16px SemiBold

Secondary Buttons:
Desktop:    Padding: 11px 23px / Font: 14px SemiBold
Tablet:     Padding: 11px 23px / Font: 14px SemiBold
Mobile:     Padding: 13px 23px / Font: 16px SemiBold

Touch Targets:
Mobile:     Minimum 44px height for all interactive elements
Tablet:     Minimum 44px height for touch-based interactions
Desktop:    Standard button heights (varies by context)
```

## Image & Media Responsive Strategy

### Hero Images
```
Desktop Large (1440px+):   1920x1080px WebP, JPEG fallback
Desktop (1024-1439px):     1440x810px WebP, JPEG fallback  
Tablet (768-1023px):       1024x576px WebP, JPEG fallback
Mobile Large (414px+):     828x466px WebP, JPEG fallback
Mobile (320-413px):        640x360px WebP, JPEG fallback
```

### Vehicle Images
```
Desktop:    400x300px per card, 2x retina = 800x600px
Tablet:     350x263px per card, 2x retina = 700x526px
Mobile:     280x210px per card, 2x retina = 560x420px
```

### Lazy Loading Strategy
- Above-the-fold images load immediately
- Below-the-fold images lazy load with intersection observer
- Placeholder skeleton screens during loading
- Progressive JPEG encoding for smoother loading

## Performance Optimizations by Device

### Mobile Optimization
- Critical CSS inline for first paint
- Defer non-essential JavaScript
- Optimize images for 2x/3x pixel density
- Minimize HTTP requests
- Use CSS Grid with fallbacks for older browsers

### Tablet Optimization  
- Balance between mobile and desktop features
- Touch-friendly interactions with hover alternatives
- Optimized image sizes for retina displays
- Maintain desktop-like functionality where possible

### Desktop Optimization
- Full feature set with advanced interactions
- Optimize for mouse/keyboard navigation
- Take advantage of larger viewport for immersive layouts
- Implement subtle hover effects and animations

## Tesla-Inspired Responsive Principles

### Visual Consistency Across Devices
- Maintain design proportions and visual hierarchy
- Scale white space proportionally, never eliminate
- Keep typography relationships consistent
- Preserve the premium, minimalist aesthetic at all sizes

### Interaction Patterns
- Touch-first design that enhances with mouse
- Consistent interaction feedback across all devices
- Progressive enhancement for advanced features
- Seamless transitions between device orientations

### Content Strategy
- Progressive disclosure based on screen real estate
- Maintain core messaging across all devices
- Prioritize essential actions on smaller screens
- Keep Tesla's confident, direct communication style

## Implementation Guidelines

### CSS Architecture
```css
/* Mobile First Approach */
.hero-section {
  padding: 32px 16px;
  text-align: center;
}

@media (min-width: 768px) {
  .hero-section {
    padding: 48px 32px;
  }
}

@media (min-width: 1024px) {
  .hero-section {
    padding: 64px 0;
    text-align: left;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
}

@media (min-width: 1440px) {
  .hero-section {
    padding: 96px 0;
  }
}
```

### Component Responsiveness
- Use CSS Grid and Flexbox for layout
- Implement container queries where supported
- Design components to work at any size
- Test across multiple devices and orientations
- Ensure all interactive elements meet accessibility standards