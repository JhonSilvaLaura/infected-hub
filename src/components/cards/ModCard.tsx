import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { ModCover } from "@/components/cards/ModCover";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, Creator, Mod } from "@/types/mod";

interface ModCardProps {
  mod: Mod;
  creator?: Creator;
  category?: Category;
  size?: "default" | "large";
  className?: string;
}

export function ModCard({ mod, creator, category, size = "default", className }: ModCardProps) {
  const large = size === "large";
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[4px] border border-concrete bg-soot transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-blood/70",
        className,
      )}
    >
      <div className={cn("relative", large && "flex flex-1 flex-col")}>
        <ModCover
          tone={mod.cover.tone}
          code={mod.cover.code}
          category={mod.categorySlug}
          large={large}
          variant={Number(mod.id.slice(-1))}
          className={large ? "aspect-[16/10] lg:aspect-auto lg:min-h-[320px] lg:flex-1" : "aspect-[16/10]"}
        />
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <PriceTag price={mod.price} />
          <span className="rounded-[2px] bg-asphalt/80 px-2 py-1 font-mono text-[11px] text-bone/80 backdrop-blur-sm">
            v{mod.version}
          </span>
        </div>
      </div>

      <div className={cn("flex flex-col gap-3 p-4", large ? "md:p-6" : "flex-1")}>
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-ash">
          <span className="truncate">{category?.name ?? mod.categorySlug}</span>
          <Rating value={mod.rating} />
        </div>

        <h3 className={cn("font-display font-extrabold uppercase leading-[0.95] tracking-wide text-bone", large ? "text-3xl md:text-5xl" : "text-2xl")}>
          <Link href={`/mods/${mod.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {mod.title}
          </Link>
        </h3>

        <p className={cn("line-clamp-2 text-sm text-ash", large && "md:text-base")}>{mod.summary}</p>

        <div className="mt-auto flex items-center justify-between border-t border-concrete pt-3 text-xs">
          <span className="truncate text-bone/80">
            por <span className="text-bone">{creator?.name ?? mod.creatorSlug}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3 whitespace-nowrap text-ash">
            <span className="inline-flex items-center gap-1 font-mono">
              <Download className="size-3.5" aria-hidden />
              {formatCount(mod.downloads)}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-flare">
              Detalles
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </span>
          </span>
        </div>
      </div>
      {/* Focus ring for the stretched link */}
      <span className="pointer-events-none absolute inset-0 rounded-[4px] ring-2 ring-flare opacity-0 group-has-[a:focus-visible]:opacity-100" />
    </article>
  );
}
