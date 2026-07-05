import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { GraphQLError } from 'graphql';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { typeDefs } from './schema/schema';
import { resolvers as allResolvers } from './resolvers';
// Import all datasources
import {
  UserAPI,
  OnboardingAPI,
  GoalsAPI,
  TasksAPI,
  ProductivityAPI,
  ProjectsAPI,
  PlansAPI,
  AnalyticsAPI,
  CalendarAPI,
  TeamsAPI,
  SchedulingAPI,
  IntegrationsAPI,
  BillingAPI,
} from './datasources/rest-api';

// Import dataloaders for batching
import {
  createTaskLoader,
  createGoalLoader,
  createProjectLoader,
  createTaskByGoalLoader,
  createTaskByPlanLoader,
  createUserLoader,
} from './datasources/dataloaders';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import 'dotenv/config';
import { resolveRedisConfig } from './redis-config';

const redisConfig = resolveRedisConfig();
const redis = redisConfig
  ? new Redis({
      ...redisConfig,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    })
  : null;

if (!redis) {
  console.warn(
    '⚠ Redis not configured — subscriptions/pubsub disabled. Set REDIS_URL in production.',
  );
}

// In-memory pubsub fallback when Redis is unavailable (dev / minimal deploy)
const pubsub = redis
  ? new RedisPubSub({
      publisher: redis.duplicate(),
      subscriber: redis.duplicate(),
    })
  : null;

// Clerk JWKS client — verifies JWT signatures against Clerk's public keys.
// CLERK_DOMAIN (e.g. "clerk.example.com" or "xxx.clerk.accounts.dev") is
// required in production; without it we refuse to trust any token.
const CLERK_DOMAIN = process.env.CLERK_DOMAIN;
const jwks = CLERK_DOMAIN
  ? jwksClient({
      jwksUri: `https://${CLERK_DOMAIN}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    })
  : null;

if (!jwks) {
  console.warn(
    '⚠ CLERK_DOMAIN is not set — JWT signatures cannot be verified. ' +
      'Tokens will be REJECTED. Set CLERK_DOMAIN to enable authentication.'
  );
}

// Verify JWT token against Clerk JWKS and normalize the user shape.
// Returns null (unauthenticated) on any failure — never trusts unverified data.
async function verifyToken(token: string | undefined): Promise<any> {
  if (!token || !jwks) return null;

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) return null;

    const key = await jwks.getSigningKey(decoded.header.kid);
    const payload = jwt.verify(token, key.getPublicKey(), {
      algorithms: ['RS256'],
      issuer: `https://${CLERK_DOMAIN}`,
    }) as jwt.JwtPayload;

    // Normalize: resolvers use user.userId; Clerk puts the user id in `sub`
    return { ...payload, sub: payload.sub, userId: (payload as any).userId || payload.sub };
  } catch (error) {
    return null;
  }
}

// Combine all resolvers
const resolvers = {
  Query: {
    // user.resolver.ts provides `me` (fetches the DB user via the REST API);
    // do not override it here — the JWT payload is not a User object.
    ...allResolvers.Query,
  },
  Mutation: {
    ...allResolvers.Mutation,
  },
  Subscription: {
    ...allResolvers.Subscription,
  },

  // Type resolvers for field resolution
  Goal: allResolvers.Goal,
  Task: allResolvers.Task,
  TaskDependency: allResolvers.TaskDependency,
  Plan: allResolvers.Plan,
  PlanTemplate: allResolvers.PlanTemplate,
  Project: allResolvers.Project,
  KanbanBoard: allResolvers.KanbanBoard,
  KanbanColumn: allResolvers.KanbanColumn,
  CalendarConnection: allResolvers.CalendarConnection,
  Team: allResolvers.Team,
  TeamMember: allResolvers.TeamMember,
  TeamInvitation: allResolvers.TeamInvitation,
  SchedulingLink: allResolvers.SchedulingLink,
  Booking: allResolvers.Booking,
  Webhook: allResolvers.Webhook,

  // Custom scalars
  DateTime: {
    parseValue(value: any) {
      return new Date(value); // Convert incoming value to Date
    },
    serialize(value: any) {
      return value instanceof Date ? value.toISOString() : value; // Convert Date to ISO string
    },
  },
  JSON: {
    parseValue(value: any) {
      return value;
    },
    serialize(value: any) {
      return value;
    },
  },
};

