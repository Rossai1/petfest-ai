import { getSupabase, resetFreeCredits } from '../database/supabase-db';
import { logger } from './logger';
import { FREE_RESET_DAYS, PLANS } from '../../config/config';

/**
 * Verifica os créditos do usuário, lida com o reset mensal para o plano 'free',
 * e retorna o status de uso.
 * 
 * @param {object} user - O objeto completo do usuário, incluindo `id`, `plan`, `credits`, `lastResetAt`.
 * @returns {Promise<{canGenerate: boolean, credits: number, plan: string, wasReset: boolean, user: object}>}
 */
export async function checkUsageLimit(user) {
  if (!user) {
    throw new Error('A user object must be provided to checkUsageLimit.');
  }

  let currentUser = { ...user };
  let wasReset = false;

  // 1. Lógica de Reset para plano 'free'
  if (currentUser.plan === PLANS.FREE) {
    const now = new Date();
    // Se lastResetAt for null/undefined, usar data atual para evitar erro
    const lastReset = currentUser.lastResetAt 
      ? new Date(currentUser.lastResetAt) 
      : now;
    
    // Calcula a diferença em dias
    const diffTime = now.getTime() - lastReset.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= FREE_RESET_DAYS) {
      logger.info(`Resetando créditos para o usuário free ${currentUser.id} após ${diffDays} dias.`);
      try {
        const updatedUser = await resetFreeCredits(currentUser.id);
        currentUser.credits = updatedUser.credits;
        currentUser.lastResetAt = updatedUser.lastResetAt;
        wasReset = true;
      } catch (error) {
        logger.error(`Falha ao resetar créditos para o usuário ${currentUser.id}:`, error);
        // Continua a execução com os créditos antigos em caso de falha no reset
      }
    }
  }

  // 2. Verificação final de créditos
  const canGenerate = currentUser.credits > 0;

  return {
    canGenerate,
    credits: currentUser.credits,
    plan: currentUser.plan,
    wasReset,
    user: currentUser, // Retorna o objeto de usuário (potencialmente atualizado)
  };
}


/**
 * Registra as gerações no banco de dados.
 * Esta função NÃO decrementa créditos. A dedução deve ser feita separadamente.
 * @param {string} userId - ID do usuário
 * @param {string} clerkId - Clerk ID do usuário
 * @param {Array} generations - Array de objetos com { theme, generatedImageUrl, originalImageUrl? }
 */
export async function recordImageGeneration(userId, clerkId, generations) {
  if (!generations || generations.length === 0) {
    return;
  }

  const supabase = getSupabase();

  const toInsert = generations.map(gen => ({
    user_id: userId,
    clerk_id: clerkId,
    theme: gen.theme,
    generated_image_url: gen.generatedImageUrl || '',
    original_image_url: gen.originalImageUrl || '',
  }));

  const { error } = await supabase
    .from('generations')
    .insert(toInsert);

  if (error) {
    logger.error('Erro ao inserir gerações:', error);
    throw error;
  }
}

/**
 * Obtém o histórico de gerações do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Número máximo de registros
 * @returns {Promise<Array>}
 */
export async function getGenerationHistory(userId, limit = 10) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('generations')
    .select('id, generated_image_url, original_image_url, theme, created_at')
    .eq('user_id', userId)
    .neq('generated_image_url', '') // Apenas gerações com resultado
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    logger.error(`Erro ao buscar histórico de gerações para user ${userId}:`, error);
    throw error;
  }
  
  return (data || []).map(item => ({
    id: item.id,
    generatedImageUrl: item.generated_image_url,
    originalImageUrl: item.original_image_url,
    theme: item.theme,
    createdAt: item.created_at,
  }));
}