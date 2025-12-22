'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Sparkles, Loader2, PawPrint } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import ThemeSelector from '@/components/ThemeSelector';
import CreditsPill from '@/components/CreditsPill';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';

// Lazy load componentes pesados
const ResultGallery = lazy(() => import('@/components/ResultGallery'));
const SuggestionModal = lazy(() => import('@/components/SuggestionModal'));

// Skeleton para ResultGallery enquanto carrega
function ResultGallerySkeleton() {
  return (
    <div className="organic-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-secondary rounded-full animate-pulse" />
        <div className="h-4 w-24 bg-secondary rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-secondary rounded-[24px] animate-pulse" />
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
    <div className="min-h-screen bg-organic-gradient">
      <div className="organic-container py-8">
        {/* Header Orgânico */}
        <header className="flex items-center justify-between mb-12 fade-in-up">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={44} />
            <h1 className="text-2xl font-bold tracking-tight font-[var(--font-quicksand)]">
              PetFest
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="btn-outline text-sm">Entrar</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="btn-primary text-sm !py-3 !px-6">Cadastrar</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <CreditsPill />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSuggestionModalOpen(true)}
                  className="text-foreground/80 hover:text-foreground hover:bg-card/50 rounded-full"
                >
                  Sugestões
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-card/50 rounded-full">
                  <Link href="/pricing">Planos</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <Link href="/admin/prompts">📝</Link>
                  </Button>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-10 fade-in-up-delay-1">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
            Transforme seus pets em<br />
            <span className="text-primary">momentos festivos</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-lg mx-auto">
            Faça upload das fotos do seu pet e deixe a IA criar imagens incríveis com temas especiais
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <SignedOut>
            <div className="organic-card text-center py-12 fade-in-up-delay-2">
              <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Faça login para começar</h3>
              <p className="text-muted-foreground mb-6">
                Crie uma conta gratuita e ganhe 3 imagens por mês!
              </p>
              <div className="flex gap-4 justify-center">
                <SignInButton mode="modal">
                  <Button className="btn-secondary">Entrar</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="btn-primary">Cadastrar Grátis</Button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Upload Section */}
            <div className="fade-in-up-delay-2">
              <ImageUploader files={files} onFilesChange={setFiles} />
            </div>

            {/* Theme Selection */}
            <div className="fade-in-up-delay-3">
              <ThemeSelector value={selectedTheme} onValueChange={setSelectedTheme} />
            </div>

            {/* Generate Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center fade-in-up-delay-4 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={files.length === 0 || !selectedTheme || isLoading}
                className="btn-generate w-full sm:w-auto min-w-[240px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Imagens
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button
                  onClick={handleReset}
                  className="btn-outline w-full sm:w-auto"
                >
                  Começar Novamente
                </Button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="organic-card bg-soft-pink/30 border border-terracotta/20 fade-in-up">
                <p className="text-terracotta font-medium mb-2">{error}</p>
                {error.includes('Limite atingido') && (
                  <Button asChild size="sm" className="btn-primary mt-2">
                    <Link href="/pricing">Ver Planos</Link>
                  </Button>
                )}
              </div>
            )}

            {/* Results */}
            {resultsLoading ? (
              <div className="organic-card flex flex-col items-center justify-center py-12 space-y-4 fade-in-up">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : results.length > 0 ? (
              <Suspense fallback={<ResultGallerySkeleton />}>
                <ResultGallery results={results} isLoading={isLoading} />
              </Suspense>
            ) : null}
          </SignedIn>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-foreground/60 fade-in-up-delay-5">
          <p className="flex items-center justify-center gap-2">
            <PawPrint className="h-4 w-4" />
            Feito com amor para seus pets
            <PawPrint className="h-4 w-4" />
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
