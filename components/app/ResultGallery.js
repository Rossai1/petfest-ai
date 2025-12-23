'use client';

import { useState } from 'react';
import { Download, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

export default function ResultGallery({ results, isLoading }) {
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

  if (isLoading) {
    return (
      <div className="organic-card flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground font-medium">Processando suas imagens...</p>
        <p className="text-sm text-muted-foreground/70">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <>
      <div className="organic-card space-y-6 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Resultados</h2>
          </div>
          <span className="organic-tag">
            {results.length} {results.length === 1 ? 'imagem' : 'imagens'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((result, index) => {
            const delay = Math.min(index * 0.1, 0.5);
            return (
              <div 
                key={index} 
                className="organic-card !p-0 overflow-hidden group hover-lift"
                style={{ 
                  '--delay': `${delay}s`,
                  animation: `fadeInUp 0.6s ease-out ${delay}s forwards`,
                  opacity: 0
                }}
              >
                <div className="relative aspect-square bg-secondary">
                  {result.error || !result.success ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-soft-pink/50 flex items-center justify-center mb-3">
                        <X className="h-8 w-8 text-terracotta" />
                      </div>
                      <p className="text-sm font-semibold text-terracotta">Erro ao processar</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.error || 'Erro desconhecido'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {result.url ? (
                        <Image
                          src={result.url}
                          alt={`Resultado ${index + 1}`}
                          fill
                          unoptimized={result.url.includes('supabase.co')}
                          className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                          onClick={() => setSelectedImage(result.url)}
                          onError={(e) => {
                            logger.error('Erro ao carregar imagem:', result.url);
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <X className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">URL não disponível</p>
                        </div>
                      )}
                      {/* Mobile: Always visible button, Desktop: On hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 sm:pb-6">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(result.url, index);
                          }}
                          className="btn-primary !py-3 !px-6 transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Imagem {index + 1}</p>
                  {result.success && !result.error && result.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadImage(result.url, index)}
                      className="text-muted-foreground hover:text-foreground rounded-full min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto]"
                      aria-label={`Baixar imagem ${index + 1}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para visualização ampliada - Mobile Optimized */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 sm:bg-black/80 p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full fade-in-scale flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-card/90 hover:bg-card rounded-full h-11 w-11 sm:h-10 sm:w-10 touch-manipulation"
              onClick={() => setSelectedImage(null)}
              aria-label="Fechar visualização"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative w-full flex-1 bg-secondary rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl min-h-0">
              <Image
                src={selectedImage}
                alt="Visualização ampliada"
                fill
                unoptimized={selectedImage.includes('supabase.co')}
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <div className="mt-4 sm:mt-6 flex justify-center pb-2 sm:pb-0">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  const index = results.findIndex(r => r.url === selectedImage);
                  downloadImage(selectedImage, index >= 0 ? index : 0);
                }}
                className="btn-primary w-full sm:w-auto min-h-[44px]"
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
