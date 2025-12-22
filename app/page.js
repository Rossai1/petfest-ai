'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import ThemeSelector from '@/components/ThemeSelector';
import CreditsPill from '@/components/CreditsPill';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';

// Lazy load componentes pesados
const ResultGallery = lazy(() => import('@/components/ResultGallery'));
const SuggestionModal = lazy(() => import('@/components/SuggestionModal'));

// Skeleton para ResultGallery enquanto carrega
function ResultGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const { 
    results, 
    setResults, 
    resultsLoading, 
    refreshAfterGeneration,
    decrementCredits,
    addResult 
  } = useUserData();
  
  const [files, setFiles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses[0]?.emailAddress;
      setIsAdmin(email === 'wesleykrzyzanovski@gmail.com');
    }
  }, [isLoaded, user]);

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError('Por favor, selecione pelo menos uma imagem');
      return;
    }

    if (!selectedTheme) {
      setError('Por favor, selecione um tema');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('themeId', selectedTheme);
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/edit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setError(
            `Limite atingido! Você usou ${data.imagesUsed} de ${data.imagesLimit} imagens do plano ${data.plan}. Faça upgrade para continuar.`
          );
        } else {
          setError(data.error || 'Erro ao processar imagens');
        }
        return;
      }

      if (data.success && data.results) {
        // Atualizar resultados imediatamente (otimismo)
        setResults(data.results);
        
        // Decrementar créditos localmente (otimismo)
        decrementCredits(data.results.filter(r => r.success).length);
        
        // Atualizar dados do servidor em background
        setTimeout(() => {
          refreshAfterGeneration();
        }, 500);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao gerar imagens:', err);
      setError(err.message || 'Erro ao processar imagens. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setSelectedTheme('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[800px]">
        {/* Header Minimalista */}
        <header className="flex items-center justify-between mb-12 fade-in-up">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">PetFest</h1>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Entrar</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Cadastrar</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <CreditsPill />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSuggestionModalOpen(true)}
                >
                  Sugestões
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/pricing">Planos</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/prompts">📝</Link>
                  </Button>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          <SignedOut>
            <div className="text-center py-8 fade-in-up-delay-1">
              <h2 className="text-xl font-semibold mb-2">Faça login para começar</h2>
              <p className="text-muted-foreground mb-6">
                Crie uma conta gratuita e ganhe 3 imagens por mês!
              </p>
              <div className="flex gap-4 justify-center">
                <SignInButton mode="modal">
                  <Button>Entrar</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="outline">Cadastrar</Button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>

          {/* Upload Section */}
          <div className="fade-in-up-delay-1">
            <ImageUploader files={files} onFilesChange={setFiles} />
          </div>

          {/* Theme Selection */}
          <div className="fade-in-up-delay-2">
            <ThemeSelector value={selectedTheme} onValueChange={setSelectedTheme} />
          </div>

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center fade-in-up-delay-3">
            <Button
              onClick={handleGenerate}
              disabled={files.length === 0 || !selectedTheme || isLoading}
              className="btn-generate w-full sm:w-auto min-w-[200px]"
            >
              {isLoading ? 'Processando...' : 'Gerar Imagens'}
            </Button>
            {results.length > 0 && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Começar Novamente
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg p-4 border border-destructive/20 bg-destructive/10 fade-in-up">
              <p className="text-destructive font-medium mb-2">{error}</p>
              {error.includes('Limite atingido') && (
                <Button asChild size="sm" className="mt-2">
                  <Link href="/pricing">Ver Planos</Link>
                </Button>
              )}
            </div>
          )}

          {/* Results */}
          {resultsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 fade-in-up">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : results.length > 0 ? (
            <Suspense fallback={<ResultGallerySkeleton />}>
              <ResultGallery results={results} isLoading={isLoading} />
            </Suspense>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Powered by OpenAI GPT-Image-1.5 • Feito com ❤️ para seus pets
          </p>
        </footer>
      </div>

      {/* Suggestion Modal - Lazy loaded */}
      {isSuggestionModalOpen && (
        <Suspense fallback={null}>
          <SuggestionModal
            isOpen={isSuggestionModalOpen}
            onClose={() => setIsSuggestionModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
