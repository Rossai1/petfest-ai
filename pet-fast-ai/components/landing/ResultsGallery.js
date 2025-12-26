'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const exampleResults = [
  { id: 1, theme: 'Natal', description: 'Pet em clima natalino' },
  { id: 2, theme: 'Festa', description: 'Pet comemorando' },
  { id: 3, theme: 'Aniversário', description: 'Pet em festa de aniversário' },
  { id: 4, theme: 'Halloween', description: 'Pet em tema Halloween' },
];

export default function ResultsGallery() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="organic-container py-8 sm:py-12 lg:py-16" id="resultados">
      <div className="text-center mb-8 sm:mb-12 fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
          Resultados Reais
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Veja transformações incríveis de pets reais criadas com nossa IA
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6 fade-in-up-delay-1">
        {exampleResults.map((result) => (
          <div key={result.id} className="organic-card !p-0 overflow-hidden group hover-lift">
            <div className="relative aspect-square bg-secondary rounded-[32px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-accent/30 flex items-center justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">{result.theme}</p>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden relative fade-in-up-delay-1">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {exampleResults.map((result) => (
            <div
              key={result.id}
              className="organic-card !p-0 overflow-hidden flex-shrink-0 w-[85vw] sm:w-[70vw] snap-center"
            >
              <div className="relative aspect-square bg-secondary rounded-[32px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-foreground mb-2">{result.theme}</p>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card rounded-full h-10 w-10 shadow-lg"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card rounded-full h-10 w-10 shadow-lg"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

