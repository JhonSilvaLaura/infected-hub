import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[3px] font-semibold uppercase tracking-wider transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-flare text-asphalt hover:bg-[#ff9445]",
  danger: "bg-blood text-bone hover:bg-[#e8394b]",
  ghost: "text-bone hover:bg-soot-2",
  outline: "border border-concrete-2 text-bone hover:border-bone/60 hover:bg-soot-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-sm",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
}

export const buttonClass = ({ variant = "primary", size = "md" }: StyleProps = {}, className?: string) =>
  cn(base, variants[variant], sizes[size], className);

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & StyleProps) {
  return <button className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
