"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, FileWarning, MessageSquare, Package } from "lucide-react";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { FieldError } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { Report, ReportStatus } from "@/types/admin";
import { filterReports } from "./filters";
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS, formatDateTime } from "./labels";

type Filter = ReportStatus | "ACTIVE" | "ALL";

const OUTCOMES = {
  MOD: ["Suspender el mod", "Pedir cambios al creador", "Sin acción sobre el contenido"],
  COMMENT: ["Eliminar el comentario", "Eliminar y advertir al autor", "Sin acción sobre el contenido"],
};

const STATUS_STYLE: Record<ReportStatus, string> = {
  OPEN: "border-flare/50 text-flare",
  IN_REVIEW: "border-bone/40 text-bone",
  RESOLVED: "border-bile/50 text-bile",
  DISMISSED: "border-concrete-2 text-ash",
};

export function ReportsBoard({ initial }: { initial: Report[] }) {
  const [reports, setReports] = useState(initial);
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [closing, setClosing] = useState<{ report: Report; mode: "resolve" | "dismiss" } | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const rows = filterReports(reports, { status: filter });
  const count = (f: Filter) => filterReports(reports, { status: f }).length;
  const setStatus = (id: string, status: ReportStatus) =>
    setReports((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));

  function openClose(report: Report, mode: "resolve" | "dismiss") {
    setClosing({ report, mode });
    setOutcome(null);
    setNote("");
    setError(undefined);
  }

  function confirmClose() {
    if (!closing) return;
    if (closing.mode === "resolve" && !outcome) return setError("Elige qué se hizo con el contenido.");
    if (note.trim().length < 10) return setError("Añade una nota interna de al menos 10 caracteres.");
    setStatus(closing.report.id, closing.mode === "resolve" ? "RESOLVED" : "DISMISSED");
    setNotice(
      `Reporte ${closing.report.id} ${closing.mode === "resolve" ? `resuelto: ${outcome?.toLowerCase()}` : "descartado"} (solo en esta demo).`,
    );
    setClosing(null);
  }

  return (
    <div className="space-y-4">
      <FilterTabs
        label="Filtrar reportes"
        value={filter}
        onChange={setFilter}
        options={(["ACTIVE", "OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED", "ALL"] as Filter[]).map((f) => ({
          value: f,
          label: f === "ACTIVE" ? "Activos" : f === "ALL" ? "Todos" : REPORT_STATUS_LABELS[f],
          count: count(f),
        }))}
      />
      <FormNotice message={notice} />

      {rows.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-16 text-center text-sm text-ash">
          No hay reportes en este estado.
        </p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {rows.map((r) => {
              const TargetIcon = r.targetType === "MOD" ? Package : MessageSquare;
              const active = r.status === "OPEN" || r.status === "IN_REVIEW";
              return (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-[4px] border border-concrete bg-soot"
                >
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex h-6 items-center rounded-[2px] border px-2 font-mono text-[11px] uppercase tracking-wider", STATUS_STYLE[r.status])}>
                          {REPORT_STATUS_LABELS[r.status]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                          <FileWarning className="size-4 text-[#ff5a69]" aria-hidden />
                          {REPORT_REASON_LABELS[r.reason]}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2">
                        <TargetIcon className="size-4 shrink-0 text-ash" aria-hidden />
                        <span className="font-medium">{r.targetTitle}</span>
                        {r.modSlug && (
                          <Link href={`/mods/${r.modSlug}`} aria-label="Abrir el mod" className="text-ash hover:text-flare">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        )}
                      </p>
                      <p className="mt-1.5 text-sm text-bone/75">“{r.details}”</p>
                      <p className="mt-2 font-mono text-[11px] text-ash">
                        {r.id} · por {r.reporter} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                    {active && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {r.status === "OPEN" && (
                          <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "IN_REVIEW")}>
                            Tomar caso
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openClose(r, "dismiss")}>
                          Descartar
                        </Button>
                        <Button size="sm" onClick={() => openClose(r, "resolve")}>
                          Resolver
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={Boolean(closing)}
        onClose={() => setClosing(null)}
        title={closing?.mode === "resolve" ? "Resolver reporte" : "Descartar reporte"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setClosing(null)}>
              Cancelar
            </Button>
            <Button variant={closing?.mode === "resolve" ? "primary" : "danger"} onClick={confirmClose}>
              {closing?.mode === "resolve" ? "Resolver" : "Descartar"}
            </Button>
          </>
        }
      >
        {closing && (
          <div className="space-y-4">
            <p className="text-sm text-bone/75">
              {closing.report.targetTitle} · {REPORT_REASON_LABELS[closing.report.reason]}
            </p>
            {closing.mode === "resolve" && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">¿Qué se hizo?</legend>
                {OUTCOMES[closing.report.targetType].map((o) => (
                  <label
                    key={o}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-[3px] border px-3 py-2.5 text-sm",
                      outcome === o ? "border-blood bg-blood/10" : "border-concrete hover:border-concrete-2",
                    )}
                  >
                    <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} className="accent-[var(--blood)]" />
                    {o}
                  </label>
                ))}
              </fieldset>
            )}
            <TextAreaField
              label="Nota interna"
              rows={3}
              hint="Queda en el registro de auditoría. No la ve quien reportó."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <FieldError message={error} />
          </div>
        )}
      </Modal>
    </div>
  );
}
