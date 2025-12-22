import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser } from '@/lib/supabase-db';
import { currentUser } from '@clerk/nextjs/server';
import { getPlanLimits } from '@/lib/pricing';

const ADMIN_EMAIL = 'wesleykrzyzanovski@gmail.com';

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
    console.error('Erro ao obter créditos:', error);
    return NextResponse.json(
      { error: 'Erro ao obter créditos' },
      { status: 500 }
    );
  }
}
