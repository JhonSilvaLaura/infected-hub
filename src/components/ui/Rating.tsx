import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs text-bone", className)}>
      <Star className="size-3.5 fill-flare text-flare" aria-hidden />
      <span>{value.toFixed(1)}</span>
      <span className="sr-only">de 5 estrellas</span>
      {count !== undefined && <span className="text-ash">({count.toLocaleString("es")})</span>}
    </span>
  );
}

export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            i <= Math.round(value) ? "fill-flare text-flare" : "text-concrete-2",
          )}
        />
      ))}
    </span>
  );
}
