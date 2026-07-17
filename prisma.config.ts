import { defineConfig } from 'prisma/config'
import 'dotenv/config'

// DATABASE_URL is required at migration/seed time, not at generate time.
// The placeholder is only used during `prisma generate` which doesn't connect.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/hiretrack_ai',
  },
})
