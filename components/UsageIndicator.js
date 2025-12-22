'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCredits } from '@/contexts/UserDataContext';

export default function UsageIndicator() {
  const { credits, imagesLimit, plan, loading } = useCredits();

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </Card>
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
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Seu Uso</h3>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Plano {getPlanName(plan)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {creditsUsed} de {imagesLimit} créditos usados
            </span>
            <span className="font-medium">
              {credits} restantes
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {isAtLimit && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Você atingiu o limite do seu plano
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Faça upgrade para continuar gerando imagens
            </p>
            <Button asChild className="mt-3 w-full" size="sm">
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Você está próximo do limite. Considere fazer upgrade para mais imagens.
            </p>
            <Button asChild variant="outline" className="mt-2 w-full" size="sm">
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
        )}

        {plan?.toLowerCase() === 'free' && !isAtLimit && (
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href="/pricing">Fazer Upgrade</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
