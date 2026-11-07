/**
 * ⚠️ DATOS SIMULADOS (MOCK) — Panel del creador, Fase 1.
 * Representan lo que vería la creadora ficticia "FerroVieja": sus mods en todos los
 * estados, ventas simuladas (compradores anonimizados, sin datos de pago), reseñas y
 * series diarias. Acceder solo vía `src/services/creator.service.ts`.
 */
import { MOCK_MODS } from "@/mocks/catalog.mock";
import { splitSale } from "@/lib/money";
import type {
  CreatorActivity,
  CreatorReview,
  CreatorSubmission,
  DailyPoint,
  Sale,
  SubmissionVersion,
} from "@/types/creator";

export const MOCK_CREATOR_SLUG = "ferro-vieja";
/** "Today" for every series in the demo. */
export const MOCK_TODAY = "2026-11-06";
const DAYS = 90;

/** Deterministic pseudo-random numbers so the demo looks the same on every render. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const dayISO = (daysAgo: number) =>
  new Date(Date.UTC(2026, 10, 6 - daysAgo)).toISOString().slice(0, 10);

const ownMods = MOCK_MODS.filter((m) => m.creatorSlug === MOCK_CREATOR_SLUG);

/** Average daily sales per paid mod. */
const SALES_RATE: Record<string, number> = {
  "bombero-voluntario": 2.4,
  "mecanica-ruta-9": 1.5,
  "guardabosques": 1.1,
  "vigilante-de-estacionamiento": 0.8,
  "cirujana-de-campana": 1.6,
};

export const MOCK_SALES: Sale[] = (() => {
  const rand = rng(7);
  const sales: Sale[] = [];
  for (let d = DAYS - 1; d >= 0; d--) {
    const date = dayISO(d);
    const weekend = [0, 6].includes(new Date(date).getUTCDay()) ? 1.5 : 1;
    for (const m of ownMods) {
      if (m.price === null || date < m.publishedAt) continue;
      const count = Math.floor((SALES_RATE[m.slug] ?? 0.5) * weekend * (0.4 + rand() * 1.2));
      for (let i = 0; i < count; i++) {
        sales.push({
          id: `sale-${sales.length + 1}`,
          date,
          modId: m.id,
          modTitle: m.title,
          buyer: `comprador_${Math.floor(rand() * 0xffff).toString(16).padStart(4, "0")}`,
          ...splitSale(m.price),
        });
      }
    }
  }
  return sales.reverse();
})();

export const MOCK_DAILY: DailyPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const daysAgo = DAYS - 1 - i;
  const date = dayISO(daysAgo);
  const weekend = [0, 6].includes(new Date(date).getUTCDay()) ? 1.45 : 1;
  const wave = 1 + 0.18 * Math.sin(i / 3.2);
  const trend = 1 + i * 0.006;
  const noise = ((i * 7919) % 23) / 100;
  return {
    date,
    downloads: Math.round(620 * weekend * wave * trend * (0.9 + noise)),
    sales: MOCK_SALES.filter((s) => s.date === date).length,
  };
});

const approved: CreatorSubmission[] = ownMods.map((m, i) => {
  const sales = MOCK_SALES.filter((s) => s.modId === m.id).length;
  const priceHistory =
    m.slug === "bombero-voluntario"
      ? [
          { date: m.publishedAt, price: 399 },
          { date: "2026-05-14", price: 499 },
        ]
      : [{ date: m.publishedAt, price: m.price }];
  const versions: SubmissionVersion[] = m.changelog.map((c, j) => ({ ...c, state: j === 0 ? "LIVE" : "PREVIOUS" }));
  // One published mod has an update waiting for moderation while the current version stays public.
  if (m.slug === "mecanica-ruta-9") {
    versions.unshift({
      version: "1.5.0",
      date: "2026-11-05",
      notes: ["Nueva variante del overol sin pañuelo.", "Corrige el brillo de la llave inglesa."],
      state: "IN_REVIEW",
    });
  }
  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    summary: m.summary,
    description: m.description.join("\n\n"),
    categorySlug: m.categorySlug,
    replaces: m.replaces,
    includes: m.includes,
    status: m.status,
    version: m.version,
    createdAt: m.publishedAt,
    updatedAt: m.updatedAt,
    downloads: m.downloads,
    views30d: Math.round(m.downloads * 0.09 + 800 + i * 137),
    sales,
    rating: m.rating,
    ratingCount: m.ratingCount,
    comments: Math.round(m.ratingCount * 0.35),
    price: m.price,
    cover: m.cover,
    galleryCount: m.galleryCount,
    versions,
    priceHistory,
    moderationHistory: [
      { date: m.publishedAt, event: "SUBMITTED" },
      { date: m.publishedAt, event: "APPROVED" },
    ],
  };
});

