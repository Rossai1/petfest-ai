// Configurações centralizadas da aplicação
// Variáveis de ambiente e constantes globais

// #region agent log
fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/config/config.js:1',message:'Config module loaded',data:{hasAdminEmail:!!process.env.ADMIN_EMAIL,NODE_ENV:process.env.NODE_ENV,NEXT_PHASE:process.env.NEXT_PHASE},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
// #endregion

/**
 * Email do administrador
 * Deve ser configurado via variável de ambiente ADMIN_EMAIL
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Validação em produção
if (!ADMIN_EMAIL && process.env.NODE_ENV === 'production') {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/config/config.js:18',message:'THROWING ERROR - ADMIN_EMAIL not configured',data:{NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
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
