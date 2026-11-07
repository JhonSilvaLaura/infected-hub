import Link from "next/link";
import { ModCover } from "@/components/cards/ModCover";
import type { Collection, Creator, Mod } from "@/types/mod";

const FAN = [
  "z-[3] group-hover:-translate-y-1",
  "z-[2] translate-x-2 -translate-y-2 rotate-2 opacity-80 group-hover:translate-x-8 group-hover:rotate-6",
  "z-[1] translate-x-4 -translate-y-4 rotate-4 opacity-60 group-hover:translate-x-16 group-hover:rotate-12",
];

export function CollectionCard({ collection, mods, curator }: { collection: Collection; mods: Mod[]; curator?: Creator }) {
  return (
    <article className="group h-full rounded-[4px] border border-concrete bg-soot p-4 transition-colors hover:border-blood/60">
      {/* Stacked covers that fan out on hover */}
      <div className="relative mb-5 h-44">
        {mods.slice(0, 3).map((m, j) => (
          <ModCover
            key={m.id}
            tone={m.cover.tone}
            code={m.cover.code}
            category={m.categorySlug}
            variant={j}
            className={`absolute inset-0 rounded-[3px] border border-concrete-2 shadow-xl transition-transform duration-500 ease-out ${FAN[j]}`}
          />
        ))}
        <span className="absolute -right-1 -top-1 z-10 rounded-[2px] bg-bone px-2 py-1 font-mono text-[11px] font-semibold text-asphalt">
          {mods.length} mods
        </span>
      </div>
      <h3 className="font-display text-3xl font-black uppercase leading-none tracking-wide">{collection.title}</h3>
      <p className="mt-2 text-sm text-ash">{collection.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {mods.map((m) => (
          <li key={m.id}>
            <Link
              href={`/mods/${m.slug}`}
              className="inline-block rounded-[2px] border border-concrete px-2 py-1 text-xs text-bone/80 hover:border-flare hover:text-flare"
            >
              {m.title}
            </Link>
          </li>
        ))}
      </ul>
      {curator && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ash">Curada por {curator.name}</p>
      )}
    </article>
  );
}
