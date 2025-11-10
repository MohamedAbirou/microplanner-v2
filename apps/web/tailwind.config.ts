import type { Config } from 'tailwindcss';
import { brand } from '@microplanner/config/brand';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: brand.colors.primary[50],
          100: brand.colors.primary[100],
          200: brand.colors.primary[200],
          300: brand.colors.primary[300],
          400: brand.colors.primary[400],
          500: brand.colors.primary[500],
          600: brand.colors.primary[600],
          700: brand.colors.primary[700],
          800: brand.colors.primary[800],
          900: brand.colors.primary[900],
          950: brand.colors.primary[950],
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: brand.colors.secondary[50],
          100: brand.colors.secondary[100],
          200: brand.colors.secondary[200],
          300: brand.colors.secondary[300],
          400: brand.colors.secondary[400],
          500: brand.colors.secondary[500],
          600: brand.colors.secondary[600],
          700: brand.colors.secondary[700],
          800: brand.colors.secondary[800],
          900: brand.colors.secondary[900],
          950: brand.colors.secondary[950],
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: brand.colors.success,
        warning: brand.colors.warning,
        error: brand.colors.error,
        info: brand.colors.info,
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        heading: ['var(--font-heading)', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        mono: ['var(--font-mono)', ...require('tailwindcss/defaultTheme').fontFamily.mono],
      },
      fontSize: {
        xs: [brand.typography.sizes.xs, { lineHeight: '1.5' }],
        sm: [brand.typography.sizes.sm, { lineHeight: '1.5' }],
        base: [brand.typography.sizes.base, { lineHeight: '1.5' }],
        lg: [brand.typography.sizes.lg, { lineHeight: '1.5' }],
        xl: [brand.typography.sizes.xl, { lineHeight: '1.25' }],
        '2xl': [brand.typography.sizes['2xl'], { lineHeight: '1.25' }],
        '3xl': [brand.typography.sizes['3xl'], { lineHeight: '1.25' }],
        '4xl': [brand.typography.sizes['4xl'], { lineHeight: '1.25' }],
        '5xl': [brand.typography.sizes['5xl'], { lineHeight: '1' }],
        '6xl': [brand.typography.sizes['6xl'], { lineHeight: '1' }],
        '7xl': [brand.typography.sizes['7xl'], { lineHeight: '1' }],
        '8xl': [brand.typography.sizes['8xl'], { lineHeight: '1' }],
        '9xl': [brand.typography.sizes['9xl'], { lineHeight: '1' }],
      },
      boxShadow: {
        'primary-glow': brand.shadows.primaryGlow,
        'secondary-glow': brand.shadows.secondaryGlow,
        'gradient-glow': brand.shadows.gradientGlow,
      },
      backgroundImage: {
        'gradient-primary': brand.colors.gradients.primary,
        'gradient-primary-light': brand.colors.gradients.primaryLight,
        'gradient-primary-dark': brand.colors.gradients.primaryDark,
        'gradient-hero': brand.colors.gradients.hero,
        'gradient-subtle': brand.colors.gradients.subtle,
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
