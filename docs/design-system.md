# Cross-Border Vehicle Services - Design System

## Design Philosophy

**Tesla-Inspired Principles:**
- **Minimalism:** Clean, uncluttered interfaces with purposeful white space
- **Premium Quality:** High-end materials, precise typography, and sophisticated color usage
- **Innovation Focus:** Forward-thinking design that suggests cutting-edge technology
- **Functional Beauty:** Every element serves both aesthetic and functional purposes
- **Seamless Experience:** Intuitive interactions with subtle, meaningful animations

## Color System

### Primary Colors
```
Primary Black: #000000 (Tesla signature black)
Pure White: #FFFFFF (Clean, premium background)
Charcoal: #171A20 (Tesla dark gray for text/accents)
Light Gray: #F4F4F4 (Subtle backgrounds and dividers)
```

### Accent Colors
```
Chinese Red: #E60012 (Cultural relevance, energy, premium)
Electric Blue: #0066CC (Technology, trust, innovation)
Success Green: #00D563 (Confirmations, success states)
Warning Amber: #FFB800 (Alerts, important information)
Error Red: #FF4B4B (Errors, critical alerts)
```

### Neutral Scale
```
Gray-50: #FAFAFA
Gray-100: #F5F5F5
Gray-200: #EEEEEE
Gray-300: #E0E0E0
Gray-400: #BDBDBD
Gray-500: #9E9E9E
Gray-600: #757575
Gray-700: #616161
Gray-800: #424242
Gray-900: #212121
```

## Typography System

### Primary Font Stack
```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Fallback: Arial, sans-serif for compatibility
```

### Type Scale
```
Display Large: 72px / Bold / Letter-spacing: -2px
Display Medium: 56px / Bold / Letter-spacing: -1.5px
Display Small: 48px / Bold / Letter-spacing: -1px

Headline Large: 40px / Bold / Letter-spacing: -0.5px
Headline Medium: 32px / Bold / Letter-spacing: -0.25px
Headline Small: 28px / Bold / Letter-spacing: 0px

Title Large: 24px / SemiBold / Letter-spacing: 0px
Title Medium: 20px / SemiBold / Letter-spacing: 0.1px
Title Small: 18px / SemiBold / Letter-spacing: 0.1px

Body Large: 16px / Regular / Letter-spacing: 0.15px / Line-height: 1.6
Body Medium: 14px / Regular / Letter-spacing: 0.25px / Line-height: 1.5
Body Small: 12px / Regular / Letter-spacing: 0.4px / Line-height: 1.4

Caption: 11px / Medium / Letter-spacing: 0.5px / Line-height: 1.3
```

### Chinese Typography
```
Primary Chinese Font: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif
Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
```

## Spacing System

