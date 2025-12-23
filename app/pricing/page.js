'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PricingCardStitch from '@/components/features/PricingCardStitch';
import PricingTabs from '@/components/features/PricingTabs';
import FAQGrid from '@/components/features/FAQGrid';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import CreditsPill from '@/components/app/CreditsPill';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Sparkles, ArrowLeft, Menu } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const { isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');

  useEffect(() => {
    if (isLoaded) {
      fetchCurrentPlan();
    }
  }, [isLoaded]);

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.usage?.plan || 'FREE');
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ajustar planos conforme design Stitch (créditos únicos)
  const plans = [
    {
      plan: 'FREE',
      price: 19,
      limit: 50,
      quality: 'Low',
      features: [
        '~25 Imagens Geradas',
        'Acesso a todos os temas',
        'Qualidade Padrão',
        'Upscaling 4K',
      ],
    },
    {
      plan: 'ESSENTIAL',
      price: 49,
      limit: 200,
      quality: 'Medium',
      features: [
        '~100 Imagens Geradas',
        'Acesso antecipado a temas novos',
        'Alta Definição (HD)',
        'Gerador de Stickers',
      ],
      isPopular: true,
    },
    {
      plan: 'PRO',
      price: 99,
      limit: 500,
      quality: 'High',
      features: [
        '~250 Imagens Geradas',
        'Prioridade no processamento',
        'Upscaling 4K',
        'Licença Comercial',
      ],
    },
  ];

  return (
    <div className="min-h-screen plans-palette" style={{ backgroundColor: '#7fb5b5' }}>
      {/* Header Stitch Style */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-white">
            <Logo size={32} />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">PetFest</span>
        </Link>
        <div className="flex items-center gap-6">
          <SignedIn>
            <div className="hidden md:flex items-center gap-2 bg-[#fdfaf6] dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[#7fb5b5]" />
              <CreditsPill />
            </div>
          </SignedIn>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-800 dark:text-gray-200">
            <Link href="/app" className="hover:opacity-75 transition">Sugestões</Link>
            <Link href="#" className="opacity-100 font-bold border-b-2 border-gray-800 dark:border-white pb-0.5">Planos</Link>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-20 w-full max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Escolha o plano perfeito para <br/>
            <span className="text-[#5f8f8f] dark:text-teal-300">eternizar momentos festivos</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 opacity-90">
            Transforme seu pet em arte com nossos pacotes de créditos flexíveis. <br className="hidden md:block"/> Sem assinaturas mensais, pague apenas pelo que usar.
          </p>
          <PricingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="bg-[#fdfaf6] dark:bg-gray-800 rounded-3xl p-8 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-start">
            {plans.map((planData, index) => (
              <PricingCardStitch
                key={planData.plan}
                plan={planData.plan}
                price={planData.price}
                limit={planData.limit}
                quality={planData.quality}
                features={planData.features}
                isPopular={planData.isPopular}
                currentPlan={currentPlan}
              />
            ))}
          </div>
        )}

        {/* FAQ Grid */}
        <FAQGrid />

        {/* Footer */}
        <footer className="w-full py-8 text-center text-gray-800/60 dark:text-white/60 text-sm mt-12">
          <p>© 2024 PetFest. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
