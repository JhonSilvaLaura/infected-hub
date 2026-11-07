"use client";

import { useState } from "react";
import { formatCount, formatPrice, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { DailyPoint, Sale } from "@/types/creator";
import type { CharacterSlot } from "@/types/mod";
import { DailyChart } from "./DailyChart";

const RANGES = [7, 30, 90] as const;

interface StatsViewProps {
  daily: DailyPoint[];
  sales: Sale[];
  mods: { id: string; title: string; downloads: number }[];
  demand: { slot: CharacterSlot; downloads: number }[];
  /** Characters this creator already covers, to highlight gaps */
  covered: CharacterSlot[];
}

export function StatsView({ daily, sales, mods, demand, covered }: StatsViewProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const span = daily.slice(-range);
  const since = span[0].date;
  const inRange = sales.filter((s) => s.date >= since);
  const rangeDownloads = span.reduce((n, d) => n + d.downloads, 0);
  const totalDownloads = mods.reduce((n, m) => n + m.downloads, 0) || 1;

  const rows = mods
    .map((m) => {
      const own = inRange.filter((s) => s.modId === m.id);
      return {
        ...m,
        downloads: Math.round(rangeDownloads * (m.downloads / totalDownloads)),
        sales: own.length,
        net: own.reduce((n, s) => n + s.net, 0),
      };
    })
    .sort((a, b) => b.net - a.net || b.downloads - a.downloads);
  const maxNet = Math.max(1, ...rows.map((r) => r.net));
  const maxDemand = Math.max(1, ...demand.map((d) => d.downloads));

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Periodo" className="flex w-fit rounded-[3px] border border-concrete p-0.5">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={cn("rounded-[2px] px-4 py-1.5 text-sm font-semibold transition-colors", range === r ? "bg-concrete text-bone" : "text-ash hover:text-bone")}
          >
            {r} días
          </button>
        ))}
      </div>

      <section className="rounded-[4px] border border-concrete bg-soot p-5">
        <DailyChart data={span} title={`Por día · últimos ${range} días`} />
      </section>

      <section aria-labelledby="comparativa">
        <h2 id="comparativa" className="mb-3 font-semibold">
          Comparativa entre tus mods
        </h2>
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mod</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Descargas</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Ventas</th>
                <th scope="col" className="w-2/5 px-4 py-3 font-medium">Ingresos netos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="px-4 py-3 font-semibold">{r.title}</th>
                  <td className="px-4 py-3 text-right font-mono">{formatCount(r.downloads)}</td>
                  <td className="px-4 py-3 text-right font-mono">{r.sales || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-concrete" aria-hidden>
                        <div className="h-full rounded-full bg-flare" style={{ width: `${(r.net / maxNet) * 100}%` }} />
                      </div>
                      <span className="w-24 text-right font-mono">{r.net ? formatPrice(r.net) : "Gratis"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ash">Datos simulados. Las descargas por mod se estiman según su parte del total.</p>
      </section>

      <section aria-labelledby="demanda">
        <h2 id="demanda" className="font-semibold">
          Demanda por personaje
        </h2>
        <p className="mb-4 mt-1 text-sm text-ash">
          Descargas de mods de pago en toda la tienda según a quién reemplazan. Los marcados “sin mod tuyo” son huecos que
          podrías cubrir.
        </p>
        <ol className="space-y-2">
          {demand.map((d) => {
            const mine = covered.includes(d.slot);
            return (
              <li key={d.slot} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                <span className="font-semibold">{SLOT_LABELS[d.slot]}</span>
                <div className="h-2 overflow-hidden rounded-full bg-concrete" aria-hidden>
                  <div className={cn("h-full rounded-full", mine ? "bg-ash" : "bg-bile")} style={{ width: `${(d.downloads / maxDemand) * 100}%` }} />
                </div>
                <span className="whitespace-nowrap text-right font-mono text-xs">
                  {formatCount(d.downloads)} {!mine && <span className="text-bile">· sin mod tuyo</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
