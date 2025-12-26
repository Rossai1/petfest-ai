import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/services/clerk';
import { getSupabase } from '@/lib/database/supabase-db';
import { themes } from '@/lib/data/themes-data';
import { logger, logProductionError } from '@/lib/utils/logger';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    // Buscar prompts do banco de dados (Supabase)
    const supabase = getSupabase();
    const { data: themesFromDb, error: fetchError } = await supabase
      .from('themes')
      .select('slug, prompt');
    
    if (fetchError) {
      logger.error('Erro ao buscar temas do banco:', fetchError);
    }
    
    // Criar objeto com prompts do banco
    const promptsFromDb = {};
    if (themesFromDb) {
      themesFromDb.forEach((theme) => {
        promptsFromDb[theme.slug] = theme.prompt;
      });
    }

    // Mesclar com prompts padrão (fallback)
    const currentPrompts = {};
    Object.keys(themes).forEach((key) => {
      currentPrompts[key] = promptsFromDb[key] || themes[key].prompt;
    });

    return NextResponse.json({
      prompts: currentPrompts,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/admin/prompts GET' });
    return NextResponse.json(
      { error: error.message || 'Erro ao obter prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem editar prompts.' },
        { status: 403 }
      );
    }

    const { prompts } = await request.json();

    if (!prompts || typeof prompts !== 'object') {
      return NextResponse.json(
        { error: 'Prompts inválidos' },
        { status: 400 }
      );
    }

    // Validar que todos os temas existem
    const validThemeIds = Object.keys(themes);
    const providedThemeIds = Object.keys(prompts);

    for (const themeId of providedThemeIds) {
      if (!validThemeIds.includes(themeId)) {
        return NextResponse.json(
          { error: `Tema inválido: ${themeId}` },
          { status: 400 }
        );
      }
    }

    // Salvar/atualizar prompts no banco de dados (Supabase)
    const supabase = getSupabase();
    const savedThemes = [];
    
    for (const [slug, prompt] of Object.entries(prompts)) {
      const themeData = themes[slug];
      
      // Verificar se o tema já existe no banco
      const { data: existingTheme } = await supabase
        .from('themes')
        .select('id, slug')
        .eq('slug', slug)
        .single();

      if (existingTheme) {
        // Atualizar tema existente
        const { data: updated, error: updateError } = await supabase
          .from('themes')
          .update({
            prompt: prompt,
            name: themeData.name,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', slug)
          .select()
          .single();
        
        if (updateError) {
          logger.error(`Erro ao atualizar tema ${slug}:`, updateError);
        } else if (updated) {
          savedThemes.push(updated);
        }
      } else {
        // Criar novo tema
        const { data: created, error: createError } = await supabase
          .from('themes')
          .insert({
            slug: slug,
            name: themeData.name,
            prompt: prompt,
            description: themeData.name,
          })
          .select()
          .single();
        
        if (createError) {
          logger.error(`Erro ao criar tema ${slug}:`, createError);
        } else if (created) {
          savedThemes.push(created);
        }
      }
    }

    logger.log('Prompts salvos no banco:', {
      userId,
      themes: savedThemes.map(t => t.slug),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${savedThemes.length} prompt(s) salvo(s) com sucesso no banco de dados.`,
      saved: savedThemes.length,
    });
  } catch (error) {
    logProductionError(error, { route: '/api/admin/prompts POST' });
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar prompts' },
      { status: 500 }
    );
  }
}

