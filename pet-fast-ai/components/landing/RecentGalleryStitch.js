'use client';

import { useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function RecentGalleryStitch() {
  const { isLoaded, user } = useUser();
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchRecentImages();
    } else {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const fetchRecentImages = async () => {
    try {
      const response = await fetch('/api/recent-results?limit=3');
      if (response.ok) {
        const data = await response.json();
        setRecentImages(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url, themeName, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `petfest-${themeName}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  // Se tiver imagens reais, usar. Caso contrário, não mostrar nada ou usar placeholders genéricos
  const displayImages = recentImages.length > 0 
    ? recentImages.slice(0, 3).map((img, idx) => ({
        ...img,
        theme: img.theme || 'Festivo',
        id: img.id || idx + 1,
      }))
    : [];

  // Não mostrar seção se não houver imagens para exibir
  if (loading) {
    return null;
  }

  if (!user || displayImages.length === 0) {
    return null;
  }

  return (
    <section className="landing-palette w-full max-w-7xl mx-auto px-6 py-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-3xl font-display font-bold text-[#1A2E35] dark:text-white">Galeria Recente</h2>
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="text-[#1A2E35] dark:text-white font-bold hover:opacity-70 flex items-center gap-1"
            >
              Ver tudo <span className="text-lg">→</span>
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayImages.map((item, index) => (
            <div 
              key={item.id || index} 
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
            >
              {item.generatedImageUrl || item.url ? (
                <>
                  <div className="relative w-full h-full">
                    <Image
                      src={item.generatedImageUrl || item.url}
                      alt={`Resultado ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized={item.generatedImageUrl?.includes('supabase.co')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-2 border border-white/20">
                        {item.theme || 'Festivo'}
                      </span>
                      <div className="flex justify-between items-center">
                        <p className="text-white font-bold">{item.theme || `Imagem ${index + 1}`}</p>
                        <div className="flex gap-2">
                          {item.generatedImageUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(item.generatedImageUrl, item.theme, index);
                              }}
                            >
                              <Download className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Mobile: Always show download button */}
                  <div className="md:hidden absolute bottom-4 right-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.generatedImageUrl) {
                          downloadImage(item.generatedImageUrl, item.theme, index);
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-[#EFF5EE] flex items-center justify-center">
                  <p className="text-gray-500">Sem imagem</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

