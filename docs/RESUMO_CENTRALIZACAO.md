# Resumo da Centralização em kiwify_webhooks

## ✅ O que foi feito

### 1. Estrutura do Banco de Dados
- ✅ Adicionadas colunas necessárias em `kiwify_webhooks`:
  - `clerk_id` (TEXT, nullable, unique quando não-null)
  - `last_reset_at` (TIMESTAMPTZ, nullable)
  - `updated_at` (TIMESTAMPTZ, default now())
  - `user_id` (UUID, nullable) - mapeamento temporário

- ✅ Criados índices e constraints:
  - UNIQUE constraint em `email`
  - UNIQUE constraint em `clerk_id` (quando não-null)
  - Índices para busca rápida

### 2. Migração de Dados
- ✅ Dados de `users` migrados para `kiwify_webhooks` usando UPSERT
- ✅ Foreign keys de `generations` e `transactions` atualizadas para apontar para `kiwify_webhooks`
- ✅ Todas as 13 gerações agora referenciam corretamente `kiwify_webhooks`

### 3. Código JavaScript
- ✅ Todas as funções em `lib/database/supabase-db.js` atualizadas:
  - `getUserByClerkId()` - usa `kiwify_webhooks`
  - `getUserByEmail()` - usa `kiwify_webhooks`
  - `createUser()` - cria em `kiwify_webhooks`
  - `linkClerkIdToUser()` - atualiza `kiwify_webhooks`
  - `resetFreeCredits()` - atualiza `kiwify_webhooks`

### 4. Função RPC
- ✅ `deduct_credits()` atualizada para usar `kiwify_webhooks`
- ⚠️ **Ação necessária**: Execute o script `docs/sql/update_deduct_credits_to_kiwify_webhooks.sql` no Supabase SQL Editor

### 5. Documentação
- ✅ `docs/MIGRACAO_KIWIFY_WEBHOOKS.md` - Estrutura e detalhes da migração
- ✅ `docs/N8N_KIWIFY_SETUP.md` - Atualizado para usar `kiwify_webhooks`
- ✅ `docs/sql/update_deduct_credits_to_kiwify_webhooks.sql` - Script SQL para função RPC

## ⚠️ Ações Necessárias

### 1. Executar Script SQL da Função RPC
Execute no Supabase SQL Editor:
```
docs/sql/update_deduct_credits_to_kiwify_webhooks.sql
```

### 2. Atualizar n8n
Atualize o workflow do n8n para fazer UPSERT em `kiwify_webhooks` ao invés de `users`:
- URL: `/rest/v1/kiwify_webhooks?on_conflict=email`
- Incluir campos: `event_type`, `order_id`, `raw_data`

### 3. Testar
1. Teste login com Clerk
2. Teste criação de novo usuário
3. Teste vinculação de créditos
4. Teste dedução de créditos
5. Teste reset de créditos (plano free)

## 📊 Estado Atual

- ✅ Tabela `kiwify_webhooks` é agora a fonte única de verdade
- ✅ Foreign keys atualizadas
- ✅ Código JavaScript atualizado
- ⚠️ Função RPC precisa ser atualizada manualmente
- ⚠️ n8n precisa ser atualizado

## 🔄 Próximos Passos (Opcional)

1. Validar que tudo funciona corretamente
2. Deprecar tabela `users` (após validação completa)
3. Remover coluna `user_id` temporária de `kiwify_webhooks` (após validação)

