# @microplanner/config

Shared configuration files for the MicroPlanner monorepo.

## Configurations

### ESLint (`eslint.config.js`)

Shared ESLint configuration extending:
- Next.js core web vitals
- TypeScript recommended
- Prettier for formatting

**Usage:**

```js
// .eslintrc.js
module.exports = {
  extends: ['@microplanner/config/eslint'],
};
```

### Tailwind CSS (`tailwind.config.js`)

Professional design system with:
- **Brand colors**: Primary (blue), Accent (purple)
- **Semantic colors**: Success, Warning, Error, Info
- **Dark mode**: Primary mode with full theme support
- **Light mode**: Secondary mode support
- **Typography**: Custom font sizes, reduced for professional look
- **Spacing**: Unified spacing scale
- **Border radius**: Consistent radii (sm: 4px, md: 8px, lg: 12px, xl: 16px)
- **Animations**: Fade, slide, scale with 150ms/250ms/350ms durations
- **Gradients**: Brand gradient, hero gradient
- **Shadows**: Glow effects for interactive elements

**Usage:**

```js
// tailwind.config.ts
import baseConfig from '@microplanner/config/tailwind.config';

export default {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@microplanner/ui/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### TypeScript (`tsconfig.base.json`)

Base TypeScript configuration with:
- ES2020 target
- Strict mode enabled
- Path aliases for monorepo packages
- Composite project references

**Usage:**

```json
// tsconfig.json
{
  "extends": "@microplanner/config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    // App-specific overrides
  }
}
```

## Design System Guidelines

### Colors

**Always use design system colors - NEVER hardcode values!**

```tsx
// ❌ BAD
<div className="text-blue-500 bg-purple-600" />

// ✅ GOOD
<div className="text-primary-500 bg-accent-600" />
<div className="text-success bg-error/10" />
<div className="text-dark-text-primary bg-dark-bg-secondary" />
```

### Spacing

```tsx
// ❌ BAD
<div className="p-[20px] m-[15px]" />

// ✅ GOOD
<div className="p-6 m-4" />
<div className="space-y-8" />
```

### Border Radius

```tsx
// ❌ BAD
<div className="rounded-[12px]" />

// ✅ GOOD
<div className="rounded-lg" />
<div className="rounded-xl" />
```

### Typography

```tsx
// ❌ BAD
<h1 className="text-[32px] font-bold" />

// ✅ GOOD
<h1 className="text-2xl font-bold" />
<h1 className="text-display-md text-gradient" />
```

### Animations

```tsx
// ❌ BAD
<div className="transition-all duration-200" />

// ✅ GOOD
<div className="transition-all duration-250" />
<div className="animate-fade-in" />
<div className="animate-slide-up" />
```

## Project References

This configuration sets up TypeScript project references for the monorepo, allowing:
- Faster incremental builds
- Better IDE performance
- Type checking across packages
- Proper import resolution

All packages are referenced with `@microplanner/*` aliases.
