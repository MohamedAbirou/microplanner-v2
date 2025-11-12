import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export PrismaClient class so it can be used in other packages
export { PrismaClient } from '@prisma/client';

// Re-export Prisma-generated types and enums
// Note: Prisma generates types in the Prisma namespace, not as direct exports
// So we just re-export everything from manual types which match the schema
export * from './types';
