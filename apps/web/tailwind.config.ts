import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary Blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED', // Primary Purple
          800: '#6B21A8',
          900: '#581C87',
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
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        // Dark Mode Colors
        dark: {
          bg: {
            primary: '#0A0A0A',
            secondary: '#171717',
            tertiary: '#262626',
            hover: '#404040',
          },
          text: {
            primary: '#FAFAFA',
            secondary: '#A1A1A1',
            tertiary: '#737373',
          },
          border: {
            primary: '#262626',
            secondary: '#404040',
          },
        },
        // Light Mode Colors
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB',
            tertiary: '#F3F4F6',
            hover: '#E5E7EB',
          },
          text: {
            primary: '#0A0A0A',
            secondary: '#525252',
            tertiary: '#737373',
          },
          border: {
            primary: '#E5E7EB',
            secondary: '#D1D5DB',
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
        'gradient-brand': 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'gradient-hero': 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.15), transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(37, 99, 235, 0.5)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.5)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        'glow-brand': '0 0 30px rgba(37, 99, 235, 0.3)',
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
  plugins: [],
};

export default config;
