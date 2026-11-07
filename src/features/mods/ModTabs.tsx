"use client";

import { motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ModTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const baseId = useId();

  return (
    <div>
      <div role="tablist" aria-label="Información del mod" className="flex gap-1 overflow-x-auto border-b border-concrete">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`${baseId}-${t.id}-tab`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`${baseId}-${t.id}-panel`}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors",
              active === t.id ? "text-bone" : "text-ash hover:text-bone",
            )}
          >
            {t.label}
            {active === t.id && <motion.span layoutId={`${baseId}-tab-line`} className="absolute inset-x-0 -bottom-px h-0.5 bg-blood" />}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`${baseId}-${t.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${t.id}-tab`}
          hidden={active !== t.id}
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
