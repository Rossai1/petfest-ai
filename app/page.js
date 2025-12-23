'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { PawPrint, Menu } from 'lucide-react';
import MobileMenu from '@/components/common/MobileMenu';
import CreditsPill from '@/components/app/CreditsPill';
import { useState } from 'react';

// Landing Components - Stitch Design
import HeroSectionStitch from '@/components/landing/HeroSectionStitch';
import ResultsGalleryStitch from '@/components/landing/ResultsGalleryStitch';
import HowItWorksStitch from '@/components/landing/HowItWorksStitch';
import RecentGalleryStitch from '@/components/landing/RecentGalleryStitch';
import PricingSection from '@/components/landing/PricingSection';
import FAQ from '@/components/landing/FAQ';
import MobileCTA from '@/components/landing/MobileCTA';

export default function LandingPage() {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen landing-palette" style={{ 
      backgroundColor: '#7DB6A8',
      backgroundImage: 'linear-gradient(135deg, #7DB6A8 0%, #68A699 100%)',
    }}>
      {/* Header Stitch Style */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-[#1A2E35] dark:text-white p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Logo size={28} />
          </div>
          <span className="font-display font-bold text-2xl text-[#1A2E35] dark:text-white tracking-tight">PetFest</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <SignedIn>
            <CreditsPill />
          </SignedIn>
          <div className="flex items-center gap-6 bg-white/10 px-6 py-2 rounded-full backdrop-blur-sm">
            <Link href="/app" className="text-[#1A2E35] dark:text-white hover:text-white font-medium transition-colors">
              Sugestões
            </Link>
            <Link href="#planos" className="text-[#1A2E35] dark:text-white hover:text-white font-medium transition-colors">
              Planos
            </Link>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-white/90 dark:bg-card-dark text-[#1A2E35] dark:text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-105">
                Entrar
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Navigation */}
        <button 
          className="md:hidden p-2 text-[#1A2E35] dark:text-white bg-white/20 rounded-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Landing Sections - Stitch Design */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-20 pb-20 lg:pb-0">
        <HeroSectionStitch />
        <ResultsGalleryStitch />
        <HowItWorksStitch />
        <RecentGalleryStitch />
        <PricingSection />
        <FAQ />
      </main>

      {/* Mobile CTA Sticky */}
      <MobileCTA />

      {/* Footer Stitch Style */}
      <footer className="text-center py-10 text-[#1A2E35]/60 dark:text-white/60 text-sm border-t border-white/10 mt-12 bg-black/5 dark:bg-black/20 backdrop-blur-sm pb-20 sm:pb-10">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="#" className="hover:text-[#1A2E35] dark:hover:text-white transition-colors">Termos</Link>
          <Link href="#" className="hover:text-[#1A2E35] dark:hover:text-white transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-[#1A2E35] dark:hover:text-white transition-colors">Instagram</Link>
        </div>
        <p>© 2024 PetFest AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
