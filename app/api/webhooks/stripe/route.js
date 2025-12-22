import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { getPlanLimits } from '@/lib/pricing';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret não configurado' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Erro ao verificar webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Obter o price ID da assinatura
        const priceId = subscription.items.data[0]?.price?.id;
        
        // Determinar o plano baseado no price ID (minúsculo para match com banco)
        let planType = 'free';
        if (priceId === process.env.STRIPE_PRICE_ID_ESSENTIAL) {
          planType = 'essential';
        } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          planType = 'pro';
        }

        // Obter limite de créditos do plano
        const newCredits = getPlanLimits(planType);

        // Atualizar usuário no banco
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            planType: planType,
            creditsRemaining: newCredits, // Reset créditos ao fazer upgrade
          },
        });

        console.log(`Assinatura ${event.type} - Cliente ${customerId} atualizado para plano ${planType} com ${newCredits} créditos`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Rebaixar para plano free
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            planType: 'free',
            creditsRemaining: getPlanLimits('free'),
          },
        });

        console.log(`Assinatura cancelada - Cliente ${customerId} rebaixado para free`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`Pagamento bem-sucedido para invoice ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`Pagamento falhou para invoice ${invoice.id}`);
        // Aqui você pode implementar lógica para notificar o usuário
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

