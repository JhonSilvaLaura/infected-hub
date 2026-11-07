/**
 * Client-side checks for the publish form. They give early feedback only:
 * the backend re-validates everything, scans files for malware and checks MIME types.
 */
import type { CategorySlug, CharacterPart, CharacterSlot } from "@/types/mod";

export const MOD_FILE_EXTENSIONS = [".vpk", ".zip"];
export const MOD_FILE_MAX_MB = 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_MB = 5;
export const IMAGE_MAX_COUNT = 8;
export const SUMMARY_RANGE = [20, 160] as const;
export const DESCRIPTION_RANGE = [80, 5000] as const;
/** USD. Empty price = free. */
export const PRICE_RANGE = [0.99, 49.99] as const;

export type LicenseChoice = "personal" | "redistribution" | "commercial";

export interface PublishValues {
  title: string;
  categorySlug: CategorySlug | "";
  summary: string;
  description: string;
  version: string;
  releaseNotes: string;
  replaces: CharacterSlot | "";
  includes: CharacterPart[];
  /** Text as typed, in USD. Empty = free. */
  price: string;
  license: LicenseChoice | "";
  credits: string;
  /** Optional trailer, https only */
  videoUrl: string;
  rightsConfirmed: boolean;
}

export interface FileLike {
  name: string;
  size: number;
  type: string;
}

export type PublishErrors = Partial<Record<keyof PublishValues | "modFile" | "images", string>>;

const MB = 1024 * 1024;

export function validateModFile(file: FileLike | null): string | undefined {
  if (!file) return "Sube el archivo del mod.";
  const name = file.name.toLowerCase();
  if (!MOD_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) return "Solo se aceptan archivos .vpk o .zip.";
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > MOD_FILE_MAX_MB * MB) return `El archivo supera ${MOD_FILE_MAX_MB} MB.`;
}

export function validateImage(file: FileLike): string | undefined {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: usa JPG, PNG o WebP.`;
  if (file.size > IMAGE_MAX_MB * MB) return `${file.name}: supera ${IMAGE_MAX_MB} MB.`;
}

export function validateVideoUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "El enlace debe empezar por https://.";
  } catch {
    return "Pega un enlace completo, por ejemplo https://youtu.be/…";
  }
}

export function validatePrice(raw: string): string | undefined {
  const value = raw.trim().replace(",", ".");
  if (!value) return;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Usa un importe como 3.99, o déjalo vacío para que sea gratis.";
  const n = Number(value);
  if (n < PRICE_RANGE[0] || n > PRICE_RANGE[1]) return `El precio va de ${PRICE_RANGE[0]} a ${PRICE_RANGE[1]} USD.`;
}

const lengthError = (value: string, [min, max]: readonly [number, number], what: string) => {
  const n = value.trim().length;
  if (n < min) return `${what}: mínimo ${min} caracteres (llevas ${n}).`;
  if (n > max) return `${what}: máximo ${max} caracteres.`;
};

/**
 * `draft`: only a title is needed to save.
 * `review`: everything moderation needs, including the rights statement.
 */
export function validatePublish(
  values: PublishValues,
  files: { modFile: FileLike | null; images: FileLike[] },
  intent: "draft" | "review",
  { isUpdate = false } = {},
): PublishErrors {
  const titleLength = values.title.trim().length;
  const errors: PublishErrors = {
    title: titleLength < 3 || titleLength > 60 ? "El título debe tener entre 3 y 60 caracteres." : undefined,
  };
  if (intent === "draft") return errors;

  return {
    ...errors,
    categorySlug: values.categorySlug ? undefined : "Elige una categoría.",
    summary: lengthError(values.summary, SUMMARY_RANGE, "Resumen"),
    description: lengthError(values.description, DESCRIPTION_RANGE, "Descripción"),
    version: /^\d+\.\d+\.\d+$/.test(values.version.trim()) ? undefined : "Usa el formato 1.0.0.",
    releaseNotes: isUpdate && !values.releaseNotes.trim() ? "Cuenta qué cambió en esta versión." : undefined,
    replaces: values.replaces ? undefined : "Elige a qué personaje reemplaza.",
    includes: values.includes.length ? undefined : "Marca qué incluye el mod.",
    price: validatePrice(values.price),
    videoUrl: validateVideoUrl(values.videoUrl),
    license: !values.license
      ? "Elige una licencia."
      : values.price.trim() && values.license !== "commercial"
        ? "Un mod de pago necesita la licencia de venta."
        : !values.price.trim() && values.license === "commercial"
          ? "La licencia de venta solo aplica si pones precio."
          : undefined,
    modFile: isUpdate && !files.modFile ? undefined : validateModFile(files.modFile),
    images: files.images.length
      ? files.images.map(validateImage).find(Boolean) ??
        (files.images.length > IMAGE_MAX_COUNT ? `Máximo ${IMAGE_MAX_COUNT} imágenes.` : undefined)
      : "Añade al menos una captura.",
    rightsConfirmed: values.rightsConfirmed ? undefined : "Debes confirmar que tienes derecho a distribuir este contenido.",
  };
}

/** Moves one item to another index; used to reorder the gallery (drag or keyboard). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

/** Wizard steps and the fields each one owns, so errors can be shown where they are fixed. */
export const WIZARD_STEPS = [
  { id: "info", label: "Información", fields: ["title", "categorySlug", "summary", "description"] },
  { id: "personaje", label: "Personaje", fields: ["replaces", "includes"] },
  { id: "archivos", label: "Archivos y galería", fields: ["modFile", "images", "videoUrl"] },
  { id: "precio", label: "Precio y licencia", fields: ["price", "license"] },
  { id: "revision", label: "Revisión", fields: ["credits", "rightsConfirmed", "version", "releaseNotes"] },
] as const satisfies readonly { id: string; label: string; fields: readonly (keyof PublishErrors)[] }[];

/** Errors that belong to one step (others are left for later steps). */
export function stepErrors(errors: PublishErrors, step: number): PublishErrors {
  const fields: readonly string[] = WIZARD_STEPS[step].fields;
  return Object.fromEntries(Object.entries(errors).filter(([k, v]) => v && fields.includes(k)));
}

/** Index of the first step that still has an error, or -1 when everything is valid. */
export function firstStepWithErrors(errors: PublishErrors): number {
  return WIZARD_STEPS.findIndex((_, i) => Object.keys(stepErrors(errors, i)).length > 0);
}

/** Compares two x.y.z versions: negative when a < b, 0 when equal, positive when a > b. */
export function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

export interface NewVersionInput {
  version: string;
  notes: string;
  file: FileLike | null;
}

/** A new version needs a higher semver than every existing one, release notes and a valid file. */
export function validateNewVersion(input: NewVersionInput, existing: string[]) {
  const version = input.version.trim();
  const latest = [...existing].sort(compareSemver).at(-1) ?? "0.0.0";
  return {
    version: !/^\d+\.\d+\.\d+$/.test(version)
      ? "Usa el formato 1.0.0."
      : compareSemver(version, latest) <= 0
        ? `Tiene que ser mayor que v${latest}.`
        : undefined,
    notes: input.notes.trim().length < 10 ? "Cuenta qué cambió (mínimo 10 caracteres)." : undefined,
    file: validateModFile(input.file),
  };
}

/** Next patch version, as a suggestion for the version field. */
export const bumpPatch = (v: string) => {
  const [a, b, c] = v.split(".").map(Number);
  return `${a}.${b}.${(c ?? 0) + 1}`;
};
