import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { editImage } from '@/lib/services/openai';
import { getOrCreateUser } from '@/lib/services/clerk';
import { checkUsageLimit, recordImageGeneration } from '@/lib/utils/usage';
import { compressImageIfNeeded } from '@/lib/utils/image-compression';
import { uploadImageToStorage } from '@/lib/services/storage';
import { logger, logProductionError } from '@/lib/utils/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos para processar múltiplas imagens

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

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key não configurada no servidor' },
        { status: 500 }
      );
    }

    // Obter ou criar usuário no banco
    let user;
    try {
      user = await getOrCreateUser();
    } catch (dbError) {
      logger.error('Erro ao acessar banco de dados:', dbError);
      return NextResponse.json(
        { 
          error: 'Erro ao conectar com o banco de dados. Verifique a configuração do DATABASE_URL.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário. Tente fazer login novamente.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const themeId = formData.get('themeId');
    const files = formData.getAll('images');

    if (!themeId) {
      return NextResponse.json(
        { error: 'Tema não especificado' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Máximo de 10 imagens permitidas' },
        { status: 400 }
      );
    }

    // Uso ilimitado - não precisa verificar limites

    // Processar cada imagem
    const results = await Promise.allSettled(
      files.map(async (file) => {
        try {
          // Converter File para Buffer
          const arrayBuffer = await file.arrayBuffer();
          let buffer = Buffer.from(arrayBuffer);

          // Comprimir imagem se necessário (máximo 4MB)
          buffer = await compressImageIfNeeded(buffer);

          // Processar imagem com OpenAI
          const result = await editImage(buffer, themeId);
          
          // Fazer upload da imagem para storage permanente (Supabase)
          const permanentUrl = await uploadImageToStorage(
            result.url,
            user.id,
            themeId
          );

          return {
            success: true,
            url: permanentUrl, // Usar URL permanente em vez da temporária
            revisedPrompt: result.revisedPrompt,
          };
        } catch (error) {
          logger.error('Erro ao processar imagem:', error);
          return {
            success: false,
            error: error.message || 'Erro desconhecido ao processar imagem',
          };
        }
      })
    );

    // Formatar resultados
    const formattedResults = results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Erro ao processar imagem',
        };
      }
    });

    // Filtrar apenas gerações bem-sucedidas
    const successfulResults = formattedResults.filter(r => r.success);
    const successfulGenerations = successfulResults.length;

    // Registrar uso apenas das imagens bem-sucedidas
    if (successfulGenerations > 0) {
      // Preparar array de gerações para registro
      const generationsToRecord = successfulResults.map((result) => ({
        theme: themeId,
        generatedImageUrl: result.url || '',
        originalImageUrl: '', // Não armazenamos URL original por enquanto
      }));

      await recordImageGeneration(
        user.id, 
        user.clerkId,
        generationsToRecord
      );
    }

    return NextResponse.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/edit' });
    return NextResponse.json(
      {
        error: error.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

