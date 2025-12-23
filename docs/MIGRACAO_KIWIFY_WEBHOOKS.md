# Migração: Centralização em kiwify_webhooks

## Resumo

Todas as tabelas foram centralizadas na tabela `kiwify_webhooks`, que agora é a única fonte de verdade para:
- Dados de usuários (email, clerk_id, credits, plan)
- Dados de webhooks da Kiwify (order_id, event_type, raw_data)
- Histórico de resets (last_reset_at)

## Estrutura da Tabela kiwify_webhooks

### Colunas Principais (Usuário)
- `id` (UUID, PK) - Identificador único
- `email` (TEXT, NOT NULL, UNIQUE) - Email normalizado (lowercase, trim)
- `clerk_id` (TEXT, NULLABLE, UNIQUE quando não-null) - ID do Clerk
- `credits` (INTEGER, NULLABLE) - Créditos atuais
- `plan` (TEXT, NULLABLE) - Plano atual (free, basic, premium, etc)
- `last_reset_at` (TIMESTAMPTZ, NULLABLE) - Data do último reset

### Colunas de Webhook
- `event_type` (TEXT, NULLABLE) - Tipo de evento (order_approved, etc)
- `order_id` (TEXT, NULLABLE) - ID do pedido na Kiwify
- `raw_data` (JSONB, NULLABLE) - Dados brutos do webhook

### Colunas de Auditoria
- `created_at` (TIMESTAMPTZ, DEFAULT now()) - Data de criação
- `updated_at` (TIMESTAMPTZ, DEFAULT now()) - Data de última atualização
- `user_id` (UUID, NULLABLE) - Mapeamento para users.id antigo (temporário, para referência)

## Constraints e Índices

- **UNIQUE(email)** - Garante um registro por email
- **UNIQUE(clerk_id)** - Garante um registro por clerk_id (apenas quando não-null)
- **Índice em email** - Busca rápida por email
- **Índice em clerk_id** - Busca rápida por clerk_id

## Foreign Keys Atualizadas

- `generations.user_id` → `kiwify_webhooks.id`
- `transactions.user_id` → `kiwify_webhooks.id`

## Migrações Aplicadas

1. `add_user_fields_to_kiwify_webhooks` - Adicionou colunas de usuário
2. `migrate_users_to_kiwify_webhooks` - Migrou dados de users para kiwify_webhooks
3. `update_foreign_keys_to_kiwify_webhooks_v2` - Atualizou foreign keys

## Próximos Passos

1. Atualizar código JavaScript para usar `kiwify_webhooks` ao invés de `users`
2. Atualizar funções RPC se necessário
3. Atualizar n8n para fazer upsert em `kiwify_webhooks`
4. (Opcional) Deprecar tabela `users` após validação completa

## Notas Importantes

- A tabela `users` ainda existe, mas não deve ser mais usada
- Todos os novos dados devem ir para `kiwify_webhooks`
- Email deve sempre ser normalizado (lowercase + trim) antes de inserir/atualizar
- A constraint UNIQUE em email garante que não haverá duplicatas

