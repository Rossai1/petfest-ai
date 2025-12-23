import { createClient } from '@supabase/supabase-js';
import { PLAN_CREDITS } from '../../config/config';

// Cliente Supabase singleton para queries diretas
let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return supabaseClient;
}

// ============================================
// QUERIES OTIMIZADAS - USUÁRIOS
// ============================================

/**
 * Busca usuário por clerkId
 */
export async function getUserByClerkId(clerkId) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('id, clerk_id, email, credits, plan, last_reset_at')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    clerkId: data.clerk_id,
    email: data.email,
    credits: data.credits,
    plan: data.plan,
    lastResetAt: data.last_reset_at,
  };
}

/**
 * Busca usuário por email (case-insensitive)
 * Normaliza o email para lowercase antes da busca para evitar problemas de case sensitivity
 */
export async function getUserByEmail(email) {
  const supabase = getSupabase();
  
  // Normalizar email para lowercase e trim para evitar problemas de case sensitivity
  const normalizedEmail = email?.toLowerCase().trim();
  
  // Usa ilike para busca case-insensitive (importante porque emails podem estar em diferentes cases no banco)
  const { data, error } = await supabase
    .from('users')
    .select('id, clerk_id, email, credits, plan, last_reset_at')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    clerkId: data.clerk_id,
    email: data.email,
    credits: data.credits,
    plan: data.plan,
    lastResetAt: data.last_reset_at,
  };
}

/**
 * Cria usuário
 * Normaliza o email para lowercase e trim antes de inserir
 */
export async function createUser(clerkId, email) {
  const supabase = getSupabase();
  
  // Normalizar email para garantir consistência
  const normalizedEmail = email?.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email: normalizedEmail,
    })
    .select('id, clerk_id, email, credits, plan, last_reset_at')
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clerkId: data.clerk_id,
    email: data.email,
    credits: data.credits,
    plan: data.plan,
    lastResetAt: data.last_reset_at,
  };
}

/**
 * Vincula um clerkId a um usuário existente via email
 * 
 * IMPORTANTE: Esta função apenas atualiza o clerk_id, preservando automaticamente
 * todos os outros campos (credits, plan, last_reset_at, etc.) que foram
 * previamente configurados pelo n8n quando processou os webhooks da Kiwify.
 * 
 * O email é normalizado para lowercase e trim antes da busca/atualização.
 */
export async function linkClerkIdToUser(email, clerkId) {
  const supabase = getSupabase();
  
  // Normalizar email para garantir consistência
  const normalizedEmail = email?.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from('users')
    .update({ clerk_id: clerkId })
    .eq('email', normalizedEmail)
    .select('id, clerk_id, email, credits, plan, last_reset_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    clerkId: data.clerk_id,
    email: data.email,
    credits: data.credits,
    plan: data.plan,
    lastResetAt: data.last_reset_at,
  };
}

/**
 * Deduz atomicamente uma quantidade de créditos do usuário.
 * Requer uma função RPC `deduct_credits` no Supabase.
 */
export async function deductCredits(userId, amount) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    console.error('Error deducting credits:', error);
    throw new Error('Failed to deduct credits.');
  }
  
  // A função RPC retorna null se os créditos forem insuficientes
  if (data === null) {
    return null; // Falha na dedução
  }
  
  // Sucesso, retorna o novo saldo
  return { new_credits: data };
}


/**
 * Reseta os créditos de um usuário do plano free
 */
export async function resetFreeCredits(userId) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .update({
      credits: PLAN_CREDITS.FREE,
      last_reset_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, credits, plan, last_reset_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    credits: data.credits,
    plan: data.plan,
    lastResetAt: data.last_reset_at,
  };
}

/**
 * Busca webhooks de um usuário por email
 * Útil para auditoria e verificação de compras vinculadas
 * 
 * Estrutura da tabela kiwify_webhooks:
 * - id (uuid)
 * - email (text, NOT NULL)
 * - plan (text, nullable)
 * - credits (integer, nullable)
 * - event_type (text, nullable) - ex: "order_approved"
 * - order_id (text, nullable)
 * - raw_data (jsonb, nullable)
 * - created_at (timestamptz)
 */
export async function getWebhooksByEmail(email) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('kiwify_webhooks')
    .select('id, order_id, plan, credits, event_type, created_at')
    .eq('email', email)
    .eq('event_type', 'order_approved')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data || [];
}


// ============================================
// QUERIES OTIMIZADAS - GERAÇÕES
// ============================================

/**
 * Busca gerações recentes do usuário
 */
export async function getRecentGenerations(userId, limit = 10) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('generations')
    .select('id, generated_image_url, theme, created_at')
    .eq('user_id', userId)
    .neq('generated_image_url', '')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    generatedImageUrl: item.generated_image_url,
    theme: item.theme,
    createdAt: item.created_at,
  }));
}

/**
 * Registra nova geração
 */
export async function createGeneration(userId, clerkId, theme, generatedImageUrl, originalImageUrl = '') {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('generations')
    .insert({
      user_id: userId,
      clerk_id: clerkId,
      theme,
      generated_image_url: generatedImageUrl,
      original_image_url: originalImageUrl,
    });
  
  if (error) throw error;
}

/**
 * Registra múltiplas gerações (uso ilimitado - sem decrementar créditos)
 */
export async function recordGenerations(userId, clerkId, generations) {
  const supabase = getSupabase();
  
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const { error: insertError } = await supabase
    .from('generations')
    .insert(generations.map(gen => ({
      id: generateUUID(),
      user_id: userId,
      clerk_id: clerkId,
      theme: gen.theme,
      generated_image_url: gen.generatedImageUrl || '',
      original_image_url: gen.originalImageUrl || '',
    })));
  
  if (insertError) throw insertError;
}
