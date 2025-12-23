import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getRecentGenerations, createUser } from '@/lib/database/supabase-db';
import { currentUser } from '@clerk/nextjs/server';
import { getPlanLimits } from '@/lib/data/pricing';
import { ADMIN_EMAIL } from '@/lib/config/config';
import { logProductionError } from '@/lib/utils/logger';

/**
 * API UNIFICADA OTIMIZADA - Retorna créditos E histórico em uma única chamada
 * Evita chamadas desnecessárias ao Clerk (só chama currentUser se precisar criar usuário)
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

    // Primeiro, buscar usuário existente (caso mais comum - muito rápido)
    let user = await getUserByClerkId(clerkId);

    // Se usuário não existe, criar (acontece só na primeira vez)
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        return NextResponse.json({
          credits: { creditsRemaining: 3, imagesLimit: 3, plan: 'free' },
          results: [],
        });
      }
      
      const isAdmin = email === ADMIN_EMAIL;
      user = await createUser(clerkId, email, isAdmin);
    }

    // Buscar gerações em paralelo (não depende de currentUser)
    const generations = await getRecentGenerations(user.id, 10);

    const results = generations.map((item) => ({
      success: true,
      url: item.generatedImageUrl,
      error: null,
      revisedPrompt: null,
    }));

    const imagesLimit = getPlanLimits(user.planType);

    return NextResponse.json({
      credits: {
        creditsRemaining: user.creditsRemaining,
        imagesLimit,
        plan: user.planType,
      },
      results,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/user-data' });
    return NextResponse.json(
      { error: error.message || 'Erro ao obter dados' },
      { status: 500 }
    );
  }
}
