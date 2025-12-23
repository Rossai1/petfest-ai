import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-abacate-signature');

    // Verificar assinatura do webhook
    if (process.env.ABACATEPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.ABACATEPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('[Webhook] Assinatura inválida');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    console.log('[Webhook] Evento recebido:', event.event);

    // Processar pagamento confirmado (PIX ou assinatura)
    if (event.event === 'BILLING_PAID' || event.event === 'SUBSCRIPTION_PAID') {
      const { id } = event.data;

      const transaction = await prisma.transaction.findUnique({
        where: { transactionId: id },
        include: { user: true },
      });

      if (!transaction) {
        console.error('[Webhook] Transação não encontrada:', id);
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      if (transaction.status === 'paid') {
        console.log('[Webhook] Transação já processada:', id);
        return NextResponse.json({ received: true, message: 'Already processed' });
      }

      console.log('[Webhook] Processando pagamento:', {
        transactionId: id,
        userId: transaction.userId,
        credits: transaction.credits,
      });

      // Atualizar status da transação e adicionar créditos ao usuário
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            creditsRemaining: {
              increment: transaction.credits,
            },
            // Atualizar planType se for assinatura
            ...(transaction.type === 'subscription' && {
              planType: transaction.planName,
            }),
          },
        }),
      ]);

      console.log('[Webhook] Pagamento processado com sucesso:', id);
    }

    // Processar cancelamento de assinatura
    if (event.event === 'SUBSCRIPTION_CANCELED') {
      const { id } = event.data;

      const transaction = await prisma.transaction.findUnique({
        where: { transactionId: id },
        include: { user: true },
      });

      if (transaction) {
        console.log('[Webhook] Cancelando assinatura:', {
          transactionId: id,
          userId: transaction.userId,
        });

        // Voltar usuário para plano free
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            planType: 'free',
          },
        });

        console.log('[Webhook] Assinatura cancelada com sucesso:', id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

