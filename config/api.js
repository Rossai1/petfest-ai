/**
 * API Configuration
 * Handles basePath for API routes
 */

// Get the base path from environment or default to /petfest
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/petfest';

/**
 * Get full API URL with basePath
 * @param {string} path - API path (e.g., '/api/abacate/create-billing')
 * @returns {string} Full path with basePath
 */
export function getApiUrl(path) {
  // In browser, use BASE_PATH
  if (typeof window !== 'undefined') {
    return `${BASE_PATH}${path}`;
  }
  // On server, just return the path
  return path;
}


