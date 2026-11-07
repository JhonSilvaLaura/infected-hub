"use client";

import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { FileDrop } from "@/components/forms/FileDrop";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { CategorySlug, CoverTone } from "@/types/mod";
import { IMAGE_MAX_COUNT, IMAGE_MAX_MB, moveItem, validateImage } from "../publish-validation";

type Item = { id: string; label: string; url?: string };

interface GalleryEditorProps {
  count: number;
  tone: CoverTone;
  category: CategorySlug;
  onSave: (count: number) => void;
}

/** Reorder, choose the cover, remove or add screenshots. Existing ones are placeholders in the demo. */
export function GalleryEditor({ count, tone, category, onSave }: GalleryEditorProps) {
  const [items, setItems] = useState<Item[]>(() =>
    Array.from({ length: count }, (_, i) => ({ id: `cap-${i + 1}`, label: `Captura ${i + 1}` })),
  );
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [announce, setAnnounce] = useState("");
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    setItems((list) => moveItem(list, from, to));
    setAnnounce(`${items[from].label}: posición ${to + 1}${to === 0 ? ", ahora es la portada" : ""}.`);
  }

  function add(files: File[]) {
    const bad = files.map(validateImage).find(Boolean);
    if (bad) return setError(bad);
    if (items.length + files.length > IMAGE_MAX_COUNT) return setError(`Máximo ${IMAGE_MAX_COUNT} capturas.`);
    setError(undefined);
    setItems((list) => [
      ...list,
      ...files.map((f) => {
        const url = URL.createObjectURL(f);
        urls.current.push(url);
        return { id: url, label: f.name, url };
      }),
    ]);
  }

  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Orden de las capturas">
        {items.map((item, i) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
            }}
            onDragEnd={() => setDragFrom(null)}
            className={cn(
              "group relative aspect-video cursor-grab overflow-hidden rounded-[3px] border",
              dragFrom === i ? "border-flare opacity-50" : "border-concrete",
            )}
          >
            {item.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.label} className="size-full object-cover" draggable={false} />
            ) : (
              <ModCover tone={tone} code={String(i + 1).padStart(2, "0")} category={category} variant={Number(item.id.split("-")[1])} className="absolute inset-0" />
            )}
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-[2px] bg-flare px-1.5 py-0.5 font-mono text-[10px] font-semibold text-asphalt">
                PORTADA
              </span>
            )}
            <span className="absolute right-1 top-1 max-w-[60%] truncate rounded-[2px] bg-asphalt/80 px-1.5 py-0.5 text-[10px]">{item.label}</span>
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
              <div className="flex gap-1">
                <Tool label={`Mover ${item.label} antes`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowLeft className="size-3.5" />
                </Tool>
                <Tool label={`Mover ${item.label} después`} disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowRight className="size-3.5" />
                </Tool>
                {i > 0 && (
                  <Tool label={`Usar ${item.label} como portada`} onClick={() => move(i, 0)}>
                    <Star className="size-3.5" />
                  </Tool>
                )}
              </div>
              <Tool label={`Quitar ${item.label}`} disabled={items.length === 1} onClick={() => setItems((l) => l.filter((x) => x.id !== item.id))}>
                <X className="size-3.5" />
              </Tool>
            </div>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {items.length < IMAGE_MAX_COUNT && (
        <FileDrop
          label="Añadir capturas"
          description={`JPG, PNG o WebP · ${IMAGE_MAX_MB} MB máx. · ${IMAGE_MAX_COUNT - items.length} restantes`}
          accept="image/jpeg,image/png,image/webp"
          multiple
          error={error}
          onFiles={add}
        />
      )}

      <Button onClick={() => onSave(items.length)}>Guardar galería</Button>
    </div>
  );
}

function Tool({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-[3px] bg-asphalt/85 text-bone transition-colors hover:bg-flare hover:text-asphalt disabled:opacity-30 disabled:hover:bg-asphalt/85 disabled:hover:text-bone"
    >
      {children}
    </button>
  );
}
