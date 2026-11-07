"use client";

import { cn } from "@/lib/cn";

interface FilterTabsProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}

export function FilterTabs<T extends string>({ label, value, onChange, options, className }: FilterTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex gap-1.5 overflow-x-auto pb-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-[3px] border px-3 text-sm transition-colors",
            value === o.value ? "border-blood bg-blood/15 text-bone" : "border-concrete text-ash hover:text-bone",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="font-mono text-[11px] text-ash">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