const base = {
  downloads: 0,
  views30d: 0,
  sales: 0,
  rating: 0,
  ratingCount: 0,
  comments: 0,
  galleryCount: 3,
};

const unpublished: CreatorSubmission[] = [
  {
    ...base,
    id: "draft-101",
    title: "Taxista de Madrugada",
    summary: "Camisa hawaiana, chaleco de cuentas y gorra de conductor. Reemplaza a Nick.",
    description: "",
    categorySlug: "survivors",
    replaces: "nick",
    includes: ["model", "arms"],
    status: "DRAFT",
    version: "0.3.0",
    createdAt: "2026-10-29",
    updatedAt: "2026-11-05",
    price: 349,
    cover: { tone: "blood", code: "SRV-15" },
    galleryCount: 1,
    versions: [{ version: "0.3.0", date: "2026-11-05", notes: ["Borrador."], state: "PREVIOUS" }],
    priceHistory: [],
    moderationHistory: [],
  },
  {
    ...base,
    id: "pend-102",
    title: "Socorrista de Piscina",
    summary: "Sudadera de salvavidas, silbato y gafas de sol. Reemplaza a Francis.",
    description:
      "Francis cambia la chaqueta de cuero por la sudadera roja de salvavidas de una piscina municipal. Silbato colgado, gafas de sol en la cabeza y bronceado de temporada completa.",
    categorySlug: "survivors",
    replaces: "francis",
    includes: ["model", "arms", "portrait"],
    status: "PENDING_REVIEW",
    version: "1.0.0",
    createdAt: "2026-10-20",
    updatedAt: "2026-11-03",
    price: 299,
    cover: { tone: "flare", code: "SRV-16" },
    versions: [{ version: "1.0.0", date: "2026-11-03", notes: ["Publicación inicial."], state: "IN_REVIEW" }],
    priceHistory: [],
    moderationHistory: [{ date: "2026-11-03", event: "SUBMITTED" }],
    moderationNote: "En cola de revisión. Tiempo estimado: 48 h.",
  },
  {
    ...base,
    id: "rej-103",
    title: "Soldado de Asalto",
    summary: "Uniforme militar completo con chaleco antibalas. Reemplaza a Coach.",
    description:
      "Uniforme de combate con chaleco antibalas, casco con funda de camuflaje y botas tácticas. Incluye brazos con guantes sin dedos.",
    categorySlug: "survivors",
    replaces: "coach",
    includes: ["model", "arms"],
    status: "REJECTED",
    version: "1.0.0",
    createdAt: "2026-10-02",
    updatedAt: "2026-10-20",
    price: 399,
    cover: { tone: "ash", code: "SRV-12" },
    versions: [{ version: "1.0.0", date: "2026-10-18", notes: ["Publicación inicial."], state: "REJECTED" }],
    priceHistory: [],
    moderationHistory: [
      { date: "2026-10-18", event: "SUBMITTED" },
      {
        date: "2026-10-20",
        event: "REJECTED",
        note: "El modelo parece extraído de otro videojuego. Solo se aceptan modelos propios o con permiso de redistribución por escrito.",
      },
    ],
    moderationNote:
      "El modelo parece extraído de otro videojuego. Solo se aceptan modelos propios o con permiso de redistribución por escrito.",
  },
  {
    ...base,
    id: "susp-104",
    title: "Profesora de Química",
    summary: "Bata de laboratorio, gafas protectoras y quemaduras de ácido. Reemplaza a Rochelle.",
    description:
      "Rochelle con bata de laboratorio manchada, gafas protectoras subidas a la frente y guantes de nitrilo rotos.",
    categorySlug: "survivors",
    replaces: "rochelle",
    includes: ["model", "arms", "portrait"],
    status: "SUSPENDED",
    version: "1.1.0",
    createdAt: "2026-06-30",
    updatedAt: "2026-09-14",
    downloads: 3_420,
    rating: 4.1,
    ratingCount: 88,
    comments: 21,
    price: null,
    cover: { tone: "night", code: "SRV-11" },
    versions: [
      { version: "1.1.0", date: "2026-08-02", notes: ["Mejora las expresiones faciales."], state: "LIVE" },
      { version: "1.0.0", date: "2026-07-02", notes: ["Publicación inicial."], state: "PREVIOUS" },
    ],
    priceHistory: [{ date: "2026-07-02", price: null }],
    moderationHistory: [
      { date: "2026-07-01", event: "SUBMITTED" },
      { date: "2026-07-02", event: "APPROVED" },
      { date: "2026-09-14", event: "SUSPENDED", note: "Reporte de licencia en revisión." },
    ],
    moderationNote: "Suspendido temporalmente por un reporte de licencia. Moderación está revisando el caso.",
  },
];

