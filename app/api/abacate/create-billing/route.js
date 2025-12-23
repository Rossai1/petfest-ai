import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { abacatePay } from '@/lib/services/abacatepay';
import { getPackageData } from '@/lib/data/packages';
import { prisma } from '@/lib/database/db';

export async function POST(request) {
  // #region agent log
  const fs = require('fs');
  fs.appendFileSync('/Users/wesleyrossa/Documents/projetos-pessoais/Ross AI/pet-fast-ai/.cursor/debug.log', JSON.stringify({location:'api/abacate/create-billing/route.js:7',message:'API route hit',data:{url:request.url,method:request.method},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'initial'})+'\n');
  // #endregion
  
  try {
    const { userId: clerkUserId } = await auth();
    
    // #region agent log
    fs.appendFileSync('/Users/wesleyrossa/Documents/projetos-pessoais/Ross AI/pet-fast-ai/.cursor/debug.log', JSON.stringify({location:'api/abacate/create-billing/route.js:12',message:'Auth result',data:{authenticated:!!clerkUserId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'initial'})+'\n');
    // #endregion
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { plan, type } = await request.json();
    
    // Validar parâmetros
    if (!plan || !type) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 400 }
      );
    }

    const packageData = getPackageData(plan, type);
    if (!packageData) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Buscar ou criar usuário no banco
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {},
      create: {
        clerkId: clerkUserId,
        email: email,
        creditsRemaining: 3,
        planType: 'free',
      },
    });

    const credits = type === 'subscription' 
      ? packageData.creditsPerMonth 
      : packageData.credits;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (type === 'subscription') {
      // Criar assinatura recorrente (cartão)
      const subscription = await abacatePay.createSubscription({
        customer: {
          name: clerkUser.fullName || clerkUser.firstName || 'Cliente',
          email: email,
        },
        plan: {
          name: packageData.name,
          price: packageData.priceInCents,
          frequency: 'MONTHLY',
        },
        metadata: {
          userId: user.id,
          clerkId: clerkUserId,
          plan: plan,
          credits: credits,
          type: 'subscription',
        },
        returnUrl: `${appUrl}/app?payment=success`,
        completionUrl: `${appUrl}/app?payment=success`,
      });

      // Salvar transação no banco
      await prisma.transaction.create({
        data: {
          userId: user.id,
          provider: 'abacatepay',
          transactionId: subscription.id,
          type: 'subscription',
          planName: plan,
          amount: packageData.priceInCents,
          credits: credits,
          status: 'pending',
        },
      });

      return NextResponse.json({
        checkoutUrl: subscription.checkoutUrl,
        subscriptionId: subscription.id,
      });
    } else {
      // Criar cobrança PIX (pagamento único)
      const billing = await abacatePay.createBilling({
        customer: {
          name: clerkUser.fullName || clerkUser.firstName || 'Cliente',
          email: email,
        },
        products: [{
          name: packageData.name,
          description: packageData.description,
          quantity: 1,
          price: packageData.priceInCents,
        }],
        metadata: {
          userId: user.id,
          clerkId: clerkUserId,
          plan: plan,
          credits: credits,
          type: 'pix',
        },
        returnUrl: `${appUrl}/app?payment=success`,
        completionUrl: `${appUrl}/app?payment=success`,
      });

      // Salvar transação no banco
      await prisma.transaction.create({
        data: {
          userId: user.id,
          provider: 'abacatepay',
          transactionId: billing.id,
          type: 'pix',
          planName: plan,
          amount: packageData.priceInCents,
          credits: credits,
          status: 'pending',
        },
      });

      return NextResponse.json({
        qrCode: billing.qrCode,
        qrCodeUrl: billing.qrCodeUrl,
        billingId: billing.id,
      });
    }
  } catch (error) {
    console.error('[API] Erro ao criar cobrança:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

