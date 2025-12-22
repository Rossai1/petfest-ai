'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { themes } from '@/lib/themes-data';

export default function ThemeSelector({ value, onValueChange }) {
  return (
    <div className="organic-card">
      <label className="block text-sm font-semibold text-foreground mb-3">
        Escolha um tema festivo
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="organic-select w-full">
          <SelectValue placeholder="Selecione um tema" />
        </SelectTrigger>
        <SelectContent className="rounded-[20px] border-border bg-card shadow-lg overflow-hidden">
          {Object.values(themes).map((theme) => (
            <SelectItem 
              key={theme.id} 
              value={theme.id}
              className="rounded-[12px] py-3 px-4 cursor-pointer focus:bg-secondary hover:bg-secondary transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{theme.icon}</span>
                <span className="font-medium">{theme.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
