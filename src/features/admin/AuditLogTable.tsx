"use client";

import { useState } from "react";
import { SearchInput, SelectFilter } from "@/components/forms/SearchInput";
import { Pagination, paginate } from "@/components/ui/Pagination";
import type { AuditAction, AuditEntry } from "@/types/admin";
import { filterAudit } from "./filters";
import { AUDIT_ACTION_LABELS, ROLE_LABELS, formatDateTime } from "./labels";

const PAGE_SIZE = 12;

/** Read-only by design: audit entries can't be edited or deleted from the UI. */
export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  const [q, setQ] = useState("");
  const [action, setAction] = useState<AuditAction | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const filtered = filterAudit(entries, { q, action });
  const view = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchInput
          className="flex-1"
          label="Buscar por responsable, objetivo o detalle"
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
        <SelectFilter
          label="Acción"
          value={action}
          onChange={(v) => {
            setAction(v);
            setPage(1);
          }}
          options={[
            { value: "ALL" as const, label: "Todas" },
            ...(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((a) => ({ value: a, label: AUDIT_ACTION_LABELS[a] })),
          ]}
        />
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-ash" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "entrada" : "entradas"}
      </p>

      {view.items.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-16 text-center text-sm text-ash">
          No hay entradas que coincidan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium">Responsable</th>
                <th scope="col" className="px-4 py-3 font-medium">Acción</th>
                <th scope="col" className="px-4 py-3 font-medium">Objetivo</th>
                <th scope="col" className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {view.items.map((e) => (
                <tr key={e.id} className="align-top hover:bg-soot/60">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ash">
                    {formatDateTime(e.at)}
                    <span className="block text-[10px]">{e.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{e.actor}</p>
                    <p className="text-xs text-ash">{ROLE_LABELS[e.actorRole]}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{AUDIT_ACTION_LABELS[e.action]}</td>
                  <td className="px-4 py-3">{e.target}</td>
                  <td className="px-4 py-3 text-bone/75">{e.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={view.page} totalPages={view.totalPages} onChange={setPage} className="pt-2" />
    </div>
  );
}
