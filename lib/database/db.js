import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL não está configurada');
  }
  
  // Criar pool de conexão do pg
  const pool = new pg.Pool({ connectionString });
  
  // Criar adapter do Prisma
  const adapter = new PrismaPg(pool);
  
  // Criar PrismaClient com o adapter
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

