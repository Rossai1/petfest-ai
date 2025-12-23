'use client';

import { Upload, Sparkles, Download } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Envia a foto',
    description: 'Faça upload da foto do seu pet',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Escolhe o tema',
    description: 'Selecione um tema festivo',
  },
  {
    number: 3,
    icon: Download,
    title: 'Recebe a arte',
    description: 'Baixe sua imagem transformada',
  },
];

export default function HowItWorks() {
  return (
    <section className="organic-container py-8 sm:py-12 lg:py-16 bg-card/30 rounded-[32px] my-8 sm:my-12">
      <div className="text-center mb-8 sm:mb-12 fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
          Como Funciona
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Três passos simples para transformar seu pet em arte festiva
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="organic-card text-center fade-in-up-delay-1"
              style={{ '--delay': `${0.1 * (index + 1)}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/30 mb-4 sm:mb-6">
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                {step.number}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}


