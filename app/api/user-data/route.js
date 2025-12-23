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

    // 2. Verificar uso e resetar créditos do plano free, se aplicável
    const usageCheck = await checkUsageLimit(user);
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
      credits: currentUser.credits,
      plan: currentUser.plan,
      linkedCredits: linkedCredits || false,
      wasReset: wasReset || false,
    });
    
  } catch (error) {
    logger.error('Erro em /api/user-data:', { 
      errorMessage: error.message,
      stack: error.stack 
    });
    return NextResponse.json(
      { error: 'Erro interno ao obter dados do usuário.' },
      { status: 500 }
    );
  }
}