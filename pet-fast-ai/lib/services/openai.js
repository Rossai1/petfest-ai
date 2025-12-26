import OpenAI, { toFile } from 'openai';
import { getThemePrompt } from '../data/themes';
import { logger } from '../utils/logger';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY não está configurada nas variáveis de ambiente');
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Edita uma imagem usando o modelo gpt-image-1.5 da OpenAI
 * @param {Buffer|File} imageData - Buffer ou File da imagem a ser editada
 * @param {string} themeId - ID do tema a ser aplicado
 * @returns {Promise<{url: string, revisedPrompt?: string}>} URL da imagem editada
 */
export async function editImage(imageData, themeId) {
  try {
    const prompt = await getThemePrompt(themeId);
    
    // Converter Buffer para File usando toFile da OpenAI
    const imageFile = Buffer.isBuffer(imageData)
      ? await toFile(imageData, 'image.png', { type: 'image/png' })
      : imageData;
    
    // Tamanho padrão 1024x1536 (3:4 vertical) para todas as imagens
    const size = '1024x1536';
    
    // Qualidade média para todas as imagens (uso ilimitado)
    const qualityValue = 'medium';
    
    const modelName = 'gpt-image-1.5';
    
    const response = await client.images.edit({
      model: modelName,
      image: imageFile,
      prompt: prompt,
      size: size,
      quality: qualityValue,
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma imagem foi retornada pela API');
    }

    const result = response.data[0];
    // A API pode retornar b64_json em vez de url quando response_format não é especificado
    const imageUrl = result.url || (result.b64_json ? `data:image/png;base64,${result.b64_json}` : null);

    if (!imageUrl) {
      throw new Error('Nenhuma URL ou base64 foi retornada pela API');
    }

    return {
      url: imageUrl,
      revisedPrompt: result.revised_prompt,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      logger.error('Erro da API OpenAI:', error.status, error.message);
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
    throw error;
  }
}

export default client;

