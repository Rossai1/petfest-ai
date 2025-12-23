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
    <div className="w-full bg-[#fdfbf7] dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-gray-700 space-y-4">
      <label className="block font-display font-semibold text-lg text-gray-800 dark:text-white">
        Escolha um tema festivo
      </label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full appearance-none bg-[#f8f6f2] dark:bg-gray-800 border-0 rounded-xl px-5 py-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#79aca9] focus:outline-none shadow-inner text-lg cursor-pointer min-h-[52px]">
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
                className="rounded-lg py-4 px-5 cursor-pointer focus:bg-[#79aca9]/10 hover:bg-[#79aca9]/10 transition-colors min-h-[52px] touch-manipulation"
              >
                <span className="flex items-center gap-3 text-lg">
                  <span className="text-xl">{theme.icon}</span>
                  <span className="font-medium">{theme.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronDown className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}


