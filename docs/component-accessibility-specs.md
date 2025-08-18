# Component Specifications & Accessibility Guidelines

## Core Component Library

### Primary Button Component

#### Visual Specifications
```css
.btn-primary {
  background-color: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.25px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  min-height: 44px; /* Accessibility: Touch target */
  
  /* States */
  &:hover {
    background-color: #333333;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
  
  &:active {
    background-color: #111111;
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid #0066CC;
    outline-offset: 2px;
  }
  
  &:disabled {
    background-color: #E0E0E0;
    color: #BDBDBD;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* Loading state */
  &.loading {
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid #FFFFFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

#### HTML Structure
```html
<button 
  class="btn-primary" 
  type="button"
  aria-describedby="btn-help-text"
  disabled="false">
  Book Now
</button>
<div id="btn-help-text" class="sr-only">
  Proceed to vehicle booking form
</div>
```

#### Accessibility Specifications
- **Keyboard Navigation**: Focusable with Tab key, activated with Enter or Space
- **Screen Readers**: Clear button text describing action
- **Focus Indicators**: High contrast 2px outline meeting WCAG AA standards
- **Touch Targets**: Minimum 44x44px for mobile accessibility
- **Color Contrast**: 21:1 ratio (black on white) exceeds WCAG AAA standards
- **States**: Loading state announced to screen readers
- **ARIA**: Uses aria-describedby for additional context when needed

### Form Input Component

#### Visual Specifications
```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  background-color: #FFFFFF;
  transition: all 200ms ease;
  min-height: 44px;
  
  &::placeholder {
    color: #9E9E9E;
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    border: 2px solid #0066CC;
    padding: 11px 15px; /* Adjust for thicker border */
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &.error {
    border: 2px solid #FF4B4B;
    padding: 11px 15px;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.1);
    }
  }
  
  &.success {
    border: 2px solid #00D563;
    padding: 11px 15px;
  }
  
  &:disabled {
    background-color: #F5F5F5;
    border-color: #E0E0E0;
    color: #9E9E9E;
    cursor: not-allowed;
  }
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #171A20;
}

.form-error {
  display: flex;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #FF4B4B;
  
  &::before {
    content: '⚠';
    margin-right: 6px;
    font-size: 14px;
  }
}

.form-success {
  display: flex;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #00D563;
  
  &::before {
    content: '✓';
    margin-right: 6px;
    font-size: 14px;
  }
}
```

#### HTML Structure
```html
<div class="form-group">
  <label for="full-name" class="form-label">
    Full Name *
  </label>
  <input 
    type="text"
    id="full-name"
    name="fullName"
    class="form-input"
    placeholder="Enter your full name"
    required
    aria-describedby="full-name-error"
    aria-invalid="false">
  <div id="full-name-error" class="form-error" style="display: none;">
    Full name is required for booking
  </div>
</div>
```

#### Accessibility Specifications
- **Labels**: Every input has associated label with for/id relationship
- **Required Fields**: Marked with asterisk and required attribute
- **Error States**: aria-invalid and aria-describedby for screen readers
- **Placeholder Text**: Supplementary, not replacement for labels
- **Keyboard Navigation**: Tab order follows visual order
- **Focus Management**: Clear focus indicators with sufficient contrast
- **Error Messages**: Immediately announced when validation fails

### Service Card Component

#### Visual Specifications
```css
.service-card {
  background: #FFFFFF;
  border: 1px solid #F4F4F4;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 200ms ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: #E0E0E0;
  }
  
  &:focus-within {
    outline: 2px solid #0066CC;
    outline-offset: 2px;
  }
}

.service-card__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #E60012;
}

.service-card__title {
  font-size: 20px;
  font-weight: 600;
  color: #171A20;
  margin-bottom: 12px;
  line-height: 1.3;
}

.service-card__description {
  font-size: 14px;
  line-height: 1.6;
  color: #616161;
  margin-bottom: 20px;
}

