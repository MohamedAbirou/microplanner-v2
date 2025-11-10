# MicroPlanner Web App

Ultra-premium Next.js 15 frontend for MicroPlanner - AI-powered weekly planning that crushes ReclaimAI and Motion.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, Server Components)
- **Language**: TypeScript 5.3 (Strict mode)
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **State Management**: Apollo Client + Zustand + Jotai
- **Forms**: React Hook Form + Zod
- **Authentication**: Clerk
- **Data Fetching**: Apollo Client (GraphQL) + TanStack Query (REST)
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Charts**: Recharts + Tremor
- **Calendar**: FullCalendar
- **Toast Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
# Edit .env.local with your values

# Run development server
pnpm --filter @microplanner/web dev
```

### Development

```bash
# Run dev server
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, signup, onboarding)
│   │   ├── (marketing)/       # Marketing pages (landing, pricing, etc.)
│   │   ├── (dashboard)/       # Protected app routes
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Client providers
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui base components
│   │   ├── marketing/        # Marketing components
│   │   ├── dashboard/        # Dashboard components
│   │   └── layout/           # Layout components
│   │
│   ├── lib/                   # Libraries & utilities
│   │   ├── apollo/           # Apollo Client setup
│   │   ├── graphql/          # GraphQL operations
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── utils/            # Utilities
│   │   ├── validations/      # Zod schemas
│   │   └── constants/        # Constants
│   │
│   └── styles/               # Additional styles
│
├── public/                    # Static assets
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Package dependencies

```

## Features

### Phase 0: Foundation ✅
- [x] Next.js 15 setup
- [x] Design system with Tailwind
- [x] Apollo Client with GraphQL
- [x] Clerk authentication
- [x] Base layouts
- [x] Landing page

### Upcoming Phases
- Phase 1: Authentication & Onboarding
- Phase 2: Marketing Pages
- Phase 3: Goals Management
- Phase 4: AI Weekly Plans
- Phase 5: Tasks Management
- ... (16 phases total)

## Design System

### Brand Colors
- **Primary**: Blue (#2563EB) - Trust, focus
- **Secondary**: Purple (#7C3AED) - Creativity, AI
- **Gradient**: Blue → Purple

### Typography
- **Headings**: Inter (semibold/bold)
- **Body**: Geist Sans (normal/medium)
- **Code**: Geist Mono

### Design Principles
- Dark-mode-first
- Glassmorphism effects
- Subtle animations
- Breathing space
- Clear hierarchy
- Delightful UX

## Performance Goals

- Lighthouse Score: 95+ (all categories)
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Bundle size: < 200KB (first load)

## Deployment

Deploy to Vercel:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

## License

Proprietary - All rights reserved
