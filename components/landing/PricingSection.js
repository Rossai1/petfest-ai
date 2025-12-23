'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PricingCard from '@/components/features/PricingCard';

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

export default function PricingSection() {
  const { isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      fetchCurrentPlan();
    } else {
      setLoading(false);
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

  return (
    <section className="py-8 sm:py-12 lg:py-16" id="planos">
      <div className="organic-container">
        <div className="text-center mb-8 sm:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Escolha Seu Plano
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Planos flexíveis para atender suas necessidades
          </p>
        </div>
      </div>

      {loading ? (
        <div className="organic-container">
          <div className="flex justify-center py-12">
            <div className="organic-card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="h-4 w-32 bg-secondary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((planData, index) => (
              <div
                key={planData.plan}
                className="fade-in-up"
                style={{ '--delay': `${0.1 * (index + 1)}s` }}
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
        </div>
      )}
    </section>
  );
}

