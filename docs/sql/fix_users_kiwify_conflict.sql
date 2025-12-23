-- ============================================================================
-- Script para investigar e corrigir conflitos entre users e kiwify_webhooks
-- Execute este script no SQL Editor do Supabase, seção por seção
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: DIAGNÓSTICO
-- Execute estas queries primeiro para entender o problema
-- ============================================================================

-- 1.1. Verificar constraint unique_email na tabela users
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'unique_email';

-- 1.2. Verificar se há emails duplicados na tabela users (case-insensitive)
SELECT 
    LOWER(TRIM(email)) as normalized_email,
    COUNT(*) as count,
    array_agg(id ORDER BY created_at DESC, id DESC) as user_ids,
    array_agg(email ORDER BY created_at DESC, id DESC) as emails,
    array_agg(created_at ORDER BY created_at DESC, id DESC) as created_dates
FROM public.users
WHERE email IS NOT NULL
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 1.3. Verificar emails na kiwify_webhooks que não estão normalizados
SELECT 
    email as original_email,
    LOWER(TRIM(email)) as normalized_email,
    COUNT(*) as webhook_count,
    COUNT(DISTINCT order_id) as unique_orders
FROM public.kiwify_webhooks
WHERE email IS NOT NULL
GROUP BY email, LOWER(TRIM(email))
HAVING email != LOWER(TRIM(email))
ORDER BY webhook_count DESC
LIMIT 20;

-- 1.4. Verificar correspondência entre kiwify_webhooks e users
SELECT 
    LOWER(TRIM(kw.email)) as normalized_webhook_email,
    COUNT(DISTINCT kw.id) as webhook_count,
    COUNT(DISTINCT u.id) as user_count,
    array_agg(DISTINCT u.id) as user_ids,
    array_agg(DISTINCT u.email) as user_emails,
    BOOL_OR(u.clerk_id IS NOT NULL) as has_any_linked_clerk
FROM public.kiwify_webhooks kw
LEFT JOIN public.users u ON LOWER(TRIM(u.email)) = LOWER(TRIM(kw.email))
WHERE kw.email IS NOT NULL
  AND kw.event_type = 'order_approved'
GROUP BY LOWER(TRIM(kw.email))
ORDER BY webhook_count DESC
LIMIT 50;

-- ============================================================================
-- SEÇÃO 2: CORREÇÕES
-- Execute estas queries apenas após revisar os resultados da SEÇÃO 1
-- ============================================================================

-- 2.1. Normalizar emails na tabela users (corrigir casos onde email não está normalizado)
-- ATENÇÃO: Execute com cuidado! Faça backup antes.
-- Esta query normaliza todos os emails para lowercase e remove espaços
UPDATE public.users
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL 
  AND email != LOWER(TRIM(email));

-- 2.2. Verificar resultado da normalização
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT LOWER(TRIM(email))) as unique_normalized_emails
FROM public.users
WHERE email IS NOT NULL;

-- 2.3. Remover duplicatas mantendo apenas o registro mais recente
-- ATENÇÃO: Execute apenas se a query 1.2 mostrar duplicatas!
-- Esta query mantém o registro mais recente baseado em created_at e id
WITH duplicates AS (
    SELECT 
        id,
        email,
        LOWER(TRIM(email)) as normalized_email,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(email)) 
            ORDER BY 
                COALESCE(created_at, '1970-01-01'::timestamptz) DESC,
                id DESC
        ) as rn
    FROM public.users
    WHERE email IS NOT NULL
)
SELECT 
    id,
    email,
    normalized_email,
    created_at,
    rn
FROM duplicates
WHERE rn > 1
ORDER BY normalized_email, rn;
-- Se quiser DELETAR as duplicatas, descomente a query abaixo:
/*
WITH duplicates AS (
    SELECT 
        id,
        LOWER(TRIM(email)) as normalized_email,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(email)) 
            ORDER BY 
                COALESCE(created_at, '1970-01-01'::timestamptz) DESC,
                id DESC
        ) as rn
    FROM public.users
    WHERE email IS NOT NULL
)
DELETE FROM public.users
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);
*/

-- 2.4. Garantir que a constraint unique_email existe e está funcionando
-- Se a constraint não existir, ela será criada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_email'
          AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT unique_email UNIQUE (email);
        RAISE NOTICE 'Constraint unique_email criada com sucesso';
    ELSE
        RAISE NOTICE 'Constraint unique_email já existe';
    END IF;
END $$;

-- 1.5. Verificar estrutura da tabela kiwify_webhooks
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'kiwify_webhooks'
ORDER BY ordinal_position;

-- 1.6. Verificar estrutura da tabela users (campos relacionados)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('id', 'email', 'clerk_id', 'credits', 'plan', 'last_reset_at', 'created_at')
ORDER BY ordinal_position;

-- ============================================================================
-- SEÇÃO 3: VERIFICAÇÕES PÓS-CORREÇÃO
-- Execute estas queries após aplicar as correções
-- ============================================================================

-- 3.1. Verificar se ainda há duplicatas após normalização
SELECT 
    LOWER(TRIM(email)) as normalized_email,
    COUNT(*) as count
FROM public.users
WHERE email IS NOT NULL
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

-- 3.2. Verificar integridade dos dados
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT clerk_id) FILTER (WHERE clerk_id IS NOT NULL) as unique_clerk_ids,
    COUNT(*) FILTER (WHERE clerk_id IS NULL) as users_without_clerk,
    COUNT(*) FILTER (WHERE email IS NULL) as users_without_email
FROM public.users;

