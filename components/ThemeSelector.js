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
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full border-[#e5e5e5] rounded-xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-300">
        <SelectValue placeholder="Selecione um tema" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-[#e5e5e5] shadow-[var(--shadow-medium)]">
        {Object.values(themes).map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{theme.icon}</span>
              <span>{theme.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

