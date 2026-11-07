import type { CategorySlug, CharacterPart, CharacterSlot, CoverTone, ModStatus } from "@/types/mod";

export type VersionState = "LIVE" | "PREVIOUS" | "IN_REVIEW" | "REJECTED";

export interface SubmissionVersion {
  version: string;
  date: string;
  notes: string[];
  state: VersionState;
}

export interface ModerationEvent {
  date: string;
  event: "SUBMITTED" | "APPROVED" | "REJECTED" | "RESUBMITTED" | "SUSPENDED";
  note?: string;
}

/** A mod as its creator sees it: every state, not only what is public. */
export interface CreatorSubmission {
  id: string;
  /** Public slug, only once approved */
  slug?: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: CategorySlug;
  replaces: CharacterSlot;
  includes: CharacterPart[];
  status: ModStatus;
  /** Version currently public (or the draft's working version) */
  version: string;
  createdAt: string;
  updatedAt: string;
  downloads: number;
  views30d: number;
  sales: number;
  rating: number;
  ratingCount: number;
  comments: number;
  price: number | null;
  cover: { tone: CoverTone; code: string };
  galleryCount: number;
  versions: SubmissionVersion[];
  priceHistory: { date: string; price: number | null }[];
  moderationHistory: ModerationEvent[];
  /** Message from moderation for REJECTED / SUSPENDED / PENDING_REVIEW */
  moderationNote?: string;
}

export interface CreatorActivity {
  id: string;
  kind: "review" | "comment" | "approved" | "rejected" | "milestone" | "sale";
  text: string;
  date: string;
}

/** Simulated sale. Buyers are anonymised; no payment data exists anywhere in the demo. */
export interface Sale {
  id: string;
  date: string;
  modId: string;
  modTitle: string;
  buyer: string;
  gross: number;
  fee: number;
  net: number;
}

export interface CreatorReview {
  id: string;
  modId: string;
  modTitle: string;
  author: string;
  rating: number;
  body: string;
  date: string;
  reply?: { body: string; date: string };
}

export interface DailyPoint {
  date: string;
  downloads: number;
  sales: number;
}
