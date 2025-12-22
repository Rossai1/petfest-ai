// Prompts padrão (usados no client-side e como fallback)
export const themes = {
  natal: {
    id: 'natal',
    name: 'Natal',
    prompt: `Create an ultra-realistic Christmas photograph of this pet, maintaining absolutely all of its original characteristics. DO NOT alter colors, fur patterns, spots, markings, body shape, size, facial expression, or proportions. The pet should be identical to the original, as if it were simply photographed in a professional Christmas setting. The pet should be highlighted, with the main focus on its face and expression, conveying naturalness, joy, and charm. The expression should remain faithful to the original image, without exaggeration or changes. Dress the pet with realistic and well-fitting Christmas accessories, such as a Santa hat, reindeer costume, or Christmas ornaments, respecting the body shape and without distortions. The accessories should look real and comfortable, without excessively covering the face or altering the animal's natural appearance. The setting should be indoors, a cozy living room, with a slightly blurred Christmas tree in the background (bokeh effect), warm lights, and elegant decorations. The background should be blurred, reinforcing the depth of field effect and highlighting the pet. Photography Style: • Professional photography • Soft and natural lighting • Shallow depth of field • High sharpness on the face • Realistic colors • Studio look or premium Christmas photoshoot Image Quality: Ultra-realistic, high resolution, DSLR style, cinematic lighting, no illustration or digital painting look. Image Ratio: 3:4 (vertical), ideal for Instagram and Christmas cards`,
    icon: '🎄',
  },
  anoNovo: {
    id: 'anoNovo',
    name: 'Ano Novo',
    prompt: 'Transform this pet into a New Year celebration scene with party hat, confetti, festive decorations, fireworks, and a celebratory atmosphere. Make it look fun and exciting.',
    icon: '🎉',
  },
  carnaval: {
    id: 'carnaval',
    name: 'Carnaval',
    prompt: 'Transform this pet into a Carnival celebration with colorful costumes, feathers, festive Brazilian Carnival elements, masks, and vibrant decorations. Make it look colorful and festive.',
    icon: '🎭',
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    prompt: 'Transform this pet into a Halloween scene with spooky decorations, pumpkin, Halloween costume, bats, and a spooky atmosphere. Make it look fun and spooky.',
    icon: '🎃',
  },
};

/**
 * Obtém um tema por ID (versão síncrona para client-side)
 */
export function getThemeById(id) {
  return themes[id] || themes.natal;
}

/**
 * Obtém o prompt de um tema (versão síncrona para client-side)
 */
export function getThemePromptSync(id) {
  const theme = getThemeById(id);
  return theme.prompt;
}


