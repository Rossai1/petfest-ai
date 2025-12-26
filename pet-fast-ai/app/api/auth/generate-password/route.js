import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/auth/server';
import { getSupabase } from '@/lib/database/supabase-db';
import { logger } from '@/lib/utils/logger';

/**
 * Gera senha simples de 8 caracteres (letras minúsculas + números)
 */
function generateSimplePassword() {
  return Math.random().toString(36).slice(-8);
}

/**
 * API Route para gerar senha automaticamente quando cliente compra na Kiwify
 * Chamada pelo n8n após inserir dados na kiwify_webhooks
 * 
 * Protegido com token secreto (variável de ambiente PASSWORD_GENERATOR_SECRET)
 */
export async function POST(request) {
  try {
    // Verificar autenticação (token secreto)
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.PASSWORD_GENERATOR_SECRET}`;
    
    if (!process.env.PASSWORD_GENERATOR_SECRET) {
      logger.error('PASSWORD_GENERATOR_SECRET não configurado');
      return NextResponse.json(
        { error: 'Configuração do servidor inválida' },
        { status: 500 }
      );
    }

    if (authHeader !== expectedToken) {
      logger.warn('Tentativa de acesso não autorizado à generate-password');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Parse do body
    const body = await request.json();
    const { email, plan, credits } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar se usuário já existe na tabela kiwify_webhooks
    const supabase = getSupabase();
    const { data: existingUser, error: fetchError } = await supabase
      .from('kiwify_webhooks')
      .select('id, email, temporary_password, password_sent')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('Erro ao buscar usuário:', fetchError);
      throw fetchError;
    }

    // Gerar senha
    const generatedPassword = generateSimplePassword();

    // Criar usuário no Supabase Auth (se ainda não existir)
    const adminClient = createAdminClient();
    
    let authUser;
    try {
      // Tentar criar usuário (se já existir, vai falhar, mas não importa)
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        email_confirm: true, // Confirmar email automaticamente
      });

      if (createError) {
        // Se erro for "user already exists", tentar buscar usuário existente
        if (createError.message.includes('already registered') || createError.status === 422) {
          const { data: existingAuthUser } = await adminClient.auth.admin.getUserByEmail(normalizedEmail);
          authUser = existingAuthUser?.user;
          
          // Atualizar senha do usuário existente
          if (authUser) {
            await adminClient.auth.admin.updateUserById(authUser.id, {
              password: generatedPassword,
            });
            logger.info(`Senha atualizada para usuário existente: ${normalizedEmail}`);
          }
        } else {
          throw createError;
        }
      } else {
        authUser = newUser.user;
        logger.info(`Novo usuário criado no Supabase Auth: ${normalizedEmail}`);
      }
    } catch (authError) {
      logger.error('Erro ao criar/atualizar usuário no Supabase Auth:', authError);
      throw authError;
    }

    // Atualizar kiwify_webhooks com senha gerada e auth_user_id
    const updateData = {
      temporary_password: generatedPassword,
      password_generated_at: new Date().toISOString(),
      password_sent: false,
      auth_user_id: authUser?.id || null, // Vincular ao auth.users.id
    };

    // Se plan ou credits foram fornecidos, também atualizar
    if (plan) updateData.plan = plan;
    if (credits !== undefined) updateData.credits = credits;

    let finalUser;
    if (existingUser) {
      // Atualizar registro existente
      const { data: updatedUser, error: updateError } = await supabase
        .from('kiwify_webhooks')
        .update(updateData)
        .eq('email', normalizedEmail)
        .select('id, email, temporary_password, password_generated_at')
        .single();

      if (updateError) {
        logger.error('Erro ao atualizar kiwify_webhooks:', updateError);
        throw updateError;
      }
      finalUser = updatedUser;
    } else {
      // Criar novo registro (se não existir)
      const { data: newRecord, error: insertError } = await supabase
        .from('kiwify_webhooks')
        .insert({
          email: normalizedEmail,
          ...updateData,
          plan: plan || 'free',
          credits: credits ?? 3,
        })
        .select('id, email, temporary_password, password_generated_at')
        .single();

      if (insertError) {
        logger.error('Erro ao inserir em kiwify_webhooks:', insertError);
        throw insertError;
      }
      finalUser = newRecord;
    }

    logger.info(`Senha gerada para ${normalizedEmail}: ${generatedPassword.substring(0, 3)}***`);

    // Retornar senha gerada (não incluir em logs de produção)
    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      password: generatedPassword,
      password_generated_at: finalUser.password_generated_at,
    });

  } catch (error) {
    logger.error('Erro em /api/auth/generate-password:', {
      errorMessage: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Erro interno ao gerar senha',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}



