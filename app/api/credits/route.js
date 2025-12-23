import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser } from '@/lib/database/supabase-db';
import { currentUser } from '@clerk/nextjs/server';
import { getPlanLimits } from '@/lib/data/pricing';
import { ADMIN_EMAIL } from '@/lib/config/config';
import { logProductionError } from '@/lib/utils/logger';

/**
 * API otimizada para retornar APENAS créditos do usuário
 * Evita chamadas desnecessárias ao Clerk
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

    // Primeiro, tentar buscar usuário existente (mais comum)
    let user = await getUserByClerkId(clerkId);

    // Se usuário não existe, precisamos criar (só acontece uma vez)
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        return NextResponse.json({
          creditsRemaining: 3,
          imagesLimit: 3,
          plan: 'free',
        });
      }
      
      const isAdmin = email === ADMIN_EMAIL;
      user = await createUser(clerkId, email, isAdmin);
    }

    const imagesLimit = getPlanLimits(user.planType);

    return NextResponse.json({
      creditsRemaining: user.creditsRemaining,
      imagesLimit,
      plan: user.planType,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/credits' });
    return NextResponse.json(
      { error: 'Erro ao obter créditos' },
      { status: 500 }
    );
  }
}
