# Arquitetura do Projeto PetFest

Este documento descreve a estrutura do projeto e define onde cada tipo de arquivo deve ser salvo daqui para frente.

## 📁 Estrutura de Diretórios

```
pet-fast-ai/
├── app/                          # Next.js App Router (páginas e rotas)
├── components/                   # Componentes React
│   ├── ui/                      # Componentes de UI reutilizáveis (shadcn/ui)
│   ├── app/                     # Componentes específicos da aplicação
│   ├── common/                  # Componentes comuns compartilhados
│   └── plans/                   # Componentes relacionados a planos
├── config/                      # Arquivos de configuração
├── contexts/                    # React Contexts
├── docs/                        # Documentação do projeto
├── lib/                         # Bibliotecas e utilitários
│   ├── data/                    # Dados estáticos e configurações de dados
│   ├── database/                # Acesso ao banco de dados
│   ├── services/                # Serviços externos (OpenAI, Clerk, Storage)
│   └── utils/                   # Funções utilitárias
├── logos/                       # Logos e ícones do projeto
├── prisma/                      # Schema e migrações do Prisma
├── public/                      # Arquivos estáticos públicos
└── [arquivos de configuração na raiz]
```

---

## 📝 Onde Salvar Cada Tipo de Arquivo

### 🎨 **Componentes React** (`/components`)

#### `/components/ui/`
**O que salvar aqui:**
- Componentes de UI reutilizáveis e genéricos
- Componentes do shadcn/ui (button, card, input, select, etc.)
- Componentes que não têm lógica de negócio específica
- Componentes que podem ser usados em qualquer parte da aplicação

**Exemplos:**
- `button.jsx`, `card.jsx`, `input.jsx`, `select.jsx`, `progress.jsx`
- Componentes de formulário genéricos
- Componentes de layout básicos

**Nomenclatura:** Use `.jsx` para componentes de UI puros.

---

#### `/components/app/`
**O que salvar aqui:**
- Componentes específicos da aplicação PetFest
- Componentes que contêm lógica de negócio
- Componentes que são usados apenas nas páginas principais da aplicação

**Exemplos:**
- `ImageUploader.js`, `ImageUploaderStitch.js`
- `ThemeSelector.js`, `ThemeSelectorStitch.js`
- `ResultGallery.js`, `ResultGalleryStitch.js`
- `SuggestionModal.js`

**Nomenclatura:** Use `.js` para componentes com lógica de negócio.

---

#### `/components/common/`
**O que salvar aqui:**
- Componentes compartilhados entre múltiplas páginas
- Componentes de layout comum (Header, Footer, Navigation)
- Componentes de infraestrutura (ErrorBoundary, Providers)
- Componentes que não são específicos de UI nem de app

**Exemplos:**
- `Header.js`, `Logo.js`, `MobileMenu.js`
- `ErrorBoundary.js`, `Providers.js`

**Nomenclatura:** Use `.js` para componentes comuns.

---

#### `/components/plans/`
**O que salvar aqui:**
- Componentes específicos relacionados a planos e preços
- Componentes de checkout e assinaturas
- Componentes de exibição de planos

**Exemplos:**
- `PlanCard.js`, `PricingTable.js`, `CheckoutForm.js`

---

### 📄 **Páginas e Rotas** (`/app`)

#### `/app/`
**O que salvar aqui:**
- Páginas do Next.js App Router
- Arquivos de layout (`layout.js`)
- Páginas principais (`page.js`)
- Arquivos de configuração de rota (`route.js` para API routes)

**Estrutura:**
```
app/
├── page.js                      # Página inicial (/)
├── layout.js                    # Layout raiz
├── globals.css                  # Estilos globais
├── app/
│   └── page.js                  # Página principal da aplicação (/app)
├── dashboard/
│   └── page.js                  # Dashboard do usuário (/dashboard)
├── admin/
│   └── prompts/
│       └── page.js              # Página admin (/admin/prompts)
└── api/
    ├── edit/
    │   └── route.js             # API route para edição de imagens
    ├── user-data/
    │   └── route.js             # API route para dados do usuário
    └── webhooks/
        ├── clerk/
        │   └── route.js         # Webhook do Clerk
        └── stripe/
            └── route.js         # Webhook do Stripe
```

**Regras:**
- Cada pasta dentro de `/app` representa uma rota
- `page.js` = página renderizada
- `route.js` = API endpoint
- `layout.js` = layout compartilhado
- Use grupos de rotas `(auth)` para organizar rotas relacionadas

---

### ⚙️ **Configurações** (`/config`)

**O que salvar aqui:**
- Arquivos de configuração da aplicação
- Configurações de API
- Configurações de design e temas
- Constantes e variáveis de configuração

