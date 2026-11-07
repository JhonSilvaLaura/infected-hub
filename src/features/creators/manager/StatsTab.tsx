import { formatCount, formatPrice } from "@/lib/format";
import type { CreatorSubmission, DailyPoint } from "@/types/creator";
import { DailyChart } from "../DailyChart";

export function StatsTab({ submission, daily, net30 }: { submission: CreatorSubmission; daily: DailyPoint[]; net30: number }) {
  const sales30 = daily.reduce((n, d) => n + d.sales, 0);
  const conversion = submission.views30d ? (sales30 / submission.views30d) * 100 : 0;
  const tiles = [
    { label: "Visitas a la ficha · 30 d", value: formatCount(submission.views30d) },
    { label: "Ventas · 30 d", value: String(sales30) },
    { label: "Conversión", value: submission.price === null ? "—" : `${conversion.toFixed(1)} %`, detail: "ventas / visitas" },
    { label: "Ingresos netos · 30 d", value: formatPrice(net30) },
    { label: "Descargas totales", value: formatCount(submission.downloads) },
    { label: "Valoración", value: submission.ratingCount ? `★ ${submission.rating.toFixed(1)}` : "—", detail: `${submission.ratingCount} valoraciones` },
  ];
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete md:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-soot p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{t.label}</dt>
            <dd className="mt-2 font-display text-3xl font-black">{t.value}</dd>
            {t.detail && <dd className="text-xs text-ash">{t.detail}</dd>}
          </div>
        ))}
      </dl>
      <section className="rounded-[4px] border border-concrete bg-soot p-5">
        <DailyChart data={daily} title={`${submission.title} · últimos 30 días`} />
      </section>
      <p className="text-xs text-ash">Datos simulados. Las descargas diarias del mod se estiman a partir de su parte del total.</p>
    </div>
  );
}
