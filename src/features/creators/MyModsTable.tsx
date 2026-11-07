"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, ExternalLink, EyeOff, MoreHorizontal, PackageOpen, Pencil, Trash2, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { FormNotice } from "@/components/forms/FormNotice";
import { SearchInput, SelectFilter } from "@/components/forms/SearchInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Modal } from "@/components/ui/Modal";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { Popover } from "@/components/ui/Popover";
import { formatCount, formatDate, formatPrice, SLOT_GROUPS, SLOT_LABELS } from "@/lib/format";
import type { CreatorSubmission } from "@/types/creator";
import type { Category, CategorySlug, CharacterSlot, ModStatus } from "@/types/mod";
import { canDelete, canUnpublish, duplicateAsDraft, filterMyMods, SORT_LABELS, type MyModsSort } from "./my-mods";
import { STATUS_META, StatusBadge } from "./StatusBadge";

const STATUSES: (ModStatus | "ALL")[] = ["ALL", "DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"];
const PAGE_SIZE = 8;

type Pending = { kind: "unpublish" | "delete"; ids: string[] };

interface MyModsTableProps {
  initial: CreatorSubmission[];
  categories: Category[];
  today: string;
}

/**
 * The creator's catalogue in every state. Actions change only this tab's state (demo);
 * with the API each one is a request the server authorises against the mod's owner.
 */
