"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, label, placeholder, className }: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex h-11 items-center gap-2 rounded-[3px] border border-concrete bg-soot px-3 focus-within:border-flare",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-ash" aria-hidden />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="w-full bg-transparent text-sm text-bone placeholder:text-ash focus:outline-none"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Borrar búsqueda" className="text-ash hover:text-bone">
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}

/** Compact labelled select used in dashboard toolbars. */
export function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-[3px] border border-concrete bg-soot px-3 text-sm">
      <span className="shrink-0 text-ash">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-w-0 bg-transparent font-semibold text-bone focus:outline-none [&>option]:bg-soot"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
