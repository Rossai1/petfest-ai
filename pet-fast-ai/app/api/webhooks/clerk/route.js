import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/database/db';
import { logger, logProductionError } from '@/lib/utils/logger';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret não configurado' },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Headers do webhook ausentes' },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    logger.error('Erro ao verificar webhook:', err);
    return NextResponse.json(
      { error: 'Erro ao verificar webhook' },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  try {
    switch (eventType) {
      case 'user.created': {
        const email = email_addresses[0]?.email_address;

        if (!email) {
          return NextResponse.json(
            { error: 'Email não encontrado' },
            { status: 400 }
          );
        }

        // Criar usuário no banco
        await prisma.user.create({
          data: {
            clerkId: id,
            email: email,
          },
        });

        logger.log(`Usuário criado: ${id} (${email})`);
        break;
      }

      case 'user.updated': {
        const email = email_addresses[0]?.email_address;

        if (email) {
          await prisma.user.update({
            where: { clerkId: id },
            data: { email: email },
          });
        }

        logger.log(`Usuário atualizado: ${id}`);
        break;
      }

      case 'user.deleted': {
        await prisma.user.delete({
          where: { clerkId: id },
        });

        logger.log(`Usuário deletado: ${id}`);
        break;
      }

      default:
        logger.log(`Evento não tratado: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logProductionError(error, { route: '/api/webhooks/clerk' });
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}


