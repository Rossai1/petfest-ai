import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:1',message:'Module loaded - entry point',data:{NEXT_PHASE:process.env.NEXT_PHASE,NODE_ENV:process.env.NODE_ENV,hasDBUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
// #endregion

const globalForPrisma = globalThis;

// Detectar se estamos em ambiente de build
function isBuildTime() {
  if (typeof process === 'undefined') return false;
  
  // Verificar se estamos em fase de build do Next.js
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-development-build') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:18',message:'isBuildTime detected NEXT_PHASE',data:{NEXT_PHASE:process.env.NEXT_PHASE},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }
  
  // Se não há DATABASE_URL e estamos em ambiente de build (não runtime)
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:25',message:'isBuildTime detected no DB_URL in production',data:{NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:32',message:'isBuildTime returned false',data:{NEXT_PHASE:process.env.NEXT_PHASE,NODE_ENV:process.env.NODE_ENV,hasDBUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
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
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:52',message:'createPrismaClient called',data:{hasConnectionString:!!connectionString,isBuild:isBuildTime()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
  // #endregion
  
  if (!connectionString) {
    // Durante o build, retornar mock silencioso
    if (isBuildTime()) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:60',message:'Returning mock - no connection string',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return createMockPrisma();
    }
    // Em runtime sem DATABASE_URL, lançar erro
    throw new Error('DATABASE_URL não está configurada');
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:71',message:'Attempting to create pg.Pool',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Criar pool de conexão do pg
    const pool = new pg.Pool({ connectionString });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:78',message:'Attempting to create PrismaPg adapter',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Criar adapter do Prisma
    const adapter = new PrismaPg(pool);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:85',message:'Attempting to create PrismaClient',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Criar PrismaClient com o adapter
    return new PrismaClient({ adapter });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:92',message:'Error in createPrismaClient',data:{errorMsg:error.message,isBuild:isBuildTime()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:108',message:'getPrisma called',data:{isBuild:isBuildTime(),hasGlobalPrisma:!!globalForPrisma.prisma},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Durante o build, retornar mock
  if (isBuildTime()) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:115',message:'Returning mock from getPrisma',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:136',message:'About to call getPrisma for export',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
// #endregion
export const prisma = getPrisma();
// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/database/db.js:141',message:'Prisma exported successfully',data:{isPrismaMock:!prisma.$connect},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
// #endregion

export default prisma;

