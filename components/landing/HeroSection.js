'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="organic-container py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground leading-tight">
            Transforme a foto do seu pet em{' '}
            <span className="text-primary">arte de Natal</span> com IA
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
            Crie momentos mágicos e festivos para seus pets com tecnologia de inteligência artificial
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button asChild className="btn-generate text-base sm:text-lg min-h-[52px] px-8">
              <Link href="#planos">
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-outline text-base sm:text-lg min-h-[52px] px-8">
              <Link href="/app">
                Ver Demo
                <Sparkles className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Before/After Visual */}
        <div className="flex-1 w-full fade-in-up-delay-1">
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {/* Before */}
              <div className="organic-card !p-0 overflow-hidden">
                <div className="relative aspect-square bg-secondary rounded-[32px]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/30 flex items-center justify-center mb-4">
                      <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">Foto Original</p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-card/50">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">Antes</p>
                </div>
              </div>

              {/* After */}
              <div className="organic-card !p-0 overflow-hidden ring-2 ring-accent">
                <div className="relative aspect-square bg-accent/20 rounded-[32px]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent flex items-center justify-center mb-4">
                      <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-foreground" />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">Com IA</p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-card/50">
                  <p className="text-xs sm:text-sm font-semibold text-primary text-center">Depois</p>
                </div>
              </div>
            </div>
            
            {/* Arrow between */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <ArrowRight className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


