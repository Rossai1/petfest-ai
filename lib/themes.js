// Este arquivo é para uso no SERVER-SIDE apenas
// Para client-side, use lib/themes-data.js

import { prisma } from './db';
import { themes as defaultThemes } from './themes-data';

// Re-exportar themes para compatibilidade
export { themes } from './themes-data';

// Cache para evitar múltiplas consultas ao banco
let themesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Busca temas do banco de dados com fallback para padrões
 * APENAS para uso no server-side
 */
async function loadThemesFromDb() {
  try {
    const themesFromDb = await prisma.theme.findMany();
    
    // Criar objeto mesclando banco com padrões
    const mergedThemes = { ...defaultThemes };
    
    themesFromDb.forEach((theme) => {
      if (mergedThemes[theme.slug]) {
        // Atualizar prompt se existir no banco
        mergedThemes[theme.slug].prompt = theme.prompt;
      }
    });
    
    return mergedThemes;
  } catch (error) {
    console.error('Erro ao carregar temas do banco:', error);
    // Retornar temas padrão em caso de erro
    return defaultThemes;
  }
}

/**
 * Obtém os temas (com cache) - SERVER-SIDE ONLY
 */
export async function getThemes() {
  const now = Date.now();
  
  // Verificar cache
  if (themesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return themesCache;
  }
  
  // Carregar do banco
  themesCache = await loadThemesFromDb();
  cacheTimestamp = now;
  
  return themesCache;
}

/**
 * Obtém um tema por ID (busca do banco se disponível) - SERVER-SIDE ONLY
 */
export async function getThemeById(id) {
  try {
    const themes = await getThemes();
    return themes[id] || themes.natal;
  } catch (error) {
    console.error('Erro ao obter tema:', error);
    return defaultThemes[id] || defaultThemes.natal;
  }
}

/**
 * Obtém o prompt de um tema (busca do banco se disponível) - SERVER-SIDE ONLY
 */
export async function getThemePrompt(id) {
  try {
    const theme = await getThemeById(id);
    return theme.prompt;
  } catch (error) {
    console.error('Erro ao obter prompt:', error);
    return defaultThemes[id]?.prompt || defaultThemes.natal.prompt;
  }
}

