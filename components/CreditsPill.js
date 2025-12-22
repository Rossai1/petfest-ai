'use client';

import { Sparkles } from 'lucide-react';
import { useCredits } from '@/contexts/UserDataContext';

export default function CreditsPill() {
  const { credits, loading } = useCredits();

  if (loading) {
    return (
      <div className="credits-pill">
        <Sparkles className="h-4 w-4" />
        <span>...</span>
      </div>
    );
  }

  if (credits === null) {
    return null;
  }

  return (
    <div className="credits-pill">
      <Sparkles className="h-4 w-4 text-primary" />
      <span>{credits} crédito{credits !== 1 ? 's' : ''}</span>
    </div>
  );
}
