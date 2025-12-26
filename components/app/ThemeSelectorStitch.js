'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { themes } from '@/lib/data/themes-data';
import { ChevronDown } from 'lucide-react';

export default function ThemeSelectorStitch({ value, onValueChange }) {
  return (
    <div className="w-full bg-[#fdfbf7] dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-white/20 dark:border-gray-700 space-y-3 sm:space-y-4">
      <label htmlFor="theme-selector" className="block font-display font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
        Escolha um tema festivo
      </label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger 
            id="theme-selector"
            className="w-full appearance-none bg-[#f8f6f2] dark:bg-gray-800 border-0 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#79aca9] focus:outline-none shadow-inner text-base sm:text-lg cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
            aria-label="Selecionar tema festivo"
          >
            <SelectValue placeholder="Selecione um tema..." />
          </SelectTrigger>
          <SelectContent 
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-[#fdfbf7] dark:bg-gray-800 shadow-lg overflow-hidden max-h-[70vh] sm:max-h-[400px]"
            position="popper"
            sideOffset={8}
          >
            {Object.values(themes).map((theme) => (
              <SelectItem 
                key={theme.id} 
                value={theme.id}
                className="rounded-lg py-3 sm:py-4 px-4 sm:px-5 cursor-pointer focus:bg-[#79aca9]/10 hover:bg-[#79aca9]/10 active:bg-[#79aca9]/20 transition-colors min-h-[48px] sm:min-h-[52px] touch-manipulation"
              >
                <span className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
                  <span className="text-lg sm:text-xl" aria-hidden="true">{theme.icon}</span>
                  <span className="font-medium">{theme.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}


