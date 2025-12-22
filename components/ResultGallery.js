'use client';

import { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

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
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      alert('Erro ao baixar a imagem. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Processando imagens...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Resultados</h2>
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'imagem processada' : 'imagens processadas'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => {
            const delay = Math.min(index * 0.1, 0.5);
            return (
              <Card 
                key={index} 
                className="overflow-hidden group transition-all duration-300 hover:shadow-[var(--shadow-hover)]"
                style={{ 
                  '--delay': `${delay}s`,
                  animation: `fadeInUp 0.6s ease-out ${delay}s forwards`,
                  opacity: 0
                }}
              >
              <div className="relative aspect-square bg-muted">
                {result.error || !result.success ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <X className="h-12 w-12 text-destructive mb-2" />
                    <p className="text-sm font-medium text-destructive">Erro ao processar</p>
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
                        className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => setSelectedImage(result.url)}
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', result.url);
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <X className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">URL da imagem não disponível</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(result.url, index);
                        }}
                        className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Imagem {index + 1}</p>
                  {result.success && !result.error && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadImage(result.url, index)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {result.revisedPrompt && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {result.revisedPrompt}
                  </p>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Modal para visualização ampliada */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt="Visualização ampliada"
                fill
                unoptimized={selectedImage.includes('supabase.co')}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

