import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUserFast, getRecentGenerations } from '@/lib/supabase-db';
import { currentUser } from '@clerk/nextjs/server';
import { getPlanLimits } from '@/lib/pricing';

/**
 * API de uso otimizada com Supabase direto
 * Histórico é opcional para performance
 */
export async function GET(request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar email do Clerk
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    // Obter ou criar usuário
    const user = await getOrCreateUserFast(clerkId, email);

    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário' },
        { status: 500 }
      );
    }

    const imagesLimit = getPlanLimits(user.planType);

    // Verificar se deve incluir histórico (padrão: false para performance)
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const historyLimit = parseInt(searchParams.get('limit') || '20', 10);

    const response = {
      usage: {
        creditsRemaining: user.creditsRemaining,
        imagesLimit,
        plan: user.planType,
      },
    };

    // Só buscar histórico se solicitado (economiza tempo)
    if (includeHistory) {
      const history = await getRecentGenerations(user.id, Math.min(historyLimit, 50));
      response.history = history.map((item) => ({
        id: item.id,
        theme: item.theme,
        generatedImageUrl: item.generatedImageUrl,
        originalImageUrl: item.originalImageUrl,
        createdAt: item.createdAt,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao obter uso:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao obter uso',
      },
      { status: 500 }
    );
  }
}
