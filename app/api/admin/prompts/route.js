import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { themes } from '@/lib/themes-data';

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

    // Buscar prompts do banco de dados
    const themesFromDb = await prisma.theme.findMany();
    
    // Criar objeto com prompts do banco
    const promptsFromDb = {};
    themesFromDb.forEach((theme) => {
      promptsFromDb[theme.slug] = theme.prompt;
    });

    // Mesclar com prompts padrão (fallback)
    const currentPrompts = {};
    Object.keys(themes).forEach((key) => {
      currentPrompts[key] = promptsFromDb[key] || themes[key].prompt;
    });

    return NextResponse.json({
      prompts: currentPrompts,
    });
  } catch (error) {
    console.error('Erro ao obter prompts:', error);
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

    // Salvar/atualizar prompts no banco de dados
    const savedThemes = [];
    
    for (const [slug, prompt] of Object.entries(prompts)) {
      const themeData = themes[slug];
      
      // Verificar se o tema já existe no banco
      const existingTheme = await prisma.theme.findUnique({
        where: { slug },
      });

      if (existingTheme) {
        // Atualizar tema existente
        const updated = await prisma.theme.update({
          where: { slug },
          data: {
            prompt: prompt,
            name: themeData.name,
            updatedAt: new Date(),
          },
        });
        savedThemes.push(updated);
      } else {
        // Criar novo tema
        const created = await prisma.theme.create({
          data: {
            slug: slug,
            name: themeData.name,
            prompt: prompt,
            description: themeData.name,
          },
        });
        savedThemes.push(created);
      }
    }

    console.log('Prompts salvos no banco:', {
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
    console.error('Erro ao salvar prompts:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar prompts' },
      { status: 500 }
    );
  }
}

