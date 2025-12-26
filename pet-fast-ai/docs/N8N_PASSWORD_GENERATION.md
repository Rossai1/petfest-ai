# Configuração do n8n para Geração Automática de Senha

## Visão Geral

Após a compra na Kiwify, o n8n deve:
1. Inserir dados na tabela `kiwify_webhooks`
2. Chamar API para gerar senha automaticamente
3. Buscar senha gerada e enviar por email ao cliente

## Passo a Passo no n8n

### 1. Variável de Ambiente

No n8n, adicione a variável de ambiente:
- **Nome**: `PASSWORD_GENERATOR_SECRET`
- **Valor**: Um token secreto qualquer (ex: gere com `openssl rand -hex 32`)
- **Uso**: Autenticação para chamar a API de geração de senha

No seu projeto Next.js, adicione a mesma variável no `.env.local`:
```
PASSWORD_GENERATOR_SECRET=seu_token_secreto_aqui
```

### 2. Após Inserir Dados na kiwify_webhooks

Adicione um node `HTTP Request` após o node que faz UPSERT na tabela:

**Configuração**:
- **Método**: `POST`
- **URL**: `{{$env.NEXT_PUBLIC_SUPABASE_URL}}/api/auth/generate-password`
  - Ou se estiver rodando localmente: `http://localhost:3000/api/auth/generate-password`
- **Headers**:
  ```
  Authorization: Bearer {{$env.PASSWORD_GENERATOR_SECRET}}
  Content-Type: application/json
  ```
- **Body (JSON)**:
  ```json
  {
    "email": "{{$json.email.toLowerCase().trim()}}",
    "plan": "{{$json.plan}}",
    "credits": {{$json.new_credits}}
  }
  ```

**Response esperado**:
```json
{
  "success": true,
  "email": "cliente@example.com",
  "password": "abc12345",
  "password_generated_at": "2025-01-23T12:00:00.000Z"
}
```

### 3. Enviar Email ao Cliente

Use o node `Email Send` ou `HTTP Request` para seu provedor de email:

**Template de Email**:
```
Assunto: Suas credenciais de acesso - PetFest

Olá!

Sua compra foi confirmada com sucesso. Seguem suas credenciais de acesso:

Email: {{$json.email}}
Senha temporária: {{$json.password}}

Link para login: {{$env.APP_URL}}/login

⚠️ IMPORTANTE: 
- Esta é uma senha temporária
- Recomendamos alterar sua senha após o primeiro login
- Mantenha suas credenciais em local seguro

Bem-vindo ao PetFest!
```

### 4. Marcar Senha como Enviada (Opcional)

Após enviar o email, você pode marcar a senha como enviada:

**HTTP Request**:
- **Método**: `PATCH`
- **URL**: `{{$env.SUPABASE_URL}}/rest/v1/kiwify_webhooks?email=eq.{{$json.email}}`
- **Headers**:
  ```
  apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Prefer: return=representation
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "password_sent": true
  }
  ```

## Fluxo Completo

```mermaid
flowchart TD
    A[Webhook Kiwify] -->|Recebe compra| B[n8n]
    B -->|UPSERT| C[kiwify_webhooks]
    C -->|POST| D[/api/auth/generate-password]
    D -->|Gera senha| E[Supabase Auth]
    E -->|Cria usuário| F[kiwify_webhooks atualizado]
    F -->|Retorna senha| D
    D -->|Response| B
    B -->|Envia email| G[Cliente]
    G -->|Login| H[Sistema]
```

## Exemplo de Workflow n8n

1. **Webhook Node** (recebe da Kiwify)
2. **Set Node** (normaliza email: `email.toLowerCase().trim()`)
3. **HTTP Request** (UPSERT em kiwify_webhooks)
4. **HTTP Request** (POST para `/api/auth/generate-password`)
5. **IF Node** (verifica se `success === true`)
6. **Email Send** (envia credenciais)
7. **HTTP Request** (PATCH para marcar `password_sent = true`)

## Segurança

- Nunca exponha `PASSWORD_GENERATOR_SECRET` publicamente
- Use sempre HTTPS em produção
- A senha é gerada automaticamente e única para cada usuário
- Senhas temporárias devem ser alteradas no primeiro login

## Troubleshooting

**Erro 401 (Não autorizado)**:
- Verifique se `PASSWORD_GENERATOR_SECRET` está configurado corretamente
- Verifique se o header `Authorization` está sendo enviado corretamente

**Erro 500 (Erro interno)**:
- Verifique os logs do servidor Next.js
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurado
- Verifique se o email está sendo normalizado corretamente

**Usuário já existe**:
- A API atualiza a senha do usuário existente automaticamente
- O cliente receberá a nova senha por email





