'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'Como funciona o reset mensal?',
    answer:
      'Seu contador de imagens é resetado automaticamente todo mês, permitindo que você use novamente todas as imagens do seu plano.',
  },
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer:
      'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente.',
  },
  {
    question: 'O que acontece se eu exceder o limite?',
    answer:
      'Você receberá uma notificação quando estiver próximo do limite. Ao atingir o limite, você precisará fazer upgrade ou aguardar o reset mensal.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="organic-container py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8 sm:mb-12 fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
          Perguntas Frequentes
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="organic-card cursor-pointer hover-lift transition-all"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground pr-4">
                {faq.question}
              </h3>
              <button
                className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-transform"
                style={{
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>
            {openIndex === index && (
              <div className="mt-4 pt-4 border-t border-border fade-in-up">
                <p className="text-base text-muted-foreground">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


