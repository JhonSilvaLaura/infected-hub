"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpCircle, Download, Library } from "lucide-react";
import { useState } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { FormNotice } from "@/components/forms/FormNotice";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { formatDate, SLOT_GROUPS, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { LibraryItem } from "@/services/store.service";
import { findConflicts } from "./conflicts";
import { inactiveStore } from "./stores";

/**
 * The buyer's mods grouped by the character they replace. "Active" is a local mark that helps
 * pick one mod per character; it doesn't touch the game files.
 */
export function LibraryView({ items }: { items: LibraryItem[] }) {
  const inactive = inactiveStore.useIds();
  const [notice, setNotice] = useState<string | null>(null);
  const active = items.filter((i) => !inactive.includes(i.mod.id));
  const conflicts = findConflicts(active.map((i) => i.mod));
  const conflictIds = new Set(conflicts.flatMap((g) => g.items.map((m) => m.id)));
  const updates = items.filter((i) => i.updateAvailable).length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-20 text-center">
        <Library className="mb-4 size-10 text-ash" aria-hidden />
        <p className="font-display text-3xl font-black uppercase">Tu biblioteca está vacía</p>
        <ButtonLink href="/mods" className="mt-6">
          Buscar personajes
        </ButtonLink>
      </div>
    );
  }

  const keepOnly = (keepId: string, ids: string[]) => {
    for (const id of ids) if (id !== keepId) inactiveStore.add(id);
    inactiveStore.remove(keepId);
  };

  return (
    <div className="space-y-8">
      <p className="font-mono text-xs uppercase tracking-wider text-ash">
        {items.length} mods · {active.length} activos · {updates} {updates === 1 ? "actualización" : "actualizaciones"}
      </p>

      {conflicts.map((g) => (
        <div key={g.slot} role="status" className="rounded-[4px] border border-flare/40 bg-flare/[0.06] p-4">
          <p className="flex gap-2 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-flare" aria-hidden />
            <span>
              <strong>{SLOT_LABELS[g.slot]}</strong> tiene {g.items.length} mods activos que reemplazan las mismas partes. El
              juego solo cargará uno. ¿Cuál dejas activo?
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 pl-6">
            {g.items.map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant="outline"
                onClick={() => keepOnly(m.id, g.items.map((x) => x.id))}
              >
                Dejar solo {m.title}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <FormNotice message={notice} />

      {SLOT_GROUPS.map((group) => {
        const inGroup = items.filter((i) => group.slots.includes(i.mod.replaces));
        if (!inGroup.length) return null;
        return (
          <section key={group.label} aria-label={group.label}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">{group.label}</h2>
            <ul className="divide-y divide-concrete rounded-[4px] border border-concrete">
              {inGroup.map((item) => {
                const on = !inactive.includes(item.mod.id);
                return (
                  <li
                    key={item.mod.id}
                    className={cn(
                      "flex flex-wrap items-center gap-4 bg-soot p-4 sm:flex-nowrap",
                      conflictIds.has(item.mod.id) && "bg-flare/[0.04]",
                    )}
                  >
                    <ModCover
                      tone={item.mod.cover.tone}
                      code=""
                      category={item.mod.categorySlug}
                      className={cn("size-14 shrink-0 rounded-[3px] transition-opacity", !on && "opacity-40")}
                    />
                    <div className="min-w-0 flex-1">
                      <Link href={`/mods/${item.mod.slug}`} className="font-semibold hover:text-flare">
                        {item.mod.title}
                      </Link>
                      <p className="text-xs text-ash">
                        {SLOT_LABELS[item.mod.replaces]} · {item.kind === "purchase" ? "Comprado (demo)" : "Gratis"} el{" "}
                        {formatDate(item.acquiredAt)} · v{item.installedVersion}
                      </p>
                      {item.updateAvailable && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-bile">
                          <ArrowUpCircle className="size-3.5" aria-hidden />
                          Actualización disponible: v{item.mod.version}
                        </p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-xs text-ash">
                      {on ? "Activo" : "Inactivo"}
                      <Switch
                        label={`${item.mod.title} activo`}
                        checked={on}
                        onChange={(v) => (v ? inactiveStore.remove(item.mod.id) : inactiveStore.add(item.mod.id))}
                      />
                    </label>
                    <Button
                      size="sm"
                      variant={item.updateAvailable ? "primary" : "outline"}
                      onClick={() =>
                        setNotice(
                          `La descarga de ${item.mod.title} se activará con el backend, que generará un enlace temporal. No se descargó nada.`,
                        )
                      }
                    >
                      <Download className="size-4" aria-hidden />
                      {item.updateAvailable ? "Actualizar" : "Descargar"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
