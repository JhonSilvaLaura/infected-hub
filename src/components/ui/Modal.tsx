"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Use "alertdialog" for destructive confirmations */
  role?: "dialog" | "alertdialog";
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom sheet on mobile, centered dialog from `sm` up. Closes on Escape and backdrop click. */
export function Modal({ open, onClose, title, role = "dialog", children, footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-[4px] border border-concrete bg-soot p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-3xl font-black uppercase leading-none">
                {title}
              </h2>
              <button type="button" onClick={onClose} aria-label="Cerrar" className="text-ash hover:text-bone">
                <X className="size-5" />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
