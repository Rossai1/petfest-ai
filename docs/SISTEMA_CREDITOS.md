# Plano de Implementação: Sistema de Créditos e Planos - PetFest AI

## 1. Resumo da Arquitetura

- **Pagamento**: Kiwify (Checkout externo)
- **Integração**: n8n recebe Webhook da Kiwify e atualiza o Supabase via e-mail
- **Autenticação**: Clerk (Vincula o `clerk_id` ao registro de e-mail existente no primeiro login)
- **Banco de Dados**: Supabase (Tabela `users` centralizada)

---

## Decisões do Usuário

- **Tabela**: Adicionar campos na tabela `users` existente (não criar `profiles`)
- **Créditos**: SOMAR ao saldo atual quando comprar
- **Toast**: Exibir ao vincular conta com créditos pré-existentes
- **Reset Free**: Automático no app (verificar `last_reset_at`)

---

## Fase 1: Ajustes no Banco de Dados (SQL)

Execute este script no SQL Editor do Supabase para preparar a tabela `users`:

```sql
-- 1. Adicionar campos de controle
ALTER TABLE users
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Garantir que o email seja único para evitar duplicatas no n8n
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- 3. Índice para performance de busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 4. Atualizar registros existentes para o padrão inicial
UPDATE users SET
    credits = COALESCE(credits, 3),
    plan = COALESCE(plan, 'free'),
    last_reset_at = COALESCE(last_reset_at, NOW())
WHERE credits IS NULL;
```

---

## Fase 2: Lógica de Backend e API

### 1. `lib/database/supabase-db.js`

Implementar as seguintes funções de manipulação:

**Modificar funções existentes:**
- `getUserByClerkId()` - Incluir campos `credits`, `plan`, `last_reset_at`
- `createUser()` - Incluir campos `credits`, `plan` com defaults

**Adicionar novas funções:**

- `getUserByEmail(email)` - Busca usuário para o fluxo de vinculação
- `linkClerkIdToUser(email, clerkId)` - Faz o UPDATE inserindo o `clerk_id` onde o e-mail coincide
- `atomicDeductCredit(userId)` - Executa a subtração garantindo que o saldo não fique negativo:

```javascript
// Lógica de proteção atômica
const { data, error } = await supabase
  .from('users')
  .update({ credits: credits - 1 })
  .eq('id', userId)
  .gt('credits', 0); // Só executa se credits > 0
```

- `resetFreeCredits(userId)` - Reseta para 3 créditos e atualiza `last_reset_at`

---

### 2. `lib/services/clerk.js` (Refatorar getOrCreateUser)

Modificar o fluxo de login:

1. Tentar buscar por `clerk_id`
2. Se não encontrar, buscar por `email`
3. Se encontrar registro por e-mail **SEM** `clerk_id`:
   - Chamar `linkClerkIdToUser`
   - Retornar flag `linkedCredits: true`
4. Se não encontrar nada, criar novo usuário com 3 créditos

---

### 3. `lib/utils/usage.js` (Lógica de Reset Mensal)

Criar função para verificar o ciclo de 30 dias:

- Se `plan === 'free'` **E** `agora - last_reset_at > 30 dias`:
  - Executar `resetFreeCredits`
  - Retornar flag `wasReset: true`

---

### 4. `app/api/edit/route.js` (Credit Guard)

Adicionar verificação **ANTES** da chamada à OpenAI:

```javascript
// Verificar créditos ANTES de processar
const usageCheck = await checkUsageLimit(user.id);

if (!usageCheck.canGenerate) {
  return NextResponse.json(
    { error: 'Créditos insuficientes', code: 'NO_CREDITS', credits: 0 },
    { status: 403 }
  );
}

if (usageCheck.credits < files.length) {
  return NextResponse.json(
    {
      error: `Você tem ${usageCheck.credits} crédito(s) mas está tentando gerar ${files.length} imagem(ns).`,
      code: 'INSUFFICIENT_CREDITS'
    },
    { status: 403 }
  );
}
```

**Importante**: Só subtrair o crédito **APÓS** a confirmação de sucesso da API de imagem.

---

### 5. `app/api/user-data/route.js`

Adicionar ao retorno:

```javascript
return NextResponse.json({
  results,
  credits: user.credits,
  plan: user.plan,
  linkedCredits: linkedCredits || false,  // Flag para toast
  wasReset: wasReset || false,             // Flag para toast de reset
});
```

---

