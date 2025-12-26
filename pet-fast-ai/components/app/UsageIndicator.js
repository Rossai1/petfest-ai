'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useCredits } from '@/contexts/UserDataContext';

export default function UsageIndicator() {
  const { credits, imagesLimit, plan, loading } = useCredits();

  if (loading) {
    return (
      <div className="organic-card">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary" />
            <div className="h-5 w-32 bg-secondary rounded-full" />
          </div>
          <div className="h-3 bg-secondary rounded-full" />
          <div className="h-4 w-48 bg-secondary rounded-full" />
        </div>
      </div>
    );
  }

  if (credits === null || imagesLimit === null) {
    return null;
  }

  const creditsUsed = imagesLimit - credits;
  const percentage = (creditsUsed / imagesLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = credits === 0;

  const getPlanName = (planType) => {
    const names = {
      free: 'Gratuito',
      essential: 'Essential',
      pro: 'Pro',
    };
    return names[planType?.toLowerCase()] || planType;
  };

  return (
    <div className="organic-card">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Seu Uso</h3>
          </div>
          <span className="organic-tag">
            Plano {getPlanName(plan)}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {creditsUsed} de {imagesLimit} créditos usados
            </span>
            <span className="font-bold text-primary">
              {credits} restantes
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit 
                  ? 'bg-terracotta' 
                  : isNearLimit 
                    ? 'bg-lavender' 
                    : 'bg-accent'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Alerts */}
        {isAtLimit && (
          <div className="rounded-[16px] bg-soft-pink/50 border border-terracotta/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-terracotta" />
              </div>
              <div>
                <p className="font-semibold text-terracotta text-sm">
                  Você atingiu o limite do seu plano
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upgrade para continuar gerando imagens incríveis
                </p>
                <Button asChild className="btn-primary !py-2 !px-5 !text-xs mt-3">
                  <Link href="/pricing">
                    <TrendingUp className="h-3 w-3 mr-1.5" />
                    Ver Planos
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="rounded-[16px] bg-lavender/30 border border-lavender/50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lavender/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Você está próximo do limite
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Considere fazer upgrade para mais imagens
                </p>
                <Button asChild className="btn-outline !py-2 !px-5 !text-xs mt-3">
                  <Link href="/pricing">Ver Planos</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA for free plan */}
        {plan?.toLowerCase() === 'free' && !isAtLimit && !isNearLimit && (
          <Button asChild className="btn-outline w-full">
            <Link href="/pricing">
              <TrendingUp className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
