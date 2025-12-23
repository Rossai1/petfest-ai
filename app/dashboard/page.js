'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import { Loader2, Image as ImageIcon, Download, Calendar, Sparkles, X, ArrowLeft, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { themes } from '@/lib/data/themes-data';
import { toast } from 'sonner';

function DashboardContent() {
  const { isLoaded, user } = useUser();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const success = searchParams.get('success');

  useEffect(() => {
    if (isLoaded) {
      fetchUsage();
    }
  }, [isLoaded]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/recent-results?limit=50');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-organic-gradient">
        <div className="organic-card flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThemeInfo = (themeId) => {
    return themes[themeId] || { name: themeId, icon: '🎨' };
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
      toast.success('Imagem baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      toast.error('Erro ao baixar a imagem. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-organic-gradient">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">

        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 fade-in-up">
          <Button asChild variant="ghost" className="mb-3 sm:mb-4 rounded-full text-foreground/80 hover:text-foreground hover:bg-card/50 min-h-[44px] px-3 sm:px-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voltar para Home</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo size={48} className="sm:hidden" />
            <Logo size={56} className="hidden sm:block" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Olá, {user?.firstName || 'Pet Lover'}!</h1>
              <p className="text-sm sm:text-base text-foreground/70">
                Bem-vindo ao seu painel de controle
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* History Gallery */}
            <div className="organic-card fade-in-up-delay-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Histórico de Gerações</h2>
                    <p className="text-sm text-muted-foreground">
                      {history.length === 0 
                        ? 'Nenhuma imagem gerada ainda' 
                        : `${history.length} ${history.length === 1 ? 'imagem' : 'imagens'}`}
                    </p>
                  </div>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">Nenhuma geração ainda</p>
                  <p className="text-sm text-muted-foreground mb-6">Comece criando suas primeiras imagens festivas!</p>
                  <Button asChild className="btn-primary">
                    <Link href="/">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Primeira Imagem
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {history.map((item, index) => {
                    const themeInfo = getThemeInfo(item.theme);
                    
                    return (
                      <div 
                        key={item.id} 
                        className="organic-card !p-0 overflow-hidden group hover-lift"
                        style={{ 
                          '--delay': `${Math.min(index * 0.05, 0.3)}s`,
                        }}
                      >
                        <div className="relative aspect-square bg-secondary">
                          {item.generatedImageUrl ? (
                            <>
                              <Image
                                src={item.generatedImageUrl}
                                alt={`Imagem gerada - ${themeInfo.name}`}
                                fill
                                unoptimized={item.generatedImageUrl?.includes('supabase.co')}
                                className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                                onClick={() => setSelectedImage(item.generatedImageUrl)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {/* Mobile: Always visible, Desktop: On hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3 sm:pb-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadImage(item.generatedImageUrl, themeInfo.name, index);
                                    }}
                                    className="btn-primary !py-2 !px-4 !text-xs transform translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-300 min-h-[36px]"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Baixar
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">Indisponível</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <span>{themeInfo.icon}</span>
                            <span>{themeInfo.name}</span>
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Mobile First */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Quick Actions */}
            <div className="organic-card fade-in-up-delay-1">
              <h3 className="font-bold text-foreground mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button asChild className="btn-primary w-full min-h-[44px]">
                  <Link href="/">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Imagens
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-foreground/60 fade-in-up-delay-3">
          <p className="flex items-center justify-center gap-2">
            <PawPrint className="h-4 w-4" />
            Feito com amor para seus pets
            <PawPrint className="h-4 w-4" />
          </p>
        </footer>
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
                  const item = history.find(h => h.generatedImageUrl === selectedImage);
                  if (item) {
                    const themeInfo = getThemeInfo(item.theme);
                    const index = history.findIndex(h => h.generatedImageUrl === selectedImage);
                    downloadImage(selectedImage, themeInfo.name, index);
                  }
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-organic-gradient">
        <div className="organic-card flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
