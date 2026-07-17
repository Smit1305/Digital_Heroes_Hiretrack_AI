import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '@prisma/client'

type PrismaClientOptions = Omit<Prisma.PrismaClientOptions, 'adapter' | 'accelerateUrl'>

export function createPrismaClient(options: PrismaClientOptions = {}) {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create a Prisma client.')
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    ...options,
    adapter,
  })
}
