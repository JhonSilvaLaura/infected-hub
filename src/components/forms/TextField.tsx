"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Rendered at the right of the label row, e.g. a "forgot password" link */
  labelAside?: ReactNode;
}

export function TextField({ label, error, hint, labelAside, className, type = "text", ...props }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-bone">
          {label}
        </label>
        {labelAside}
      </div>
      <div
        className={cn(
          "flex h-12 items-center rounded-[3px] border bg-asphalt transition-colors focus-within:border-flare",
          error ? "border-blood" : "border-concrete-2",
        )}
      >
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="h-full w-full bg-transparent px-3.5 text-bone placeholder:text-ash/70 focus:outline-none"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-[3px] text-ash hover:text-bone"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hint && (
        <div id={`${id}-hint`} className="mt-1.5 text-xs text-ash">
          {hint}
        </div>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden pt-1.5 text-xs font-medium text-[#ff5a69]"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