## Fase 3: Interface e Experiência do Usuário (UX)

### 1. `contexts/UserDataContext.js`

**Adicionar estados:**
- `credits` (number)
- `plan` (string)
- `updateCreditsLocally(newCredits)` - Update otimista

**Ao carregar os dados do usuário:**

```javascript
if (data.linkedCredits) {
  toast.success('Assinatura vinculada com sucesso!');
}
if (data.wasReset) {
  toast.info('Seus créditos mensais foram renovados!');
}
```

---

### 2. Componentes Visuais

**Header** (`app/app/page.js`):

Exibir contador de créditos dinâmico com ícone:

```jsx
<div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
  <Sparkles className="h-4 w-4" />
  <span className="font-medium text-sm">Créditos: {credits}</span>
</div>
```

**Handler de Erro**:

Capturar o erro 403 e exibir toast instrutivo:

```javascript
if (data.code === 'NO_CREDITS' || data.code === 'INSUFFICIENT_CREDITS') {
  toast.error(data.error);
  return;
}
```

---

### 3. `config/config.js`

Adicionar constantes:

```javascript
export const PLAN_CREDITS = {
  FREE: 3,
  ESSENTIAL: 50,
  PRO: 180,
};

export const FREE_RESET_DAYS = 30;
```

---

## Fase 4: Configuração da Automação (n8n)

O Workflow no n8n deve seguir este fluxo:

1. **Webhook Trigger**: URL configurada na Kiwify (Evento: Ordem Aprovada)

2. **Filtro de Segurança**: Validar o token de assinatura da Kiwify

3. **Identificador de Plano**:
   - Produto X → `credits_to_add = 50`, `plan_name = 'essential'`
   - Produto Y → `credits_to_add = 180`, `plan_name = 'pro'`

4. **Supabase Upsert**:
   - Tabela: `users`
   - Coluna de conflito: `email`
   - Operação: `credits = credits + credits_to_add` (usar expressão SQL ou buscar saldo atual antes)
   - Definir `plan = plan_name`

---

## Fluxo de Sincronização n8n

```
Compra na Kiwify
      ↓
n8n recebe webhook
      ↓
n8n insere/atualiza no Supabase:
  - email = email do comprador
  - credits = credits + PLAN_CREDITS[plano]
  - plan = nome do plano
  - clerk_id = NULL (usuário ainda não logou)
      ↓
Usuário faz login no app
      ↓
getOrCreateUser() busca por email
      ↓
Encontra registro sem clerk_id
      ↓
Vincula clerk_id ao registro
      ↓
Retorna com linkedCredits: true
      ↓
Frontend exibe toast de sucesso
```

---

## Regras de Negócio Consolidadas

| Plano     | Créditos Iniciais | Comportamento de Compra | Reset Mensal         |
|-----------|-------------------|-------------------------|----------------------|
| Free      | 3                 | N/A                     | Sim (Volta para 3)   |
| Essential | 50                | Soma ao saldo atual     | Não                  |
| Pro       | 180               | Soma ao saldo atual     | Não                  |

**Reset Mensal (Free):**
- Verificar `last_reset_at` ao carregar usuário
- Se > 30 dias e `plan === 'free'` → reset para 3 créditos

---

## Ordem de Implementação

1. Executar SQL no Supabase Dashboard
2. Atualizar `config/config.js` (constantes)
3. Atualizar `lib/database/supabase-db.js` (novas funções)
4. Atualizar `lib/services/clerk.js` (sync n8n)
5. Atualizar `lib/utils/usage.js` (créditos reais + reset mensal)
6. Atualizar `app/api/user-data/route.js` (retornar créditos)
7. Atualizar `app/api/edit/route.js` (Credit Guard)
8. Atualizar `contexts/UserDataContext.js` (estados + toasts)
9. Atualizar `app/app/page.js` (exibir créditos no header)

---

## Arquivos Críticos

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `lib/database/supabase-db.js` | Adicionar 5 funções + modificar 2 |
| `lib/services/clerk.js` | Refatorar getOrCreateUser |
| `lib/utils/usage.js` | Refatorar para créditos reais + reset |
| `app/api/edit/route.js` | Adicionar Credit Guard |
| `app/api/user-data/route.js` | Retornar créditos/plan/flags |
| `contexts/UserDataContext.js` | Estados + toasts |
| `app/app/page.js` | Exibir créditos no header |
| `config/config.js` | Constantes de planos |
