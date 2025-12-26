# Estrutura do Projeto PetFest

## Organização de Pastas

### `/components`
Componentes React organizados por categoria:

- **`/common`** - Componentes compartilhados e utilitários
  - `Logo.js` - Logo da aplicação
  - `MobileMenu.js` - Menu mobile
  - `ErrorBoundary.js` - Tratamento de erros
  - `Providers.js` - Providers do React (contextos, temas, etc)

- **`/app`** - Componentes específicos da aplicação principal
  - `ImageUploader.js` - Upload de imagens
  - `ThemeSelector.js` - Seletor de temas
  - `ResultGallery.js` - Galeria de resultados
  - `CreditsPill.js` - Indicador de créditos
  - `UsageIndicator.js` - Indicador de uso
  - `SuggestionModal.js` - Modal de sugestões

- **`/landing`** - Componentes da landing page
  - `HeroSection.js` - Seção hero
  - `ResultsGallery.js` - Galeria de resultados
  - `HowItWorks.js` - Como funciona
  - `PricingSection.js` - Seção de preços
  - `FAQ.js` - Perguntas frequentes
  - `MobileCTA.js` - CTA mobile fixo

- **`/features`** - Componentes de features específicas
  - `PricingCard.js` - Card de planos

- **`/ui`** - Componentes de UI base (shadcn/ui)
  - `button.jsx`, `card.jsx`, `progress.jsx`, `select.jsx`

### `/lib`
Bibliotecas e utilitários organizados por função:

- **`/config`** - Configurações
  - `config.js` - Configurações gerais
  - `design.json` - Design system

- **`/services`** - Serviços externos
  - `clerk.js` - Autenticação Clerk
  - `stripe.js` - Pagamentos Stripe
  - `openai.js` - Integração OpenAI
  - `storage.js` - Armazenamento (Supabase Storage)

- **`/database`** - Banco de dados
  - `db.js` - Prisma client
  - `supabase-db.js` - Queries Supabase diretas
  - `cache.js` - Sistema de cache

- **`/utils`** - Utilitários
  - `index.js` - Função `cn()` (merge de classes)
  - `logger.js` - Sistema de logging
  - `usage.js` - Lógica de uso/créditos
  - `image-compression.js` - Compressão de imagens

- **`/data`** - Dados estáticos e lógica de dados
  - `themes.js` - Lógica de temas (server-side)
  - `themes-data.js` - Dados de temas
  - `pricing.js` - Lógica de preços e planos

### `/app`
Estrutura do Next.js App Router:

- **`/`** - Landing page
- **`/app`** - Aplicação principal
- **`/dashboard`** - Dashboard do usuário
- **`/pricing`** - Página de planos
- **`/admin`** - Painel administrativo
- **`/api`** - Rotas da API
- **`/(auth)`** - Rotas de autenticação (Clerk)

### `/contexts`
Contextos React:
- `UserDataContext.js` - Contexto de dados do usuário

### Outros
- `/prisma` - Schema e migrações do Prisma
- `/public` - Arquivos estáticos
- `/middleware.js` - Middleware do Next.js

## Convenções de Imports

- Componentes: `@/components/[categoria]/ComponentName`
- Lib: `@/lib/[categoria]/arquivo`
- Utils: `@/lib/utils` (importa index.js automaticamente)
- Contextos: `@/contexts/ContextName`

## Benefícios da Nova Estrutura

1. **Organização clara** - Fácil encontrar arquivos
2. **Escalabilidade** - Estrutura preparada para crescimento
3. **Manutenibilidade** - Código agrupado por responsabilidade
4. **Navegação intuitiva** - Pastas nomeadas de forma descritiva



