"use client";

import { Ban, RotateCcw, UsersRound } from "lucide-react";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { SearchInput, SelectFilter } from "@/components/forms/SearchInput";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AdminUser, Role, UserStatus } from "@/types/admin";
import { canChangeRole, filterUsers } from "./filters";
import { ROLE_LABELS, USER_STATUS_LABELS } from "./labels";

const PAGE_SIZE = 10;
const ROLES: Role[] = ["USER", "CREATOR", "MODERATOR", "ADMIN"];
/** The signed-in admin in this demo */
const ACTOR = { id: "u-001", role: "ADMIN" as Role };

const STATUS_STYLE: Record<UserStatus, string> = {
  ACTIVE: "text-bile",
  UNVERIFIED: "text-flare",
  SUSPENDED: "text-[#ff5a69]",
};

type Pending =
  | { kind: "role"; user: AdminUser; role: Role }
  | { kind: "suspend"; user: AdminUser }
  | { kind: "reactivate"; user: AdminUser };

export function UsersTable({ initial }: { initial: AdminUser[] }) {
  const [users, setUsers] = useState(initial);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [status, setStatus] = useState<UserStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = filterUsers(users, { q, role, status });
  const view = paginate(filtered, page, PAGE_SIZE);
  const admins = users.filter((u) => u.role === "ADMIN").length;
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };
  const update = (id: string, patch: Partial<AdminUser>) => setUsers((all) => all.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  function confirm() {
    if (!pending) return;
    if (pending.kind === "suspend" && reason.trim().length < 10) {
      setReasonError("Indica el motivo con al menos 10 caracteres. El usuario lo recibirá por correo.");
      return;
    }
    if (pending.kind === "role") update(pending.user.id, { role: pending.role });
    if (pending.kind === "suspend") update(pending.user.id, { status: "SUSPENDED" });
    if (pending.kind === "reactivate") update(pending.user.id, { status: "ACTIVE" });
    setNotice(
      pending.kind === "role"
        ? `Rol de ${pending.user.username}: ${ROLE_LABELS[pending.user.role]} → ${ROLE_LABELS[pending.role]} (solo en esta demo).`
        : `${pending.user.username} ${pending.kind === "suspend" ? "suspendido" : "reactivado"} (solo en esta demo).`,
    );
    setPending(null);
  }

  function open(next: Pending) {
    setPending(next);
    setReason("");
    setReasonError(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchInput className="flex-1" label="Buscar por usuario o correo" value={q} onChange={resetPage(setQ)} />
        <SelectFilter
          label="Rol"
          value={role}
          onChange={resetPage(setRole)}
          options={[{ value: "ALL" as const, label: "Todos" }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
        />
        <SelectFilter
          label="Estado"
          value={status}
          onChange={resetPage(setStatus)}
          options={[
            { value: "ALL" as const, label: "Todos" },
            ...(Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((s) => ({ value: s, label: USER_STATUS_LABELS[s] })),
          ]}
        />
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-ash" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"}
      </p>
      <FormNotice message={notice} />

      {view.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-16 text-center">
          <UsersRound className="mb-3 size-9 text-ash" aria-hidden />
          <p className="font-semibold">Ningún usuario coincide</p>
          <p className="mt-1 text-sm text-ash">Cambia la búsqueda o los filtros.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-concrete">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Alta</th>
                <th scope="col" className="px-4 py-3 font-medium">Última visita</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Reportes</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete">
              {view.items.map((u) => {
                const editable = canChangeRole(ACTOR, u, admins);
                return (
                  <tr key={u.id} className="hover:bg-soot/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {u.username}
                        {u.id === ACTOR.id && <span className="ml-2 font-mono text-[10px] text-ash">(tú)</span>}
                      </p>
                      <p className="text-xs text-ash">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {editable ? (
                        <select
                          value={u.role}
                          aria-label={`Rol de ${u.username}`}
                          onChange={(e) => open({ kind: "role", user: u, role: e.target.value as Role })}
                          className="h-8 rounded-[3px] border border-concrete bg-asphalt px-2 text-sm focus:border-flare focus:outline-none [&>option]:bg-soot"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span title="No puedes cambiar este rol">{ROLE_LABELS[u.role]}</span>
                      )}
                    </td>
                    <td className={cn("px-4 py-3 font-medium", STATUS_STYLE[u.status])}>{USER_STATUS_LABELS[u.status]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ash">{formatDate(u.joinedAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ash">{formatDate(u.lastSeenAt)}</td>
                    <td className="px-4 py-3 text-right font-mono">{u.reportsReceived || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== ACTOR.id &&
                        (u.status === "SUSPENDED" ? (
                          <Button size="sm" variant="ghost" onClick={() => open({ kind: "reactivate", user: u })}>
                            <RotateCcw className="size-4" aria-hidden />
                            Reactivar
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="hover:text-[#ff5a69]" onClick={() => open({ kind: "suspend", user: u })}>
                            <Ban className="size-4" aria-hidden />
                            Suspender
                          </Button>
                        ))}
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
        title={pending?.kind === "role" ? "Cambiar rol" : pending?.kind === "suspend" ? "Suspender cuenta" : "Reactivar cuenta"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button variant={pending?.kind === "suspend" ? "danger" : "primary"} onClick={confirm}>
              Confirmar
            </Button>
          </>
        }
      >
        {pending?.kind === "role" && (
          <p className="text-sm text-bone/80">
            <strong>{pending.user.username}</strong> pasará de {ROLE_LABELS[pending.user.role]} a{" "}
            <strong>{ROLE_LABELS[pending.role]}</strong>.
            {pending.role === "ADMIN" && " Tendrá acceso total a la plataforma, incluida la configuración."}
          </p>
        )}
        {pending?.kind === "suspend" && (
          <div className="space-y-4">
            <p className="text-sm text-bone/80">
              <strong>{pending.user.username}</strong> no podrá iniciar sesión, comentar ni publicar mientras dure la suspensión.
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
        )}
        {pending?.kind === "reactivate" && (
          <p className="text-sm text-bone/80">
            <strong>{pending.user.username}</strong> recuperará el acceso a su cuenta.
          </p>
        )}
      </Modal>
    </div>
  );
}
