import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateStripeCustomer, createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/services/stripe';
import { getOrCreateUser } from '@/lib/services/clerk';
import { logProductionError } from '@/lib/utils/logger';

export async function POST(request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (!plan || !['ESSENTIAL', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Obter ou criar usuário no banco
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário' },
        { status: 500 }
      );
    }

    // Obter email do Clerk (já temos o user, mas precisamos do email para Stripe)
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 400 }
      );
    }

    // Obter ou criar cliente Stripe
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const { prisma } = await import('@/lib/database/db');
      const customer = await getOrCreateStripeCustomer(email, clerkUserId);
      stripeCustomerId = customer.id;

      // Salvar customer ID no banco
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Obter price ID do plano
    const priceId = STRIPE_PRICE_IDS[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Preço do plano não configurado' },
        { status: 500 }
      );
    }

    // Criar sessão de checkout
    const session = await createCheckoutSession(priceId, stripeCustomerId, user.id);

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/checkout' });
    return NextResponse.json(
      {
        error: error.message || 'Erro ao criar sessão de checkout',
      },
      { status: 500 }
    );
  }
}

