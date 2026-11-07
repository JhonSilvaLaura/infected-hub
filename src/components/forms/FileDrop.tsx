"use client";

import { UploadCloud } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "./TextField";

interface FileDropProps {
  label: string;
  description: ReactNode;
  accept: string;
  multiple?: boolean;
  error?: string;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
}

/** Drag-and-drop zone backed by a real file input, so it works with keyboard and screen readers. */
export function FileDrop({ label, description, accept, multiple, error, onFiles, children }: FileDropProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium text-bone">
        {label}
      </p>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = Array.from(e.dataTransfer.files);
          onFiles(multiple ? files : files.slice(0, 1));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border-2 border-dashed px-6 py-8 text-center transition-colors has-[:focus-visible]:border-flare",
          dragging ? "border-flare bg-flare/10" : error ? "border-blood/70" : "border-concrete-2 hover:border-ash",
        )}
      >
        <UploadCloud className={cn("size-7", dragging ? "text-flare" : "text-ash")} aria-hidden />
        <span className="text-sm">
          <span className="font-semibold text-flare">Elige un archivo</span> o arrástralo aquí
        </span>
        <span className="text-xs text-ash">{description}</span>
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          aria-labelledby={`${id}-label`}
          aria-invalid={Boolean(error)}
          className="sr-only"
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
