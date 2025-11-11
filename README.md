# 🎯 MicroPlanner

**Mobile-first AI weekly planner that crushes ReclaimAI**

A production-ready, AI-powered weekly planning application built with a modern microservices architecture. Designed to beat ReclaimAI by solving their three critical failures: no mobile app, calendar sync disasters, and basic AI.

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🏗️ Architecture Overview

MicroPlanner follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐            │
│  │ iOS App  │  │ Android   │  │ Web Client   │            │
│  │ (Expo)   │  │ (Expo)    │  │ (Next.js 15) │            │
│  └─────┬────┘  └──────┬────┘  └──────┬───────┘            │
└────────┼──────────────┼──────────────┼──────────────────────┘
         │              │              │
         └──────────────┴──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │   NestJS API Gateway         │
         │   - Authentication           │
         │   - Rate Limiting            │
         │   - Request Routing          │
         └──────────────┬──────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    ▼                   ▼                   ▼
┌─────────┐     ┌──────────────┐    ┌──────────┐
│Database │     │  Planning    │    │  Redis   │
│(Postgres│     │  Service     │    │ (Cache/  │
│+pgvector)     │  (FastAPI)   │    │  Queue)  │
└─────────┘     └──────────────┘    └──────────┘
```

## 🚀 Tech Stack

### Frontend
- **Web**: Next.js 15 (App Router) + React 19
- **Mobile**: Expo (React Native) - iOS & Android
- **UI**: TailwindCSS + shadcn/ui (Blue → Purple gradient theme)
- **State**: TanStack Query (React Query)

### Backend
- **API Gateway**: NestJS (TypeScript) - Modular architecture
- **Planning Service**: Python FastAPI - AI-powered planning
- **Database**: PostgreSQL 15+ with pgvector extension
- **Cache/Queue**: Redis 7+
- **AI/LLM**: OpenAI GPT-4o-mini / GPT-4o (tiered system)

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📦 Project Structure

```
microplanner-v2/
├── apps/
│   ├── api-gateway/          # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/     # Clerk authentication
│   │   │   │   ├── users/    # User management
│   │   │   │   ├── goals/    # Goal CRUD
│   │   │   │   ├── plans/    # Plan orchestration
│   │   │   │   ├── tasks/    # Task management
│   │   │   │   ├── calendar/ # Calendar integration
│   │   │   │   ├── billing/  # Stripe billing
│   │   │   │   └── analytics/# Event tracking
│   │   │   ├── database/     # Prisma client
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── planning-service/     # Python FastAPI Service
│   │   ├── app/
│   │   │   ├── api/v1/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   │   └── planner.py # AI planning engine
│   │   │   ├── models/       # Pydantic schemas
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── web/                  # Next.js 15 App (Coming soon)
│   └── mobile/               # Expo App (Coming soon)
│
├── packages/
│   ├── database/             # Prisma schema & client
│   │   └── prisma/
│   │       └── schema.prisma # Complete DB schema
│   │
│   ├── types/                # Shared TypeScript types
│   │   └── src/index.ts      # API contracts
│   │
│   └── config/               # Shared configuration
│       └── src/index.ts      # Tier limits, constants
│
├── docker-compose.yml        # Local development setup
├── turbo.json               # Turborepo config
├── pnpm-workspace.yaml      # pnpm workspaces
└── README.md                # You are here!
```

## 🎬 Getting Started

### Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **pnpm**: v8+ (`npm install -g pnpm`)
- **Docker**: Latest version ([Download](https://www.docker.com/))
- **Python**: 3.11+ (for planning service)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MohamedAbirou/microplanner-v2.git
cd microplanner-v2
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required for AI Planning
OPENAI_API_KEY=sk-...

# Required for Authentication (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Required for Payments (get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database (auto-configured for Docker)
DATABASE_URL="postgresql://microplanner:microplanner_dev_password@localhost:5432/microplanner_dev"

# Redis (auto-configured for Docker)
REDIS_URL="redis://localhost:6379"
```

4. **Start infrastructure services**

```bash
# Start PostgreSQL + Redis
docker-compose up -d postgres redis
```

