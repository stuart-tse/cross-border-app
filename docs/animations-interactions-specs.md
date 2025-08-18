# Interactive Elements & Micro-Animations Specifications

## Animation Philosophy - Tesla-Inspired Principles

### Core Animation Values
- **Purposeful**: Every animation serves a functional purpose
- **Subtle**: Refined movements that enhance without distracting
- **Confident**: Smooth, decisive transitions that reinforce premium quality
- **Responsive**: Immediate feedback to user interactions
- **Consistent**: Unified timing and easing across all interactions

### Tesla-Style Motion Language
- **Precision**: Clean, geometric movements
- **Elegance**: Smooth acceleration and deceleration curves
- **Efficiency**: No wasted motion or decorative animations
- **Sophistication**: High-quality transitions that feel premium

## Timing & Easing Standards

### Animation Duration Guidelines
```css
/* Micro-interactions: Instant feedback */
--duration-instant: 100ms;

/* Fast interactions: Button hovers, focus states */
--duration-fast: 200ms;

/* Standard interactions: Card hovers, form validation */
--duration-standard: 300ms;

/* Complex interactions: Modal open/close, page transitions */
--duration-complex: 400ms;

/* Layout changes: Accordion expand, content reveals */
--duration-layout: 500ms;
```

### Tesla-Inspired Easing Functions
```css
/* Primary easing: Confident, smooth acceleration */
--ease-primary: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Secondary easing: Gentle, organic feel */
--ease-secondary: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Entrance easing: Elements appearing */
--ease-entrance: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Exit easing: Elements disappearing */
--ease-exit: cubic-bezier(0.4, 0.0, 1, 1);

/* Bounce easing: Playful feedback (use sparingly) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Button Interactions

### Primary Button Animation
```css
.btn-primary {
  transition: all var(--duration-fast) var(--ease-primary);
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition-duration: var(--duration-instant);
  }
  
  &:focus {
    outline: 2px solid var(--color-blue);
    outline-offset: 2px;
  }
}

/* Loading state animation */
.btn-primary.loading {
  position: relative;
  color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: btn-spinner 1s linear infinite;
  }
}

@keyframes btn-spinner {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### Button Press Feedback
```css
.btn-primary {
  &:active {
    transform: translateY(1px) scale(0.98);
    transition: transform var(--duration-instant) var(--ease-secondary);
  }
  
  &:not(:active) {
    transition: transform var(--duration-fast) var(--ease-primary);
  }
}
```

## Card Interactions

### Service Card Hover Animation
```css
.service-card {
  transition: all var(--duration-standard) var(--ease-primary);
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  /* Image zoom effect on hover */
  .service-card__image {
    overflow: hidden;
    border-radius: 4px;
    
    img {
      transition: transform var(--duration-complex) var(--ease-primary);
      transform: scale(1);
    }
  }
  
  &:hover .service-card__image img {
    transform: scale(1.05);
  }
}
```

### Vehicle Fleet Card Animation
```css
.fleet-card {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-standard) var(--ease-primary);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left var(--duration-complex) var(--ease-primary);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  .fleet-card__price {
    transition: color var(--duration-fast) var(--ease-primary);
  }
  
  &:hover .fleet-card__price {
    color: var(--color-accent);
  }
}
```

## Form Interactions

### Input Field Animations
```css
.form-input {
  position: relative;
  transition: all var(--duration-fast) var(--ease-primary);
  border: 1px solid var(--color-gray-300);
  
  &:focus {
    border-color: var(--color-blue);
    transform: scale(1.02);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  /* Floating label animation */
  & + .form-label {
    position: absolute;
    top: 12px;
    left: 16px;
    font-size: 14px;
    color: var(--color-gray-500);
    pointer-events: none;
    transition: all var(--duration-fast) var(--ease-primary);
  }
  
  &:focus + .form-label,
  &:not(:placeholder-shown) + .form-label {
    top: -8px;
    left: 12px;
    font-size: 12px;
    color: var(--color-blue);
    background: white;
    padding: 0 4px;
  }
}

/* Error state animation */
.form-input.error {
  animation: shake var(--duration-standard) var(--ease-primary);
  border-color: var(--color-error);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Success state animation */
.form-input.success {
  border-color: var(--color-success);
  
  &::after {
    content: '✓';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    color: var(--color-success);
    font-weight: bold;
    animation: check-appear var(--duration-standard) var(--ease-bounce) forwards;
  }
}

@keyframes check-appear {
  to { transform: translateY(-50%) scale(1); }
}
```

### Form Validation Feedback
```css
.form-error {
  opacity: 0;
  transform: translateY(-8px);
  transition: all var(--duration-fast) var(--ease-entrance);
  
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-success {
  opacity: 0;
  transform: translateY(-8px);
  transition: all var(--duration-fast) var(--ease-entrance);
  
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Navigation Animations

### Mobile Menu Animation
```css
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 80%;
  max-width: 320px;
  height: 100vh;
  background: white;
  transition: right var(--duration-complex) var(--ease-primary);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  &.open {
    right: 0;
  }
}

