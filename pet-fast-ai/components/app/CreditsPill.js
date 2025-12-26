'use client';

import { Sparkles } from 'lucide-react';
import { useCredits } from '@/contexts/UserDataContext';

export default function CreditsPill() {
  const { credits, loading } = useCredits();

  if (loading) {
    return (
      <div className="credits-pill">
        <div className="w-4 h-4 rounded-full bg-secondary animate-pulse" />
        <span className="text-muted-foreground">...</span>
      </div>
    );
  }

  if (credits === null) {
    return null;
  }

  const isLow = credits <= 3;
  const isEmpty = credits === 0;

  return (
    <div className={`credits-pill ${isEmpty ? 'bg-soft-pink/50 border-terracotta/30' : isLow ? 'bg-lavender/30' : ''}`}>
      <Sparkles className={`h-4 w-4 ${isEmpty ? 'text-terracotta' : 'text-primary'}`} />
      <span className={isEmpty ? 'text-terracotta' : ''}>
        {credits} crédito{credits !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
