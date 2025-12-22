import sharp from 'sharp';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB em bytes

/**
 * Comprime uma imagem se ela for maior que 4MB
 * @param {Buffer} imageBuffer - Buffer da imagem original
 * @param {number} maxSizeBytes - Tamanho máximo em bytes (padrão: 4MB)
 * @returns {Promise<Buffer>} Buffer da imagem comprimida (ou original se já estiver dentro do limite)
 */
export async function compressImageIfNeeded(imageBuffer, maxSizeBytes = MAX_FILE_SIZE) {
  // Verificar tamanho atual
  if (imageBuffer.length <= maxSizeBytes) {
    return imageBuffer; // Já está dentro do limite
  }

  try {
    // Obter metadados da imagem
    const metadata = await sharp(imageBuffer).metadata();
    
    // Calcular fator de compressão necessário
    const currentSize = imageBuffer.length;
    const targetSize = maxSizeBytes;
    const compressionRatio = targetSize / currentSize;
    
    // Calcular nova qualidade (JPEG) ou qualidade (PNG/WebP)
    // Para JPEG, qualidade vai de 1-100
    // Para PNG/WebP, compressLevel vai de 0-9
    let quality = Math.max(60, Math.floor(100 * compressionRatio));
    quality = Math.min(quality, 90); // Não comprimir demais, manter qualidade mínima de 60
    
    // Comprimir imagem
    let compressedBuffer;
    
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      compressedBuffer = await sharp(imageBuffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    } else if (metadata.format === 'png') {
      // PNG usa compressLevel (0-9) e pode converter para JPEG se necessário
      if (compressionRatio < 0.5) {
        // Se precisa comprimir muito, converter para JPEG
        compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
      } else {
        compressedBuffer = await sharp(imageBuffer)
          .png({ compressionLevel: 9, quality: 90 })
          .toBuffer();
      }
    } else if (metadata.format === 'webp') {
      compressedBuffer = await sharp(imageBuffer)
        .webp({ quality })
        .toBuffer();
    } else {
      // Para outros formatos, converter para JPEG
      compressedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }
    
    // Se ainda estiver muito grande, reduzir dimensões
    if (compressedBuffer.length > maxSizeBytes) {
      const scaleFactor = Math.sqrt(maxSizeBytes / compressedBuffer.length);
      const newWidth = Math.floor(metadata.width * scaleFactor);
      const newHeight = Math.floor(metadata.height * scaleFactor);
      
      compressedBuffer = await sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }
    
    console.log(`Imagem comprimida: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB → ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    return compressedBuffer;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Se falhar, retornar original
    return imageBuffer;
  }
}

/**
 * Verifica se uma imagem precisa ser comprimida
 * @param {Buffer} imageBuffer - Buffer da imagem
 * @param {number} maxSizeBytes - Tamanho máximo em bytes
 * @returns {boolean}
 */
export function needsCompression(imageBuffer, maxSizeBytes = MAX_FILE_SIZE) {
  return imageBuffer.length > maxSizeBytes;
}


