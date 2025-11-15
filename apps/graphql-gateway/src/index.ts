import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { typeDefs } from './schema/schema';
import { resolvers as allResolvers } from './resolvers';
// Phase 0 & 1 datasources only
import { WaitlistAPI, UserAPI, OnboardingAPI } from './datasources/rest-api';

// Commented out until features are implemented
// import { GoalsAPI, TasksAPI, ProductivityAPI, ProjectsAPI } from './datasources/rest-api';
// import {
//   createTaskLoader,
//   createGoalLoader,
//   createProjectLoader,
//   createTaskByGoalLoader,
// } from './datasources/dataloaders';
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

  // Type resolvers - commented out until features are implemented
  // Goal: allResolvers.Goal,
  // Task: allResolvers.Task,
  // TaskDependency: allResolvers.TaskDependency,
  // Project: allResolvers.Project,
  // KanbanBoard: allResolvers.KanbanBoard,

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

  // Enable subscriptions
  plugins: [
    // Add plugins here (Sentry, logging, etc.)
  ],
});

// Start server
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4000') },

    // Context function - runs for every request
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = verifyToken(token);
      const userId = user?.userId || user?.sub || '';

      // Create data sources (Phase 0 & 1 only)
      const waitlistAPI = new WaitlistAPI(token);
      const userAPI = new UserAPI(token);
      const onboardingAPI = new OnboardingAPI(token);

      return {
        user,
        token,
        redis,
        pubsub,
        dataSources: {
          waitlistAPI,
          userAPI,
          onboardingAPI,
        },
      };
    },
  });

  console.log(`🚀 GraphQL Gateway ready at ${url}`);
  console.log(`📊 GraphQL Playground: ${url}`);
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
