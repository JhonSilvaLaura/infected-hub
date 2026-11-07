import Link from "next/link";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import type { Category } from "@/types/mod";

/** Styled like a stencilled supply-crate label. */
export function CategoryCard({ category, count }: { category: Category; count: number }) {
  const Icon = CATEGORY_ICONS[category.slug];
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[4px] border border-concrete bg-soot p-5 transition-[border-color,background-color] duration-300 hover:border-flare/60 hover:bg-soot-2"
    >
      <div className="flex items-start justify-between">
        <Icon className="size-7 text-bone/70 transition-colors duration-300 group-hover:text-flare" strokeWidth={1.5} aria-hidden />
        <span className="font-mono text-[11px] tracking-wider text-ash">
          {String(count).padStart(2, "0")} {category.slug === "packs" ? "packs" : "mods"}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-wide text-bone [overflow-wrap:anywhere]">
          {category.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs text-ash">{category.description}</p>
      </div>
      <span
        aria-hidden
        className="hazard absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
