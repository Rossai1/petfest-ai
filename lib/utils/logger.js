/**
 * Logger utility for development/production environment
 * Wraps console methods to only log in development
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Development-only logger
 * Logs are suppressed in production
 */
export const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => isDev && console.error(...args),
  warn: (...args) => isDev && console.warn(...args),
  info: (...args) => isDev && console.info(...args),
  debug: (...args) => isDev && console.debug(...args),
};

/**
 * Production error logger
 * Use this for critical errors that should be logged even in production
 * In the future, this can be extended to send errors to a monitoring service
 */
export const logProductionError = (error, context = {}) => {
  // Always log critical errors
  console.error('[Production Error]', {
    message: error?.message || error,
    stack: error?.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
