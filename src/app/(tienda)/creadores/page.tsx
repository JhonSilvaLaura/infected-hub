import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCount } from "@/lib/format";
import { getCategory, getCreators, getModsByCreator } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Creadores" };

export default function CreatorsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <PageHeader eyebrow="Quienes modelan los personajes" title="Creadores">
        Cada creador firma sus modelos y responde por sus derechos. Entra en su perfil para ver todo lo que ha publicado.
      </PageHeader>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {getCreators().map((c) => {
          const mods = getModsByCreator(c.slug);
          return (
            <li key={c.slug}>
              <Link
                href={`/creadores/${c.slug}`}
                className="flex items-center gap-4 rounded-[4px] border border-concrete bg-soot p-4 transition-colors hover:border-flare/60"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[3px] bg-concrete font-display text-2xl font-black">
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {c.name}
                    {c.verified && <BadgeCheck className="size-4 text-flare" aria-label="Creador verificado" />}
                  </p>
                  <p className="text-xs text-ash">{getCategory(c.specialty)?.name}</p>
                  <p className="mt-1 font-mono text-[11px] text-bone/60">
                    {mods.length} mods · {formatCount(mods.reduce((n, m) => n + m.downloads, 0))} descargas
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
