import { getSupabase } from '../database/supabase-db';
import { get, set, invalidate, CACHE_KEYS, CACHE_TTL } from '../database/cache';
import { logger } from './logger';

/**
 * Verifica se o usuário pode gerar mais imagens
 * Uso ilimitado - sempre permite
 * @param {string} userId - ID do usuário
 * @returns {Promise<{canGenerate: boolean}>}
 */
export async function checkUsageLimit(userId) {
  // Uso ilimitado - sempre permite
  return {
    canGenerate: true,
  };
}

/**
 * Registra as gerações (sem decrementar créditos - uso ilimitado)
 * @param {string} userId - ID do usuário
 * @param {string} clerkId - Clerk ID do usuário
 * @param {Array} generations - Array de objetos com { theme, generatedImageUrl, originalImageUrl? }
 */
export async function recordImageGeneration(userId, clerkId, generations) {
  if (!generations || generations.length === 0) {
    return;
  }

  const supabase = getSupabase();

  // Inserir gerações
  const { error: insertError } = await supabase
    .from('generations')
    .insert(generations.map(gen => ({
      user_id: userId,
      clerk_id: clerkId,
      theme: gen.theme,
      generated_image_url: gen.generatedImageUrl || '',
      original_image_url: gen.originalImageUrl || '',
    })));

  if (insertError) {
    logger.error('Erro ao inserir gerações:', insertError);
    throw insertError;
  }

  // Invalidar caches relacionados
  invalidate(CACHE_KEYS.USAGE(userId));
  invalidate(CACHE_KEYS.USER(clerkId));
}

/**
 * Obtém o uso atual do usuário (uso ilimitado)
 * @param {string} userId - ID do usuário
 * @returns {Promise<{canGenerate: boolean}>}
 */
export async function getUserUsage(userId) {
  return { canGenerate: true };
}

/**
 * Obtém o histórico de gerações do usuário
 * Usa Supabase direto para performance
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
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    generatedImageUrl: item.generated_image_url,
    originalImageUrl: item.original_image_url,
    theme: item.theme,
    createdAt: item.created_at,
  }));
}
