'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MobileCTA() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <Button asChild className="btn-generate w-full min-h-[52px] text-base">
        <Link href="#planos">
          <Sparkles className="h-5 w-5 mr-2" />
          Ver Planos e Preços
        </Link>
      </Button>
    </div>
  );
}


