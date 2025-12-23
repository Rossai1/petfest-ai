# Configuração do Stripe - Sprint 4

## 📋 Passo a Passo

### 1. Criar Products no Stripe Dashboard

Acesse: https://dashboard.stripe.com/products

#### Product 1: PetFest Essential Mensal
- **Nome**: PetFest Essential Mensal
- **Descrição**: 50 créditos para gerar imagens todo mês
- **Preço**: R$ 29,90
- **Tipo**: Recorrente (Mensal)
- **Moeda**: BRL

Após criar, copie o **Price ID** (começa com `price_...`)

#### Product 2: PetFest Pro Mensal
- **Nome**: PetFest Pro Mensal
- **Descrição**: 180 créditos para gerar imagens todo mês
- **Preço**: R$ 79,90
- **Tipo**: Recorrente (Mensal)
- **Moeda**: BRL

Após criar, copie o **Price ID** (começa com `price_...`)

---

### 2. Configurar Webhooks

Acesse: https://dashboard.stripe.com/webhooks

#### Criar Novo Endpoint

**URL do Webhook**:
- Produção: `https://app.rossai.com.br/petfest/api/webhooks/stripe`
- Local (teste): Use Stripe CLI `stripe listen --forward-to localhost:3000/petfest/api/webhooks/stripe`

**Eventos para ouvir**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Após criar, copie o **Webhook Secret** (começa com `whsec_...`)

---

### 3. Adicionar Variáveis de Ambiente

Adicione no arquivo `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ESSENTIAL_MONTHLY=price_... (do Essential)
STRIPE_PRICE_PRO_MONTHLY=price_... (do Pro)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... ou pk_live_...
```

**IMPORTANTE**: Para produção, adicione também no Vercel:
- Dashboard Vercel → Settings → Environment Variables
- Adicionar todas as variáveis acima

---

### 4. Testar Conexão (Opcional)

No terminal, execute:

```bash
node -e "console.log(require('stripe')(process.env.STRIPE_SECRET_KEY).products.list())"
```

Se retornar uma lista de produtos, a configuração está correta!

---

## ✅ Checklist

- [ ] Product "PetFest Essential Mensal" criado
- [ ] Product "PetFest Pro Mensal" criado  
- [ ] Price IDs copiados
- [ ] Webhook configurado
- [ ] Webhook Secret copiado
- [ ] Variáveis adicionadas no `.env.local`
- [ ] (Produção) Variáveis adicionadas no Vercel
- [ ] Teste de conexão realizado

---

## 🔄 Próximos Passos

Após completar este checklist:
1. Confirme que a Sprint 4 está completa
2. Avance para Sprint 5: Implementar Fluxo de Assinatura Stripe

