/**
 * Cache em memória simples com TTL
 * Usado para reduzir chamadas desnecessárias ao banco
 */

const cache = new Map();

/**
 * Obtém um valor do cache
 * @param {string} key - Chave do cache
 * @returns {any|null} - Valor ou null se expirado/não existe
 */
export function get(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

/**
 * Define um valor no cache com TTL
 * @param {string} key - Chave do cache
 * @param {any} value - Valor a armazenar
 * @param {number} ttlMs - Tempo de vida em milissegundos (padrão: 30s)
 */
export function set(key, value, ttlMs = 30000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Remove um valor do cache
 * @param {string} key - Chave do cache
 */
export function invalidate(key) {
  cache.delete(key);
}

/**
 * Remove todos os valores que começam com um prefixo
 * @param {string} prefix - Prefixo das chaves a remover
 */
export function invalidatePrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Limpa todo o cache
 */
export function clear() {
  cache.clear();
}

/**
 * Obtém ou define um valor no cache
 * @param {string} key - Chave do cache
 * @param {Function} fetchFn - Função para buscar o valor se não estiver em cache
 * @param {number} ttlMs - Tempo de vida em milissegundos
 * @returns {Promise<any>} - Valor do cache ou resultado da função
 */
export async function getOrSet(key, fetchFn, ttlMs = 30000) {
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = await fetchFn();
  set(key, value, ttlMs);
  return value;
}

// Cache keys constants
export const CACHE_KEYS = {
  USER: (clerkId) => `user:${clerkId}`,
  CREDITS: (userId) => `credits:${userId}`,
  USAGE: (userId) => `usage:${userId}`,
};

// Cache TTLs constants (em milissegundos)
export const CACHE_TTL = {
  USER: 60000,      // 1 minuto
  CREDITS: 30000,   // 30 segundos
  USAGE: 30000,     // 30 segundos
  HISTORY: 60000,   // 1 minuto
};

