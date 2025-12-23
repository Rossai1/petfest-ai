'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingCardStitch({ plan, price, limit, quality, features, isPopular = false, currentPlan }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (plan === 'FREE' || plan === currentPlan) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          toast.loading('Redirecionando para checkout...', { duration: 2000 });
          window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error) {
      console.error('Erro ao assinar:', error);
      toast.error('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (plan) => {
    const names = {
      FREE: 'Iniciante',
      ESSENTIAL: 'Entusiasta',
      PRO: 'Profissional',
    };
    return names[plan] || plan;
  };

  const getPlanDescription = (plan) => {
    const descriptions = {
      FREE: 'Para quem quer experimentar a magia.',
      ESSENTIAL: 'O melhor valor para criadores de conteúdo.',
      PRO: 'Para uso comercial e alta demanda.',
    };
    return descriptions[plan] || '';
  };

  const getCredits = (plan) => {
    const credits = {
      FREE: 3,
      ESSENTIAL: 50,
      PRO: 200,
    };
    return credits[plan] || limit;
  };

  const isCurrentPlan = plan.toLowerCase() === currentPlan?.toLowerCase();
  const isFree = plan === 'FREE';
  const credits = getCredits(plan);
  const planName = getPlanName(plan);
  const planDescription = getPlanDescription(plan);

  // Features com check ou cancel baseado no plano
  const processedFeatures = plan === 'FREE' 
    ? features.map((f, i) => ({ text: f, enabled: i < 3 }))
    : features.map(f => ({ text: f, enabled: true }));

  return (
    <div
      className={`bg-[#fdfaf6] dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 ${
        isPopular 
          ? 'border-[#5f8f8f]/30 shadow-2xl transform md:-translate-y-4 z-10 relative' 
          : 'border-transparent hover:border-white/50 transition duration-300 transform hover:-translate-y-1 relative group'
      }`}
    >
      {/* Top border color */}
      <div className={`absolute top-0 left-0 w-full h-2 rounded-t-3xl ${
        isFree ? 'bg-gray-300' : plan === 'PRO' ? 'bg-gray-800 dark:bg-gray-600' : ''
      }`} />

      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#5f8f8f] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
          Mais Popular
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{planName}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{planDescription}</p>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {isFree ? 'Grátis' : `R$ ${price.toFixed(0)}`}
          </span>
          {!isFree && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">/ único</span>
          )}
        </div>
        <div className={`rounded-xl p-4 mb-8 flex items-center justify-center gap-2 ${
          isPopular 
            ? 'bg-[#b8d8be]/40 dark:bg-[#b8d8be]/20 border border-[#b8d8be]' 
            : 'bg-[#7fb5b5]/10 dark:bg-[#7fb5b5]/20'
        }`}>
          <Coins className={`h-6 w-6 ${isPopular ? 'text-green-800 dark:text-green-300' : 'text-[#5f8f8f] dark:text-teal-300'}`} />
          <span className={`font-bold text-lg ${isPopular ? 'text-green-900 dark:text-green-300' : 'text-[#5f8f8f] dark:text-teal-300'}`}>
            {credits} Créditos
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8 text-sm text-gray-600 dark:text-gray-300">
        {processedFeatures.map((feature, index) => (
          <li key={index} className={`flex items-center gap-3 ${!feature.enabled ? 'opacity-50' : ''}`}>
            {feature.enabled ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-gray-400" />
            )}
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isFree || isCurrentPlan ? (
        <Button 
          disabled 
          className={`w-full py-3 px-6 rounded-xl border-2 border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white font-bold ${
            isCurrentPlan ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          {isCurrentPlan ? 'Plano Atual' : 'Plano Gratuito'}
        </Button>
      ) : (
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] ${
            isPopular 
              ? 'bg-[#5f8f8f] text-white hover:bg-[#5f8f8f]/90' 
              : 'border-2 border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            isPopular ? 'Escolher Entusiasta' : 'Comprar Agora'
          )}
        </Button>
      )}
    </div>
  );
}


