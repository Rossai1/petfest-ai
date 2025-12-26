import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.warn('Supabase Storage não configurado. URLs temporárias serão usadas.');
}

// Cliente Supabase com service role key para uploads server-side
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

const BUCKET_NAME = 'generated-images';

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param {string} imageUrl - URL temporária da imagem (da OpenAI)
 * @param {string} userId - ID do usuário
 * @param {string} themeId - ID do tema
 * @returns {Promise<string>} URL pública permanente da imagem
 */
export async function uploadImageToStorage(imageUrl, userId, themeId) {
  // Se Supabase não estiver configurado, retorna a URL original
  if (!supabase) {
    logger.warn('Supabase Storage não configurado. Retornando URL temporária.');
    return imageUrl;
  }

  try {
    // Baixar a imagem da URL temporária
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Erro ao baixar imagem: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${themeId}/${timestamp}-${randomId}.png`;

    // Criar bucket se não existir (apenas na primeira vez)
    // Nota: Isso precisa ser feito manualmente no Supabase Dashboard primeiro
    // Storage > Create bucket > Name: generated-images > Public bucket

    // Fazer upload da imagem
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      // Se o bucket não existir, criar (pode falhar se não tiver permissões)
      if (error.message.includes('not found')) {
        logger.error('Bucket não encontrado. Crie o bucket "generated-images" no Supabase Dashboard.');
        return imageUrl; // Retorna URL temporária como fallback
      }
      throw error;
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    logger.error('Erro ao fazer upload da imagem:', error);
    // Em caso de erro, retorna a URL temporária como fallback
    return imageUrl;
  }
}

/**
 * Verifica se uma URL é temporária (da OpenAI) ou permanente (do Supabase)
 * @param {string} url - URL para verificar
 * @returns {boolean}
 */
export function isTemporaryUrl(url) {
  if (!url) return false;
  // URLs da OpenAI geralmente contêm 'oaidalleapiprodscus' ou são data URLs
  // URLs do Supabase contêm 'supabase.co/storage'
  return (url.includes('oaidalleapiprodscus') || url.startsWith('data:')) 
    && !url.includes('supabase.co/storage');
}

/**
 * Migra uma imagem de URL temporária para storage permanente
 * Útil para migrar imagens antigas que ainda estão com URLs temporárias
 * @param {string} temporaryUrl - URL temporária da imagem
 * @param {string} userId - ID do usuário
 * @param {string} themeId - ID do tema
 * @returns {Promise<string>} URL permanente da imagem
 */
export async function migrateImageToStorage(temporaryUrl, userId, themeId) {
  if (!isTemporaryUrl(temporaryUrl)) {
    // Já é uma URL permanente, retornar como está
    return temporaryUrl;
  }
  
  return await uploadImageToStorage(temporaryUrl, userId, themeId);
}

