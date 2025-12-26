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

export default function HowItWorksStitch() {
  return (
    <section className="landing-palette w-full max-w-7xl mx-auto px-6 py-8">
      <div className="w-full bg-white/20 dark:bg-gray-800/30 backdrop-blur-md rounded-[3rem] p-10 lg:p-16 text-center shadow-lg border border-white/10">
        <div className="max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1A2E35] dark:text-white">Como Funciona</h2>
          <p className="text-lg text-[#1A2E35]/70 dark:text-gray-200">Três passos simples para transformar seu pet em arte festiva</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="glass-card rounded-[2.5rem] p-10 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-10 right-10 w-10 h-10 bg-[#374151] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {step.number}
                </div>
                <div className="bg-[#EFF5EE] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="h-12 w-12 text-[#68A699]" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#1A2E35] mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

