/**
 * MicroPlanner Brand Identity & Design Tokens
 *
 * A world-class design system for the AI-powered productivity platform
 * that will crush ReclaimAI and Motion.
 */

export const brand = {
  /**
   * Brand Name & Tagline
   */
  name: 'MicroPlanner',
  tagline: 'The Intelligent Planner',
  description: 'AI-powered weekly planning that adapts to you',

  /**
   * Color Palette
   * Teal → Sage gradient with slate neutrals (Claude Design system)
   */
  colors: {
    // Primary — deep teal (#0b6e63)
    primary: {
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
      950: '#031816',
    },

    // Secondary — sage green (#3c7a5e)
    secondary: {
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
      950: '#0F1E18',
    },

    // Slate neutral (#3b4c57) — text, surfaces, borders
    slate: {
      50: '#F4F6F7',
      100: '#E4E8EB',
      200: '#C9D1D7',
      300: '#A3B0BA',
      400: '#7D8E9A',
      500: '#5C6D78',
      600: '#3B4C57',
      700: '#2F3D46',
      800: '#232E35',
      900: '#171F24',
      950: '#0D1215',
    },

    // Gradient Combinations
    gradients: {
      primary: 'linear-gradient(135deg, #0B6E63 0%, #3C7A5E 100%)',
      primaryLight: 'linear-gradient(135deg, #1A8A7D 0%, #4A8568 100%)',
      primaryDark: 'linear-gradient(135deg, #095850 0%, #336851 100%)',
      hero: 'linear-gradient(135deg, #0B6E63 0%, #3C7A5E 50%, #3B4C57 100%)',
      subtle: 'linear-gradient(135deg, rgba(11, 110, 99, 0.1) 0%, rgba(60, 122, 94, 0.1) 100%)',
    },

    // Semantic Colors
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#10B981',  // Success green
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },

    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',  // Warning amber
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },

    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',  // Error red
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A',
    },

    info: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',  // Info blue
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
      950: '#082F49',
    },

    // Dark Mode Palette
    dark: {
      background: '#0D1215',
      surface: '#171F24',
      surfaceHover: '#232E35',
      border: '#2F3D46',
      borderHover: '#3B4C57',
      text: {
        primary: '#FAFAFA',
        secondary: '#A3B0BA',
        tertiary: '#7D8E9A',
        disabled: '#5C6D78',
      },
    },

    // Light Mode Palette
    light: {
      background: '#FFFFFF',
      surface: '#F4F6F7',
      surfaceHover: '#E4E8EB',
      border: '#C9D1D7',
      borderHover: '#A3B0BA',
      text: {
        primary: '#3B4C57',
        secondary: '#5C6D78',
        tertiary: '#7D8E9A',
        disabled: '#A3B0BA',
      },
    },
  },

  /**
   * Typography
   * Inter for headings, Geist Sans for body
   */
  typography: {
    fonts: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: 'Geist Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: 'Geist Mono, Monaco, "Courier New", monospace',
    },

    // Font Sizes (rem)
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem',    // 128px
    },

    // Font Weights
    weights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Line Heights
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Spacing Scale
   * Consistent spacing system (4px base)
   */
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  /**
   * Border Radius
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem',// 8px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  /**
   * Shadows
   * Subtle elevation system
   */
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: 'none',

    // Colored shadows for glassmorphism
    primaryGlow: '0 8px 32px 0 rgba(11, 110, 99, 0.2)',
    secondaryGlow: '0 8px 32px 0 rgba(60, 122, 94, 0.2)',
    gradientGlow: '0 8px 32px 0 rgba(11, 110, 99, 0.15), 0 8px 32px 0 rgba(60, 122, 94, 0.15)',
  },

  /**
   * Animation Durations
   */
  animation: {
    durations: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },

    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Z-Index Scale
   */
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,
  },

  /**
   * Breakpoints
   */
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Container Max Widths
   */
  containers: {
    xs: '20rem',   // 320px
    sm: '24rem',   // 384px
    md: '28rem',   // 448px
    lg: '32rem',   // 512px
    xl: '36rem',   // 576px
    '2xl': '42rem',// 672px
    '3xl': '48rem',// 768px
    '4xl': '56rem',// 896px
    '5xl': '64rem',// 1024px
    '6xl': '72rem',// 1152px
    '7xl': '80rem',// 1280px
    full: '100%',
  },

  /**
   * Glassmorphism Styles
   */
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(12px) saturate(180%)',
    },
    dark: {
      background: 'rgba(23, 23, 23, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px) saturate(180%)',
    },
  },
} as const;

export type Brand = typeof brand;

/**
 * Brand Guidelines Export
 */
export const brandGuidelines = {
  logoUsage: {
    clearSpace: 'Minimum clear space of 16px on all sides',
    minSize: 'Minimum size: 24px height',
    backgrounds: 'Use on light backgrounds or dark backgrounds with appropriate variant',
  },
  colorUsage: {
    primary: 'Use for CTAs, links, primary actions, focus states (#0b6e63 teal)',
    secondary: 'Use for accents, highlights, gradient partner (#3c7a5e sage)',
    slate: 'Use for body text, dark surfaces, borders (#3b4c57)',
    gradient: 'Use for hero sections, premium features, special callouts',
  },
  typography: {
    headings: 'Use Inter with semibold (600) or bold (700) weight',
    body: 'Use Geist Sans with normal (400) or medium (500) weight',
    emphasis: 'Use medium (500) or semibold (600) for emphasis',
  },
  spacing: {
    components: 'Use 4, 6, 8 for component internal spacing',
    sections: 'Use 12, 16, 24 for section spacing',
    layout: 'Use 32, 48, 64 for major layout spacing',
  },
};

export default brand;
