import { Eye } from "lucide-react";
import type { ReactNode } from "react";

/** States that a dashboard runs on simulated data and what will protect it once the API exists. */
export function DemoBanner({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 flex items-start gap-2 rounded-[3px] border border-dashed border-concrete-2 px-3 py-2.5 text-xs text-ash">
      <Eye className="mt-px size-4 shrink-0 text-flare" aria-hidden />
      <span>
        <strong className="font-semibold text-bone">Vista de demostración.</strong> {children}
      </span>
    </p>
  );
}
