"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  describedBy?: string;
}

export function Switch({ checked, onChange, label, disabled, describedBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-flare bg-flare" : "border-concrete-2 bg-asphalt",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className={cn("size-4 rounded-full", checked ? "ml-[22px] bg-asphalt" : "ml-[3px] bg-ash")}
      />
    </button>
  );
}
