# Como Corrigir Conflitos entre users e kiwify_webhooks

## Problema

O erro 500 pode estar sendo causado por conflitos entre as tabelas `users` e `kiwify_webhooks`, geralmente relacionados a:

1. **Emails duplicados** na tabela `users` em diferentes cases (ex: "Email@example.com" vs "email@example.com")
2. **Constraint `unique_email`** falhando quando o n8n tenta fazer upsert
3. **Emails não normalizados** causando problemas de busca/vinculação

## Solução

### Passo 1: Executar Script de Diagnóstico

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Abra o arquivo `docs/sql/fix_users_kiwify_conflict.sql`
3. Execute as queries da **SEÇÃO 1: DIAGNÓSTICO** uma por uma:
   - `1.1` - Verificar constraint
   - `1.2` - Verificar duplicatas
   - `1.3` - Verificar emails não normalizados em kiwify_webhooks
   - `1.4` - Verificar correspondência entre tabelas
   - `1.5` e `1.6` - Verificar estruturas das tabelas

### Passo 2: Analisar Resultados

- **Se a query 1.2 retornar duplicatas**: Há emails duplicados que precisam ser resolvidos
- **Se a query 1.3 retornar resultados**: Há emails em kiwify_webhooks que não estão normalizados
- **Se a query 1.4 mostrar inconsistências**: Há emails em webhooks que não estão em users

### Passo 3: Aplicar Correções

⚠️ **IMPORTANTE: Faça backup do banco antes de executar as correções!**

1. Execute `2.1` para normalizar todos os emails na tabela `users`
2. Execute `2.2` para verificar o resultado
3. Se houver duplicatas (query 1.2 retornou resultados):
   - Execute a query SELECT da `2.3` para ver quais serão deletados
   - Revise cuidadosamente os IDs que serão deletados
   - Se estiver correto, descomente e execute a query DELETE da `2.3`
4. Execute `2.4` para garantir que a constraint existe

### Passo 4: Verificar Correções

Execute as queries da **SEÇÃO 3** para verificar se tudo está correto:
- `3.1` - Não deve retornar duplicatas
- `3.2` - Deve mostrar dados consistentes

## Prevenção

Para evitar problemas futuros:

1. **n8n deve normalizar emails**: O n8n já está configurado para normalizar emails (ver `docs/N8N_KIWIFY_SETUP.md`)
2. **Código normaliza emails**: O código do app já normaliza emails antes de buscar/criar
3. **Constraint unique_email**: Mantém a integridade dos dados

## Notas

- A tabela `kiwify_webhooks` é apenas para **auditoria** - não interfere no funcionamento
- A tabela `users` é a **fonte de verdade** para créditos e planos
- O conflito geralmente ocorre quando o n8n tenta fazer upsert e encontra emails duplicados em diferentes cases





