import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '../config/config';

// Cliente Supabase singleton para queries diretas
// Muito mais rápido que Prisma com adapter
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
    .select('id, clerk_id, email')
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
  };
}

/**
 * Cria usuário
 */
export async function createUser(clerkId, email, isAdmin = false) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email: email,
    })
    .select('id, clerk_id, email')
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clerkId: data.clerk_id,
    email: data.email,
  };
}

// ============================================
// QUERIES OTIMIZADAS - GERAÇÕES
// ============================================

/**
 * Busca gerações recentes do usuário
 * Query direta, ~50ms vs 4-5s do Prisma
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
  
  if (insertError) throw insertError;
}

// ============================================
// HELPER: GET OR CREATE USER
// ============================================

/**
 * Obtém ou cria usuário - versão otimizada
 */
export async function getOrCreateUserFast(clerkId, email) {
  let user = await getUserByClerkId(clerkId);
  
  if (!user && email) {
    const isAdmin = email === ADMIN_EMAIL;
    user = await createUser(clerkId, email, isAdmin);
  }
  
  return user;
}

