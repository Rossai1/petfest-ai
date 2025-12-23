'use client';

import { Button } from '@/components/ui/button';

export default function PricingTabs({ activeTab, onTabChange }) {
  return (
    <div className="mt-8 inline-flex bg-[#fdfaf6]/30 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-full border border-white/20">
      <Button
        onClick={() => onTabChange('packages')}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
          activeTab === 'packages'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Pacotes de Créditos
      </Button>
      <Button
        onClick={() => onTabChange('subscription')}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          activeTab === 'subscription'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Assinatura Mensal
      </Button>
    </div>
  );
}