export const MOCK_CREATOR_SUBMISSIONS: CreatorSubmission[] = [...unpublished, ...approved];

const REVIEW_SEED: Omit<CreatorReview, "id" | "modId" | "modTitle">[] = [
  { author: "pala_y_linterna", rating: 5, body: "El casco abollado es un detalle precioso. Funciona perfecto en versus.", date: "2026-11-06" },
  { author: "medkit_ajeno", rating: 4, body: "Muy buen modelo, pero los brazos brillan un poco con la linterna.", date: "2026-11-05" },
  { author: "sin_balas", rating: 5, body: "Las expresiones faciales están a otro nivel. Vale cada centavo.", date: "2026-11-04", reply: { body: "¡Gracias! Las expresiones me llevaron un mes.", date: "2026-11-04" } },
  { author: "la_ultima_ronda", rating: 2, body: "Se ve el cuello cortado al agacharse en algunos mapas.", date: "2026-11-03" },
  { author: "faro_norte", rating: 5, body: "Por fin un Coach que no parece un muñeco. Compra obligada.", date: "2026-11-01" },
  { author: "tejado_azul", rating: 3, body: "Bonito, pero me gustaría una versión sin la mochila.", date: "2026-10-30", reply: { body: "Está en camino para la próxima versión.", date: "2026-10-31" } },
  { author: "cinta_naranja", rating: 4, body: "Buen trabajo. La textura 4K pesa algo en mi portátil.", date: "2026-10-27" },
  { author: "senal_debil", rating: 5, body: "Instalación limpia y el retrato del HUD le queda genial.", date: "2026-10-22", reply: { body: "¡Me alegra que funcione bien!", date: "2026-10-22" } },
  { author: "humo_blanco", rating: 1, body: "No funciona con mi pack de voces.", date: "2026-10-18" },
  { author: "botiquin_lleno", rating: 4, body: "Muy bien hecho. Le faltaría un poco de suciedad en las botas.", date: "2026-10-12" },
];

export const MOCK_CREATOR_REVIEWS: CreatorReview[] = REVIEW_SEED.map((r, i) => {
  const mod = approved[i % approved.length];
  return { ...r, id: `rev-${i + 1}`, modId: mod.id, modTitle: mod.title };
});

export const MOCK_CREATOR_ACTIVITY: CreatorActivity[] = [
  { id: "a1", kind: "sale", text: "Vendiste 3 copias de Bombero Voluntario hoy.", date: "2026-11-06" },
  { id: "a2", kind: "review", text: "pala_y_linterna valoró Bombero Voluntario con 5 estrellas.", date: "2026-11-06" },
  { id: "a3", kind: "comment", text: "Nuevo comentario en Mecánica de la Ruta 9.", date: "2026-11-05" },
  { id: "a4", kind: "approved", text: "Cirujana de Campaña fue aprobada y ya es pública.", date: "2026-11-01" },
  { id: "a5", kind: "milestone", text: "Bombero Voluntario superó las 150 mil descargas.", date: "2026-10-30" },
  { id: "a6", kind: "rejected", text: "Soldado de Asalto fue rechazado. Revisa la nota de moderación.", date: "2026-10-20" },
];
