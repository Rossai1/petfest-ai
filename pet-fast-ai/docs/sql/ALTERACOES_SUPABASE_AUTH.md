# Alterações no Supabase para Migração Auth

## Migrações Aplicadas

### 1. `add_password_fields_to_kiwify_webhooks`
**Data**: 2025-01-23

Adiciona colunas para geração automática de senha:
- `temporary_password` (TEXT) - Senha temporária gerada
- `password_generated_at` (TIMESTAMPTZ) - Quando a senha foi gerada
- `password_sent` (BOOLEAN, default false) - Se a senha foi enviada

**Índices criados**:
- `idx_kiwify_webhooks_password_sent` - Para busca rápida de senhas não enviadas

### 2. `add_auth_user_id_column_to_kiwify_webhooks`
**Data**: 2025-01-23

Adiciona coluna para vincular ao Supabase Auth:
- `auth_user_id` (UUID) - Referência ao `auth.users.id`
- Foreign key para `auth.users(id)` com `ON DELETE SET NULL`
- Índice `idx_kiwify_webhooks_auth_user_id` para busca rápida

### 3. `create_function_clean_temporary_passwords`
**Data**: 2025-01-23

Cria função para limpeza automática de senhas temporárias:
```sql
SELECT public.clean_old_temporary_passwords();
```

**Comportamento**:
- Remove senhas temporárias com mais de 7 dias
- Remove senhas enviadas há mais de 24 horas
- Mantém a segurança removendo senhas antigas

**Nota**: Para agendar execução automática, habilite a extensão `pg_cron` no Supabase Dashboard.

### 4. `create_function_link_auth_user_to_kiwify`
**Data**: 2025-01-23

Cria função helper para vincular usuário do Auth ao registro:
```sql
SELECT public.link_auth_user_to_kiwify('email@example.com', 'uuid-do-auth-user');
```

**Comportamento**:
- Normaliza email automaticamente
- Faz UPSERT (insert ou update)
- Retorna o `id` do registro em `kiwify_webhooks`

## Estrutura Final da Tabela

A tabela `kiwify_webhooks` agora possui:

### Colunas Principais
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE, NOT NULL)
- `auth_user_id` (UUID, FK → auth.users.id) - **NOVO**
- `clerk_id` (TEXT, nullable) - **Deprecated**, mantido para compatibilidade

### Colunas de Senha Temporária
- `temporary_password` (TEXT, nullable) - **NOVO**
- `password_generated_at` (TIMESTAMPTZ, nullable) - **NOVO**
- `password_sent` (BOOLEAN, default false) - **NOVO**

### Outras Colunas
- `plan` (TEXT)
- `credits` (INTEGER)
- `last_reset_at` (TIMESTAMPTZ)
- `event_type`, `order_id`, `raw_data` (dados do webhook)
- `created_at`, `updated_at` (timestamps)

## Como Usar

### Limpar Senhas Temporárias Manualmente

```sql
-- Executar limpeza manual
SELECT public.clean_old_temporary_passwords();
```

### Agendar Limpeza Automática (Requer pg_cron)

```sql
-- Habilitar extensão (se ainda não habilitado)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza diária às 2h da manhã
SELECT cron.schedule(
    'clean-temporary-passwords',
    '0 2 * * *', -- Todo dia às 2h
    $$SELECT public.clean_old_temporary_passwords();$$
);
```

### Vincular Usuário do Auth

```sql
-- Quando um usuário faz login pela primeira vez
SELECT public.link_auth_user_to_kiwify(
    'usuario@example.com',
    'uuid-do-usuario-no-auth-users'
);
```

## Segurança

- As funções usam `SECURITY DEFINER` para permitir operações administrativas
- Foreign key garante integridade referencial
- `ON DELETE SET NULL` preserva dados mesmo se usuário for deletado do Auth

## Próximos Passos

1. ✅ Estrutura do banco criada
2. ✅ Funções helper criadas
3. ⏳ Configurar pg_cron para limpeza automática (opcional)
4. ⏳ Testar fluxo completo de geração de senha
5. ⏳ Remover coluna `clerk_id` após confirmação (opcional, futuro)



