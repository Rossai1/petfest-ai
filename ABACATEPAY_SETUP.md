# Configuração AbacatePay

Este documento descreve como configurar a integração com AbacatePay.

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao arquivo `.env.local`:

```bash
# URLs do App
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção: NEXT_PUBLIC_APP_URL=https://app.rossai.com.br/petfest

# AbacatePay
ABACATEPAY_API_KEY=sua_chave_api_aqui
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

## Como Obter as Credenciais

1. Acesse o painel do AbacatePay: https://abacatepay.com
2. Vá em **Configurações** → **API**
3. Copie sua **API Key**
4. Gere um **Webhook Secret** (ou use o fornecido)

## Configuração do Webhook

### 1. No Painel do AbacatePay

Acesse **Configurações** → **Webhooks** e configure:

- **URL do Webhook:**
  - Desenvolvimento: `https://seu-dominio-ngrok.ngrok.io/api/abacate/webhook`
  - Produção: `https://app.rossai.com.br/petfest/api/abacate/webhook`

- **Eventos para receber:**
  - ✅ `BILLING_PAID` - Quando um pagamento PIX é confirmado
  - ✅ `SUBSCRIPTION_PAID` - Quando uma assinatura é paga
  - ✅ `SUBSCRIPTION_CANCELED` - Quando uma assinatura é cancelada

- **Secret:** Use o mesmo valor da variável `ABACATEPAY_WEBHOOK_SECRET`

### 2. Testando Localmente com ngrok

Para testar webhooks localmente:

```bash
# Instalar ngrok (se não tiver)
brew install ngrok  # macOS
# ou baixe em: https://ngrok.com/download

# Expor porta local
ngrok http 3000

# Copie a URL fornecida (ex: https://abc123.ngrok.io)
# Configure no painel AbacatePay: https://abc123.ngrok.io/api/abacate/webhook
```

## Estrutura de URLs dos Planos

### Links para o Framer (rossai.com.br)

Use estes links nos botões da landing page:

**Essential:**
- PIX: `https://app.rossai.com.br/petfest/checkout?plan=essential&type=pix`
- Mensal: `https://app.rossai.com.br/petfest/checkout?plan=essential&type=subscription`

**Pro:**
- PIX: `https://app.rossai.com.br/petfest/checkout?plan=pro&type=pix`
- Mensal: `https://app.rossai.com.br/petfest/checkout?plan=pro&type=subscription`

**Outros links:**
- Começar Grátis: `https://app.rossai.com.br/petfest/sign-up`
- Entrar no App: `https://app.rossai.com.br/petfest/app`

## Configuração de Domínio (Produção)

### 1. DNS (Registro.br ou outro provedor)

Adicione um registro CNAME:

```
Tipo: CNAME
Nome: app
Valor: cname.vercel-dns.com
```

### 2. Vercel

1. Acesse o projeto no Vercel
2. Vá em **Settings** → **Domains**
3. Adicione: `app.rossai.com.br`
4. Aguarde propagação do DNS (até 24h)

### 3. Variáveis de Ambiente na Vercel

Adicione todas as variáveis de ambiente no painel da Vercel:
- Settings → Environment Variables
- Adicione: `ABACATEPAY_API_KEY`, `ABACATEPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`

## Testando a Integração

1. **Modo Sandbox:**
   - Use credenciais de teste do AbacatePay
   - Faça um checkout de teste
   - Verifique se o webhook é recebido

2. **Verificar Logs:**
   ```bash
   # Ver logs da API
   vercel logs
   
   # Ou localmente
   npm run dev
   ```

3. **Testar Fluxo Completo:**
   - ✅ Criar cobrança PIX
   - ✅ Webhook receber confirmação
   - ✅ Créditos adicionados ao usuário
   - ✅ Redirecionamento após pagamento

## Troubleshooting

### Webhook não está sendo recebido

1. Verifique se a URL está correta no painel AbacatePay
2. Confirme que o secret está correto
3. Veja os logs de tentativas no painel AbacatePay
4. Teste localmente com ngrok

### Erro de autenticação

1. Verifique se `ABACATEPAY_API_KEY` está definida
2. Confirme que a chave é válida (não expirada)
3. Teste com `curl`:
   ```bash
   curl -H "Authorization: Bearer SUA_API_KEY" \
        https://api.abacatepay.com/v1/billing/list
   ```

### Créditos não são adicionados

1. Verifique logs do webhook
2. Confirme que a transação existe no banco
3. Veja se o evento correto está sendo enviado (`BILLING_PAID`)

## Suporte

- Documentação AbacatePay: https://docs.abacatepay.com
- Suporte: suporte@abacatepay.com

