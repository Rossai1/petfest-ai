'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const exampleResults = [
  { id: 1, theme: 'Natal', icon: '🎄', description: 'Pet em clima natalino' },
  { id: 2, theme: 'Festa', icon: '🎉', description: 'Pet comemorando' },
  { id: 3, theme: 'Aniversário', icon: '🎂', description: 'Pet em festa de aniversário' },
  { id: 4, theme: 'Halloween', icon: '🎃', description: 'Pet em tema Halloween' },
];

export default function ResultsGalleryStitch() {
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
    <section className="landing-palette max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1A2E35] dark:text-white">Resultados Reais</h2>
        <p className="text-lg text-[#1A2E35]/70 dark:text-gray-300">Veja transformações incríveis de pets reais criadas com nossa IA</p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {exampleResults.map((result) => (
          <div key={result.id} className="glass-card p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group shadow-soft">
            <div className="bg-[#EFF5EE] dark:bg-gray-700 p-6 rounded-full group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">{result.icon}</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#1A2E35] dark:text-white mb-1">{result.theme}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{result.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {exampleResults.map((result) => (
            <div
              key={result.id}
              className="glass-card p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 flex-shrink-0 w-[85vw] sm:w-[70vw] snap-center shadow-soft"
            >
              <div className="bg-[#EFF5EE] p-6 rounded-full">
                <span className="text-4xl">{result.icon}</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#1A2E35] mb-1">{result.theme}</h3>
                <p className="text-sm text-gray-500">{result.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full h-10 w-10 shadow-lg"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full h-10 w-10 shadow-lg"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}


