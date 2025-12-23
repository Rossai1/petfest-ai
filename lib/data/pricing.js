/**
 * Calcula o custo de geração de uma imagem baseado nos parâmetros
 * Valores reais baseados no pricing oficial da OpenAI GPT-Image-1.5
 * Cotação: R$ 5.00 = $1.00
 */

// Custos reais por qualidade e tamanho (em R$)
const COSTS = {
  low: {
    '1024x1024': 0.045,    // $0.009
    '1024x1536': 0.065,    // $0.013
    '1536x1024': 0.065,    // $0.013
  },
  medium: {
    '1024x1024': 0.17,     // $0.034
    '1024x1536': 0.25,     // $0.05
    '1536x1024': 0.25,     // $0.05
  },
  high: {
    '1024x1024': 0.665,    // $0.133
    '1024x1536': 1.00,     // $0.20
    '1536x1024': 1.00,     // $0.20
  },
};

/**
 * Calcula o custo de geração de uma imagem
 * Todas as imagens usam 1024x1536 (formato vertical premium)
 * @param {string} quality - Qualidade: 'low', 'medium', 'high'
 * @returns {number} Custo em R$
 */
export function calculateImageCost(quality = 'medium') {
  // Tamanho padrão: 1024x1536 (vertical premium)
  const size = '1024x1536';
  
  // Obter custo baseado em qualidade
  const qualityCosts = COSTS[quality] || COSTS.medium;
  const cost = qualityCosts[size];
  
  return cost;
}

/**
 * Obtém os limites de imagens por plano
 * @param {string} planType - Tipo do plano (free, essential, pro)
 */
export function getPlanLimits(planType) {
  const limits = {
    free: 3,
    essential: 50,
    pro: 180, // Ajustado para manter margem de lucro segura
  };

  return limits[planType?.toLowerCase()] || limits.free;
}

/**
 * Obtém a qualidade do plano (para exibição no frontend)
 * @param {string} planType - Tipo do plano
 * @returns {string} 'low', 'medium', ou 'high'
 */
export function getPlanQuality(planType) {
  const qualities = {
    free: 'low',
    essential: 'medium',
    pro: 'high',
  };

  return qualities[planType?.toLowerCase()] || 'low';
}

/**
 * Obtém a qualidade real usada no backend
 * Nota: Pro mostra "high" mas usa "medium" no backend
 * @param {string} planType - Tipo do plano
 * @returns {string} 'low', 'medium', ou 'high'
 */
export function getPlanQualityBackend(planType) {
  const qualities = {
    free: 'low',
    essential: 'medium',
    pro: 'medium', // Backend sempre usa medium, mesmo para Pro
  };

  return qualities[planType?.toLowerCase()] || 'low';
}

/**
 * Obtém o preço mensal do plano em R$
 */
export function getPlanPrice(planType) {
  const prices = {
    free: 0,
    essential: 29.90,
    pro: 79.90,
  };

  return prices[planType?.toLowerCase()] || 0;
}

/**
 * Obtém informações completas de um plano
 * @param {string} planType - Tipo do plano
 */
export function getPlanInfo(planType) {
  const quality = getPlanQuality(planType);
  const qualityBackend = getPlanQualityBackend(planType);
  
  return {
    name: planType,
    limit: getPlanLimits(planType),
    price: getPlanPrice(planType),
    quality: quality, // Para exibição no frontend
    qualityBackend: qualityBackend, // Para uso no backend
    costPerImage: calculateImageCost(qualityBackend), // Custo por imagem (1024x1536)
  };
}

/**
 * Calcula a margem de lucro estimada para um plano
 * Todas as imagens usam 1024x1536 (formato vertical premium)
 * @param {string} planType - Tipo do plano
 */
export function calculateProfitMargin(planType) {
  const price = getPlanPrice(planType);
  const limit = getPlanLimits(planType);
  const quality = getPlanQualityBackend(planType);
  
  // Custo fixo para 1024x1536
  const costPerImage = calculateImageCost(quality);
  
  const totalCost = limit * costPerImage;
  const profit = price - totalCost;
  const margin = price > 0 ? (profit / price) * 100 : 0;

  return {
    price,
    limit,
    costPerImage,
    totalCost,
    profit,
    margin: Math.round(margin * 10) / 10,
  };
}

