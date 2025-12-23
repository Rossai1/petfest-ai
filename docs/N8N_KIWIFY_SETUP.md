# Configuracao n8n + Kiwify (Creditos e Planos)

## Objetivo
Receber uma compra aprovada na Kiwify, somar creditos e atualizar o plano no Supabase (tabela `users`) usando o email do comprador.

## Pre-requisitos
- Supabase URL e Service Role Key.
- Token/assinatura do webhook da Kiwify (conforme painel da Kiwify).
- Workflow n8n com acesso ao ambiente externo.

## Variaveis sugeridas no n8n
- `KIWIFY_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Mapeamento de produtos
Defina o mapeamento entre produto Kiwify e plano/creditos:

| Produto (ID ou nome) | plan | credits_to_add |
|----------------------|------|----------------|
| PRODUTO_ESSENTIAL    | essential | 50 |
| PRODUTO_PRO          | pro | 180 |

## Workflow n8n (passo a passo)

### 1) Webhook Trigger
- Metodo: `POST`
- Path: escolha um caminho fixo (ex: `/kiwify/webhook`)
- Resposta: `200` com corpo simples (ex: `{ "ok": true }`)

### 2) Validacao de seguranca
Valide o token/assinatura enviado pela Kiwify:
- Compare o header ou query param recebido com `KIWIFY_WEBHOOK_SECRET`.
- Se invalido, retorne `401` e finalize o fluxo.

> Obs: o nome exato do header e formato da assinatura dependem da Kiwify. Ajuste conforme a documentacao oficial.

### 3) Normalizar payload
Use um node `Set` ou `Function` para extrair:
- `email` do comprador
- `product_id` (ou `product_name`)
- `status` do pedido

### 4) Filtrar evento aprovado
Use um `IF` para permitir apenas eventos aprovados (ex: `status == "approved"`).

### 5) Mapear plano e creditos
Node `Function` (ajuste os campos conforme seu payload):

```javascript
const map = {
  'PRODUTO_ESSENTIAL': { plan: 'essential', credits_to_add: 50 },
  'PRODUTO_PRO': { plan: 'pro', credits_to_add: 180 },
};

const productId = $json.product_id; // ajuste para o campo real
const item = map[productId];

if (!item) {
  throw new Error(`Produto nao mapeado: ${productId}`);
}

return [{ ...$json, ...item }];
```

### 6) Buscar creditos atuais (Supabase)
Use um `HTTP Request`:
- Metodo: `GET`
- URL: `{{$env.SUPABASE_URL}}/rest/v1/users`
- Query: `select=credits&email=eq.{{$json.email}}`
- Headers:
  - `apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
  - `Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}`

### 7) Calcular novo saldo
Node `Function` (use o primeiro item do array retornado):

```javascript
const current = Array.isArray($json) && $json[0] ? ($json[0].credits || 0) : 0;
return [{
  ...$json,
  current_credits: current,
  new_credits: current + $json.credits_to_add,
}];
```

### 8) Upsert no Supabase
Use um `HTTP Request`:
- Metodo: `POST`
- URL: `{{$env.SUPABASE_URL}}/rest/v1/users?on_conflict=email`
- Headers:
  - `apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
  - `Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
  - `Prefer: resolution=merge-duplicates`
  - `Content-Type: application/json`
- Body (JSON):

```json
[
  {
    "email": "{{$json.email}}",
    "credits": "{{$json.new_credits}}",
    "plan": "{{$json.plan}}"
  }
]
```

> Nao envie `clerk_id` para evitar sobrescrever usuarios ja vinculados.

## Observacoes
- Para atualizacao atomica, considere criar uma RPC `add_credits_by_email` no Supabase e chamar via `/rest/v1/rpc/add_credits_by_email`.
- Para evitar duplicidade (webhook reenviado), considere registrar o `order_id` em uma tabela de transacoes (opcional).

## Teste rapido
1. Use o modo de teste do webhook no n8n com um payload real da Kiwify.
2. Verifique no Supabase se `credits` e `plan` foram atualizados.
