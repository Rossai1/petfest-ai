# Resumo da Migração: Clerk → Supabase Auth

## O que foi implementado

### 1. Banco de Dados
- ✅ Adicionadas colunas na tabela `kiwify_webhooks`:
  - `temporary_password` - Senha temporária gerada automaticamente
  - `password_generated_at` - Timestamp de quando a senha foi gerada
  - `password_sent` - Flag indicando se a senha já foi enviada

### 2. API de Geração de Senha
- ✅ Criada rota `/api/auth/generate-password`
  - Gera senha de 8 caracteres automaticamente
  - Cria usuário no Supabase Auth
  - Armazena senha temporária na tabela
  - Protegida com token secreto (`PASSWORD_GENERATOR_SECRET`)

### 3. Autenticação
- ✅ Criados helpers de autenticação:
  - `lib/auth/server.js` - Para server components e API routes
  - `lib/auth/client.js` - Para client components
- ✅ Atualizado middleware para usar Supabase Auth
- ✅ Criado serviço de autenticação (`lib/services/auth.js`)
- ✅ Criadas páginas de login e registro (`app/(auth)/login` e `app/(auth)/register`)

### 4. Componentes
- ✅ Atualizado `UserDataContext` para usar Supabase Auth
- ✅ Criado componente `UserMenu` customizado
- ✅ Atualizados componentes principais:
  - `app/app/page.js`
  - `app/dashboard/page.js`
  - `app/admin/prompts/page.js`
  - `components/common/MobileMenu.js`

### 5. Rotas de API
- ✅ Atualizadas todas as rotas de API:
  - `/api/user-data`
  - `/api/edit`
  - `/api/admin/prompts`
  - `/api/suggestions`
  - `/api/recent-results`

### 6. Limpeza
- ✅ Removido `ClerkProvider` do layout principal
- ✅ Removida dependência `@clerk/nextjs`

## Próximos Passos

### 1. Configurar Variáveis de Ambiente

Adicione ao `.env.local`:
```env
# Supabase (já deve existir)
NEXT_PUBLIC_SUPABASE_URL=seu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Novo - Token secreto para geração de senha
PASSWORD_GENERATOR_SECRET=seu_token_secreto_aqui
```

Para gerar um token secreto seguro:
```bash
openssl rand -hex 32
```

### 2. Configurar Supabase Auth no Dashboard

1. Acesse o Supabase Dashboard
2. Vá em Authentication → Providers
3. Habilite os providers desejados:
   - Email (já habilitado por padrão)
   - Google (opcional)
   - GitHub (opcional)
4. Configure URLs de redirecionamento:
   - `http://localhost:3000/app` (desenvolvimento)
   - `https://seu-dominio.com/app` (produção)

### 3. Atualizar n8n Workflow

Consulte `docs/N8N_PASSWORD_GENERATION.md` para:
- Configurar chamada à API de geração de senha
- Enviar email com credenciais ao cliente
- Marcar senha como enviada

### 4. Testar Fluxo Completo

1. Cliente compra na Kiwify
2. n8n insere dados na `kiwify_webhooks`
3. n8n chama `/api/auth/generate-password`
4. Sistema gera senha e cria usuário
5. n8n envia email com credenciais
6. Cliente faz login com email/senha
7. Sistema vincula créditos automaticamente

### 5. Remover Arquivos do Clerk (Opcional)

Após confirmar que tudo funciona, pode remover:
- `app/(auth)/sign-in/[[...sign-in]]/page.js`
- `app/(auth)/sign-up/[[...sign-up]]/page.js`
- `app/api/webhooks/clerk/route.js` (se existir)
- `lib/services/clerk.js` (mantido para referência, pode remover depois)

## Arquivos Principais Modificados

### Novos Arquivos
- `lib/auth/server.js`
- `lib/auth/client.js`
- `lib/services/auth.js`
- `app/(auth)/login/page.js`
- `app/(auth)/register/page.js`
- `app/api/auth/generate-password/route.js`
- `components/auth/UserMenu.js`
- `docs/N8N_PASSWORD_GENERATION.md`

### Arquivos Modificados
- `middleware.js`
- `app/layout.js`
- `contexts/UserDataContext.js`
- `app/app/page.js`
- `app/dashboard/page.js`
- `app/admin/prompts/page.js`
- `components/common/MobileMenu.js`
- Todas as rotas em `app/api/**`

### Arquivos do Banco (via MCP)
- Migration: `add_password_fields_to_kiwify_webhooks`

## Notas Importantes

1. **Migração de Usuários**: Não foi feita migração de usuários existentes do Clerk. Novos usuários serão criados automaticamente via Supabase Auth quando fizerem login.

2. **Segurança de Senhas Temporárias**: 
   - Senhas são geradas com 8 caracteres (letras minúsculas + números)
   - Recomende alteração de senha após primeiro login
   - Considere limpar `temporary_password` após 24-48h

3. **Compatibilidade**: 
   - Mantidas algumas referências a `clerkId` para compatibilidade (podem ser removidas depois)
   - A coluna `clerk_id` na tabela `kiwify_webhooks` pode ser removida no futuro

4. **Documentação n8n**: 
   - Veja `docs/N8N_PASSWORD_GENERATION.md` para instruções completas de integração

## Status

✅ Migração completa de Clerk para Supabase Auth
✅ Sistema de geração automática de senha implementado
✅ Integração com n8n documentada
⏳ Aguardando configuração final (variáveis de ambiente, Supabase Dashboard, teste do fluxo)





