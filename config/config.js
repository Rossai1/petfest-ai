// Configurações centralizadas da aplicação
// Variáveis de ambiente e constantes globais

/**
 * Email do administrador
 * Deve ser configurado via variável de ambiente ADMIN_EMAIL
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Validação em produção (skip durante build)
if (!ADMIN_EMAIL && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error('ADMIN_EMAIL must be configured in production environment');
}

/**
 * Configurações de créditos
 */
export const PLAN_CREDITS = {
  FREE: 3,
  ESSENTIAL: 50,
  PRO: 180,
};

export const FREE_RESET_DAYS = 30;

/**
 * Planos de assinatura
 */
export const PLANS = {
  FREE: 'free',
  ESSENTIAL: 'essential',
  PRO: 'pro',
};
