// lib/prisma.ts
// Singleton pattern: mencegah terlalu banyak koneksi database
// terbuka saat Next.js melakukan hot-reload di development

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}