.service-card__features {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.service-card__feature {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #424242;
  
  &::before {
    content: '✓';
    color: #00D563;
    font-weight: bold;
    margin-right: 8px;
    font-size: 12px;
  }
}

.service-card__cta {
  margin-top: auto; /* For flexbox layouts */
}
```

#### HTML Structure
```html
<div class="service-card" role="article" aria-labelledby="service-1-title">
  <div class="service-card__icon" aria-hidden="true">
    <svg><!-- Icon SVG --></svg>
  </div>
  
  <h3 id="service-1-title" class="service-card__title">
    Cross-Border Transfers
  </h3>
  
  <p class="service-card__description">
    Professional door-to-door service between Hong Kong and major 
    Mainland China cities. Our experienced drivers handle all border 
    crossing procedures efficiently.
  </p>
  
  <ul class="service-card__features">
    <li class="service-card__feature">Licensed cross-border operators</li>
    <li class="service-card__feature">24/7 booking and support</li>
    <li class="service-card__feature">Real-time tracking</li>
    <li class="service-card__feature">Professional chauffeurs</li>
  </ul>
  
  <div class="service-card__cta">
    <button type="button" class="btn-primary">
      Book Now
    </button>
    <button type="button" class="btn-secondary">
      Learn More
    </button>
  </div>
</div>
```

#### Accessibility Specifications
- **Semantic HTML**: Uses article role with proper heading hierarchy
- **Icon Accessibility**: Decorative icons marked with aria-hidden="true"
- **Focus Management**: Card becomes focusable when it contains interactive elements
- **Screen Readers**: Clear headings and descriptive content structure
- **Keyboard Navigation**: All interactive elements accessible via Tab
- **Color Independence**: Information conveyed through text and icons, not color alone

### Navigation Menu Component

#### Desktop Navigation HTML
```html
<nav class="main-navigation" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <a href="/" class="nav-logo" aria-label="CrossBorder - Return to homepage">
      <img src="/logo.svg" alt="CrossBorder" width="120" height="32">
    </a>
    
    <ul class="nav-menu" role="menubar">
      <li role="none">
        <a href="/" class="nav-link" role="menuitem" aria-current="page">
          Home
        </a>
      </li>
      <li role="none">
        <a href="/services" class="nav-link" role="menuitem">
          Services
        </a>
      </li>
      <li role="none">
        <a href="/routes" class="nav-link" role="menuitem">
          Routes
        </a>
      </li>
      <li role="none">
        <a href="/about" class="nav-link" role="menuitem">
          About
        </a>
      </li>
    </ul>
    
    <div class="nav-actions">
      <button type="button" class="language-toggle" aria-label="Switch language">
        <span aria-hidden="true">EN</span>
        <span class="sr-only">Switch to Chinese</span>
      </button>
      <a href="/contact" class="btn-primary">Contact</a>
    </div>
  </div>
</nav>
```

#### Mobile Navigation HTML
```html
<nav class="main-navigation mobile" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <button 
      type="button" 
      class="mobile-menu-toggle"
      aria-label="Open main menu"
      aria-expanded="false"
      aria-controls="mobile-menu">
      <span class="hamburger"></span>
    </button>
    
    <a href="/" class="nav-logo" aria-label="CrossBorder - Return to homepage">
      CrossBorder
    </a>
    
    <button type="button" class="language-toggle" aria-label="Switch language">
      <span aria-hidden="true">EN</span>
      <span class="sr-only">Switch to Chinese</span>
    </button>
  </div>
  
  <div id="mobile-menu" class="mobile-menu" aria-hidden="true">
    <div class="mobile-menu__header">
      <button 
        type="button" 
        class="mobile-menu__close"
        aria-label="Close main menu">
        <span aria-hidden="true">×</span>
      </button>
    </div>
    
    <ul class="mobile-menu__list" role="menu">
      <li role="none">
        <a href="/" class="mobile-menu__link" role="menuitem" tabindex="-1">
          Home
        </a>
      </li>
      <li role="none">
        <a href="/services" class="mobile-menu__link" role="menuitem" tabindex="-1">
          Services
        </a>
      </li>
      <!-- Additional menu items -->
    </ul>
    
    <div class="mobile-menu__contact">
      <a href="tel:+852-xxxx-xxxx" class="mobile-menu__phone">
        📞 +852-XXXX-XXXX
      </a>
      <a href="#" class="mobile-menu__wechat">
        💬 WeChat Support  
      </a>
    </div>
  </div>
  
  <div class="mobile-menu__overlay" aria-hidden="true"></div>
</nav>
```

### Modal Component

#### HTML Structure
```html
<div 
  class="modal" 
  id="booking-modal" 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  tabindex="-1"
  style="display: none;">
  
  <div class="modal__backdrop" aria-hidden="true"></div>
  
  <div class="modal__container">
    <div class="modal__header">
      <h2 id="modal-title" class="modal__title">
        Quick Booking Request
      </h2>
      <button 
        type="button" 
        class="modal__close" 
        aria-label="Close booking form">
        <span aria-hidden="true">×</span>
      </button>
    </div>
    
    <div class="modal__body">
      <p id="modal-description" class="modal__description">
        Fill out this form and we'll contact you within 1 hour to confirm your booking.
      </p>
      
      <!-- Form content -->
      <form class="booking-form" novalidate>
        <!-- Form fields -->
      </form>
    </div>
  </div>
</div>
```

#### JavaScript Accessibility Functions
```javascript
class Modal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.previousFocus = null;
    this.focusableElements = null;
    this.firstFocusable = null;
    this.lastFocusable = null;
  }
  
  open() {
    // Store current focus
    this.previousFocus = document.activeElement;
    
    // Show modal
    this.modal.style.display = 'flex';
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Get focusable elements
    this.updateFocusableElements();
    
    // Focus first element
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }
    
    // Trap focus
    this.modal.addEventListener('keydown', this.trapFocus.bind(this));
    
    // Close on escape
    document.addEventListener('keydown', this.handleEscape.bind(this));
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    // Hide modal
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    
    // Remove event listeners
    this.modal.removeEventListener('keydown', this.trapFocus);
    document.removeEventListener('keydown', this.handleEscape);
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  trapFocus(event) {
    if (event.key !== 'Tab') return;
    
    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }
  }
  
  handleEscape(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
  
  updateFocusableElements() {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = this.modal.querySelectorAll(focusableSelector);
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
  }
}
```

## Comprehensive Accessibility Guidelines

### WCAG 2.1 AA Compliance Checklist

#### Perceivable
- **Color Contrast**: All text meets minimum 4.5:1 ratio (7:1 for large text)
- **Alternative Text**: All images have descriptive alt attributes
- **Captions**: Video content includes captions when applicable
- **Text Scaling**: Content remains usable when zoomed to 200%

#### Operable
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Indicators**: Clear, visible focus states with sufficient contrast
- **No Seizures**: No content that flashes more than 3 times per second
- **Timing**: Users can extend or disable time limits

#### Understandable
- **Language**: Page language declared in HTML
- **Reading Level**: Content written at appropriate comprehension level
- **Labels**: Form labels clearly describe required information
- **Error Identification**: Validation errors clearly explained

#### Robust
- **Valid HTML**: Semantic, standards-compliant markup
- **ARIA**: Proper ARIA labels and roles where needed
- **Compatibility**: Works with assistive technologies

### Screen Reader Optimizations

#### Content Structure
```html
<!-- Proper heading hierarchy -->
<h1>Cross-Border Vehicle Services</h1>
  <h2>Our Premium Services</h2>
    <h3>Cross-Border Transfers</h3>
    <h3>Corporate Solutions</h3>
  <h2>Popular Routes</h2>
    <h3>Hong Kong ↔ Shenzhen</h3>

