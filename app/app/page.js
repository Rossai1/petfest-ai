'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Sparkles, Loader2, PawPrint, Menu } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import ImageUploaderStitch from '@/components/app/ImageUploaderStitch';
import ThemeSelectorStitch from '@/components/app/ThemeSelectorStitch';
import Logo from '@/components/common/Logo';
import MobileMenu from '@/components/common/MobileMenu';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';

// Lazy load componentes pesados
const ResultGalleryStitch = lazy(() => import('@/components/app/ResultGalleryStitch'));
const SuggestionModal = lazy(() => import('@/components/app/SuggestionModal'));

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

export default function AppPage() {
  const { user, isLoaded } = useUser();
  const { 
    results, 
    setResults, 
    resultsLoading, 
    refreshAfterGeneration
  } = useUserData();
  
  const [files, setFiles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses[0]?.emailAddress;
      const adminEmail = process.env.ADMIN_EMAIL || 'wesleykrzyzanovski@gmail.com';
      setIsAdmin(email === adminEmail);
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
        setError(data.error || 'Erro ao processar imagens');
        return;
      }

      if (data.success && data.results) {
        // Atualizar resultados imediatamente
        setResults(data.results);
        
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
    <div className="min-h-screen app-palette" style={{ backgroundColor: '#7aaead' }}>
      {/* Header Stitch Style */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-[#fdfbf7] dark:bg-gray-800 text-[#79aca9] p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
            <Logo size={32} />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">PetFest</span>
        </Link>
            
        {/* Desktop Navigation */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 font-medium text-white dark:text-gray-300">
            <Button
              variant="ghost"
              onClick={() => setIsSuggestionModalOpen(true)}
              className="hover:text-white transition-colors text-white"
            >
              Sugestões
            </Button>
          </div>
          <SignedIn>
            {isAdmin && (
              <Button asChild variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 rounded-full text-white">
                <Link href="/admin/prompts">📝</Link>
              </Button>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-white/20 hover:bg-white/30 rounded-full text-white">
                Entrar
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-white/20 hover:bg-white/30 rounded-full text-white h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        {/* Hero Section - Stitch Style */}
        <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center gap-8">
          <header className="text-center space-y-4 mb-4">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-white drop-shadow-sm">
              Transforme seus pets em <br/>
              <span className="text-[#2d5c58] dark:text-green-300">momentos festivos</span>
            </h1>
            <p className="text-white/80 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Faça upload das fotos do seu pet e deixe a IA criar imagens incríveis com temas especiais
            </p>
          </header>

        {/* Main Content */}
        <div className="w-full space-y-8">
          <SignedOut>
            <div className="organic-card text-center py-8 sm:py-12 fade-in-up-delay-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Faça login para começar</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
                Crie uma conta gratuita e comece a gerar imagens ilimitadas!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <SignInButton mode="modal">
                  <Button className="btn-secondary w-full sm:w-auto">Entrar</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="btn-primary w-full sm:w-auto">Cadastrar Grátis</Button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Upload Section */}
            <div className="fade-in-up-delay-2">
              <ImageUploaderStitch files={files} onFilesChange={setFiles} />
            </div>

            {/* Theme Selection */}
            <div className="fade-in-up-delay-3">
              <ThemeSelectorStitch value={selectedTheme} onValueChange={setSelectedTheme} />
            </div>

            {/* Generate Button - Stitch Style */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2 fade-in-up-delay-4">
              <Button
                onClick={handleGenerate}
                disabled={files.length === 0 || !selectedTheme || isLoading}
                className="flex-1 max-w-xs bg-[#a4cbb4] hover:bg-[#8eb89f] dark:bg-green-600 dark:hover:bg-green-500 text-[#2d5c58] dark:text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg min-h-[52px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    GERAR IMAGENS
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button
                  onClick={handleReset}
                  className="flex-1 max-w-xs bg-transparent border-2 border-white/50 dark:border-gray-500 text-white dark:text-gray-200 font-semibold py-4 px-8 rounded-full hover:bg-white/10 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 min-h-[52px]"
                >
                  Começar Novamente
                </Button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="organic-card bg-soft-pink/30 border border-terracotta/20 fade-in-up">
                <p className="text-terracotta font-medium mb-2">{error}</p>
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
                <ResultGalleryStitch results={results} isLoading={isLoading} />
              </Suspense>
            ) : null}
          </SignedIn>
        </div>

        </main>
        
        {/* Footer Stitch Style */}
        <footer className="text-center py-8 text-white/60 text-sm dark:text-gray-400">
          <p>© 2024 PetFest AI. Todos os direitos reservados.</p>
        </footer>

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

