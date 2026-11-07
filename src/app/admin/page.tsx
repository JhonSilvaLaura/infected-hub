import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { AUDIT_ACTION_LABELS, REPORT_REASON_LABELS, SCAN_LABELS, formatDateTime } from "@/features/admin/labels";
import { formatCount } from "@/lib/format";
import { getAuditLog, getModerationQueue, getPlatformStats, getReports } from "@/services/admin.service";

export default function AdminOverviewPage() {
  const stats = getPlatformStats();
  const queue = getModerationQueue();
  const reports = getReports().filter((r) => r.status === "OPEN" || r.status === "IN_REVIEW").slice(0, 4);
  const audit = getAuditLog().slice(0, 6);

  const tiles = [
    { label: "Usuarios", value: formatCount(stats.users), detail: `${stats.unverified} sin verificar` },
    { label: "Creadores", value: String(stats.creators), detail: "con rol CREATOR" },
    { label: "Mods publicados", value: String(stats.published), detail: `${formatCount(stats.totalDownloads)} descargas` },
    { label: "Pendientes", value: String(stats.queue + stats.openReports), detail: `${stats.queue} en cola · ${stats.openReports} reportes` },
  ];

  return (
    <div className="space-y-8">
      <DashboardTitle eyebrow="Administración" title="Resumen" />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-soot p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">{t.label}</dt>
            <dd className="mt-2 font-display text-5xl font-black leading-none">{t.value}</dd>
            <dd className="mt-2 text-xs text-ash">{t.detail}</dd>
          </div>
        ))}
      </dl>

      {stats.flaggedFiles > 0 && (
        <p className="flex items-center gap-2 rounded-[4px] border border-blood/50 bg-blood/[0.06] px-4 py-3 text-sm">
          <ShieldAlert className="size-4 shrink-0 text-[#ff5a69]" aria-hidden />
          <span className="flex-1">
            {stats.flaggedFiles} archivo en cola con <strong>amenaza detectada</strong> por el análisis antivirus.
          </span>
          <Link href="/admin/moderacion" className="font-semibold text-flare hover:underline">
            Revisar
          </Link>
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Cola de moderación" href="/admin/moderacion">
          <ul className="divide-y divide-concrete">
            {queue.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{q.title}</p>
                  <p className="text-xs text-ash">
                    {q.creator} · {q.kind === "NEW" ? "Nuevo" : `Actualización v${q.version}`}
                  </p>
                </div>
                <span className={`shrink-0 font-mono text-[11px] ${q.scan === "FLAGGED" ? "text-[#ff5a69]" : "text-ash"}`}>
                  {SCAN_LABELS[q.scan]}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Reportes activos" href="/admin/reportes">
          <ul className="divide-y divide-concrete">
            {reports.map((r) => (
              <li key={r.id} className="py-3">
                <p className="truncate font-medium">{r.targetTitle}</p>
                <p className="text-xs text-ash">
                  {REPORT_REASON_LABELS[r.reason]} · {formatDateTime(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Últimas acciones" href="/admin/auditoria">
        <ul className="divide-y divide-concrete">
          {audit.map((e) => (
            <li key={e.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[150px_1fr_auto] sm:items-center sm:gap-4">
              <span className="font-mono text-[11px] text-ash">{formatDateTime(e.at)}</span>
              <span className="min-w-0 truncate">
                <span className="font-semibold">{e.actor}</span> · {AUDIT_ACTION_LABELS[e.action]} ·{" "}
                <span className="text-bone/75">{e.target}</span>
              </span>
              <span className="font-mono text-[11px] text-ash">{e.id}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[4px] border border-concrete bg-soot p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="group inline-flex items-center gap-1 text-sm text-ash hover:text-flare">
          Ver todo
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
      {children}
    </section>
  );
}
