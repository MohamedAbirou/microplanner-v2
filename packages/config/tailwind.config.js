/**
 * Shared Tailwind CSS configuration for MicroPlanner
 * Design system with unified colors, spacing, typography, and animations
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        // Shadcn/ui CSS variable colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Brand Colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#ECF8F6',
          100: '#D1F0EB',
          200: '#A3E0D7',
          300: '#6EC9BC',
          400: '#3AA899',
          500: '#1A8A7D',
          600: '#0B6E63',
          700: '#095850',
          800: '#07423C',
          900: '#052D29',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#F0F5F2',
          100: '#DCE8E0',
          200: '#B9D1C1',
          300: '#8FB59F',
          400: '#64977D',
          500: '#4A8568',
          600: '#3C7A5E',
          700: '#336851',
          800: '#2A5543',
          900: '#183027',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#0B6E63',
          light: '#3AA899',
          dark: '#095850',
        },
        // Dark Mode Colors (PRIMARY MODE)
        dark: {
          bg: {
            primary: '#0D1215',
            secondary: '#171F24',
            tertiary: '#232E35',
            hover: '#3B4C57',
          },
          text: {
            primary: '#FAFAFA',
            secondary: '#A3B0BA',
            tertiary: '#7D8E9A',
          },
          border: {
            primary: '#2F3D46',
            secondary: '#3B4C57',
          },
        },
        // Light Mode Colors (SECONDARY MODE)
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F4F6F7',
            tertiary: '#E4E8EB',
            hover: '#C9D1D7',
          },
          text: {
            primary: '#3B4C57',
            secondary: '#5C6D78',
            tertiary: '#7D8E9A',
          },
          border: {
            primary: '#C9D1D7',
            secondary: '#A3B0BA',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['48px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        // Reduced default sizes for less "zoomed in" feel
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #0B6E63 0%, #3C7A5E 100%)',
        'gradient-hero': 'radial-gradient(circle at top right, rgba(11, 110, 99, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(60, 122, 94, 0.15), transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(11, 110, 99, 0.5)',
        'glow-blue': '0 0 20px rgba(11, 110, 99, 0.5)',
        'glow-purple': '0 0 20px rgba(60, 122, 94, 0.5)',
        'glow-brand': '0 0 30px rgba(11, 110, 99, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 250ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
