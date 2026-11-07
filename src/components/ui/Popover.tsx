"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PopoverProps {
  /** Accessible name of the trigger button */
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  onOpen?: () => void;
  panelClassName?: string;
}

/** Button + floating panel. Closes on Escape, outside click, or using a link or button inside. */
export function Popover({ label, trigger, children, align = "end", onOpen, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }}
        className="relative inline-flex size-9 items-center justify-center rounded-[3px] text-ash transition-colors hover:bg-soot-2 hover:text-bone"
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClickCapture={(e) => {
              if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
            }}
            className={cn(
              "absolute top-full z-50 mt-2 w-80 overflow-hidden rounded-[4px] border border-concrete bg-soot shadow-2xl shadow-black/60",
              align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
              panelClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
