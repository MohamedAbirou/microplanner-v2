# 🎨 MicroPlanner Brand Guidelines

**Version 1.0** | Created: November 2024

---

## 📖 Table of Contents

1. [Brand Overview](#brand-overview)
2. [Logo System](#logo-system)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Design Tokens](#design-tokens)
6. [Visual Style](#visual-style)
7. [Usage Examples](#usage-examples)

---

## 🌟 Brand Overview

### **Brand Positioning**
MicroPlanner is a **premium AI-powered weekly planning tool** that combines intelligent automation with human-centric design. We compete with top-tier products like ReclaimAI, Motion, and Clockwise.

### **Brand Personality**
- **Intelligent**: AI-powered, data-driven, smart
- **Trustworthy**: Reliable, secure, professional
- **Modern**: Cutting-edge, innovative, tech-forward
- **Friendly**: Approachable, helpful, user-focused
- **Efficient**: Fast, streamlined, productive

### **Target Audience**
- **Primary**: Tech-savvy professionals, startup founders, developers
- **Secondary**: Knowledge workers, creatives, students
- **Tertiary**: Teams and organizations (Enterprise)

### **Brand Voice**
- **Tone**: Confident but not arrogant, smart but not complex
- **Style**: Clear, concise, action-oriented
- **Language**: Professional with a modern edge (like Vercel, Stripe, Linear)

---

## 🎨 Logo System

### **Logo Concept: "The Micro Maestro"**

The MicroPlanner logo represents:
- **Ascending bars**: Productivity growth and progress
- **M-shape**: The letter "M" for MicroPlanner
- **Calendar grid**: Planning and scheduling
- **AI dots**: Neural network pattern, artificial intelligence
- **Gradient**: Innovation, dynamism, premium quality

### **Logo Variations**

1. **Full Logo** (`logo-full.svg`)
   - Icon + Wordmark + Tagline
   - Use for: Website header, marketing materials, presentations

2. **Icon Only** (`logo-icon.svg`)
   - Just the bars and dots
   - Use for: App icon, favicon, social media avatars, small spaces

3. **White Version** (`logo-white.svg`)
   - For dark backgrounds
   - Use for: Dark mode, presentations with dark slides

4. **Black Version** (`logo-black.svg`)
   - For light backgrounds
   - Use for: Light mode, printed materials

### **Logo Usage Rules**

✅ **DO**
- Maintain clear space around the logo (minimum 20px)
- Use official logo files (no recreation)
- Scale proportionally
- Use on contrasting backgrounds
- Use gradient version when possible for digital

❌ **DON'T**
- Distort, rotate, or skew the logo
- Change colors (except official monochrome versions)
- Add effects (drop shadows, outlines, etc.)
- Place on busy backgrounds
- Use low-resolution versions

### **Minimum Sizes**
- **Digital**: 24px height (icon), 120px width (full logo)
- **Print**: 0.5 inch height minimum

---

## 🎨 Color Palette

### **Primary Colors**

```css
/* Brand Gradient (Primary) */
--gradient-brand: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);

/* Blue (Trust, Focus, Clarity) */
--color-blue-500: #3B82F6;
--color-blue-600: #2563EB;  /* PRIMARY BLUE */
--color-blue-700: #1D4ED8;

/* Purple (Creativity, AI, Innovation) */
--color-purple-500: #A855F7;
--color-purple-600: #9333EA;
--color-purple-700: #7C3AED;  /* PRIMARY PURPLE */
```

**When to Use:**
- **Blue (#2563EB)**: Primary buttons, links, highlights
- **Purple (#7C3AED)**: Accent elements, AI features, premium badges
- **Gradient**: Hero sections, CTAs, premium features, branding elements

---

### **Semantic Colors**

```css
/* Success (Completion, Goals Achieved) */
--color-success: #10B981;
--color-success-light: #34D399;
--color-success-dark: #059669;

/* Warning (Attention, Limits) */
--color-warning: #F59E0B;
--color-warning-light: #FBBF24;
--color-warning-dark: #D97706;

/* Error (Failure, Critical) */
--color-error: #EF4444;
--color-error-light: #F87171;
--color-error-dark: #DC2626;

/* Info (Neutral Information) */
--color-info: #3B82F6;
--color-info-light: #60A5FA;
--color-info-dark: #2563EB;
```

---

### **Dark Mode (Primary Theme)**

```css
/* Backgrounds */
--bg-primary: #0A0A0A;      /* Main background */
--bg-secondary: #171717;    /* Cards, panels */
--bg-tertiary: #262626;     /* Elevated surfaces */
--bg-hover: #404040;        /* Hover states */

/* Text */
--text-primary: #FAFAFA;    /* Headings, primary text */
--text-secondary: #A1A1A1;  /* Body text, descriptions */
--text-tertiary: #737373;   /* Muted text, placeholders */

/* Borders */
--border-primary: #262626;
--border-secondary: #404040;
--border-focus: #2563EB;
```

---

### **Light Mode**

```css
/* Backgrounds */
--bg-primary: #FFFFFF;      /* Main background */
--bg-secondary: #F9FAFB;    /* Cards, panels */
--bg-tertiary: #F3F4F6;     /* Elevated surfaces */
--bg-hover: #E5E7EB;        /* Hover states */

/* Text */
--text-primary: #0A0A0A;    /* Headings, primary text */
--text-secondary: #525252;  /* Body text, descriptions */
--text-tertiary: #737373;   /* Muted text, placeholders */

/* Borders */
--border-primary: #E5E7EB;
--border-secondary: #D1D5DB;
--border-focus: #2563EB;
```

---

### **Full Color Scale (Tailwind Extended)**

```javascript
colors: {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',  // ← PRIMARY
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
    700: '#7C3AED',  // ← PRIMARY ACCENT
    800: '#6B21A8',
    900: '#581C87',
  },
}
```

---

## 📝 Typography

### **Font Stack**

```css
/* Headings & Display Text */
--font-display: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body & UI Text */
--font-body: 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code & Monospace */
--font-mono: 'Geist Mono', 'Fira Code', 'Consolas', monospace;
```

---

### **Type Scale**

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **Display XL** | 72px | 700 | 1.1 | -0.02em |
| **Display L** | 60px | 700 | 1.1 | -0.02em |
| **Display M** | 48px | 700 | 1.2 | -0.01em |
| **H1** | 36px | 700 | 1.2 | -0.01em |
| **H2** | 30px | 600 | 1.3 | -0.005em |
| **H3** | 24px | 600 | 1.4 | 0 |
| **H4** | 20px | 600 | 1.5 | 0 |
| **H5** | 18px | 600 | 1.5 | 0 |
| **Body L** | 18px | 400 | 1.6 | 0 |
| **Body M** | 16px | 400 | 1.6 | 0 |
| **Body S** | 14px | 400 | 1.5 | 0 |
| **Caption** | 12px | 500 | 1.4 | 0.01em |
| **Overline** | 11px | 600 | 1.3 | 0.08em (uppercase) |

---

### **Font Weights**

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Usage Guidelines:**
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: UI labels, buttons, captions
- **Semibold (600)**: Subheadings (H2-H5), emphasized text
- **Bold (700)**: Main headings (H1, Display), strong emphasis

---

## 🎯 Design Tokens

### **Spacing Scale**

```css
--spacing-1: 4px;    /* 0.25rem */
--spacing-2: 8px;    /* 0.5rem */
--spacing-3: 12px;   /* 0.75rem */
--spacing-4: 16px;   /* 1rem */
--spacing-5: 20px;   /* 1.25rem */
--spacing-6: 24px;   /* 1.5rem */
--spacing-8: 32px;   /* 2rem */
--spacing-10: 40px;  /* 2.5rem */
--spacing-12: 48px;  /* 3rem */
--spacing-16: 64px;  /* 4rem */
--spacing-20: 80px;  /* 5rem */
--spacing-24: 96px;  /* 6rem */
```

**Usage:**
- **4-8px**: Icon padding, tight spacing
- **12-16px**: Component padding, spacing between related elements
- **24-32px**: Section spacing, card padding
- **48-96px**: Page margins, section breaks

---

### **Border Radius**

```css
--radius-sm: 4px;    /* Small elements (tags, badges) */
--radius-md: 8px;    /* Buttons, inputs, small cards */
--radius-lg: 12px;   /* Cards, modals */
--radius-xl: 16px;   /* Large cards, panels */
--radius-2xl: 24px;  /* Hero sections, feature cards */
--radius-full: 9999px; /* Pills, avatars */
```

---

### **Shadows**

```css
/* Subtle - Cards, panels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Medium - Dropdowns, popovers */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Large - Modals, overlays */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Glow - CTAs, focus states, premium elements */
--shadow-glow-blue: 0 0 20px rgba(37, 99, 235, 0.5);
--shadow-glow-purple: 0 0 20px rgba(124, 58, 237, 0.5);
--shadow-glow-brand: 0 0 30px rgba(37, 99, 235, 0.3);
```

---

### **Animation Timing**

```css
/* Duration */
--duration-instant: 150ms;   /* Micro-interactions */
--duration-fast: 250ms;      /* Hover states, transitions */
--duration-normal: 350ms;    /* Modals, drawers */
--duration-slow: 500ms;      /* Page transitions, complex animations */

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Usage:**
- **Instant (150ms)**: Button hover, icon changes
- **Fast (250ms)**: Dropdowns, tooltips, color changes
- **Normal (350ms)**: Modals, sidebars, card flips
- **Slow (500ms)**: Page transitions, complex sequences

---

## 🎨 Visual Style

### **Glassmorphism**

```css
.glass-card {
  background: rgba(23, 23, 23, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

**When to Use:**
- Modals and overlays
- Premium feature cards
- Navigation panels
- Elevated surfaces

---

### **Gradient Overlays**

```css
/* Brand Gradient (Primary) */
.bg-gradient-brand {
  background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
}

/* Hero Backgrounds */
.bg-gradient-hero {
  background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 50%),
              radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.15), transparent 50%);
}

/* Glass with Gradient Border */
.gradient-border {
  position: relative;
  background: #0A0A0A;
  border-radius: 12px;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

---

### **Icons**

**Library**: Lucide Icons
**Style**: Outlined, 2px stroke weight
**Sizes**: 16px, 20px, 24px, 32px

```jsx
// Example usage
import { Calendar, CheckCircle, Sparkles } from 'lucide-react';

<Calendar size={20} strokeWidth={2} />
```

---

## 💡 Usage Examples

### **Button Styles**

```tsx
// Primary CTA (Gradient)
<button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600
                   rounded-lg font-semibold text-white shadow-glow-brand
                   hover:shadow-glow-brand/80 transition-all duration-250">
  Get Started Free
</button>

// Secondary
<button className="px-6 py-3 border border-gray-700 rounded-lg font-semibold
                   text-gray-200 hover:border-gray-500 transition-all duration-250">
  Learn More
</button>

// Ghost
<button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800
                   rounded-md transition-colors duration-150">
  Cancel
</button>
```

---

### **Card Styles**

```tsx
// Glass Card
<div className="p-6 bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-800
                shadow-xl hover:border-gray-700 transition-all duration-350">
  {/* Content */}
</div>

// Feature Card with Gradient Border
<div className="relative p-6 bg-gray-950 rounded-2xl overflow-hidden
                before:absolute before:inset-0 before:rounded-2xl before:p-[1px]
                before:bg-gradient-to-br before:from-blue-600 before:to-purple-600
                before:-z-10">
  {/* Content */}
</div>
```

---

### **Input Styles**

```tsx
<input className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2
                  focus:ring-blue-600 focus:border-transparent transition-all duration-150"
       placeholder="Enter your email..."
/>
```

---

## 📐 Layout Grid

### **Container Widths**

```css
--container-sm: 640px;   /* Mobile, forms */
--container-md: 768px;   /* Tablets */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Wide desktop */
--container-2xl: 1536px; /* Ultra-wide */
```

### **Breakpoints**

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

---

## ✅ Brand Checklist

Before launching any design:

- [ ] Logo has proper clear space
- [ ] Colors match brand palette
- [ ] Typography uses Inter/Geist Sans
- [ ] Shadows and borders are consistent
- [ ] Animations use correct timing
- [ ] Dark mode is the default
- [ ] Gradient used for CTAs
- [ ] Glassmorphism on elevated surfaces
- [ ] Icons are from Lucide (outlined, 2px stroke)
- [ ] Accessible (WCAG 2.1 AA minimum)

---

## 📞 Contact

For questions or brand asset requests, contact: **brand@microplanner.ai**

---

**© 2024 MicroPlanner. All rights reserved.**
