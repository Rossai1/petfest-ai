import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/services/clerk';
import { getRecentGenerations } from '@/lib/database/supabase-db';
import { checkUsageLimit } from '@/lib/utils/usage';
import { logger } from '@/lib/utils/logger';

/**
 * API UNIFICADA - Retorna dados do usuário, incluindo gerações e créditos.
 * Lida com a criação/vinculação de usuários e o reset de créditos para o plano free.
 */
export async function GET() {
  try {
    // 1. Obter ou criar usuário (lida com vinculação de contas n8n)
    const userResult = await getOrCreateUser();

    if (!userResult) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // `userResult` pode conter { ...user, linkedCredits: true/false }
    const { linkedCredits, ...user } = userResult;

    // Validar que o usuário tem os campos necessários
    if (!user || !user.id) {
      logger.error('Usuário inválido retornado de getOrCreateUser:', user);
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário' },
        { status: 500 }
      );
    }

    // 2. Verificar uso e resetar créditos do plano free, se aplicável
    const usageCheck = await checkUsageLimit(user);
    
    if (!usageCheck || !usageCheck.user) {
      logger.error('checkUsageLimit retornou resultado inválido:', usageCheck);
      return NextResponse.json(
        { error: 'Erro ao verificar créditos do usuário' },
        { status: 500 }
      );
    }
    
    const { wasReset, user: currentUser } = usageCheck;

    // 3. Buscar gerações recentes
    const generations = await getRecentGenerations(currentUser.id, 10);
    const results = generations.map((item) => ({
      success: true,
      url: item.generatedImageUrl,
      error: null,
      revisedPrompt: null,
    }));

    // 4. Retornar dados consolidados
    return NextResponse.json({
      results,
      credits: currentUser.credits ?? 0,
      plan: currentUser.plan ?? 'free',
      linkedCredits: linkedCredits || false,
      wasReset: wasReset || false,
    });
    
  } catch (error) {
    logger.error('Erro em /api/user-data:', { 
      errorMessage: error.message,
      stack: error.stack,
      errorName: error.name
    });
    
    // Retornar JSON mesmo em caso de erro para evitar HTML
    return NextResponse.json(
      { 
        error: 'Erro interno ao obter dados do usuário.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}