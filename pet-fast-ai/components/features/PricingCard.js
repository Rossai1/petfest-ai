'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingCard({ plan, price, limit, quality, features, isPopular = false, currentPlan }) {
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
      FREE: 'Gratuito',
      ESSENTIAL: 'Essential',
      PRO: 'Pro',
    };
    return names[plan] || plan;
  };

  const isCurrentPlan = plan.toLowerCase() === currentPlan?.toLowerCase();
  const isFree = plan === 'FREE';
  const isPro = plan === 'PRO';

  return (
    <div
      className={`organic-card relative h-full flex flex-col ${
        isPopular 
          ? '!bg-primary text-primary-foreground ring-4 ring-accent shadow-xl scale-[1.02]' 
          : ''
      } ${
        isCurrentPlan ? 'ring-2 ring-accent' : ''
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="organic-tag !bg-accent !text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Mais Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && !isPopular && (
        <div className="absolute -top-4 right-4">
          <span className="organic-tag !bg-accent !text-foreground">
            Plano Atual
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
          {isPro ? (
            <Crown className={`h-6 w-6 ${isPopular ? 'text-accent' : 'text-primary'}`} />
          ) : (
            <Sparkles className={`h-6 w-6 ${isPopular ? 'text-accent' : 'text-primary'}`} />
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">{getPlanName(plan)}</h3>
        <div className="mb-3">
          <span className="text-4xl font-bold">
            {isFree ? 'Grátis' : `R$ ${price.toFixed(2).replace('.', ',')}`}
          </span>
          {!isFree && <span className={`text-sm ${isPopular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>/mês</span>}
        </div>
        <p className={`text-sm ${isPopular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          {limit} imagens por mês
        </p>
        {quality && (
          <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
            isPopular 
              ? 'bg-accent/30 text-primary-foreground' 
              : 'bg-secondary text-primary'
          }`}>
            Qualidade: {quality}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isPopular ? 'bg-accent/30' : 'bg-accent/50'
            }`}>
              <Check className={`h-3 w-3 ${isPopular ? 'text-accent' : 'text-primary'}`} />
            </div>
            <span className={`text-sm ${isPopular ? 'text-primary-foreground/90' : ''}`}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button - Mobile Optimized */}
      {isFree || isCurrentPlan ? (
        <Button 
          disabled 
          className={`w-full rounded-full py-5 sm:py-6 min-h-[44px] ${
            isPopular 
              ? '!bg-primary-foreground/20 !text-primary-foreground' 
              : '!bg-secondary !text-muted-foreground'
          }`}
        >
          {isCurrentPlan ? 'Plano Atual' : 'Plano Gratuito'}
        </Button>
      ) : (
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-5 sm:py-6 min-h-[44px] ${
            isPopular 
              ? 'btn-primary !bg-accent hover:!bg-lime-hover !text-foreground' 
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            'Assinar Agora'
          )}
        </Button>
      )}
    </div>
  );
}
