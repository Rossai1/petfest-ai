// Configurações centralizadas da aplicação
// Variáveis de ambiente e constantes globais

/**
 * Email do administrador
 * Deve ser configurado via variável de ambiente ADMIN_EMAIL
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Validação em produção
if (!ADMIN_EMAIL && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_EMAIL must be configured in production environment');
}

/**
 * Configurações de créditos
 */
export const CREDITS = {
  ADMIN: 999999,
  FREE_USER: 3,
  ESSENTIAL_PLAN: 500,
  PRO_PLAN: 2000,
};

/**
 * Planos de assinatura
 */
export const PLANS = {
  FREE: 'free',
  ESSENTIAL: 'essential',
  PRO: 'pro',
};
