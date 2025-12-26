# Plano de Integração - Abacate Pay

## Status: 📋 FUTURO (Após deploy na Vercel)

---

## 📋 O que precisa fornecer ao Abacate Pay

### Variáveis de ambiente

```bash
ABACATEPAY_API_KEY=sua_chave_api_aqui
ABACATEPAY_WEBHOOK_SECRET=seu_secret_do_webhook
```

---

## 🏗️ Arquitetura da Integração

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Cliente    │────▶│   PetFest    │────▶│ Abacate Pay  │
│  (Frontend)  │     │   (Next.js)  │     │    (API)     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │◀───────────────────│
       │                    │   Webhook (PIX OK) │
       │◀───────────────────│                    │
       │   Créditos +50     │                    │
```

---

## 🔧 Endpoints a criar

| Rota | Função |
|------|--------|
| `POST /api/abacate/create-billing` | Criar cobrança PIX |
| `POST /api/abacate/create-subscription` | Criar assinatura (cartão) |
| `POST /api/abacate/webhook` | Receber notificações de pagamento |
| `GET /api/abacate/billing-status` | Verificar status de cobrança |

---

## 📦 Dados para PIX (pagamento único)

```javascript
{
  customer: {
    name: "Nome do Cliente",
    email: "cliente@email.com",
    cellphone: "11999999999",
    taxId: "12345678900" // CPF
  },
  
  products: [
    {
      name: "Plano Essential - 50 créditos",
      description: "50 imagens geradas com IA",
      quantity: 1,
      price: 2990 // centavos (R$ 29,90)
    }
  ],
  
  metadata: {
    userId: "user_clerk_id",
    planType: "essential",
    credits: 50
  },
  
  returnUrl: "https://petfest.com/payment-success",
  completionUrl: "https://petfest.com/payment-complete"
}
```

---

## 📦 Dados para Assinatura (cartão recorrente)

```javascript
{
  customer: {
    name: "Nome do Cliente",
    email: "cliente@email.com"
  },
  
  subscription: {
    frequency: "MONTHLY",
    products: [
      {
        name: "Plano Pro - 180 créditos/mês",
        price: 7990 // R$ 79,90
      }
    ]
  },
  
  metadata: {
    userId: "user_clerk_id",
    planType: "pro",
    creditsPerMonth: 180
  }
}
```

---

## 📥 Webhook - Dados recebidos

```javascript
{
  event: "BILLING_PAID", // ou SUBSCRIPTION_PAID
  data: {
    id: "billing_123abc",
    status: "PAID",
    value: 2990,
    paidAt: "2025-12-22T15:00:00Z",
    customer: {
      email: "cliente@email.com"
    },
    metadata: {
      userId: "user_clerk_id",
      planType: "essential",
      credits: 50
    }
  }
}
```

---

## 🎨 Fluxo de UX

```
PÁGINA DE PLANOS
├── Gratuito (R$ 0) - 3 imagens - [Atual]
├── Essential (R$ 29,90) - 50 imagens - [PIX] [Assinar]
└── Pro (R$ 79,90) - 180 imagens - [PIX] [Assinar]

    ↓ (clicou em PIX)

POP-UP ABACATE PAY
├── QR Code PIX
├── Valor: R$ 29,90
├── [Copiar código PIX]
└── Aguardando pagamento...

    ↓ (pagamento confirmado)

✅ PAGAMENTO CONFIRMADO!
├── 50 créditos adicionados
└── [Começar a usar]
```

---

## 📝 Arquivos a criar

1. `lib/abacate.js` - Cliente HTTP para API
2. `app/api/abacate/create-billing/route.js` - PIX
3. `app/api/abacate/create-subscription/route.js` - Cartão
4. `app/api/abacate/webhook/route.js` - Receber pagamentos
5. `components/AbacateCheckout.js` - Modal de checkout

---

## ✅ Lógica de Créditos

- **PIX pago** → Adiciona créditos imediatamente
- **Assinatura criada** → Adiciona créditos do plano
- **Renovação mensal** → Reseta créditos para limite do plano
- **Cancelamento** → Rebaixa para plano free (3 créditos)

---

## 📅 Quando implementar

1. ✅ Deploy na Vercel funcionando
2. ✅ App estável em produção
3. 🔜 Criar conta no Abacate Pay
4. 🔜 Obter API Key e configurar webhook
5. 🔜 Implementar integração
6. 🔜 Testar em ambiente de desenvolvimento
7. 🔜 Migrar para produção



