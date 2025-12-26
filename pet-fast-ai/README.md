# PetFest 🎄

Transforme fotos dos seus pets em momentos festivos incríveis usando inteligência artificial!

## 🎯 Sobre o Projeto

PetFest é uma aplicação web que permite você fazer upload de até 10 fotos dos seus pets, selecionar um tema festivo (Natal, Ano Novo, Carnaval, Halloween), e gerar versões editadas usando o modelo GPT-Image-1.5 da OpenAI.

## ✨ Funcionalidades

- 📤 Upload de até 10 imagens simultaneamente
- 🎨 4 temas festivos disponíveis (Natal, Ano Novo, Carnaval, Halloween)
- 🖼️ Edição de imagens usando IA avançada (GPT-Image-1.5)
- 💾 Download das imagens editadas
- 📱 Interface responsiva e moderna
- ⚡ Processamento em paralelo de múltiplas imagens

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ instalado
- Conta na OpenAI com API key
- Conta no Clerk (para autenticação)
- Conta no Stripe (para pagamentos)
- Banco de dados PostgreSQL (Supabase, Neon, Vercel Postgres, etc.)

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd pet-fast-ai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione todas as chaves necessárias (veja seção de Configuração abaixo).

4. Configure o banco de dados:
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações (quando o banco estiver configurado)
npx prisma migrate dev --name init
```

5. Configure os webhooks:
   - **Clerk**: Configure webhook apontando para `https://seu-dominio.com/api/webhooks/clerk`
   - **Stripe**: Configure webhook apontando para `https://seu-dominio.com/api/webhooks/stripe`

6. Crie produtos no Stripe Dashboard:
   - Crie produtos "Essential" e "Pro" com preços recorrentes mensais
   - Copie os Price IDs e adicione em `.env.local`

7. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

8. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
pet-fast-ai/
├── app/
│   ├── api/
│   │   └── edit/
│   │       └── route.js          # API route para edição de imagens
│   ├── layout.js                 # Layout principal
│   ├── page.js                   # Página principal
│   └── globals.css               # Estilos globais
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   ├── ImageUploader.js          # Componente de upload
│   ├── ThemeSelector.js         # Seletor de temas
│   └── ResultGallery.js         # Galeria de resultados
├── lib/
│   ├── openai.js                 # Cliente OpenAI
│   └── themes.js                 # Configuração de temas
└── public/                       # Arquivos estáticos
```

## 🎨 Temas Disponíveis

- **Natal** 🎄 - Fotografia ultra-realista de Natal mantendo características originais do pet
- **Ano Novo** 🎉 - Celebração de Ano Novo com chapéu de festa, confete e fogos
- **Carnaval** 🎭 - Celebração de Carnaval com fantasias coloridas e elementos brasileiros
- **Halloween** 🎃 - Cena de Halloween com decorações assustadoras e abóbora

## 💳 Planos e Preços

- **Gratuito**: 3 imagens/mês
- **Essential**: R$ 29,90/mês - 50 imagens/mês
- **Pro**: R$ 79,90/mês - 200 imagens/mês

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **React 19** - Biblioteca UI
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **OpenAI API** - Edição de imagens com IA (GPT-Image-1.5)
- **Clerk** - Autenticação e gerenciamento de usuários
- **Stripe** - Processamento de pagamentos e assinaturas
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **react-dropzone** - Upload de arquivos

## 📝 Como Usar

1. **Selecione suas fotos**: Arraste e solte ou clique para selecionar até 10 imagens (PNG, JPEG ou WebP, máx 4MB cada)
2. **Escolha um tema**: Selecione um dos temas festivos disponíveis
3. **Gere as imagens**: Clique em "Gerar Imagens" e aguarde o processamento
4. **Baixe os resultados**: Visualize e baixe as imagens editadas

## ⚙️ Configuração

### Variáveis de Ambiente

Todas as variáveis devem ser configuradas no arquivo `.env.local`:

- `OPENAI_API_KEY` - Sua chave de API da OpenAI (obrigatória)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Chave pública do Clerk (obrigatória)
- `CLERK_SECRET_KEY` - Chave secreta do Clerk (obrigatória)
- `CLERK_WEBHOOK_SECRET` - Secret do webhook Clerk (obrigatória)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Chave pública do Stripe (obrigatória)
- `STRIPE_SECRET_KEY` - Chave secreta do Stripe (obrigatória)
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook Stripe (obrigatória)
- `STRIPE_PRICE_ID_ESSENTIAL` - ID do preço Essential no Stripe (obrigatória)
- `STRIPE_PRICE_ID_PRO` - ID do preço Pro no Stripe (obrigatória)
- `DATABASE_URL` - URL de conexão PostgreSQL (obrigatória)
- `NEXT_PUBLIC_APP_URL` - URL da aplicação (opcional, padrão: http://localhost:3000)

### Limites

- Máximo de 10 imagens por requisição
- Tamanho máximo de 4MB por imagem
- Formatos aceitos: PNG, JPEG, WebP
- Timeout de 5 minutos para processamento

## 🐛 Solução de Problemas

### Erro: "API key não configurada"
- Verifique se o arquivo `.env.local` existe e contém `OPENAI_API_KEY`
- Certifique-se de que a API key está correta

### Erro ao processar imagens
- Verifique se a imagem está em um formato suportado (PNG, JPEG, WebP)
- Certifique-se de que a imagem não excede 4MB
- Verifique sua cota de API da OpenAI

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🙏 Agradecimentos

- OpenAI por fornecer a API de edição de imagens
- shadcn/ui pelos componentes UI incríveis
- Next.js pela excelente documentação

---

Feito com ❤️ para seus pets
