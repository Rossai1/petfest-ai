import { auth, currentUser } from '@clerk/nextjs/server';
import {
  getUserByClerkId,
  getUserByEmail,
  linkClerkIdToUser,
  createUser,
} from '../database/supabase-db';
import { ADMIN_EMAIL } from '../../config/config';
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
 * Obtém ou cria um usuário no banco de dados baseado no Clerk ID.
 * Sincroniza com usuários pré-existentes (criados via n8n/webhook).
 */
export async function getOrCreateUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    // 1. Tenta buscar pelo clerk_id (caso mais comum)
    let user = await getUserByClerkId(userId);
    if (user) {
      return { ...user, linkedCredits: false };
    }

    // Se não encontrou, pode ser um usuário pré-cadastrado via n8n/webhook
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      // Caso extremo: usuário do Clerk sem e-mail verificado
      logger.warn(`Usuário Clerk ${userId} não possui um e-mail.`);
      throw new Error(`Não foi possível encontrar um e-mail para o usuário.`);
    }

    // Normalizar email para lowercase e trim antes de buscar
    const normalizedEmail = email.toLowerCase().trim();
    
    // 2. Tenta buscar por e-mail para vincular a conta
    const userByEmail = await getUserByEmail(normalizedEmail);

    if (userByEmail) {
      // 3. Encontrou por e-mail, verificar se precisa vincular
      if (!userByEmail.clerkId) {
        logger.info(`Vinculando clerkId ${userId} ao usuário com email ${email}`, {
          email,
          clerkId: userId,
          credits: userByEmail.credits,
          plan: userByEmail.plan,
          userId: userByEmail.id,
        });
        const linkedUser = await linkClerkIdToUser(normalizedEmail, userId);
        logger.info(`Vinculação concluída: ${email} agora vinculado ao clerkId ${userId}`, {
          credits: linkedUser.credits,
          plan: linkedUser.plan,
        });
        return { ...linkedUser, linkedCredits: true }; // Sinaliza que créditos/plano foram vinculados
      } else if (userByEmail.clerkId !== userId) {
        // Conflito: e-mail já associado a outro clerkId.
        logger.warn(`Conflito de contas: O e-mail ${email} já está associado ao clerkId ${userByEmail.clerkId}. Tentativa de login com ${userId}.`);
        // Retorna o usuário existente associado ao e-mail. A UI pode precisar lidar com este caso.
        return { ...userByEmail, linkedCredits: false, conflict: true };
      }
      // Se o clerkId for o mesmo, o usuário já deveria ter sido encontrado na primeira query.
      return { ...userByEmail, linkedCredits: false };
    }

    // 4. Se não encontrou por clerk_id ou e-mail, cria um novo usuário
    logger.info(`Criando novo usuário para clerkId ${userId} e email ${normalizedEmail}`);
    const newUser = await createUser(userId, normalizedEmail);
    return { ...newUser, linkedCredits: false };

  } catch (error) {
    logger.error('getOrCreateUser: erro inesperado', {
      errorMessage: error.message,
      stack: error.stack,
    });
    // Lançar o erro para que a camada superior possa lidar com ele (ex: página de erro)
    throw new Error('Ocorreu um erro ao obter ou criar o usuário.');
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

  // A função getUserByClerkId já foi atualizada para retornar todos os campos
  return await getUserByClerkId(userId);
}