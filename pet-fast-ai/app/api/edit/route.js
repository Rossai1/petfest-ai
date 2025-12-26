import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { editImage } from '@/lib/services/openai';
import { getOrCreateUser } from '@/lib/services/auth';
import { checkUsageLimit, recordImageGeneration } from '@/lib/utils/usage';
import { deductCredits } from '@/lib/database/supabase-db';
import { compressImageIfNeeded } from '@/lib/utils/image-compression';
import { uploadImageToStorage } from '@/lib/services/storage';
import { logger, logProductionError } from '@/lib/utils/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos para processar múltiplas imagens

export async function POST(request) {
  try {
    // 1. Verificar autenticação
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Não autenticado. Por favor, faça login.' },
        { status: 401 }
      );
    }

    // Obter ou criar usuário no banco
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário. Tente fazer login novamente.' },
        { status: 500 }
      );
    }

    // 2. Validar créditos do usuário ANTES de processar
    const formData = await request.formData();
    const themeId = formData.get('themeId');
    const files = formData.getAll('images');
    const numImages = files.length;

    const usageCheck = await checkUsageLimit(user);

    if (!usageCheck.canGenerate) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para gerar imagens.', code: 'NO_CREDITS', credits: 0 },
        { status: 403 }
      );
    }

    if (usageCheck.credits < numImages) {
      return NextResponse.json(
        {
          error: `Você tem ${usageCheck.credits} crédito(s), mas está tentando gerar ${numImages} imagem(ns).`,
          code: 'INSUFFICIENT_CREDITS',
          credits: usageCheck.credits,
        },
        { status: 403 }
      );
    }
    
    // 3. Validar input do formulário
    if (!themeId) {
      return NextResponse.json({ error: 'Tema não especificado' }, { status: 400 });
    }
    if (numImages === 0) {
      return NextResponse.json({ error: 'Nenhuma imagem foi enviada' }, { status: 400 });
    }
    if (numImages > 10) {
      return NextResponse.json({ error: 'Máximo de 10 imagens permitidas' }, { status: 400 });
    }

    // 4. Processar cada imagem em paralelo
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);
        buffer = await compressImageIfNeeded(buffer);
        const result = await editImage(buffer, themeId);
        const permanentUrl = await uploadImageToStorage(result.url, user.id, themeId);

        return {
          success: true,
          url: permanentUrl,
          revisedPrompt: result.revisedPrompt,
        };
      })
    );

    const formattedResults = results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      logger.error('Erro ao processar imagem individualmente:', result.reason);
      return { success: false, error: result.reason?.message || 'Erro ao processar imagem' };
    });

    // 5. Deduzir créditos e registrar uso
    const successfulResults = formattedResults.filter(r => r.success);
    const successfulGenerations = successfulResults.length;

    if (successfulGenerations > 0) {
      try {
        await deductCredits(user.id, successfulGenerations);
        
        const generationsToRecord = successfulResults.map((result) => ({
          theme: themeId,
          generatedImageUrl: result.url || '',
          originalImageUrl: '', // Não armazenamos URL original por enquanto
        }));

        // clerkId não é mais necessário, passamos null
        await recordImageGeneration(user.id, null, generationsToRecord);
      } catch (error) {
        // Se a dedução/registro falhar, a geração já ocorreu.
        // Apenas logamos o erro para análise e não falhamos a requisição.
        logProductionError(error, { 
          message: 'Falha ao deduzir créditos ou registrar geração',
          userId: user.id,
          creditsToDeduct: successfulGenerations
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/edit' });
    const isKnownError = error.code === 'NO_CREDITS' || error.code === 'INSUFFICIENT_CREDITS';

    return NextResponse.json(
      {
        error: error.message || 'Erro interno do servidor',
        code: isKnownError ? error.code : 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: isKnownError ? 403 : 500 }
    );
  }
}