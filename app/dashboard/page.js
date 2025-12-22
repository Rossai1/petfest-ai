'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UsageIndicator from '@/components/UsageIndicator';
import { Loader2, Image as ImageIcon, Download, Calendar, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { themes } from '@/lib/themes-data';

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
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erro ao buscar uso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      alert('Erro ao baixar a imagem. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {success && (
          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20 fade-in-up">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              ✅ Assinatura ativada com sucesso! Seu plano foi atualizado.
            </p>
          </Card>
        )}

        <div className="mb-8 fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Voltar para Home</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="fade-in-up-delay-1">
              <UsageIndicator />
            </div>

            <Card className="fade-in-up-delay-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Histórico de Gerações</CardTitle>
                    <CardDescription>
                      {history.length === 0 
                        ? 'Nenhuma imagem gerada ainda' 
                        : `${history.length} ${history.length === 1 ? 'imagem gerada' : 'imagens geradas'}`}
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                      <ImageIcon className="h-10 w-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-2">Nenhuma geração ainda</p>
                    <p className="text-sm mb-6">Comece criando suas primeiras imagens festivas!</p>
                    <Button asChild size="lg">
                      <Link href="/">Gerar Primeira Imagem</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((item, index) => {
                      const themeInfo = getThemeInfo(item.theme);
                      const themeName = `${themeInfo.icon} ${themeInfo.name}`;
                      
                      return (
                        <Card 
                          key={item.id} 
                          className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="relative aspect-square bg-muted">
                            {item.generatedImageUrl ? (
                              <>
                                <Image
                                  src={item.generatedImageUrl}
                                  alt={`Imagem gerada - ${themeInfo.name}`}
                                  fill
                                  unoptimized={item.generatedImageUrl?.includes('supabase.co')}
                                  className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                  onClick={() => setSelectedImage(item.generatedImageUrl)}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadImage(item.generatedImageUrl, themeInfo.name, index);
                                      }}
                                      className="bg-white/90 hover:bg-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Baixar
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(item.generatedImageUrl);
                                      }}
                                      className="bg-white/90 hover:bg-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                    >
                                      Ver
                                    </Button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5">
                                <ImageIcon className="h-12 w-12 text-primary opacity-50 mb-2" />
                                <p className="text-xs text-muted-foreground">Imagem não disponível</p>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{themeName}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                              {item.generatedImageUrl && (
                                <div className="pt-2 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => downloadImage(item.generatedImageUrl, themeInfo.name, index)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Baixar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setSelectedImage(item.generatedImageUrl)}
                                  >
                                    Ver
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="fade-in-up-delay-1">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/">Gerar Imagens</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/pricing">Ver Planos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {usage && (
              <Card className="fade-in-up-delay-2">
                <CardHeader>
                  <CardTitle>Informações do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plano:</span>
                      <span className="font-semibold capitalize">{usage.plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Limite:</span>
                      <span className="font-semibold">{usage.imagesLimit} imagens/mês</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Créditos:</span>
                      <span className="font-semibold text-primary">
                        {usage.creditsRemaining} restantes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  const item = history.find(h => h.generatedImageUrl === selectedImage);
                  if (item) {
                    const themeInfo = getThemeInfo(item.theme);
                    const index = history.findIndex(h => h.generatedImageUrl === selectedImage);
                    downloadImage(selectedImage, themeInfo.name, index);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

