import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getRecentGenerations } from '@/lib/database/supabase-db';
import { logProductionError } from '@/lib/utils/logger';

/**
 * API otimizada para buscar resultados recentes
 * Não precisa chamar Clerk currentUser (mais rápido)
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuário direto do Supabase
    const user = await getUserByClerkId(clerkId);

    if (!user) {
      // Usuário não existe ainda, retornar vazio
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    // Buscar gerações recentes
    const generations = await getRecentGenerations(user.id, 10);

    // Converter para formato de results
    const results = generations.map((item) => ({
      success: true,
      url: item.generatedImageUrl,
      error: null,
      revisedPrompt: null,
    }));

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/recent-results' });
    return NextResponse.json(
      {
        error: error.message || 'Erro ao obter resultados recentes',
      },
      { status: 500 }
    );
  }
}