**Exemplos:**
- `config.js` - Configurações gerais (ADMIN_EMAIL, etc.)
- `api.js` - Configurações de URLs de API
- `design.json` - Configurações de design e cores

**Importação:**
```javascript
import { ADMIN_EMAIL } from '@/config/config';
import { getApiUrl } from '@/config/api';
```

**⚠️ Não mover para `/config`:**
- `next.config.mjs` - Deve ficar na raiz (requerimento do Next.js)
- `jsconfig.json` - Deve ficar na raiz (configuração do TypeScript/JS)
- `eslint.config.mjs` - Deve ficar na raiz (configuração do ESLint)
- `postcss.config.mjs` - Deve ficar na raiz (configuração do PostCSS)
- `vercel.json` - Deve ficar na raiz (configuração do Vercel)
- `components.json` - Deve ficar na raiz (configuração do shadcn/ui)

---

### 🔧 **Serviços Externos** (`/lib/services`)

**O que salvar aqui:**
- Integrações com serviços externos
- Clientes de APIs de terceiros
- Serviços de autenticação
- Serviços de armazenamento

**Exemplos:**
- `openai.js` - Cliente OpenAI para edição de imagens
- `clerk.js` - Funções de autenticação e usuário (Clerk)
- `storage.js` - Upload e gerenciamento de imagens (Supabase Storage)

**Padrão:**
- Cada serviço deve ter seu próprio arquivo
- Exporte funções específicas, não objetos genéricos
- Use tratamento de erros adequado

---

### 🗄️ **Banco de Dados** (`/lib/database`)

**O que salvar aqui:**
- Acesso ao banco de dados
- Queries otimizadas
- Cache e invalidação
- Clientes de banco de dados

**Exemplos:**
- `db.js` - Cliente Prisma
- `supabase-db.js` - Queries diretas do Supabase (otimizadas)
- `cache.js` - Sistema de cache

**Regras:**
- Use Prisma para operações complexas
- Use Supabase direto para queries simples e rápidas
- Implemente cache quando apropriado

---

### 📊 **Dados e Temas** (`/lib/data`)

**O que salvar aqui:**
- Dados estáticos
- Configurações de temas
- Dados de referência
- Mocks e fixtures (apenas em desenvolvimento)

**Exemplos:**
- `themes-data.js` - Dados dos temas (prompts padrão)
- `themes.js` - Lógica de busca e gerenciamento de temas

---

### 🛠️ **Utilitários** (`/lib/utils`)

**O que salvar aqui:**
- Funções utilitárias reutilizáveis
- Helpers genéricos
- Funções de formatação
- Funções de validação
- Funções de transformação de dados

**Exemplos:**
- `index.js` - Função `cn()` para classes CSS (clsx + tailwind-merge)
- `logger.js` - Sistema de logging
- `usage.js` - Funções relacionadas a uso e créditos
- `image-compression.js` - Compressão de imagens

**Regras:**
- Funções devem ser puras quando possível
- Evite dependências de contexto específico
- Documente funções complexas

---

### 🎭 **Contextos React** (`/contexts`)

**O que salvar aqui:**
- React Contexts
- Providers de contexto
- Hooks customizados relacionados a contexto

**Exemplos:**
- `UserDataContext.js` - Contexto de dados do usuário

**Padrão:**
- Um arquivo por contexto
- Exporte Provider e hooks customizados
- Use nomes descritivos

---

### 📚 **Documentação** (`/docs`)

**O que salvar aqui:**
- Toda a documentação do projeto
- Guias de setup
- Documentação de implementação
- Guias de teste
- Este arquivo (ARCHITECTURE.md)

**Exemplos:**
- `ARCHITECTURE.md` - Este arquivo
- `ADMIN_SETUP.md` - Guia de configuração de admin
- `STRIPE_SETUP.md` - Guia de configuração do Stripe
- `STATUS_DEPLOY.md` - Status de deploy

**⚠️ Não mover:**
- `README.md` - Deve ficar na raiz do projeto

---

### 🖼️ **Arquivos Estáticos** (`/public`)

**O que salvar aqui:**
- Imagens públicas
- Favicons
- Arquivos HTML estáticos
- Assets que serão servidos diretamente

**Estrutura:**
```
public/
├── favicon.svg
├── logo.svg
└── index.html
```

---

### 🎨 **Logos e Ícones** (`/logos`)

**O que salvar aqui:**
- Logos do projeto
- Ícones customizados
- Assets de marca

**Exemplos:**
- `logo.svg`, `favicon.svg`

---

### 🗃️ **Prisma** (`/prisma`)

**O que salvar aqui:**
- Schema do Prisma (`schema.prisma`)
- Migrações (geradas automaticamente)
- Seeds (se necessário)

