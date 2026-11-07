"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, FileArchive, Loader2, ShieldAlert, ShieldCheck, Inbox } from "lucide-react";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/mod";
import type { QueueItem, ScanResult } from "@/types/admin";
import { SCAN_LABELS, formatDateTime } from "./labels";

const CHECKLIST = [
  "El creador declaró tener derechos de distribución",
  "Los créditos y permisos de terceros son verificables",
  "La descripción y las capturas corresponden al archivo",
  "No contiene recursos de Valve ni contenido inapropiado",
];

const REJECT_MIN = 20;

const SCAN_STYLE: Record<ScanResult, { icon: typeof ShieldCheck; className: string }> = {
  CLEAN: { icon: ShieldCheck, className: "text-bile border-bile/50" },
  PENDING: { icon: Loader2, className: "text-flare border-flare/50" },
  FLAGGED: { icon: ShieldAlert, className: "text-[#ff5a69] border-blood/60 bg-blood/10" },
};

export function ModerationQueue({ initial, categories }: { initial: QueueItem[]; categories: Category[] }) {
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial[0]?.id ?? null);
  const [checked, setChecked] = useState<Record<string, boolean[]>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const ticks = selected ? (checked[selected.id] ?? CHECKLIST.map(() => false)) : [];
  const canApprove = selected?.scan === "CLEAN" && ticks.every(Boolean);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  function resolve(action: "approve" | "reject") {
    if (!selected) return;
    const rest = items.filter((i) => i.id !== selected.id);
    setItems(rest);
    setSelectedId(rest[0]?.id ?? null);
    setNotice(
      action === "approve"
        ? `“${selected.title}” aprobado (solo en esta demo). Con la API pasaría a APPROVED y quedaría en el registro de auditoría.`
        : `“${selected.title}” rechazado (solo en esta demo). El creador vería tu motivo en su panel.`,
    );
  }

  return (
    <div className="space-y-4">
      <FormNotice message={notice} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-20 text-center">
          <Inbox className="mb-3 size-10 text-ash" aria-hidden />
          <p className="font-display text-3xl font-black uppercase">Cola vacía</p>
          <p className="mt-2 text-sm text-ash">No hay envíos esperando revisión.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <ul className="space-y-2" aria-label="Envíos pendientes">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-current={item.id === selectedId}
                  className={cn(
                    "w-full rounded-[4px] border p-3 text-left transition-colors",
                    item.id === selectedId ? "border-flare bg-soot-2" : "border-concrete bg-soot hover:border-concrete-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <span className="shrink-0 rounded-[2px] bg-asphalt px-1.5 py-0.5 font-mono text-[10px] uppercase text-ash">
                      {item.kind === "NEW" ? "Nuevo" : "Update"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ash">
                    {item.creator} · {formatDateTime(item.submittedAt)}
                  </p>
                  {item.scan !== "CLEAN" && (
                    <p className={cn("mt-1.5 text-xs font-medium", item.scan === "FLAGGED" ? "text-[#ff5a69]" : "text-flare")}>
                      {SCAN_LABELS[item.scan]}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.article
                key={selected.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-[4px] border border-concrete bg-soot p-5 md:p-6"
                aria-labelledby="queue-title"
              >
                <p className="font-mono text-xs uppercase tracking-wider text-ash">
                  {categoryName(selected.categorySlug)} · {selected.kind === "NEW" ? "Publicación nueva" : "Actualización"} · v
                  {selected.version}
                </p>
                <h2 id="queue-title" className="mt-1 font-display text-4xl font-black uppercase leading-none">
                  {selected.title}
                </h2>
                <p className="mt-1 text-sm text-ash">por {selected.creator}</p>
                <p className="mt-4 text-bone/85">{selected.summary}</p>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Detail label="Archivo">
                    <span className="inline-flex items-center gap-2">
                      <FileArchive className="size-4 text-ash" aria-hidden />
                      {selected.fileName} · {selected.fileSizeMb} MB
                    </span>
                  </Detail>
                  <Detail label="Análisis antivirus">
                    <ScanBadge scan={selected.scan} />
                  </Detail>
                  <Detail label="Licencia">{selected.license}</Detail>
                  <Detail label="Créditos y permisos">{selected.credits ?? "No declara recursos de terceros"}</Detail>
                  {selected.releaseNotes && <Detail label="Novedades de la versión">{selected.releaseNotes}</Detail>}
                </dl>

                <fieldset className="mt-6 rounded-[3px] border border-concrete p-4">
                  <legend className="px-1 text-sm font-semibold">Revisión</legend>
                  <ul className="space-y-2.5">
                    {CHECKLIST.map((item, i) => (
                      <li key={item}>
                        <label className="flex cursor-pointer items-start gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={ticks[i]}
                            onChange={(e) =>
                              setChecked((c) => ({ ...c, [selected.id]: ticks.map((t, j) => (j === i ? e.target.checked : t)) }))
                            }
                            className="mt-0.5 size-4 accent-[var(--flare)]"
                          />
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {!canApprove && (
                    <p className="text-xs text-ash sm:mr-auto">
                      {selected.scan !== "CLEAN"
                        ? "No se puede aprobar hasta que el análisis antivirus termine sin amenazas."
                        : "Marca todos los puntos de la revisión para aprobar."}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReason("");
                      setReasonError(undefined);
                      setRejecting(true);
                    }}
                  >
                    Rechazar
                  </Button>
                  <Button disabled={!canApprove} onClick={() => resolve("approve")}>
                    <CheckCircle2 className="size-4" aria-hidden />
                    Aprobar
                  </Button>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="Rechazar envío"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (reason.trim().length < REJECT_MIN) {
                  setReasonError(`Explica el motivo con al menos ${REJECT_MIN} caracteres para que el creador pueda corregirlo.`);
                  return;
                }
                setRejecting(false);
                resolve("reject");
              }}
            >
              Rechazar
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-bone/75">El creador verá este motivo en su panel. Indica qué debe cambiar.</p>
        <TextAreaField
          label="Motivo del rechazo"
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setReasonError(undefined);
          }}
          error={reasonError}
          placeholder="Ej.: el modelo parece derivado de otro autor; adjunta su permiso o reemplázalo."
        />
      </Modal>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function ScanBadge({ scan }: { scan: ScanResult }) {
  const { icon: Icon, className } = SCAN_STYLE[scan];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-[2px] border px-2 text-xs font-medium", className)}>
      <Icon className={cn("size-3.5", scan === "PENDING" && "animate-spin")} aria-hidden />
      {SCAN_LABELS[scan]}
    </span>
  );
}
