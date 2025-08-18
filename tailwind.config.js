/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tesla-inspired color palette with Light Pink Theme
        primary: '#000000',
        white: '#FFFFFF',
        charcoal: '#171A20',
        'light-gray': '#F4F4F4',
        // Light Pink Accent colors (replacing Chinese Red)
        'hot-pink': '#FF69B4',        // Primary pink (was chinese-red)
        'light-pink': '#FFB6C1',      // Secondary pink
        'deep-pink': '#FF1493',       // Darker pink for contrast
        'pink-tint': '#FFF0F5',       // Very light pink background
        'rose-gold': '#F7C6C7',       // Elegant rose gold accent
        // Supporting colors
        'electric-blue': '#0066CC',
        'success-green': '#00D563',
        'warning-amber': '#FFB800',
        'error-red': '#FF4B4B',
        // Legacy color (for backward compatibility)
        'chinese-red': '#FF69B4',     // Mapped to hot-pink
        // Neutral scale
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        chinese: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['72px', { lineHeight: '1.1', letterSpacing: '-2px' }],
        'display-md': ['56px', { lineHeight: '1.1', letterSpacing: '-1.5px' }],
        'display-sm': ['48px', { lineHeight: '1.1', letterSpacing: '-1px' }],
        'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        'headline-md': ['32px', { lineHeight: '1.2', letterSpacing: '-0.25px' }],
        'headline-sm': ['28px', { lineHeight: '1.3', letterSpacing: '0px' }],
        'title-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0px' }],
        'title-md': ['20px', { lineHeight: '1.3', letterSpacing: '0.1px' }],
        'title-sm': ['18px', { lineHeight: '1.3', letterSpacing: '0.1px' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '0.15px' }],
        'body-md': ['14px', { lineHeight: '1.5', letterSpacing: '0.25px' }],
        'body-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.4px' }],
        'caption': ['11px', { lineHeight: '1.3', letterSpacing: '0.5px' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.04)',
        'md': '0 4px 16px rgba(0,0,0,0.08)',
        'lg': '0 8px 32px rgba(0,0,0,0.12)',
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'standard': '300ms',
        'complex': '400ms',
        'layout': '500ms',
      },
      transitionTimingFunction: {
        'primary': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'secondary': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'entrance': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      screens: {
        'mobile': '320px',
        'mobile-lg': '375px',
        'tablet': '768px',
        'desktop': '1024px',
        'desktop-lg': '1200px',
        'desktop-xl': '1440px',
      },
    },
  },
  plugins: [],
}