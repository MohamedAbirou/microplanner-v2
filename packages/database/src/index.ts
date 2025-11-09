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

// Export Prisma client types when available
// Temporarily export our own types until Prisma client is generated
export * from './types';

// Uncomment when Prisma client is generated:
// export * from '@prisma/client';
