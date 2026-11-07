/**
 * Datos del panel del creador.
 * Fase 1: datos simulados de una creadora ficticia. Con la API serán llamadas autenticadas
 * a `/api/creators/me/...`; el backend decide qué mods pertenecen al usuario y rechaza el resto.
 */
import {
  MOCK_CREATOR_ACTIVITY,
  MOCK_CREATOR_REVIEWS,
  MOCK_CREATOR_SLUG,
  MOCK_CREATOR_SUBMISSIONS,
  MOCK_DAILY,
  MOCK_SALES,
  MOCK_TODAY,
} from "@/mocks/creator.mock";
import { getCreator } from "@/services/catalog.service";

export type { CreatorActivity, CreatorReview, CreatorSubmission, DailyPoint, Sale } from "@/types/creator";

export const DEMO_TODAY = MOCK_TODAY;

export const getCurrentCreator = () => getCreator(MOCK_CREATOR_SLUG)!;
export const getMySubmissions = () => MOCK_CREATOR_SUBMISSIONS;
export const getMySubmission = (id: string) => MOCK_CREATOR_SUBMISSIONS.find((s) => s.id === id);
export const getMyActivity = () => MOCK_CREATOR_ACTIVITY;
export const getMySales = () => MOCK_SALES;
export const getMyReviews = () => MOCK_CREATOR_REVIEWS;
export const getMyReviewsFor = (modId: string) => MOCK_CREATOR_REVIEWS.filter((r) => r.modId === modId);
/** Last 90 days, oldest first. */
export const getMyDaily = () => MOCK_DAILY;
export const getMyDailyDownloads = (days = 30) => MOCK_DAILY.slice(-days);

const sum = <T,>(list: T[], pick: (x: T) => number) => list.reduce((n, x) => n + pick(x), 0);
const trend = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : 0);

/** KPIs for the last `days` days compared with the `days` before them. */
export function getMyStats(days = 30) {
  const subs = MOCK_CREATOR_SUBMISSIONS;
  const published = subs.filter((s) => s.status === "APPROVED");
  const rated = published.filter((s) => s.ratingCount > 0);
  const totalRatings = sum(rated, (s) => s.ratingCount);

  const current = MOCK_DAILY.slice(-days);
  const previous = MOCK_DAILY.slice(-days * 2, -days);
  const since = current[0]?.date ?? MOCK_TODAY;
  const prevSince = previous[0]?.date ?? since;
  const salesNow = MOCK_SALES.filter((s) => s.date >= since);
  const salesBefore = MOCK_SALES.filter((s) => s.date >= prevSince && s.date < since);

  return {
    published: published.length,
    pending: subs.filter((s) => s.status === "PENDING_REVIEW" || s.versions.some((v) => v.state === "IN_REVIEW")).length,
    drafts: subs.filter((s) => s.status === "DRAFT").length,
    needsAttention: subs.filter((s) => s.status === "REJECTED" || s.status === "SUSPENDED").length,
    totalDownloads: sum(published, (s) => s.downloads),
    downloads: sum(current, (d) => d.downloads),
    downloadsTrend: trend(sum(current, (d) => d.downloads), sum(previous, (d) => d.downloads)),
    sales: salesNow.length,
    salesTrend: trend(salesNow.length, salesBefore.length),
    net: sum(salesNow, (s) => s.net),
    netTrend: trend(sum(salesNow, (s) => s.net), sum(salesBefore, (s) => s.net)),
    averageRating: totalRatings ? sum(rated, (s) => s.rating * s.ratingCount) / totalRatings : 0,
    totalRatings,
    unanswered: MOCK_CREATOR_REVIEWS.filter((r) => !r.reply).length,
  };
}

/** Net revenue per mod for the last `days` days, highest first. */
export function getRevenueByMod(days = 30) {
  const since = MOCK_DAILY.slice(-days)[0].date;
  const rows = new Map<string, { modId: string; title: string; sales: number; net: number }>();
  for (const s of MOCK_SALES.filter((x) => x.date >= since)) {
    const row = rows.get(s.modId) ?? { modId: s.modId, title: s.modTitle, sales: 0, net: 0 };
    row.sales += 1;
    row.net += s.net;
    rows.set(s.modId, row);
  }
  return [...rows.values()].sort((a, b) => b.net - a.net);
}

/** Daily series for one mod: its own sales, plus downloads estimated from its share of the total. */
export function getModDaily(modId: string, days = 30) {
  const published = MOCK_CREATOR_SUBMISSIONS.filter((s) => s.status === "APPROVED");
  const total = published.reduce((n, s) => n + s.downloads, 0);
  const mod = MOCK_CREATOR_SUBMISSIONS.find((s) => s.id === modId);
  const share = mod && total ? mod.downloads / total : 0;
  return MOCK_DAILY.slice(-days).map((d) => ({
    date: d.date,
    downloads: Math.round(d.downloads * share),
    sales: MOCK_SALES.filter((s) => s.modId === modId && s.date === d.date).length,
  }));
}
