'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HeroSectionStitch() {
  return (
    <section className="landing-palette max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <h1 className="font-display text-5xl lg:text-7xl font-bold text-[#1A2E35] dark:text-white leading-[1.1] hero-text-shadow">
            Transforme a <br/>
            foto do seu pet <br/>
            em <span className="text-[#2C4A3B] dark:text-[#D4E8B5] opacity-80">arte de Natal</span> <br/>
            com IA
          </h1>
          <p className="text-xl text-[#1A2E35]/80 dark:text-gray-200 font-medium max-w-lg leading-relaxed">
            Crie momentos mágicos e festivos para seus pets com tecnologia de inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              asChild 
              className="bg-[#CDE8C3] hover:bg-[#B5D9A8] text-[#2C4A3B] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-glow transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 w-full sm:w-auto group min-h-[52px]"
            >
              <Link href="#planos">
                COMEÇAR AGORA
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="bg-transparent border-2 border-[#1A2E35]/30 dark:border-white/30 text-[#1A2E35] dark:text-white hover:bg-[#1A2E35] hover:text-white dark:hover:bg-white dark:hover:text-[#1A2E35] px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-h-[52px]"
            >
              <Link href="/app">
                Ver Demo
                <Sparkles className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Before/After Visual */}
        <div className="relative flex items-center justify-center lg:justify-end gap-4 mt-8 lg:mt-0">
          {/* Before Card */}
          <div className="glass-card p-6 rounded-[2rem] shadow-soft flex flex-col items-center gap-4 w-44 z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="bg-[#EFF5EE] w-24 h-24 rounded-full flex items-center justify-center mb-2">
              <Camera className="h-12 w-12 text-[#68A699]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[#1A2E35] text-lg">Foto Original</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Antes</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="bg-[#CDE8C3] rounded-full p-3 z-20 shadow-lg">
            <ArrowRight className="h-6 w-6 text-[#2C4A3B]" />
          </div>

          {/* After Card */}
          <div className="glass-card p-6 rounded-[2rem] shadow-soft flex flex-col items-center gap-4 w-44 z-10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="bg-[#CDE8C3] w-24 h-24 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="h-12 w-12 text-[#2C4A3B]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[#1A2E35] text-lg">Com IA</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Depois</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


