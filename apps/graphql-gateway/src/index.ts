import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { GraphQLError } from 'graphql';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { typeDefs } from './schema/schema';
import { resolvers as allResolvers } from './resolvers';
// Import all datasources
import {
  WaitlistAPI,
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
import 'dotenv/config';

// Redis setup
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Pub/Sub for subscriptions
const pubsub = new RedisPubSub({
  publisher: redis.duplicate(),
  subscriber: redis.duplicate(),
});

// Verify JWT token
function verifyToken(token: string | undefined): any {
  if (!token) return null;

  try {
    // If using Clerk, verify with Clerk's public key
    // For now, decode without verification (development only!)
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Combine all resolvers
const resolvers = {
  Query: {
    ...allResolvers.Query,
    me: async (_: any, __: any, { user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return user;
    },
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

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,

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

    // Drain HTTP server on shutdown
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // CORS configuration for credentials
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    '/graphql',
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // Allow credentials (cookies, authorization headers)
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = verifyToken(token);
        const userId = user?.userId || user?.sub || '';

        // Create all data sources
        const waitlistAPI = new WaitlistAPI(token);
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
            waitlistAPI,
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
  console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down GraphQL Gateway...');
  await redis.quit();
  await pubsub.close();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
