/**
 * Configuração de Pacotes de Créditos e Assinaturas
 * Nota: Créditos = quantidade de imagens geradas (1 crédito = 1 imagem)
 */

// Pacotes de créditos - pagamento único via PIX
export const CREDIT_PACKAGES = {
  essential: {
    id: 'essential',
    name: 'Essential',
    credits: 50,
    price: 34.90,
    priceInCents: 3490,
    description: '50 imagens geradas',
    features: [
      '50 imagens',
      'Alta Definição (HD)',
      'Gerador de Stickers',
      'Acesso a todos os temas',
      'Pagamento único via PIX'
    ],
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    credits: 180,
    price: 84.90,
    priceInCents: 8490,
    description: '180 imagens geradas',
    features: [
      '180 imagens',
      'Prioridade no processamento',
      'Upscaling 4K',
      'Licença Comercial',
      'Pagamento único via PIX'
    ],
    popular: false,
  },
};

// Assinaturas mensais - pagamento recorrente via cartão de crédito
export const SUBSCRIPTION_PLANS = {
  essential: {
    id: 'essential',
    name: 'Essential Mensal',
    creditsPerMonth: 50,
    price: 29.90,
    priceInCents: 2990,
    description: '50 imagens todo mês',
    features: [
      '50 imagens/mês',
      'Renovação automática',
      'Cancele quando quiser',
      'Alta Definição (HD)',
      'Cartão de crédito'
    ],
    frequency: 'MONTHLY',
  },
  pro: {
    id: 'pro',
    name: 'Pro Mensal',
    creditsPerMonth: 180,
    price: 79.90,
    priceInCents: 7990,
    description: '180 imagens todo mês',
    features: [
      '180 imagens/mês',
      'Prioridade no processamento',
      'Suporte prioritário',
      'Licença Comercial',
      'Cartão de crédito'
    ],
    frequency: 'MONTHLY',
  },
};

/**
 * Função auxiliar para obter pacote
 * @param {string} plan - Nome do plano ('essential' ou 'pro')
 * @param {string} type - Tipo: 'pix' ou 'subscription'
 * @returns {Object|null} Dados do pacote
 */
export function getPackageData(plan, type) {
  if (type === 'subscription') {
    return SUBSCRIPTION_PLANS[plan] || null;
  }
  return CREDIT_PACKAGES[plan] || null;
}

/**
 * Obter todos os pacotes de créditos
 * @returns {Array} Array de pacotes
 */
export function getAllCreditPackages() {
  return Object.values(CREDIT_PACKAGES);
}

/**
 * Obter todos os planos de assinatura
 * @returns {Array} Array de planos
 */
export function getAllSubscriptionPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Validar se um plano existe
 * @param {string} plan - Nome do plano
 * @param {string} type - Tipo: 'pix' ou 'subscription'
 * @returns {boolean} True se existe
 */
export function isValidPackage(plan, type) {
  return getPackageData(plan, type) !== null;
}