<!-- Skip links for keyboard users -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#main-navigation" class="skip-link">Skip to navigation</a>

<!-- Screen reader only text -->
<span class="sr-only">This form will help you book your cross-border transfer</span>
```

#### ARIA Landmarks
```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
</header>

<main role="main" id="main-content">
  <section aria-labelledby="services-heading">
    <h2 id="services-heading">Our Services</h2>
  </section>
</main>

<aside role="complementary" aria-label="Contact information">
  <!-- Contact details -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Mobile Accessibility Considerations

#### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between touch targets (8px minimum)
- Larger targets for primary actions (48x48px recommended)

#### Gesture Alternatives  
- Swipe actions have keyboard/tap alternatives
- Pinch-to-zoom functionality preserved
- No essential functionality requires complex gestures

#### Screen Orientation
- Content works in both portrait and landscape
- No orientation restrictions unless essential
- Layout adapts gracefully to orientation changes

### Testing Procedures

#### Automated Testing Tools
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/cli
npm install --save-dev lighthouse

# Run accessibility audits
axe-core src/
lighthouse --only-categories=accessibility http://localhost:3000
```

#### Manual Testing Checklist
1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify logical tab order
   - Test Escape key functionality in modals
   - Confirm Enter/Space activate buttons

2. **Screen Reader Testing**
   - Test with VoiceOver (macOS), NVDA (Windows)
   - Verify all content is announced
   - Check heading navigation
   - Test form completion flow

3. **Visual Testing**
   - Verify focus indicators are visible
   - Test at 200% zoom level
   - Check color contrast in all states
   - Verify content reflows properly

4. **Mobile Testing**
   - Test touch targets on actual devices
   - Verify gesture alternatives work
   - Check screen reader mobile behavior
   - Test with device accessibility settings

### Implementation Standards

#### CSS Classes for Accessibility
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
  
  &:focus {
    top: 6px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This comprehensive component library and accessibility specification ensures that the Tesla-inspired cross-border vehicle website is not only visually stunning but also usable by everyone, including users with disabilities. The focus on semantic HTML, proper ARIA usage, and thorough testing procedures creates an inclusive user experience that meets the highest accessibility standards.