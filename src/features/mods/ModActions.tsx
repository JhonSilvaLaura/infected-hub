"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Download, Flag, Heart, Info, Share2, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { cartStore, wishlistStore } from "@/features/store/stores";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

const REPORT_REASONS = [
  "Contenido inapropiado",
  "Archivo sospechoso",
  "Publicado sin autorización",
  "Suplantación de autoría",
  "Incumplimiento de licencia",
];

interface ModActionsProps {
  modId: string;
  title: string;
  price: number | null;
  /** The (demo) buyer already has it in their library */
  owned: boolean;
}

const DOWNLOAD_NOTICE =
  "Las descargas se activarán con el backend: el servidor comprobará el estado del mod y tus permisos, y generará un enlace temporal.";

export function ModActions({ modId, title, price, owned }: ModActionsProps) {
  const inCart = cartStore.useIds().includes(modId);
  const wished = wishlistStore.useIds().includes(modId);
  const [notice, setNotice] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  function toggleWish() {
    wishlistStore.toggle(modId);
    setNotice(wished ? "Quitado de tu lista de deseos." : "Añadido a tu lista de deseos (en este navegador).");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setNotice("Enlace copiado al portapapeles.");
      }
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    <div className="space-y-3">
      {owned ? (
        <>
          <Button size="lg" className="w-full" onClick={() => setNotice(DOWNLOAD_NOTICE)}>
            <Download className="size-4" aria-hidden />
            Ya lo tienes · Descargar
          </Button>
          <Link href="/cuenta/biblioteca" className="block text-center text-xs text-ash hover:text-bone">
            Ver en mi biblioteca
          </Link>
        </>
      ) : price === null ? (
        <Button size="lg" className="w-full" onClick={() => setNotice(DOWNLOAD_NOTICE)}>
          <Download className="size-4" aria-hidden />
          Descargar gratis
        </Button>
      ) : inCart ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link href="/carrito" className={buttonClass({ variant: "primary", size: "lg" })}>
            <Check className="size-4" aria-hidden />
            En el carrito · Ver carrito
          </Link>
          <Button size="lg" variant="outline" onClick={() => cartStore.remove(modId)} aria-label="Quitar del carrito">
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={() => cartStore.add(modId)}>
          <ShoppingCart className="size-4" aria-hidden />
          Añadir al carrito · {formatPrice(price)}
        </Button>
      )}
      {price !== null && !owned && (
        <p className="text-xs text-ash">El pago todavía no está habilitado: puedes preparar tu carrito, pero no se cobra nada.</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={toggleWish} aria-pressed={wished}>
          <motion.span key={String(wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart className={cn("size-4", wished && "fill-blood text-blood")} aria-hidden />
          </motion.span>
          {wished ? "En deseos" : "Deseos"}
        </Button>
        <Button variant="outline" size="sm" onClick={share}>
          <Share2 className="size-4" aria-hidden />
          Compartir
        </Button>
        <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
          <Flag className="size-4" aria-hidden />
          Reportar
        </Button>
      </div>

      <div aria-live="polite">
        <AnimatePresence>
          {notice && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-[3px] border border-concrete bg-soot-2 p-3 text-xs text-bone/80"
            >
              <Info className="mt-0.5 size-3.5 shrink-0 text-flare" aria-hidden />
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso" className="text-ash hover:text-bone">
                <X className="size-3.5" />
              </button>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => {
          setReportOpen(false);
          setNotice("Los reportes llegarán al equipo de moderación cuando el backend esté disponible. No se envió nada.");
        }}
      />
    </div>
  );
}

function ReportDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  const [reason, setReason] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar mod"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" disabled={!reason} onClick={onSubmit}>
            Enviar reporte
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm text-ash">¿Qué problema encontraste?</legend>
        {REPORT_REASONS.map((r) => (
          <label
            key={r}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-[3px] border px-3 py-2.5 text-sm transition-colors",
              reason === r ? "border-blood bg-blood/10" : "border-concrete hover:border-concrete-2",
            )}
          >
            <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--blood)]" />
            {r}
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}
