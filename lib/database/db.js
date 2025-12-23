import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

// Detectar se estamos em ambiente de build
function isBuildTime() {
  if (typeof process === 'undefined') return false;
  
  // Verificar se estamos em fase de build do Next.js
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-development-build') {
    return true;
  }
  
  // Se não há DATABASE_URL e estamos em ambiente de build (não runtime)
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    return true;
  }
  
  return false;
}

// Mock do Prisma para uso durante o build
function createMockPrisma() {
  return {
    theme: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
    },
    user: {
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      upsert: async () => ({}),
    },
  };
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // Durante o build, retornar mock silencioso
    if (isBuildTime()) {
      return createMockPrisma();
    }
    // Em runtime sem DATABASE_URL, lançar erro
    throw new Error('DATABASE_URL não está configurada');
  }
  
  try {
    // Criar pool de conexão do pg
    const pool = new pg.Pool({ connectionString });
    
    // Criar adapter do Prisma
    const adapter = new PrismaPg(pool);
    
    // Criar PrismaClient com o adapter
    return new PrismaClient({ adapter });
  } catch (error) {
    // Durante o build, retornar mock em vez de lançar erro
    if (isBuildTime()) {
      console.warn('Prisma initialization skipped during build');
      return createMockPrisma();
    }
    throw error;
  }
}

// Lazy initialization - só cria quando necessário
function getPrisma() {
  // Durante o build, retornar mock
  if (isBuildTime()) {
    return createMockPrisma();
  }
  
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  const client = createPrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  
  return client;
}

export const prisma = getPrisma();

export default prisma;

