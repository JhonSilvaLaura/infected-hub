import type { LucideIcon } from "lucide-react";
import { COVER_TONES } from "@/components/cards/ModCover";
import { cn } from "@/lib/cn";
import type { CoverTone } from "@/types/mod";

/** Procedural art for a role, in the same language as the mod covers. */
export function RoleArt({ tone, icon: Icon, className, code }: { tone: CoverTone; icon: LucideIcon; className?: string; code?: string }) {
  return (
    <span aria-hidden className={cn("isolate block overflow-hidden", className)} style={{ background: COVER_TONES[tone] }}>
      <Icon strokeWidth={1} className="absolute -bottom-[14%] -right-[14%] size-[86%] -rotate-6 text-bone/[0.16]" />
      <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      {code && <span className="absolute left-3 top-2 font-display text-4xl font-black tracking-wider text-bone/30">{code}</span>}
      <span className="grain absolute inset-0 opacity-40" />
    </span>
  );
}