.mobile-menu__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all var(--duration-complex) var(--ease-primary);
  z-index: 999;
  
  &.open {
    opacity: 1;
    visibility: visible;
  }
}

/* Menu items stagger animation */
.mobile-menu__link {
  opacity: 0;
  transform: translateX(20px);
  transition: all var(--duration-fast) var(--ease-entrance);
  
  &.animate {
    opacity: 1;
    transform: translateX(0);
  }
  
  /* Stagger delay */
  &:nth-child(1) { transition-delay: 0ms; }
  &:nth-child(2) { transition-delay: 50ms; }
  &:nth-child(3) { transition-delay: 100ms; }
  &:nth-child(4) { transition-delay: 150ms; }
  &:nth-child(5) { transition-delay: 200ms; }
}
```

### Desktop Navigation Hover Effects
```css
.nav-link {
  position: relative;
  transition: color var(--duration-fast) var(--ease-primary);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--color-accent);
    transition: all var(--duration-fast) var(--ease-primary);
    transform: translateX(-50%);
  }
  
  &:hover {
    color: var(--color-accent);
    
    &::after {
      width: 100%;
    }
  }
  
  &.active::after {
    width: 100%;
  }
}
```

## Modal & Overlay Animations

### Modal Entrance Animation
```css
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all var(--duration-complex) var(--ease-entrance);
  
  &.open {
    opacity: 1;
    visibility: visible;
  }
}

.modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal__container {
  transform: scale(0.9) translateY(20px);
  transition: transform var(--duration-complex) var(--ease-entrance);
  background: white;
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  
  .modal.open & {
    transform: scale(1) translateY(0);
  }
}
```

### Toast Notification Animation
```css
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateX(100%) scale(0.8);
  opacity: 0;
  transition: all var(--duration-complex) var(--ease-entrance);
  z-index: 1001;
  
  &.show {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  
  &.hide {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
    transition: all var(--duration-standard) var(--ease-exit);
  }
}
```

## Loading & State Animations

### Skeleton Loading Animation
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  .skeleton-title { height: 20px; margin-bottom: 12px; }
  .skeleton-text { height: 14px; margin-bottom: 8px; width: 80%; }
  .skeleton-button { height: 44px; width: 120px; margin-top: 16px; }
}
```

### Progressive Image Loading
```css
.progressive-image {
  position: relative;
  overflow: hidden;
  
  &__placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--color-gray-100);
    filter: blur(10px);
    transform: scale(1.1);
    transition: opacity var(--duration-complex) var(--ease-primary);
  }
  
  &__img {
    opacity: 0;
    transition: opacity var(--duration-complex) var(--ease-primary);
    
    &.loaded {
      opacity: 1;
    }
    
    &.loaded ~ .progressive-image__placeholder {
      opacity: 0;
    }
  }
}
```