### Base Unit: 8px
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px
5xl: 128px
```

### Component Spacing
```
Button Padding: 12px 24px (md + lg horizontal)
Card Padding: 24px (lg)
Page Margins: 16px mobile, 32px tablet, 64px desktop
Section Spacing: 64px mobile, 96px desktop
```

## Component Library

### Buttons

#### Primary Button
```
Background: #000000 (Primary Black)
Text: #FFFFFF (Pure White)
Border: None
Border-radius: 4px
Padding: 12px 24px
Font: 14px/SemiBold
Hover: Background #333333
Focus: 2px solid #0066CC outline
Active: Background #111111
Disabled: Background #E0E0E0, Text #BDBDBD
```

#### Secondary Button
```
Background: Transparent
Text: #000000 (Primary Black)
Border: 1px solid #000000
Border-radius: 4px
Padding: 11px 23px (account for border)
Font: 14px/SemiBold
Hover: Background #F4F4F4
Focus: 2px solid #0066CC outline
Active: Background #EEEEEE
```

#### Accent Button (Chinese Red)
```
Background: #E60012 (Chinese Red)
Text: #FFFFFF (Pure White)
Border: None
Border-radius: 4px
Padding: 12px 24px
Font: 14px/SemiBold
Hover: Background #C50010
Focus: 2px solid #0066CC outline
Active: Background #A8000E
```

### Form Elements

#### Input Fields
```
Background: #FFFFFF
Border: 1px solid #E0E0E0
Border-radius: 4px
Padding: 12px 16px
Font: 14px/Regular
Placeholder: #9E9E9E
Focus: Border 2px solid #0066CC
Error: Border 2px solid #FF4B4B
Success: Border 2px solid #00D563
```

#### Select Dropdowns
```
Background: #FFFFFF
Border: 1px solid #E0E0E0
Border-radius: 4px
Padding: 12px 16px
Font: 14px/Regular
Arrow: Custom SVG icon
Focus: Border 2px solid #0066CC
```

### Cards

#### Service Card
```
Background: #FFFFFF
Border: 1px solid #F4F4F4
Border-radius: 8px
Padding: 24px
Shadow: 0 2px 8px rgba(0,0,0,0.04)
Hover: Shadow 0 4px 16px rgba(0,0,0,0.08)
Transition: all 0.2s ease
```

#### Feature Card
```
Background: #FAFAFA
Border: None
Border-radius: 12px
Padding: 32px 24px
Text-align: center
Icon: 48x48px, Chinese Red accent
```

### Navigation

#### Header Navigation
```
Background: #FFFFFF
Height: 64px
Border-bottom: 1px solid #F4F4F4
Logo: Left-aligned
Navigation: Center-aligned
CTA Button: Right-aligned
Mobile: Hamburger menu
```

#### Footer
```
Background: #171A20 (Charcoal)
Text: #FFFFFF
Padding: 48px 0
Links: #BDBDBD with #FFFFFF hover
```

## Icon System

### Style Guidelines
```
Style: Outlined, 2px stroke weight
Size: 16px, 20px, 24px, 32px, 48px
Color: Inherit from parent or #171A20 default
Format: SVG for scalability
```

### Core Icons
- Navigation: Menu, Close, Arrow-right, Arrow-left
- Actions: Phone, Email, Search, Filter, Share
- Status: Check, Warning, Error, Info
- Transport: Car, Route, Location, Time
- Interface: Download, Upload, Refresh, Settings

## Accessibility Standards

### Color Contrast
- Large text (18px+): Minimum 3:1 ratio
- Normal text: Minimum 4.5:1 ratio
- Interactive elements: Minimum 3:1 ratio
- All primary combinations meet WCAG AA standards

### Focus States
- Visible focus indicators on all interactive elements
- 2px solid #0066CC outline with 2px offset
- Never remove focus indicators completely

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex interactions
- Alt text for all images
- Proper heading hierarchy (H1 → H6)

### Keyboard Navigation
- Tab order follows logical reading pattern
- All interactive elements accessible via keyboard
- Skip links for main content
- Escape key closes modals/dropdowns

### Touch Targets
- Minimum 44x44px touch targets (iOS/Android standards)
- Adequate spacing between interactive elements
- Gesture alternatives for complex interactions

## Motion & Animation

### Micro-Interactions
```
Duration: 200ms for small elements, 300ms for larger
Easing: cubic-bezier(0.4, 0.0, 0.2, 1) - Material Design standard
Properties: transform, opacity, color (avoid animating layout)
```

### Page Transitions
```
Duration: 400ms
Easing: cubic-bezier(0.25, 0.1, 0.25, 1)
Style: Fade + slight scale for overlays, slide for navigation
```

### Loading States
```
Skeleton screens for content loading
Spinner: 20px diameter, 2px stroke, Chinese Red color
Progress bars: 4px height, rounded ends
Fade-in: 200ms for loaded content
```

## Responsive Breakpoints

```
Mobile: 320px - 767px
Tablet: 768px - 1023px  
Desktop: 1024px - 1439px
Large Desktop: 1440px+

Container Max-Width: 1200px
Grid: 12-column system
Gutters: 16px mobile, 24px tablet, 32px desktop
```

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --color-primary: #000000;
  --color-white: #FFFFFF;
  --color-accent: #E60012;
  --color-blue: #0066CC;
  --color-charcoal: #171A20;
  --color-light-gray: #F4F4F4;
  
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-chinese: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
  
  --transition-fast: 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

### Performance Considerations
- Use system fonts as fallbacks for faster loading
- Optimize images with proper formats (WebP, AVIF)
- Lazy load images below the fold
- Minimize CSS and JavaScript bundles
- Use CSS animations over JavaScript when possible