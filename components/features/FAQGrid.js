'use client';

import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Os créditos expiram?',
    answer: 'Não! Uma vez comprados, seus créditos são seus para sempre. Use quando a inspiração bater, seja hoje ou no próximo Natal.',
  },
  {
    question: 'Posso usar as fotos comercialmente?',
    answer: 'Sim, se você adquirir o plano Profissional, você tem direito de uso comercial das imagens geradas.',
  },
  {
    question: 'Como funciona o reembolso?',
    answer: 'Se você não gerou nenhuma imagem com seus créditos, oferecemos reembolso total em até 7 dias após a compra.',
  },
  {
    question: 'Quantas fotos preciso enviar?',
    answer: 'Recomendamos entre 10 a 20 fotos variadas do seu pet para obter os melhores resultados possíveis com nossa IA.',
  },
];

export default function FAQGrid() {
  return (
    <div className="mt-20 w-full max-w-4xl mx-auto bg-[#fdfaf6] dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-sm border border-white/10">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Perguntas Frequentes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#5f8f8f]" />
              {faq.question}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


