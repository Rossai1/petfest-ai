'use client';

import { useState } from 'react';
import { Download, X, Loader2, Library, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

export default function ResultGalleryStitch({ results, isLoading }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const downloadImage = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `petfest-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Imagem baixada com sucesso!');
    } catch (error) {
      logger.error('Erro ao baixar imagem:', error);
      toast.error('Erro ao baixar a imagem. Tente novamente.');
    }
  };

  const shareImage = async (url) => {
    try {
      if (navigator.share) {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], 'petfest-image.png', { type: 'image/png' });
        await navigator.share({
          title: 'PetFest - Imagem Gerada',
          text: 'Confira esta imagem gerada com IA!',
          files: [file],
        });
      } else {
        // Fallback: copiar URL
        await navigator.clipboard.writeText(url);
        toast.success('URL copiada para a área de transferência!');
      }
    } catch (error) {
      logger.error('Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#fdfbf7] dark:bg-gray-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center py-12 space-y-4 shadow-xl border border-white/20 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-[#79aca9]/20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#79aca9]" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Processando suas imagens...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <>
      <section className="w-full bg-[#fdfbf7] dark:bg-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl mt-8 border border-white/20 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#79aca9]/20 p-2.5 rounded-full text-[#79aca9] dark:text-green-300">
              <Library className="h-6 w-6" />
            </div>
            <h2 className="font-display font-bold text-3xl text-gray-800 dark:text-white">Resultados</h2>
          </div>
          <span className="bg-[#d4e6b5] dark:bg-green-900 text-[#4a6b2f] dark:text-green-200 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
            {results.length} {results.length === 1 ? 'Imagem' : 'Imagens'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => {
            return (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {result.error || !result.success ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-100 dark:bg-gray-700">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                      <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Erro ao processar</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.error || 'Erro desconhecido'}
                    </p>
                  </div>
                ) : (
                  <>
                    {result.url ? (
                      <>
                        <Image
                          src={result.url}
                          alt={`Resultado ${index + 1}`}
                          fill
                          unoptimized={result.url.includes('supabase.co')}
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                          onClick={() => setSelectedImage(result.url)}
                          onError={(e) => {
                            logger.error('Erro ao carregar imagem:', result.url);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <div className="flex gap-2 w-full justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 min-h-[44px] min-w-[44px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(result.url, index);
                              }}
                              aria-label="Baixar imagem"
                            >
                              <Download className="h-5 w-5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100 min-h-[44px] min-w-[44px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                shareImage(result.url);
                              }}
                              aria-label="Compartilhar imagem"
                            >
                              <Share2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                        {/* Mobile: Always show buttons */}
                        <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm min-h-[44px] min-w-[44px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(result.url, index);
                            }}
                          >
                            <Download className="h-5 w-5" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-100 dark:bg-gray-700">
                        <X className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-500">URL não disponível</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal para visualização ampliada */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 sm:bg-black/80 p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/90 hover:bg-white rounded-full h-11 w-11 sm:h-10 sm:w-10"
              onClick={() => setSelectedImage(null)}
              aria-label="Fechar visualização"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative w-full flex-1 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl min-h-0">
              <Image
                src={selectedImage}
                alt="Visualização ampliada"
                fill
                unoptimized={selectedImage.includes('supabase.co')}
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <div className="mt-4 sm:mt-6 flex justify-center gap-2 pb-2 sm:pb-0">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  const index = results.findIndex(r => r.url === selectedImage);
                  downloadImage(selectedImage, index >= 0 ? index : 0);
                }}
                className="bg-[#a4cbb4] hover:bg-[#8eb89f] text-[#2d5c58] dark:text-white font-bold py-3 px-6 rounded-full min-h-[44px]"
              >
                <Download className="h-5 w-5 mr-2" />
                Baixar Imagem
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

