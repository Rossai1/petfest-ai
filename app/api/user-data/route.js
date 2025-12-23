import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getRecentGenerations, createUser } from '@/lib/database/supabase-db';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAIL } from '@/lib/config/config';
import { logProductionError } from '@/lib/utils/logger';

/**
 * API UNIFICADA - Retorna histórico de gerações
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
          results: [],
        });
      }
      
      const isAdmin = email === ADMIN_EMAIL;
      user = await createUser(clerkId, email, isAdmin);
    }

    // Buscar gerações
    const generations = await getRecentGenerations(user.id, 10);

    const results = generations.map((item) => ({
      success: true,
      url: item.generatedImageUrl,
      error: null,
      revisedPrompt: null,
    }));

    return NextResponse.json({
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
