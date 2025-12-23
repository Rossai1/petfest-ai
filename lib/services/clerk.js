// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/clerk.js:1',message:'Clerk service loading',data:{NEXT_PHASE:process.env.NEXT_PHASE},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E,F'})}).catch(()=>{});
// #endregion
import { auth, currentUser } from '@clerk/nextjs/server';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/clerk.js:7',message:'About to import supabase-db',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import { getOrCreateUserFast, getUserByClerkId } from '../database/supabase-db';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/clerk.js:12',message:'After supabase-db import',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import { ADMIN_EMAIL } from '../config/config';
import { logger } from '../utils/logger';

/**
 * Verifica se o usuário atual é administrador
 */
export async function isAdmin() {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const clerkUser = await currentUser();
    if (!clerkUser) return false;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    return email === ADMIN_EMAIL;
  } catch (error) {
    logger.error('Erro ao verificar admin:', error);
    return false;
  }
}

/**
 * Obtém ou cria um usuário no banco de dados baseado no Clerk ID
 * Usa Supabase direto para performance (~50ms vs 4-5s)
 */
export async function getOrCreateUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return null;
    }

    // Usar função otimizada do Supabase
    return await getOrCreateUserFast(userId, email);
  } catch (error) {
    logger.error('getOrCreateUser: erro', error);
    throw error;
  }
}

/**
 * Obtém o usuário atual do banco de dados
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return await getUserByClerkId(userId);
}
