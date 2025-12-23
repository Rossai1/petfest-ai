import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { abacatePay } from '@/lib/services/abacatepay';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const billingId = searchParams.get('id');

    if (!billingId) {
      return NextResponse.json(
        { error: 'ID da cobrança não fornecido' },
        { status: 400 }
      );
    }

    // Buscar status no AbacatePay
    const billing = await abacatePay.getBillingStatus(billingId);

    return NextResponse.json({
      status: billing.status,
      paidAt: billing.paidAt,
    });
  } catch (error) {
    console.error('[API] Erro ao verificar status:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}