## Booking Flow Animations

### Step Progress Animation
```css
.progress-bar {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.progress-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  font-weight: 600;
  transition: all var(--duration-standard) var(--ease-primary);
  
  &.completed {
    background: var(--color-accent);
    color: white;
    transform: scale(1.1);
    
    &::after {
      content: '✓';
      animation: check-bounce var(--duration-fast) var(--ease-bounce);
    }
  }
  
  &.active {
    background: var(--color-blue);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.2);
  }
}

.progress-connector {
  flex: 1;
  height: 2px;
  background: var(--color-gray-200);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--color-accent);
    width: 0;
    transition: width var(--duration-complex) var(--ease-primary);
  }
  
  &.completed::after {
    width: 100%;
  }
}

@keyframes check-bounce {
  0%, 20% { transform: scale(0); }
  40% { transform: scale(1.2); }
  60% { transform: scale(0.9); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Form Step Transition
```css
.booking-step {
  opacity: 0;
  transform: translateX(20px);
  transition: all var(--duration-standard) var(--ease-entrance);
  
  &.active {
    opacity: 1;
    transform: translateX(0);
  }
  
  &.exiting {
    opacity: 0;
    transform: translateX(-20px);
    transition: all var(--duration-standard) var(--ease-exit);
  }
}
```

## Scroll & Parallax Effects

### Scroll-Triggered Animations
```css
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: all var(--duration-standard) var(--ease-entrance);
  
  &.in-view {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-fade-in {
  .fade-in-up:nth-child(1) { transition-delay: 0ms; }
  .fade-in-up:nth-child(2) { transition-delay: 100ms; }
  .fade-in-up:nth-child(3) { transition-delay: 200ms; }
  .fade-in-up:nth-child(4) { transition-delay: 300ms; }
}
```

### Tesla-Style Parallax Hero
```css
.hero-section {
  position: relative;
  height: 100vh;
  overflow: hidden;
  
  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 120%;
    height: 120%;
    background-size: cover;
    background-position: center;
    will-change: transform;
  }
  
  &__content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    align-items: center;
    will-change: transform;
  }
}

/* JavaScript for parallax effect */
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('.hero-section__background');
  const content = document.querySelector('.hero-section__content');
  
  if (parallax) {
    const speed = scrolled * 0.5;
    parallax.style.transform = `translateY(${speed}px)`;
  }
  
  if (content) {
    const contentSpeed = scrolled * 0.3;
    content.style.transform = `translateY(${contentSpeed}px)`;
  }
});
```

## Performance Considerations

### Animation Optimization
```css
/* Use transform and opacity for best performance */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Avoid animating layout properties */
.avoid {
  /* Don't animate: width, height, margin, padding, border */
  /* These cause layout recalculations */
}

/* Prefer transforms */
.preferred {
  /* Use: transform, opacity, filter */
  /* These only affect compositing */
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Keep essential animations but reduce them */
  .essential-animation {
    animation-duration: 0.5s !important;
  }
}
```

## JavaScript Implementation

### Intersection Observer for Scroll Animations
```javascript
class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.fade-in-up');
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      this.observer.observe(el);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
});
```

### Smooth Page Transitions
```javascript
class PageTransitions {
  constructor() {
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('click', this.handleLinkClick.bind(this));
  }
  
  handleLinkClick(event) {
    const link = event.target.closest('a[href]');
    if (!link || link.host !== window.location.host) return;
    
    event.preventDefault();
    this.transitionTo(link.href);
  }
  
  async transitionTo(url) {
    // Fade out current page
    document.body.classList.add('page-transition');
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Navigate to new page
    window.location.href = url;
  }
}

// Initialize page transitions
new PageTransitions();
```

This comprehensive animation and interaction specification creates a Tesla-inspired user experience that feels premium, responsive, and purposeful. Every animation serves to enhance usability while maintaining the sophisticated, minimalist aesthetic that characterizes Tesla's design philosophy.