5. **Initialize database**

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

6. **Start development servers**

```bash
# Start all services in development mode
pnpm dev
```

This will start:
- **API Gateway**: http://localhost:3001
- **Planning Service**: http://localhost:8000
- **Web App**: http://localhost:3000 (when implemented)

## 🛠️ Development

### Running Individual Services

```bash
# API Gateway only
cd apps/api-gateway
pnpm dev

# Planning Service only
cd apps/planning-service
python -m uvicorn app.main:app --reload
```

### Database Management

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Create migration (production)
pnpm db:migrate

# Open Prisma Studio (GUI)
pnpm db:studio
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

## 📚 API Documentation

### API Gateway Endpoints

Once the API Gateway is running, visit:
- **Swagger Docs**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

### Planning Service Endpoints

Once the Planning Service is running, visit:
- **FastAPI Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health

### Key API Endpoints

#### Generate Weekly Plan

```bash
POST /api/v1/plans/generate
Content-Type: application/json

{
  "weekStartDate": "2025-01-06",
  "userId": "user_abc123",
  "goals": [
    {
      "id": "goal_1",
      "title": "Gym Workout",
      "frequencyPerWeek": 3,
      "durationMinutes": 60,
      "priority": 8
    }
  ],
  "preferences": {
    "wakeTime": "07:00",
    "sleepTime": "23:00",
    "workStartTime": "09:00",
    "workEndTime": "17:00"
  },
  "userTier": "FREE"
}
```

**Response:**

```json
{
  "success": true,
  "plan": {
    "monday": [
      {
        "goalId": "goal_1",
        "title": "Gym Workout",
        "start": "07:00",
        "end": "08:00",
        "reasoning": "Scheduled in the morning to match your peak energy time"
      }
    ],
    "tuesday": [...],
    ...
  },
  "complexity": "simple",
  "qualityScore": 85.0,
  "metadata": {
    "model": "rule-based",
    "tier": "simple",
    "latency": 0.05,
    "cost": 0.0
  }
}
```

## 🎨 Design System

MicroPlanner uses a custom design system with a **Blue → Purple gradient** theme optimized for dark mode.

### Color Palette

- **Primary**: Blue (#3B82F6 → #1E40AF)
- **Accent**: Purple (#A855F7 → #6B21A8)
- **Background**: Gray 950 (#030712)
- **Text**: White/Gray 100

See the full design system in the planning document or `packages/ui` (coming soon).

## 🚢 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter @microplanner/api-gateway build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Recommended Hosting

- **API Gateway**: Fly.io or Railway
- **Planning Service**: Fly.io or Railway
- **Web App**: Vercel
- **Mobile App**: Expo EAS
- **Database**: Neon (serverless PostgreSQL with pgvector)
- **Redis**: Upstash (serverless Redis)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

## 📊 Architecture Decisions

### Why Turborepo?
- Share code between mobile, web, and API
- Single dependency management
- Parallel builds for faster CI/CD

### Why NestJS for Gateway?
- TypeScript-native with excellent DX
- Modular architecture (easy to extract microservices later)
- Enterprise patterns ready for scale

### Why Python for Planning?
- Superior AI/ML ecosystem
- OpenAI SDK works best with Python
- Easy to integrate with LangChain in future

### Why PostgreSQL + pgvector?
- ACID compliance (no data corruption)
- pgvector for AI embeddings without separate vector DB
- Mature ecosystem with 30+ years of production usage

## 🎯 Tier System

| Tier | Goals | Plans/Week | AI Model | Price |
|------|-------|------------|----------|-------|
| **FREE** | 2 | 5 | Rule-based | $0 |
| **STARTER** | 5 | 20 | GPT-4o-mini | $5/mo |
| **PRO** | Unlimited | Unlimited | GPT-4o | $12/mo |

## 🤝 Contributing

This is currently a private project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🙋 Support

For questions or issues:
- Open a GitHub Issue
- Email: support@microplanner.ai (coming soon)

---

**Built with ❤️ to crush ReclaimAI** 🚀

_Mobile-first • AI-powered • Actually works_
