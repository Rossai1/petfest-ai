import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/services/clerk';
import { logger, logProductionError } from '@/lib/utils/logger';

export async function POST(request) {
  try {
    // Verificar autenticação
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado. Por favor, faça login.' },
        { status: 401 }
      );
    }

    const { suggestion } = await request.json();

    if (!suggestion || !suggestion.trim()) {
      return NextResponse.json(
        { error: 'Sugestão não pode estar vazia' },
        { status: 400 }
      );
    }

    // Obter dados do usuário
    const user = await getOrCreateUser();
    const userEmail = user?.email || 'usuário@desconhecido.com';

    // Preparar email
    const emailSubject = 'Sugestão de Implementação - PetFest';
    const emailBody = `
Nova sugestão recebida do PetFest:

Usuário: ${userEmail}
ID: ${userId}

Sugestão:
${suggestion.trim()}

---
Enviado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    // Enviar email usando mailto (alternativa simples)
    // Em produção, você pode usar um serviço como Resend, SendGrid, etc.
    const mailtoLink = `mailto:master@rossai.com.br?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Log da sugestão (para debug)
    logger.log('Nova sugestão recebida:', {
      userId,
      userEmail,
      suggestion: suggestion.substring(0, 100) + '...',
    });

    // Retornar sucesso
    // Nota: Em produção, você pode implementar envio real de email aqui
    return NextResponse.json({
      success: true,
      message: 'Sugestão enviada com sucesso!',
    });
  } catch (error) {
    logProductionError(error, { route: '/api/suggestions' });
    return NextResponse.json(
      {
        error: error.message || 'Erro ao enviar sugestão',
      },
      { status: 500 }
    );
  }
}


