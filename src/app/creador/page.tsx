import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FilePen,
  MessageSquare,
  MessageSquareText,
  Receipt,
  Star,
  ThumbsUp,
  Trophy,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ModCover } from "@/components/cards/ModCover";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ButtonLink } from "@/components/ui/Button";
import { DailyChart } from "@/features/creators/DailyChart";
import { StatusBadge } from "@/features/creators/StatusBadge";
import { formatCount, formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CreatorActivity } from "@/services/creator.service";
import {
  getCurrentCreator,
  getMyActivity,
  getMyDailyDownloads,
  getMyStats,
  getMySubmissions,
  getRevenueByMod,
} from "@/services/creator.service";

const ACTIVITY_ICONS: Record<CreatorActivity["kind"], LucideIcon> = {
  review: Star,
  comment: MessageSquare,
  approved: ThumbsUp,
  rejected: XCircle,
  milestone: Trophy,
  sale: Receipt,
};

function Trend({ value }: { value: number }) {
  return (
    <span className={cn("font-mono", value >= 0 ? "text-bile" : "text-[#ff5a69]")}>
      {value >= 0 ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

export default function CreatorOverviewPage() {
  const creator = getCurrentCreator();
  const stats = getMyStats(30);
  const subs = getMySubmissions();
  const top = getRevenueByMod(30).slice(0, 3);

  const tasks = [
    ...subs
      .filter((s) => s.status === "REJECTED" || s.status === "SUSPENDED")
      .map((s) => ({
        id: s.id,
        icon: AlertTriangle,
        tone: "text-[#ff5a69]",
        title: s.title,
        body: s.moderationNote ?? "",
        status: s.status,
        href: `/creador/mods/${s.id}?tab=moderacion`,
        cta: s.status === "REJECTED" ? "Corregir y reenviar" : "Ver el caso",
      })),
    ...(stats.unanswered
      ? [
          {
            id: "reviews",
            icon: MessageSquareText,
            tone: "text-flare",
            title: `${stats.unanswered} reseñas sin responder`,
            body: "Responder rápido sube la confianza de quien está por comprar.",
            status: undefined,
            href: "/creador/resenas?filtro=sin-responder",
            cta: "Responder",
          },
        ]
      : []),
    ...subs
      .filter((s) => s.status === "DRAFT")
      .map((s) => ({
        id: s.id,
        icon: FilePen,
        tone: "text-ash",
        title: `Borrador: ${s.title}`,
        body: `Última edición el ${formatDate(s.updatedAt)}.`,
        status: s.status,
        href: `/creador/mods/${s.id}`,
        cta: "Terminar",
      })),
  ];

  const tiles = [
    { label: "Ventas", value: String(stats.sales), trend: stats.salesTrend, detail: "simuladas" },
    { label: "Ingresos netos", value: formatPrice(stats.net), trend: stats.netTrend, detail: "tras comisión, simulados" },
    { label: "Descargas", value: formatCount(stats.downloads), trend: stats.downloadsTrend, detail: "gratis y de pago" },
    { label: "Valoración media", value: stats.averageRating.toFixed(1), detail: `${stats.totalRatings.toLocaleString("es")} valoraciones` },
    { label: "En revisión", value: String(stats.pending), detail: "mods o versiones" },
  ];

  return (
    <div className="space-y-8">
      <DashboardTitle
        eyebrow="Últimos 30 días"
        title={`Hola, ${creator.name}`}
        action={<ButtonLink href="/creador/mods/nuevo">Nuevo mod</ButtonLink>}
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="bg-soot p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{t.label}</dt>
            <dd className="mt-2 font-display text-4xl font-black leading-none text-bone">{t.value}</dd>
            <dd className="mt-2 text-xs text-ash">
              {t.trend !== undefined && (
                <>
                  <Trend value={t.trend} /> vs. 30 días anteriores ·{" "}
                </>
              )}
              {t.detail}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0 rounded-[4px] border border-concrete bg-soot p-5">
          <DailyChart data={getMyDailyDownloads(30)} title="Por día · últimos 30 días" />
        </section>

        <section aria-labelledby="tareas" className="min-w-0 rounded-[4px] border border-concrete bg-soot">
          <h2 id="tareas" className="border-b border-concrete px-5 py-3 font-semibold">
            Tareas pendientes <span className="font-mono text-xs text-ash">{tasks.length}</span>
          </h2>
          {tasks.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ash">Todo al día.</p>
          ) : (
            <ul className="divide-y divide-concrete">
              {tasks.map((t) => (
                <li key={t.id} className="flex gap-3 px-5 py-4">
                  <t.icon className={cn("mt-0.5 size-4 shrink-0", t.tone)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{t.title}</p>
                      {t.status && <StatusBadge status={t.status} />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-ash">{t.body}</p>
                    <Link href={t.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-flare hover:underline">
                      {t.cta}
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="top" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="top" className="font-semibold">Top por ingresos · 30 días</h2>
            <Link href="/creador/ventas" className="group inline-flex items-center gap-1.5 text-sm text-ash hover:text-flare">
              Ver ventas
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <ol className="space-y-2">
            {top.map((row, i) => {
              const s = subs.find((x) => x.id === row.modId)!;
              return (
                <li key={row.modId}>
                  <Link
                    href={`/creador/mods/${s.id}`}
                    className="flex items-center gap-3 rounded-[4px] border border-concrete bg-soot p-3 transition-colors hover:border-concrete-2"
                  >
                    <span className="w-6 font-display text-3xl font-black text-concrete-2">{i + 1}</span>
                    <ModCover tone={s.cover.tone} code="" category={s.categorySlug} className="size-12 shrink-0 rounded-[3px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{s.title}</p>
                      <p className="font-mono text-[11px] text-ash">{row.sales} ventas</p>
                    </div>
                    <p className="font-mono font-semibold">{formatPrice(row.net)}</p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="actividad" className="min-w-0 rounded-[4px] border border-concrete bg-soot p-5">
          <h2 id="actividad" className="mb-4 font-semibold">Actividad reciente</h2>
          <ol className="space-y-4">
            {getMyActivity().map((a) => {
              const Icon = ACTIVITY_ICONS[a.kind];
              return (
                <li key={a.id} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[3px] bg-soot-2">
                    <Icon className={a.kind === "rejected" ? "size-4 text-[#ff5a69]" : "size-4 text-flare"} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm text-bone/85">{a.text}</p>
                    <time dateTime={a.date} className="font-mono text-[11px] text-ash">
                      {formatDate(a.date)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
