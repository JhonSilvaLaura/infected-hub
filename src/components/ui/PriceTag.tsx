import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({ price, className }: { price: number | null; className?: string }) {
  const free = price === null;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-[2px] px-2 font-mono text-[11px] font-semibold uppercase tracking-wider",
        free ? "bg-bone text-asphalt" : "bg-flare text-asphalt",
        className,
      )}
    >
      {free ? "Gratis" : formatPrice(price)}
    </span>
  );
}
