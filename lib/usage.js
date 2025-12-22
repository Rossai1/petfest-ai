import { getSupabase, getUserByClerkId, recordGenerations } from './supabase-db';
import { getPlanLimits } from './pricing';
import { get, set, invalidate, CACHE_KEYS, CACHE_TTL } from './cache';

/**
 * Verifica se o usuário pode gerar mais imagens
 * Usa Supabase direto para performance
 * @param {string} userId - ID do usuário
 * @returns {Promise<{canGenerate: boolean, creditsRemaining: number, imagesLimit: number, plan: string}>}
 */
export async function checkUsageLimit(userId) {
  // Verificar cache primeiro
  const cacheKey = CACHE_KEYS.USAGE(userId);
  const cachedUsage = get(cacheKey);
  if (cachedUsage) {
    return cachedUsage;
  }

  const supabase = getSupabase();
  
  // Query direta ao Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('credits_remaining, plan_type')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('Usuário não encontrado');
  }

  // Obter limite do plano (baseado no planType)
  const imagesLimit = getPlanLimits(user.plan_type);
  
  // Calcular imagens usadas baseado em creditsRemaining
  const imagesUsed = imagesLimit - user.credits_remaining;

  const usage = {
    canGenerate: user.credits_remaining > 0,
    imagesUsed: Math.max(0, imagesUsed),
    imagesLimit: imagesLimit,
    creditsRemaining: user.credits_remaining,
    plan: user.plan_type,
  };

  // Armazenar em cache (curta duração)
  set(cacheKey, usage, CACHE_TTL.USAGE);

  return usage;
}

/**
 * Decrementa os créditos do usuário e registra as gerações
 * Usa Supabase direto para performance
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
    console.error('Erro ao inserir gerações:', insertError);
    throw insertError;
  }

  // Buscar créditos atuais e decrementar
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (!fetchError && userData) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits_remaining: Math.max(0, userData.credits_remaining - generations.length) })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Erro ao atualizar créditos:', updateError);
    }
  }

  // Invalidar caches relacionados
  invalidate(CACHE_KEYS.USAGE(userId));
  invalidate(CACHE_KEYS.USER(clerkId));
}

/**
 * Obtém o uso atual do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<{imagesUsed: number, imagesLimit: number, resetDate: Date, plan: string}>}
 */
export async function getUserUsage(userId) {
  const usage = await checkUsageLimit(userId);
  return usage;
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