**⚠️ Não edite manualmente:**
- Pasta `migrations/` - Gerada automaticamente pelo Prisma

---

## 🔄 Convenções de Nomenclatura

### Arquivos e Pastas

- **Componentes:** PascalCase (ex: `ImageUploader.js`, `ThemeSelector.js`)
- **Utilitários:** camelCase (ex: `image-compression.js`, `logger.js`)
- **Páginas:** lowercase (ex: `page.js`, `layout.js`, `route.js`)
- **Configurações:** lowercase (ex: `config.js`, `api.js`)
- **Serviços:** camelCase (ex: `openai.js`, `clerk.js`)

### Imports

**Use aliases do `@/` quando possível:**
```javascript
// ✅ Correto
import { getApiUrl } from '@/config/api';
import { Button } from '@/components/ui/button';
import { editImage } from '@/lib/services/openai';

// ❌ Evite caminhos relativos longos
import { getApiUrl } from '../../../config/api';
```

**Caminhos relativos apenas dentro de `/lib`:**
```javascript
// ✅ OK dentro de /lib
import { logger } from '../utils/logger';
import { ADMIN_EMAIL } from '../../config/config';
```

---

## 📦 Estrutura de Imports Recomendada

### Ordem de Imports

1. **React e Next.js**
```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
```

2. **Bibliotecas de terceiros**
```javascript
import { Button } from '@clerk/nextjs';
import { toast } from 'sonner';
```

3. **Componentes UI**
```javascript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

4. **Componentes da aplicação**
```javascript
import ImageUploaderStitch from '@/components/app/ImageUploaderStitch';
import Logo from '@/components/common/Logo';
```

5. **Configurações**
```javascript
import { getApiUrl } from '@/config/api';
import { ADMIN_EMAIL } from '@/config/config';
```

6. **Serviços**
```javascript
import { editImage } from '@/lib/services/openai';
import { getOrCreateUser } from '@/lib/services/clerk';
```

7. **Utilitários**
```javascript
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';
```

8. **Dados**
```javascript
import { themes } from '@/lib/data/themes-data';
```

---

## 🚫 O Que NÃO Fazer

### ❌ Não coloque na raiz:
- Componentes React (use `/components`)
- Utilitários genéricos (use `/lib/utils`)
- Configurações de aplicação (use `/config`)
- Documentação (use `/docs`, exceto README.md)

### ❌ Não misture:
- Lógica de negócio em componentes UI (`/components/ui`)
- Componentes de UI em componentes de app (`/components/app`)
- Serviços em utilitários (`/lib/utils` vs `/lib/services`)

### ❌ Não use caminhos relativos longos:
```javascript
// ❌ Ruim
import { Button } from '../../../../components/ui/button';

// ✅ Bom
import { Button } from '@/components/ui/button';
```

---

## 🔍 Checklist ao Criar Novo Arquivo

Antes de criar um novo arquivo, pergunte-se:

1. **É um componente React?**
   - UI genérico? → `/components/ui/`
   - Específico da app? → `/components/app/`
   - Compartilhado? → `/components/common/`

2. **É uma página ou rota?**
   - Página? → `/app/[rota]/page.js`
   - API route? → `/app/api/[rota]/route.js`

3. **É uma configuração?**
   - Config da app? → `/config/`
   - Config do framework? → Raiz (next.config.mjs, etc.)

4. **É um serviço externo?**
   - → `/lib/services/`

5. **É um utilitário?**
   - → `/lib/utils/`

6. **É um dado estático?**
   - → `/lib/data/`

7. **É documentação?**
   - → `/docs/` (exceto README.md)

---

## 📝 Exemplos Práticos

### Criando um novo componente de UI

```bash
# Criar: components/ui/input.jsx
```

```javascript
// components/ui/input.jsx
import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn("...", className)}
      {...props}
    />
  );
}
```

### Criando uma nova API route

```bash
# Criar: app/api/health/route.js
```

```javascript
// app/api/health/route.js
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  logger.info('Health check');
  return NextResponse.json({ status: 'ok' });
}
```

### Criando um novo serviço

```bash
# Criar: lib/services/email.js
```

```javascript
// lib/services/email.js
import { logger } from '../utils/logger';

export async function sendEmail(to, subject, body) {
  // Implementação
  logger.info(`Sending email to ${to}`);
}
```

---

## 🔄 Atualizações Futuras

Quando adicionar novos tipos de arquivos ou estruturas:

1. **Atualize este documento** (`ARCHITECTURE.md`)
2. **Mantenha a consistência** com a estrutura existente
3. **Documente decisões** importantes sobre organização
4. **Revise periodicamente** a estrutura para garantir que ainda faz sentido

---

## 📚 Referências

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0


