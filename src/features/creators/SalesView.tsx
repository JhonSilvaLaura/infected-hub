"use client";

import { Download, Lock } from "lucide-react";
import { useState } from "react";
import { SelectFilter } from "@/components/forms/SearchInput";
import { Button } from "@/components/ui/Button";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { formatDate, formatPrice } from "@/lib/format";
import { downloadText, toCsv } from "@/lib/csv";
import { PLATFORM_FEE_RATE } from "@/lib/money";
import type { Sale } from "@/types/creator";

const RANGES = { "7": "7 días", "30": "30 días", "90": "90 días" } as const;
type Range = keyof typeof RANGES;
const PAGE_SIZE = 15;

const daysBefore = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
};
const plain = (cents: number) => (cents / 100).toFixed(2);

export function SalesView({ sales, mods, today }: { sales: Sale[]; mods: { id: string; title: string }[]; today: string }) {
  const [range, setRange] = useState<Range>("30");
  const [modId, setModId] = useState("ALL");
  const [page, setPage] = useState(1);

  const since = daysBefore(today, Number(range));
  const rows = sales.filter((s) => s.date >= since && (modId === "ALL" || s.modId === modId));
  const totals = rows.reduce((t, s) => ({ gross: t.gross + s.gross, fee: t.fee + s.fee, net: t.net + s.net }), { gross: 0, fee: 0, net: 0 });
  const view = paginate(rows, page, PAGE_SIZE);

  function exportCsv() {
    const csv = toCsv(
      ["fecha", "mod", "comprador", "precio_usd", "comision_usd", "neto_usd"],
      rows.map((s) => [s.date, s.modTitle, s.buyer, plain(s.gross), plain(s.fee), plain(s.net)]),
    );
    downloadText(`ventas-simuladas-${since}-a-${today}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SelectFilter
          label="Periodo"
          value={range}
          onChange={(v) => {
            setRange(v);
            setPage(1);
          }}
          options={(Object.keys(RANGES) as Range[]).map((r) => ({ value: r, label: `Últimos ${RANGES[r]}` }))}
        />
        <SelectFilter
          label="Mod"
          value={modId}
          onChange={(v) => {
            setModId(v);
            setPage(1);
          }}
          options={[{ value: "ALL", label: "Todos" }, ...mods.map((m) => ({ value: m.id, label: m.title }))]}
        />
        <Button variant="outline" className="sm:ml-auto" onClick={exportCsv} disabled={!rows.length}>
          <Download className="size-4" aria-hidden />
          Exportar CSV
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete md:grid-cols-4">
        {[
          { label: "Ventas", value: rows.length.toLocaleString("es") },
          { label: "Bruto", value: formatPrice(totals.gross) },
          { label: `Comisión (${Math.round(PLATFORM_FEE_RATE * 100)}%)`, value: `−${formatPrice(totals.fee)}` },
          { label: "Neto para ti", value: formatPrice(totals.net) },
        ].map((t) => (
          <div key={t.label} className="bg-soot p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{t.label}</dt>
            <dd className="mt-2 font-display text-3xl font-black">{t.value}</dd>
          </div>
        ))}
      </dl>

      <p className="font-mono text-xs uppercase tracking-wider text-ash" aria-live="polite">
        {rows.length} transacciones simuladas
      </p>

      {rows.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-12 text-center text-sm text-ash">Sin ventas en este periodo.</p>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Ventas simuladas</caption>
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium">Mod</th>
                <th scope="col" className="px-4 py-3 font-medium">Comprador</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Precio</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Comisión</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {view.items.map((s) => (
                <tr key={s.id} className="hover:bg-soot/60">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ash">{formatDate(s.date)}</td>
                  <td className="px-4 py-2.5">{s.modTitle}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-bone/70">{s.buyer}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatPrice(s.gross)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-ash">−{formatPrice(s.fee)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatPrice(s.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={view.page} totalPages={view.totalPages} onChange={setPage} />

      <section className="flex gap-3 rounded-[4px] border border-dashed border-concrete-2 p-5">
        <Lock className="mt-0.5 size-5 shrink-0 text-ash" aria-hidden />
        <div>
          <h2 className="font-semibold">Cobros</h2>
          <p className="mt-1 text-sm text-ash">
            Los retiros no están disponibles hasta habilitar pagos. No se piden ni se guardan datos bancarios en esta fase.
          </p>
        </div>
      </section>
    </div>
  );
}
