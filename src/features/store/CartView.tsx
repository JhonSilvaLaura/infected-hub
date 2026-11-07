"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Lock, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice, SLOT_LABELS } from "@/lib/format";
import type { Mod } from "@/types/mod";
import { cartTotals, findConflicts } from "./conflicts";
import { cartStore } from "./stores";

interface CartViewProps {
  /** Every public mod; the cart only stores ids */
  mods: Mod[];
  /** Mods the (demo) buyer already owns, to warn about character clashes */
  owned: Mod[];
}

export function CartView({ mods, owned }: CartViewProps) {
  const ids = cartStore.useIds();
  const reduce = useReducedMotion();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // Free mods never belong in the cart; drop anything stale or unknown
  const items = ids.flatMap((id) => mods.filter((m) => m.id === id && m.price !== null));
  const { count, total } = cartTotals(items);
  const ownedIds = new Set(owned.map((m) => m.id));
  const conflicts = findConflicts([...items, ...owned]).filter((g) => g.items.some((m) => !ownedIds.has(m.id)));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-20 text-center">
        <ShoppingCart className="mb-4 size-10 text-ash" aria-hidden />
        <p className="font-display text-3xl font-black uppercase">Tu carrito está vacío</p>
        <p className="mt-2 max-w-sm text-sm text-ash">Añade mods de pago desde su ficha. Los gratuitos se descargan directamente.</p>
        <ButtonLink href="/mods" className="mt-6">
          Explorar el catálogo
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {conflicts.map((g) => (
          <p key={g.slot} role="status" className="flex gap-3 rounded-[4px] border border-flare/40 bg-flare/[0.06] p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-flare" aria-hidden />
            <span>
              <strong className="font-semibold">{SLOT_LABELS[g.slot]}:</strong>{" "}
              {g.items.map((m) => `${m.title}${ownedIds.has(m.id) ? " (ya lo tienes)" : ""}`).join(" y ")} reemplazan las
              mismas partes. Solo puedes tener uno activo a la vez.
            </span>
          </p>
        ))}

        <ul className="divide-y divide-concrete rounded-[4px] border border-concrete">
          <AnimatePresence initial={false}>
            {items.map((m) => (
              <motion.li
                key={m.id}
                layout={!reduce}
                exit={{ opacity: 0, x: -16 }}
                className="flex items-center gap-4 bg-soot p-4"
              >
                <ModCover tone={m.cover.tone} code="" category={m.categorySlug} className="size-16 shrink-0 rounded-[3px]" />
                <div className="min-w-0 flex-1">
                  <Link href={`/mods/${m.slug}`} className="font-semibold hover:text-flare">
                    {m.title}
                  </Link>
                  <p className="text-xs text-ash">Reemplaza a {SLOT_LABELS[m.replaces]}</p>
                </div>
                <p className="font-mono font-semibold">{formatPrice(m.price)}</p>
                <button
                  type="button"
                  onClick={() => cartStore.remove(m.id)}
                  aria-label={`Quitar ${m.title} del carrito`}
                  className="rounded-[3px] p-2 text-ash transition-colors hover:bg-blood/15 hover:text-[#ff5a69]"
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <button type="button" onClick={cartStore.clear} className="text-sm text-ash underline-offset-4 hover:text-bone hover:underline">
          Vaciar carrito
        </button>
      </div>

      <aside className="h-fit rounded-[4px] border border-concrete bg-soot p-5 lg:sticky lg:top-28" aria-label="Resumen del pedido">
        <h2 className="font-display text-2xl font-black uppercase">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ash">
              {count} {count === 1 ? "mod" : "mods"}
            </dt>
            <dd className="font-mono">{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between border-t border-concrete pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="font-mono">{formatPrice(total)}</dd>
          </div>
        </dl>
        <Button size="lg" className="mt-5 w-full" onClick={() => setCheckoutOpen(true)}>
          <Lock className="size-4" aria-hidden />
          Pagar
        </Button>
        <p className="mt-3 text-xs text-ash">Precios en USD. Los mods comprados quedan en tu biblioteca para siempre.</p>
      </aside>

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Pagos no habilitados"
        footer={
          <Button type="button" onClick={() => setCheckoutOpen(false)}>
            Entendido
          </Button>
        }
      >
        <div className="space-y-3 text-sm text-bone/85">
          <p>
            Ibas a pagar <strong className="font-mono">{formatPrice(total)}</strong> por {count} {count === 1 ? "mod" : "mods"}.
          </p>
          <p>
            Los pagos todavía no están habilitados: falta revisar licencias, impuestos y requisitos legales.{" "}
            <strong>No se realizó ningún cobro</strong> y no se pidió ningún dato de pago.
          </p>
          <p className="text-ash">Tu carrito se queda guardado en este navegador.</p>
        </div>
      </Modal>
    </div>
  );
}
