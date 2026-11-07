"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, FileArchive, Lock, Star, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FieldError, TextField } from "@/components/forms/TextField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { FileDrop } from "@/components/forms/FileDrop";
import { formatPrice, PART_LABELS, SLOT_GROUPS, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import { splitSale } from "@/lib/money";
import type { Category, CharacterPart } from "@/types/mod";
import {
  DESCRIPTION_RANGE,
  IMAGE_MAX_COUNT,
  IMAGE_MAX_MB,
  MOD_FILE_MAX_MB,
  moveItem,
  PRICE_RANGE,
  SUMMARY_RANGE,
  validatePrice,
  type LicenseChoice,
  type PublishErrors,
  type PublishValues,
} from "./publish-validation";

export const EMPTY_PUBLISH_VALUES: PublishValues = {
  title: "",
  categorySlug: "",
  summary: "",
  description: "",
  version: "1.0.0",
  releaseNotes: "",
  replaces: "",
  includes: ["model"],
  price: "",
  license: "",
  credits: "",
  videoUrl: "",
  rightsConfirmed: false,
};

const LICENSES: { value: LicenseChoice; title: string; body: string }[] = [
  { value: "personal", title: "Uso personal", body: "Se puede descargar y usar. No se puede volver a subir en otro sitio." },
  { value: "redistribution", title: "Redistribución con crédito", body: "Otros pueden incluirlo en packs si te citan y enlazan el original." },
  { value: "commercial", title: "Venta", body: "Quien lo compra lo usa en su juego. No puede revenderlo ni volver a subirlo." },
];

export interface Preview {
  id: string;
  file: File;
  url: string;
}

/** Form state shared by the wizard and the edit screen. */
export function usePublishForm(initial?: Partial<PublishValues>) {
  const [values, setValues] = useState<PublishValues>({ ...EMPTY_PUBLISH_VALUES, ...initial });
  const [errors, setErrors] = useState<PublishErrors>({});
  const set = <K extends keyof PublishValues>(key: K, value: PublishValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const text = (key: "title" | "summary" | "description" | "version" | "releaseNotes" | "credits" | "price" | "videoUrl") => ({
    value: values[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    error: errors[key],
    name: key,
  });
  return { values, setValues, errors, setErrors, set, text };
}

export type PublishForm = ReturnType<typeof usePublishForm>;

/** Focus the first invalid field inside `root`. Returns whether a field was found. */
export function focusFirstError(root: HTMLElement | null, errors: PublishErrors) {
  const first = Object.keys(errors).find((k) => errors[k as keyof PublishErrors]);
  const el = first ? root?.querySelector<HTMLElement>(`[name="${first}"], [data-field="${first}"]`) : null;
  el?.focus();
  return Boolean(el);
}

export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[4px] border border-concrete bg-soot p-5 md:p-6">
      <h2 className="font-display text-2xl font-black uppercase tracking-wide">{title}</h2>
      {description && <p className="mt-1 text-sm text-ash">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

const selectClass = (invalid: boolean) =>
  cn(
    "h-12 w-full rounded-[3px] border bg-asphalt px-3 text-bone focus:border-flare focus:outline-none [&>optgroup]:bg-soot [&_option]:bg-soot",
    invalid ? "border-blood" : "border-concrete-2",
  );

export function InfoFields({ form, categories }: { form: PublishForm; categories: Category[] }) {
  const { values, errors, set, text } = form;
  return (
    <>
      <TextField label="Título" placeholder="Taxista de Madrugada" maxLength={60} {...text("title")} />
      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
          Categoría
        </label>
        <select
          id="category"
          name="categorySlug"
          value={values.categorySlug}
          onChange={(e) => set("categorySlug", e.target.value as PublishValues["categorySlug"])}
          aria-invalid={Boolean(errors.categorySlug)}
          className={selectClass(Boolean(errors.categorySlug))}
        >
          <option value="">Elige una categoría</option>
          {categories
            .filter((c) => c.slug !== "packs")
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
        </select>
        <FieldError message={errors.categorySlug} />
      </div>
      <TextAreaField label="Resumen" rows={2} max={SUMMARY_RANGE[1]} hint="Una frase. Aparece en las tarjetas del catálogo." {...text("summary")} />
      <TextAreaField
        label="Descripción completa"
        rows={7}
        max={DESCRIPTION_RANGE[1]}
        hint="Estilo del personaje, resolución de texturas y cualquier problema conocido (clipping, expresiones)."
        {...text("description")}
      />
    </>
  );
}

export function CharacterFields({ form }: { form: PublishForm }) {
  const { values, errors, set } = form;
  return (
    <>
      <div>
        <label htmlFor="replaces" className="mb-1.5 block text-sm font-medium">
          Reemplaza a
        </label>
        <select
          id="replaces"
          name="replaces"
          value={values.replaces}
          onChange={(e) => set("replaces", e.target.value as PublishValues["replaces"])}
          aria-invalid={Boolean(errors.replaces)}
          className={selectClass(Boolean(errors.replaces))}
        >
          <option value="">Elige un personaje</option>
          {SLOT_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.slots.map((slot) => (
                <option key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <FieldError message={errors.replaces} />
      </div>
      <fieldset data-field="includes" tabIndex={-1}>
        <legend className="mb-2 text-sm font-medium">Incluye</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PART_LABELS) as CharacterPart[]).map((part) => {
            const checked = values.includes.includes(part);
            return (
              <label
                key={part}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[3px] border px-3 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-flare",
                  checked ? "border-blood bg-blood/15" : "border-concrete hover:border-concrete-2",
                )}
              >
                <input
                  type="checkbox"
                  name="includes"
                  className="sr-only"
                  checked={checked}
                  onChange={() => set("includes", checked ? values.includes.filter((x) => x !== part) : [...values.includes, part])}
                />
                {PART_LABELS[part]}
              </label>
            );
          })}
        </div>
        <FieldError message={errors.includes} />
      </fieldset>
    </>
  );
}

export function ModFileField({
  file,
  onChange,
  error,
  label = "Archivo del mod",
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  label?: string;
}) {
  return (
    <div data-field="modFile" tabIndex={-1}>
      <FileDrop
        label={label}
        description={`.vpk o .zip · máximo ${MOD_FILE_MAX_MB} MB · se analizará contra malware`}
        accept=".vpk,.zip"
        error={error}
        onFiles={([f]) => onChange(f ?? null)}
      >
        {file && (
          <div className="mt-2 flex items-center gap-3 rounded-[3px] border border-concrete bg-soot-2 px-3 py-2 text-sm">
            <FileArchive className="size-4 text-flare" aria-hidden />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="font-mono text-xs text-ash">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button type="button" onClick={() => onChange(null)} aria-label="Quitar archivo" className="text-ash hover:text-bone">
              <X className="size-4" />
            </button>
          </div>
        )}
      </FileDrop>
    </div>
  );
}

/**
 * Screenshots with local previews. Reorder by dragging or with the arrow buttons;
 * the first one is the cover. Object URLs are revoked when removed or on unmount.
 */
export function GalleryField({
  images,
  onChange,
  error,
}: {
  images: Preview[];
  onChange: (next: Preview[]) => void;
  error?: string;
}) {
  const urls = useRef<string[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function add(files: File[]) {
    const next = files.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { id: url, file, url };
    });
    onChange([...images, ...next].slice(0, IMAGE_MAX_COUNT + 1));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    onChange(moveItem(images, from, to));
    setAnnounce(`${images[from].file.name}: posición ${to + 1} de ${images.length}${to === 0 ? ", ahora es la portada" : ""}.`);
  }

  function remove(p: Preview) {
    URL.revokeObjectURL(p.url);
    onChange(images.filter((x) => x.id !== p.id));
  }

  return (
    <div data-field="images" tabIndex={-1}>
      <FileDrop
        label="Capturas"
        description={`JPG, PNG o WebP · hasta ${IMAGE_MAX_COUNT} imágenes de ${IMAGE_MAX_MB} MB · arrastra para ordenar; la primera es la portada`}
        accept="image/jpeg,image/png,image/webp"
        multiple
        error={error}
        onFiles={add}
      >
        {images.length > 0 && (
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Orden de las capturas">
            <AnimatePresence initial={false}>
              {images.map((img, i) => (
                <motion.li
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
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
                  {/* Local object URL preview; next/image does not apply to blob: URLs */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`Captura ${i + 1}: ${img.file.name}`} className="size-full object-cover" draggable={false} />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-[2px] bg-flare px-1.5 py-0.5 font-mono text-[10px] font-semibold text-asphalt">
                      PORTADA
                    </span>
                  )}
                  <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                    <div className="flex gap-1">
                      <GalleryButton label={`Mover ${img.file.name} antes`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                        <ArrowLeft className="size-3.5" />
                      </GalleryButton>
                      <GalleryButton label={`Mover ${img.file.name} después`} disabled={i === images.length - 1} onClick={() => move(i, i + 1)}>
                        <ArrowRight className="size-3.5" />
                      </GalleryButton>
                      {i > 0 && (
                        <GalleryButton label={`Usar ${img.file.name} como portada`} onClick={() => move(i, 0)}>
                          <Star className="size-3.5" />
                        </GalleryButton>
                      )}
                    </div>
                    <GalleryButton label={`Quitar ${img.file.name}`} onClick={() => remove(img)}>
                      <X className="size-3.5" />
                    </GalleryButton>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </FileDrop>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

function GalleryButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
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

export function LicenseFields({ form }: { form: PublishForm }) {
  const { values, errors, set } = form;
  return (
    <fieldset data-field="license" tabIndex={-1}>
      <legend className="mb-2 text-sm font-medium">Licencia</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {LICENSES.map((l) => (
          <label
            key={l.value}
            className={cn(
              "cursor-pointer rounded-[3px] border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-flare",
              values.license === l.value ? "border-blood bg-blood/10" : "border-concrete hover:border-concrete-2",
            )}
          >
            <input
              type="radio"
              name="license"
              value={l.value}
              checked={values.license === l.value}
              onChange={() => set("license", l.value)}
              className="sr-only"
            />
            <span className="block font-semibold">{l.title}</span>
            <span className="mt-1 block text-xs text-ash">{l.body}</span>
          </label>
        ))}
      </div>
      <FieldError message={errors.license} />
    </fieldset>
  );
}

/** Price input with a live estimate of what the creator receives after the platform fee. */
export function PriceField({ form }: { form: PublishForm }) {
  const { values, text } = form;
  const raw = values.price.trim().replace(",", ".");
  const cents = raw && !validatePrice(values.price) ? Math.round(Number(raw) * 100) : null;
  const split = cents ? splitSale(cents) : null;
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Precio (USD)"
          inputMode="decimal"
          placeholder="Vacío = gratis"
          hint={`De ${PRICE_RANGE[0]} a ${PRICE_RANGE[1]}. Déjalo vacío para publicarlo gratis.`}
          {...text("price")}
        />
        <div className="rounded-[3px] border border-concrete bg-asphalt p-4" aria-live="polite">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Recibirás aprox.</p>
          <p className="mt-1 font-display text-3xl font-black">{split ? formatPrice(split.net) : cents === null && raw ? "—" : "Gratis"}</p>
          {split && <p className="text-xs text-ash">por venta, tras la comisión de {formatPrice(split.fee)}</p>}
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-[3px] border border-concrete bg-soot-2 p-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-ash" aria-hidden />
        <p className="text-sm text-ash">
          <span className="font-semibold text-bone">El cobro todavía no está activo.</span> El precio se mostrará en el
          catálogo, pero nadie podrá pagar hasta que se habiliten los pagos.
        </p>
      </div>
    </>
  );
}

export function RightsFields({ form }: { form: PublishForm }) {
  const { values, errors, set, text } = form;
  return (
    <>
      <TextAreaField
        label="Créditos y permisos (opcional)"
        rows={2}
        placeholder="Ej.: textura del chaleco de Costura, usada con su permiso — enlace al mensaje"
        hint="Si usas recursos de otras personas, indica quién y dónde consta el permiso."
        {...text("credits")}
      />
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="rightsConfirmed"
            checked={values.rightsConfirmed}
            onChange={(e) => set("rightsConfirmed", e.target.checked)}
            aria-invalid={Boolean(errors.rightsConfirmed)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--flare)]"
          />
          <span className="text-bone/85">
            Confirmo que este contenido es mío o que tengo permiso de sus autores para distribuirlo, y que no incluye
            recursos de Valve ni de terceros sin autorización.
          </span>
        </label>
        <FieldError message={errors.rightsConfirmed} />
      </div>
    </>
  );
}
