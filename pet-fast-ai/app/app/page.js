'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Sparkles, Loader2, PawPrint, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploaderStitch from '@/components/app/ImageUploaderStitch';
import ThemeSelectorStitch from '@/components/app/ThemeSelectorStitch';
import Logo from '@/components/common/Logo';
import MobileMenu from '@/components/common/MobileMenu';
import UserMenu from '@/components/auth/UserMenu';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';
import { getApiUrl } from '@/config/api';
import { toast } from 'sonner';
import { ADMIN_EMAIL } from '@/config/config';

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
  const { 
    user,
    results, 
    setResults, 
    isLoading: userDataIsLoading, 
    refreshUserData,
    credits
  } = useUserData();
  
  const [files, setFiles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setIsAdmin(user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    }
  }, [user]);

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

      const response = await fetch(getApiUrl('/api/edit'), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.code === 'NO_CREDITS' || data?.code === 'INSUFFICIENT_CREDITS') {
          toast.error(data.error || 'Créditos insuficientes');
          return;
        }
        setError(data.error || 'Erro ao processar imagens');
        return;
      }

      if (data.success && data.results) {
        // Atualizar resultados imediatamente
        setResults(data.results);
        
        // Atualizar dados do servidor em background
        setTimeout(() => {
          refreshUserData();
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
      {/* Header Stitch Style - Mobile Optimized */}
      <nav className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto" role="navigation" aria-label="Navegação principal">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group touch-manipulation" aria-label="Ir para página inicial">
          <div className="bg-[#fdfbf7] dark:bg-gray-800 text-[#79aca9] p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-all">
            <Logo size={24} />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white tracking-tight">PetFest</span>
        </Link>
            
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-4 lg:gap-6 font-medium text-white dark:text-gray-300">
            <Button
              variant="ghost"
              onClick={() => setIsSuggestionModalOpen(true)}
              className="hover:text-white transition-colors text-white min-h-[44px] px-4"
              aria-label="Abrir sugestões"
            >
              Sugestões
            </Button>
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="font-medium text-sm text-white">Créditos: {credits}</span>
              </div>
              {isAdmin && (
                <Button asChild variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 rounded-full text-white min-h-[44px] min-w-[44px]">
                  <Link href="/admin/prompts" aria-label="Painel administrativo">📝</Link>
                </Button>
              )}
              <UserMenu user={user} />
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-white/20 hover:bg-white/30 rounded-full text-white min-h-[44px] px-4">
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-full text-white h-11 w-11 touch-manipulation"
            aria-label="Abrir menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </nav>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        {/* Hero Section - Stitch Style - Mobile Optimized */}
        <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 flex flex-col items-center gap-6 sm:gap-8" role="main">
          <header className="text-center space-y-3 sm:space-y-4 mb-2 sm:mb-4">
            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white drop-shadow-sm leading-tight px-2">
              Transforme seus pets em <br className="hidden sm:block"/>
              <span className="text-[#2d5c58] dark:text-green-300">momentos festivos</span>
            </h1>
            <p className="text-white/80 dark:text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light leading-relaxed px-4">
              Faça upload das fotos do seu pet e deixe a IA criar imagens incríveis com temas especiais
            </p>
          </header>

        {/* Main Content */}
        <div className="w-full space-y-6 sm:space-y-8">
          {!user ? (
            <div className="organic-card text-center py-6 sm:py-8 md:py-12 fade-in-up-delay-2 px-4 sm:px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">Faça login para começar</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
                Crie uma conta gratuita e comece a gerar imagens ilimitadas!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-4">
                <Link href="/login">
                  <Button className="btn-secondary w-full sm:w-auto min-h-[44px] px-6 touch-manipulation">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-primary w-full sm:w-auto min-h-[44px] px-6 touch-manipulation">Cadastrar Grátis</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
            {/* Upload Section */}
            <div className="fade-in-up-delay-2">
              <ImageUploaderStitch files={files} onFilesChange={setFiles} />
            </div>

            {/* Theme Selection */}
            <div className="fade-in-up-delay-3">
              <ThemeSelectorStitch value={selectedTheme} onValueChange={setSelectedTheme} />
            </div>

            {/* Generate Button - Stitch Style - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center pt-2 fade-in-up-delay-4 px-2 sm:px-0">
              <Button
                onClick={handleGenerate}
                disabled={files.length === 0 || !selectedTheme || isLoading}
                className="flex-1 sm:max-w-xs bg-[#a4cbb4] hover:bg-[#8eb89f] active:bg-[#7fb08f] dark:bg-green-600 dark:hover:bg-green-500 dark:active:bg-green-400 text-[#2d5c58] dark:text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] touch-manipulation"
                aria-label={isLoading ? "Processando imagens" : "Gerar imagens"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" aria-hidden="true" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">GERAR IMAGENS</span>
                    <span className="sm:hidden">GERAR</span>
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button
                  onClick={handleReset}
                  className="flex-1 sm:max-w-xs bg-transparent border-2 border-white/50 dark:border-gray-500 text-white dark:text-gray-200 font-semibold py-3.5 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-white/10 active:bg-white/20 dark:hover:bg-gray-700 dark:active:bg-gray-600 transition-all flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] touch-manipulation"
                  aria-label="Começar novamente"
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
            {userDataIsLoading ? (
              <div className="organic-card flex flex-col items-center justify-center py-12 space-y-4 fade-in-up">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : results.length > 0 ? (
              <Suspense fallback={<ResultGallerySkeleton />}>
                <ResultGalleryStitch results={results} isLoading={isLoading} />
              </Suspense>
            ) : null}
            </>
          )}
        </div>

        </main>
        
        {/* Footer Stitch Style - Mobile Optimized */}
        <footer className="text-center py-4 sm:py-6 md:py-8 text-white/60 text-xs sm:text-sm dark:text-gray-400 px-4" role="contentinfo">
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
