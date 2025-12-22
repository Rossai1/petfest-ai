'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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
          window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error) {
      console.error('Erro ao assinar:', error);
      alert('Erro ao processar assinatura. Tente novamente.');
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

  return (
    <Card
      className={`relative p-6 ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${
        isCurrentPlan ? 'border-green-500' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            Mais Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Plano Atual
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{getPlanName(plan)}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">R$ {price.toFixed(2)}</span>
          {!isFree && <span className="text-muted-foreground">/mês</span>}
        </div>
        <p className="text-sm text-muted-foreground">
          {limit} imagens por mês
        </p>
        {quality && (
          <p className="text-xs font-medium text-primary mt-1">
            Qualidade: {quality}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <Button variant="outline" className="w-full" disabled>
          Plano Atual
        </Button>
      ) : isCurrentPlan ? (
        <Button variant="outline" className="w-full" disabled>
          Plano Atual
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={loading}
          size="lg"
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
    </Card>
  );
}