// Start server with Express and CORS
async function startServer() {
  // Create Express app
  const app = express();
  const httpServer = http.createServer(app);

  // Executable schema shared by the HTTP server and the WebSocket server
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket server for GraphQL subscriptions (graphql-ws protocol —
  // matches the frontend's GraphQLWsLink in apps/web/src/lib/apollo/client.ts)
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const wsServerCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const rawAuth = (ctx.connectionParams?.authorization as string) || '';
        const token = rawAuth.replace('Bearer ', '');
        const user = await verifyToken(token);
        return { user, token, redis, pubsub };
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,

    // Performance optimizations
    cache: 'bounded',
    persistedQueries: {
      ttl: 900, // 15 minutes
    },

    // Error handling
    formatError: (formattedError, error) => {
      // Don't leak internal errors
      if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Internal error:', error);
        return new GraphQLError('Internal server error');
      }
      return formattedError;
    },

    // Production settings
    introspection: process.env.NODE_ENV !== 'production',

    // Drain HTTP + WS servers on shutdown
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsServerCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Start Apollo Server
  await server.start();

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || []),
  ].filter(Boolean) as string[];

  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.endsWith('.vercel.app')) return true;
    return false;
  };

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, origin || true);
        return;
      }
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };

  // CORS on all routes so preflight succeeds even if the client URL is misconfigured
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', graphql: '/graphql' });
  });

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = await verifyToken(token);
        const userId = user?.userId || user?.sub || '';

        // Create all data sources
        const userAPI = new UserAPI(token);
        const onboardingAPI = new OnboardingAPI(token);
        const goalsAPI = new GoalsAPI(token);
        const tasksAPI = new TasksAPI(token);
        const productivityAPI = new ProductivityAPI(token);
        const projectsAPI = new ProjectsAPI(token);
        const plansAPI = new PlansAPI(token);
        const analyticsAPI = new AnalyticsAPI(token);
        const calendarAPI = new CalendarAPI(token);
        const teamsAPI = new TeamsAPI(token);
        const schedulingAPI = new SchedulingAPI(token);
        const integrationsAPI = new IntegrationsAPI(token);
        const billingAPI = new BillingAPI(token);

        // Create DataLoaders for batching (reduces N+1 queries)
        const taskLoader = createTaskLoader(tasksAPI, userId);
        const goalLoader = createGoalLoader(goalsAPI, userId);
        const projectLoader = createProjectLoader(projectsAPI, userId);
        const taskByGoalLoader = createTaskByGoalLoader(tasksAPI);
        const taskByPlanLoader = createTaskByPlanLoader(tasksAPI);
        const userLoader = createUserLoader(userAPI);

        return {
          user,
          token,
          redis,
          pubsub,
          dataSources: {
            userAPI,
            onboardingAPI,
            goalsAPI,
            tasksAPI,
            productivityAPI,
            projectsAPI,
            plansAPI,
            analyticsAPI,
            calendarAPI,
            teamsAPI,
            schedulingAPI,
            integrationsAPI,
            billingAPI,
          },
          // DataLoaders for field resolvers
          taskLoader,
          goalLoader,
          projectLoader,
          taskByGoalLoader,
          taskByPlanLoader,
          userLoader,
        };
      },
    })
  );

  const PORT = parseInt(process.env.PORT || '4000');

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`🚀 GraphQL Gateway ready at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphQL endpoint: /graphql (set NEXT_PUBLIC_GRAPHQL_URL to .../graphql)`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ') || '(none)'} + *.vercel.app`);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down GraphQL Gateway...');
  if (redis) await redis.quit();
  if (pubsub) await pubsub.close();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
