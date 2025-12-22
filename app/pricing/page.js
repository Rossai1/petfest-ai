'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PricingCard from '@/components/PricingCard';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Sparkles, ArrowLeft, PawPrint } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const { isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const plans = [
    {
      plan: 'FREE',
      price: 0,
      limit: 3,
      quality: 'Low',
      features: [
        '3 imagens por mês',
        'Acesso a todos os temas',
        'Qualidade Low',
        'Suporte da comunidade',
      ],
    },
    {
      plan: 'ESSENTIAL',
      price: 29.90,
      limit: 50,
      quality: 'Medium',
      features: [
        '50 imagens por mês',
        'Acesso a todos os temas',
        'Qualidade Medium',
        'Prioridade no suporte',
        'Reset mensal automático',
        'Histórico de imagens',
      ],
      isPopular: true,
    },
    {
      plan: 'PRO',
      price: 79.90,
      limit: 180,
      quality: 'High',
      features: [
        '180 imagens por mês',
        'Acesso a todos os temas',
        'Qualidade High',
        'Suporte prioritário',
        'Reset mensal automático',
        'Histórico completo',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-organic-gradient">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header com navegação */}
        <div className="mb-8 fade-in-up">
          <Button asChild variant="ghost" className="rounded-full text-foreground/80 hover:text-foreground hover:bg-card/50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Home
            </Link>
          </Button>
        </div>

        {/* Hero */}
        <div className="text-center mb-12 fade-in-up-delay-1">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size={64} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Planos e Preços
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Todos os planos incluem acesso a todos os temas festivos.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="organic-card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="h-4 w-32 bg-secondary rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up-delay-2">
            {plans.map((planData, index) => (
              <div 
                key={planData.plan}
                style={{ '--delay': `${0.1 * (index + 1)}s` }}
                className="fade-in-up"
              >
                <PricingCard
                  plan={planData.plan}
                  price={planData.price}
                  limit={planData.limit}
                  quality={planData.quality}
                  features={planData.features}
                  isPopular={planData.isPopular}
                  currentPlan={currentPlan}
                />
              </div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="organic-card mt-12 fade-in-up-delay-3">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <PawPrint className="h-6 w-6 text-primary" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="pb-4 border-b border-border">
              <p className="font-semibold text-foreground mb-2">Como funciona o reset mensal?</p>
              <p className="text-muted-foreground">
                Seu contador de imagens é resetado automaticamente todo mês, permitindo que você use novamente todas as imagens do seu plano.
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <p className="font-semibold text-foreground mb-2">Posso mudar de plano a qualquer momento?</p>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">O que acontece se eu exceder o limite?</p>
              <p className="text-muted-foreground">
                Você receberá uma notificação quando estiver próximo do limite. Ao atingir o limite, você precisará fazer upgrade ou aguardar o reset mensal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-foreground/60 fade-in-up-delay-4">
          <p className="flex items-center justify-center gap-2">
            <PawPrint className="h-4 w-4" />
            Feito com amor para seus pets
            <PawPrint className="h-4 w-4" />
          </p>
        </footer>
      </div>
    </div>
  );
}
