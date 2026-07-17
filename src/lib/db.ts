import { createPrismaClient } from './prisma-client'

// Infer the return type directly so we never import PrismaClient from @prisma/client
type DbClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: DbClient | undefined
}



export const db: DbClient =
  globalForPrisma.prisma ?? createPrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
