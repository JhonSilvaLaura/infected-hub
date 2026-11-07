"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "./TextField";

interface TextAreaFieldProps extends Omit<ComponentProps<"textarea">, "id"> {
  label: string;
  error?: string;
  hint?: string;
  /** Shows "n / max" under the field */
  max?: number;
}

export function TextAreaField({ label, error, hint, max, className, value, ...props }: TextAreaFieldProps) {
  const id = useId();
  const length = String(value ?? "").length;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-bone">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(error && `${id}-error`, hint && `${id}-hint`) || undefined}
        className={cn(
          "block w-full resize-y rounded-[3px] border bg-asphalt px-3.5 py-3 text-bone placeholder:text-ash/70 transition-colors focus:border-flare focus:outline-none",
          error ? "border-blood" : "border-concrete-2",
        )}
        {...props}
      />
      <div className="mt-1.5 flex justify-between gap-3 text-xs text-ash">
        <span id={`${id}-hint`}>{hint}</span>
        {max && <span className={cn("font-mono", length > max && "text-[#ff5a69]")}>{length} / {max}</span>}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
