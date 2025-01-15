// File: lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // Uncomment for debugging if needed
  });
}
prisma = globalForPrisma.prisma;

export default prisma;
