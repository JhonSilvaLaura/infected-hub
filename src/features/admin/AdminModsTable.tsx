"use client";

import Link from "next/link";
import { ExternalLink, PauseCircle, PlayCircle } from "lucide-react";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { SearchInput, SelectFilter } from "@/components/forms/SearchInput";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Modal } from "@/components/ui/Modal";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { STATUS_META, StatusBadge } from "@/features/creators/StatusBadge";
import { formatCount, formatDate } from "@/lib/format";
import type { AdminModRow } from "@/services/admin.service";
import type { Category, CategorySlug, ModStatus } from "@/types/mod";

const PAGE_SIZE = 10;
const STATUSES: ("ALL" | ModStatus)[] = ["ALL", "APPROVED", "PENDING_REVIEW", "DRAFT", "REJECTED", "SUSPENDED"];
const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function AdminModsTable({ initial, categories }: { initial: AdminModRow[]; categories: Category[] }) {
  const [mods, setMods] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | ModStatus>("ALL");
  const [category, setCategory] = useState<"ALL" | CategorySlug>("ALL");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminModRow | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = mods.filter(
    (m) =>
      (status === "ALL" || m.status === status) &&
      (category === "ALL" || m.categorySlug === category) &&
      (!q || normalize(`${m.title} ${m.creator}`).includes(normalize(q))),
  );
  const view = paginate(filtered, page, PAGE_SIZE);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const withReset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  function confirm() {
    if (!target) return;
    const suspending = target.status === "APPROVED";
    if (suspending && reason.trim().length < 10) {
      setReasonError("Indica el motivo (mínimo 10 caracteres). El creador lo verá en su panel.");
      return;
    }
    setMods((all) => all.map((m) => (m.id === target.id ? { ...m, status: suspending ? "SUSPENDED" : "APPROVED" } : m)));
    setNotice(`“${target.title}” ${suspending ? "suspendido y oculto del catálogo" : "reactivado"} (solo en esta demo).`);
    setTarget(null);
  }

  return (
    <div className="space-y-4">
      <FilterTabs
        label="Filtrar por estado"
        value={status}
        onChange={withReset(setStatus)}
        options={STATUSES.map((s) => ({
          value: s,
          label: s === "ALL" ? "Todos" : STATUS_META[s].label,
          count: s === "ALL" ? mods.length : mods.filter((m) => m.status === s).length,
        }))}
      />
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchInput className="flex-1" label="Buscar por título o creador" value={q} onChange={withReset(setQ)} />
        <SelectFilter
          label="Categoría"
          value={category}
          onChange={withReset(setCategory)}
          options={[
            { value: "ALL" as const, label: "Todas" },
            ...categories.filter((c) => c.slug !== "packs").map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>
      <FormNotice message={notice} />

      {view.items.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-16 text-center text-sm text-ash">
          Ningún mod coincide con estos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mod</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Descargas</th>
                <th scope="col" className="px-4 py-3 font-medium">Actualizado</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {view.items.map((m) => (
                <tr key={m.id} className="hover:bg-soot/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-xs text-ash">
                      {m.creator} · v{m.version}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-bone/80">{catName(m.categorySlug)}</td>
                  <td className="px-4 py-3 text-right font-mono">{m.downloads ? formatCount(m.downloads) : "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">{formatDate(m.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {m.slug && m.status === "APPROVED" && (
                        <Link
                          href={`/mods/${m.slug}`}
                          aria-label={`Ver ${m.title}`}
                          className="inline-flex size-9 items-center justify-center rounded-[3px] text-ash hover:bg-soot-2 hover:text-bone"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                      {(m.status === "APPROVED" || m.status === "SUSPENDED") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTarget(m);
                            setReason("");
                            setReasonError(undefined);
                          }}
                        >
                          {m.status === "APPROVED" ? <PauseCircle className="size-4" aria-hidden /> : <PlayCircle className="size-4" aria-hidden />}
                          {m.status === "APPROVED" ? "Suspender" : "Reactivar"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={view.page} totalPages={view.totalPages} onChange={setPage} className="pt-2" />

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        role="alertdialog"
        title={target?.status === "APPROVED" ? "Suspender mod" : "Reactivar mod"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button variant={target?.status === "APPROVED" ? "danger" : "primary"} onClick={confirm}>
              Confirmar
            </Button>
          </>
        }
      >
        {target?.status === "APPROVED" ? (
          <div className="space-y-4">
            <p className="text-sm text-bone/80">
              <strong>{target.title}</strong> dejará de aparecer en el catálogo y no se podrá descargar.
            </p>
            <TextAreaField
              label="Motivo"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(undefined);
              }}
              error={reasonError}
            />
          </div>
        ) : (
          <p className="text-sm text-bone/80">
            <strong>{target?.title}</strong> volverá a estar visible y descargable.
          </p>
        )}
      </Modal>
    </div>
  );
}
