import { CircleCheck, CircleDashed, CircleSlash, Clock, PencilLine } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ModStatus } from "@/types/mod";

export const STATUS_META: Record<ModStatus, { label: string; className: string; icon: typeof Clock }> = {
  DRAFT: { label: "Borrador", className: "border-concrete-2 text-bone/70", icon: PencilLine },
  PENDING_REVIEW: { label: "En revisión", className: "border-flare/50 text-flare", icon: Clock },
  APPROVED: { label: "Publicado", className: "border-bile/50 text-bile", icon: CircleCheck },
  REJECTED: { label: "Rechazado", className: "border-blood/60 text-[#ff5a69]", icon: CircleDashed },
  SUSPENDED: { label: "Suspendido", className: "border-blood/60 bg-blood/10 text-[#ff5a69]", icon: CircleSlash },
};

/** Status is always shown with icon + label, never color alone. */
export function StatusBadge({ status, className }: { status: ModStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[2px] border px-2 font-mono text-[11px] uppercase tracking-wider",
        meta.className,
        className,
      )}
    >
      <meta.icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}
