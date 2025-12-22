'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PricingCard from '@/components/PricingCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header com navegação */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar para Home
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Planos e Preços</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Todos os planos incluem acesso a todos os temas.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((planData) => (
              <PricingCard
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

        <Card className="mt-12 p-6">
          <h2 className="text-xl font-semibold mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">Como funciona o reset mensal?</p>
              <p className="text-muted-foreground">
                Seu contador de imagens é resetado automaticamente todo mês, permitindo que você use novamente todas as imagens do seu plano.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Posso mudar de plano a qualquer momento?</p>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">O que acontece se eu exceder o limite?</p>
              <p className="text-muted-foreground">
                Você receberá uma notificação quando estiver próximo do limite. Ao atingir o limite, você precisará fazer upgrade ou aguardar o reset mensal.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

