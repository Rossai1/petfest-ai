/**
 * Cliente AbacatePay para integração com API
 * Documentação: https://docs.abacatepay.com
 */

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

export class AbacatePayClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    
    if (!this.apiKey) {
      throw new Error('ABACATEPAY_API_KEY não está configurada');
    }
  }

  /**
   * Criar cobrança PIX (pagamento único)
   * @param {Object} data - Dados da cobrança
   * @returns {Promise<Object>} Resposta com QR Code e dados da cobrança
   */
  async createBilling(data) {
    try {
      const response = await fetch(`${ABACATEPAY_API_URL}/billing/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao criar cobrança');
      }

      return result.data;
    } catch (error) {
      console.error('[AbacatePay] Erro ao criar cobrança:', error);
      throw error;
    }
  }

  /**
   * Criar assinatura (cartão recorrente)
   * @param {Object} data - Dados da assinatura
   * @returns {Promise<Object>} Resposta com dados da assinatura
   */
  async createSubscription(data) {
    try {
      const response = await fetch(`${ABACATEPAY_API_URL}/subscription/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao criar assinatura');
      }

      return result.data;
    } catch (error) {
      console.error('[AbacatePay] Erro ao criar assinatura:', error);
      throw error;
    }
  }

  /**
   * Verificar status de cobrança
   * @param {string} billingId - ID da cobrança
   * @returns {Promise<Object>} Status da cobrança
   */
  async getBillingStatus(billingId) {
    try {
      const response = await fetch(`${ABACATEPAY_API_URL}/billing/get?id=${billingId}`, {
        headers: { 
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao buscar status');
      }

      return result.data;
    } catch (error) {
      console.error('[AbacatePay] Erro ao buscar status:', error);
      throw error;
    }
  }

  /**
   * Criar ou obter cliente
   * @param {Object} customerData - Dados do cliente
   * @returns {Promise<Object>} Cliente criado/encontrado
   */
  async createCustomer(customerData) {
    try {
      const response = await fetch(`${ABACATEPAY_API_URL}/customer/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao criar cliente');
      }

      return result.data;
    } catch (error) {
      console.error('[AbacatePay] Erro ao criar cliente:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const abacatePay = new AbacatePayClient(process.env.ABACATEPAY_API_KEY);