export function MyModsTable({ initial, categories, today }: MyModsTableProps) {
  const params = useSearchParams();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState<ModStatus | "ALL">("ALL");
  const [category, setCategory] = useState<CategorySlug | "ALL">("ALL");
  const [slot, setSlot] = useState<CharacterSlot | "ALL">("ALL");
  const [sort, setSort] = useState<MyModsSort>("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = filterMyMods(rows, { q, status, category, slot, sort });
  const view = paginate(filtered, page, PAGE_SIZE);
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const selectedRows = rows.filter((r) => selected.includes(r.id));
  const bulkUnpublish = selectedRows.filter(canUnpublish).map((r) => r.id);
  const bulkDelete = selectedRows.filter(canDelete).map((r) => r.id);
  const pageIds = view.items.map((r) => r.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  function apply({ kind, ids }: Pending) {
    if (kind === "delete") setRows((r) => r.filter((x) => !ids.includes(x.id)));
    else setRows((r) => r.map((x) => (ids.includes(x.id) ? { ...x, status: "DRAFT", slug: undefined, updatedAt: today } : x)));
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    setNotice(
      `${ids.length} ${ids.length === 1 ? "mod" : "mods"} ${kind === "delete" ? "eliminado(s)" : "despublicado(s)"} (solo en esta demo; se restablece al recargar).`,
    );
    setPending(null);
  }

  function duplicate(source: CreatorSubmission) {
    const copy = duplicateAsDraft(source, rows, today);
    setRows((r) => [copy, ...r]);
    setStatus("ALL");
    setSort("updated");
    setPage(1);
    setNotice(`Se creó “${copy.title}” como borrador (solo en esta demo).`);
  }

  const pendingRows = pending ? rows.filter((r) => pending.ids.includes(r.id)) : [];

  return (
    <div className="space-y-4">
      <FilterTabs
        label="Filtrar por estado"
        value={status}
        onChange={reset(setStatus)}
        options={STATUSES.map((s) => ({
          value: s,
          label: s === "ALL" ? "Todos" : STATUS_META[s].label,
          count: s === "ALL" ? rows.length : rows.filter((r) => r.status === s).length,
        }))}
      />

      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput className="flex-1" label="Buscar en mis mods" value={q} onChange={reset(setQ)} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
          <SelectFilter
            label="Categoría"
            value={category}
            onChange={reset(setCategory)}
            options={[
              { value: "ALL" as const, label: "Todas" },
              ...categories.filter((c) => c.slug !== "packs").map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <SelectFilter
            label="Personaje"
            value={slot}
            onChange={reset(setSlot)}
            options={[
              { value: "ALL" as const, label: "Todos" },
              ...SLOT_GROUPS.flatMap((g) => g.slots).map((s) => ({ value: s, label: SLOT_LABELS[s] })),
            ]}
          />
          <SelectFilter
            label="Orden"
            value={sort}
            onChange={reset(setSort)}
            options={(Object.keys(SORT_LABELS) as MyModsSort[]).map((s) => ({ value: s, label: SORT_LABELS[s] }))}
          />
        </div>
      </div>

      <FormNotice message={notice} />

      {selected.length > 0 && (
        <div
          role="region"
          aria-label="Acciones sobre la selección"
          className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-[4px] border border-concrete-2 bg-soot-2 px-4 py-3"
        >
          <p className="text-sm font-semibold">
            {selected.length} {selected.length === 1 ? "seleccionado" : "seleccionados"}
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={!bulkUnpublish.length}
            onClick={() => setPending({ kind: "unpublish", ids: bulkUnpublish })}
          >
            <EyeOff className="size-4" aria-hidden />
            Despublicar ({bulkUnpublish.length})
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={!bulkDelete.length}
            onClick={() => setPending({ kind: "delete", ids: bulkDelete })}
          >
            <Trash2 className="size-4" aria-hidden />
            Eliminar borradores ({bulkDelete.length})
          </Button>
          <button type="button" onClick={() => setSelected([])} className="ml-auto text-sm text-ash hover:text-bone">
            Quitar selección
          </button>
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-wider text-ash" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "mod" : "mods"}
      </p>

      {view.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-16 text-center">
          <PackageOpen className="mb-3 size-9 text-ash" aria-hidden />
          <p className="font-semibold">Ningún mod coincide con estos filtros</p>
          <ButtonLink href="/creador/mods/nuevo" className="mt-5" size="sm">
            Nuevo mod
          </ButtonLink>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar los mods de esta página"
                    checked={allOnPage}
                    onChange={() =>
                      setSelected((s) => (allOnPage ? s.filter((id) => !pageIds.includes(id)) : [...new Set([...s, ...pageIds])]))
                    }
                    className="accent-[var(--blood)]"
                  />
                </th>
                <th scope="col" className="px-2 py-3 font-medium">Mod</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Precio</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Ventas</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Descargas</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Valoración</th>
                <th scope="col" className="px-4 py-3 font-medium">Actualizado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {view.items.map((s) => {
                const inReview = s.versions.find((v) => v.state === "IN_REVIEW" && s.status === "APPROVED");
                return (
                  <tr key={s.id} className="transition-colors hover:bg-soot/60">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${s.title}`}
                        checked={selected.includes(s.id)}
                        onChange={() => setSelected((x) => (x.includes(s.id) ? x.filter((id) => id !== s.id) : [...x, s.id]))}
                        className="accent-[var(--blood)]"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <ModCover tone={s.cover.tone} code="" category={s.categorySlug} className="size-11 shrink-0 rounded-[3px]" />
                        <div className="min-w-0">
                          <Link href={`/creador/mods/${s.id}`} className="font-semibold hover:text-flare">
                            {s.title}
                          </Link>
                          <p className="font-mono text-[11px] text-ash">
                            {SLOT_LABELS[s.replaces]} · v{s.version}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                      {inReview && <p className="mt-1 font-mono text-[10px] text-flare">v{inReview.version} en revisión</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{s.sales ? formatCount(s.sales) : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{s.downloads ? formatCount(s.downloads) : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{s.ratingCount ? `★ ${s.rating.toFixed(1)}` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ash">{formatDate(s.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Popover label={`Acciones de ${s.title}`} trigger={<MoreHorizontal className="size-4" />} panelClassName="w-60">
                        <ul className="py-1 text-left text-sm">
                          <MenuLink href={`/creador/mods/${s.id}`} icon={<Pencil className="size-4" />}>
                            Editar
                          </MenuLink>
                          {s.status !== "DRAFT" && (
                            <MenuLink href={`/creador/mods/${s.id}?tab=versiones`} icon={<Upload className="size-4" />}>
                              Subir nueva versión
                            </MenuLink>
                          )}
                          {s.slug && s.status === "APPROVED" && (
                            <MenuLink href={`/mods/${s.slug}`} icon={<ExternalLink className="size-4" />}>
                              Ver en la tienda
                            </MenuLink>
                          )}
                          <MenuButton onClick={() => duplicate(s)} icon={<Copy className="size-4" />}>
                            Duplicar como borrador
                          </MenuButton>
                          {canUnpublish(s) && (
                            <MenuButton onClick={() => setPending({ kind: "unpublish", ids: [s.id] })} icon={<EyeOff className="size-4" />}>
                              Despublicar
                            </MenuButton>
                          )}
                          {canDelete(s) && (
                            <MenuButton danger onClick={() => setPending({ kind: "delete", ids: [s.id] })} icon={<Trash2 className="size-4" />}>
                              Eliminar
                            </MenuButton>
                          )}
                        </ul>
                      </Popover>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={view.page} totalPages={view.totalPages} onChange={setPage} className="pt-2" />

      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        role="alertdialog"
        title={pending?.kind === "delete" ? "Eliminar borradores" : "Despublicar mods"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)} autoFocus>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => pending && apply(pending)}>
              {pending?.kind === "delete" ? "Eliminar" : "Despublicar"}
            </Button>
          </>
        }
      >
        <ul className="list-inside list-disc text-sm font-semibold">
          {pendingRows.map((r) => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-bone/75">
          {pending?.kind === "delete"
            ? "Los borradores y sus archivos se eliminarán. No se puede deshacer."
            : "Saldrán de la tienda y volverán a borrador. Quienes ya los tienen conservan su copia; para volver a publicarlos pasarán otra vez por moderación."}
        </p>
      </Modal>
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-bone/85 hover:bg-soot-2 hover:text-bone">
        <span className="text-ash">{icon}</span>
        {children}
      </Link>
    </li>
  );
}

function MenuButton({
  onClick,
  icon,
  danger,
  children,
}: {
  onClick: () => void;
  icon: ReactNode;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={
          danger
            ? "flex w-full items-center gap-2.5 px-4 py-2 text-[#ff5a69] hover:bg-blood/15"
            : "flex w-full items-center gap-2.5 px-4 py-2 text-bone/85 hover:bg-soot-2 hover:text-bone"
        }
      >
        <span className={danger ? "" : "text-ash"}>{icon}</span>
        {children}
      </button>
    </li>
  );
}
