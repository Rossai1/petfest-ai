import { getUser } from '@/lib/auth/server';
import {
  getUserByEmail,
  createUser,
  getSupabase,
} from '../database/supabase-db';
import { ADMIN_EMAIL } from '../../config/config';
import { logger } from '../utils/logger';

/**
 * Verifica se o usuário atual é administrador
 */
export async function isAdmin() {
  try {
    const user = await getUser();
    if (!user || !user.email) return false;
    return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  } catch (error) {
    logger.error('Erro ao verificar admin:', error);
    return false;
  }
}

/**
 * Obtém ou cria um usuário no banco de dados baseado no email do Supabase Auth.
 * Sincroniza com usuários pré-existentes (criados via n8n/webhook).
 * Vincula o auth_user_id quando o usuário faz login.
 */
export async function getOrCreateUser() {
  try {
    const authUser = await getUser();
    if (!authUser || !authUser.email) {
      return null;
    }

    const email = authUser.email.toLowerCase().trim();
    const authUserId = authUser.id;

    // Buscar usuário por email na tabela kiwify_webhooks
    let user = await getUserByEmail(email);

    if (user) {
      // Se o usuário já existe, atualizar auth_user_id se necessário
      if (!user.authUserId && authUserId) {
        const supabase = getSupabase();
        const { data: updatedUser, error: updateError } = await supabase
          .from('kiwify_webhooks')
          .update({ 
            auth_user_id: authUserId,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email)
          .select('id, auth_user_id, email, credits, plan, last_reset_at')
          .single();

        if (!updateError && updatedUser) {
          user = {
            id: updatedUser.id,
            authUserId: updatedUser.auth_user_id,
            email: updatedUser.email,
            credits: updatedUser.credits,
            plan: updatedUser.plan,
            lastResetAt: updatedUser.last_reset_at,
          };
          logger.info(`Vinculei auth_user_id ${authUserId} ao usuário ${email}`);
        }
      }
      return { ...user, linkedCredits: false };
    }

    // Se não encontrou, pode ser um usuário que acabou de fazer login
    // mas ainda não tem registro na kiwify_webhooks
    // Neste caso, criamos um registro básico
    logger.info(`Criando novo registro para email ${email} na kiwify_webhooks`);
    const newUser = await createUser(null, email); // clerkId é null porque não usamos mais
    
    // Vincular auth_user_id
    if (authUserId && newUser) {
      const supabase = getSupabase();
      await supabase
        .from('kiwify_webhooks')
        .update({ 
          auth_user_id: authUserId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', newUser.id);
      
      newUser.authUserId = authUserId;
    }
    
    return { ...newUser, linkedCredits: false };

  } catch (error) {
    logger.error('getOrCreateUser: erro inesperado', {
      errorMessage: error.message,
      stack: error.stack,
    });
    throw new Error('Ocorreu um erro ao obter ou criar o usuário.');
  }
}

/**
 * Obtém o usuário atual do banco de dados
 */
export async function getCurrentUser() {
  const authUser = await getUser();

  if (!authUser || !authUser.email) {
    return null;
  }

  const email = authUser.email.toLowerCase().trim();
  return await getUserByEmail(email);
}



