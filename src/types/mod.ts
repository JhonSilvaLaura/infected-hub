export type ModStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

/** Survivor a mod replaces. Each model mod overwrites exactly one survivor. */
export type CharacterSlot = "nick" | "ellis" | "coach" | "rochelle" | "bill" | "zoey" | "louis" | "francis";

/** What the download contains besides the third-person model. */
export type CharacterPart = "model" | "arms" | "portrait" | "voice";

export type CoverTone = "blood" | "flare" | "bile" | "ash" | "night";

export type CategorySlug = "survivors" | "outfits" | "arms" | "packs";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface Creator {
  slug: string;
  name: string;
  bio: string;
  joinedAt: string;
  verified: boolean;
  specialty: CategorySlug;
}

export interface ModVersion {
  version: string;
  date: string;
  notes: string[];
}

export interface License {
  name: string;
  terms: string;
  allowsRedistribution: boolean;
  allowsCommercialUse: boolean;
}

export interface Mod {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  creatorSlug: string;
  categorySlug: CategorySlug;
  version: string;
  gameBuild: string;
  replaces: CharacterSlot;
  includes: CharacterPart[];
  /** Price in cents. `null` = free. Commerce is disabled in this phase. */
  price: number | null;
  rating: number;
  ratingCount: number;
  downloads: number;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  fileSizeMb: number;
  requirements: string[];
  install: string[];
  changelog: ModVersion[];
  license: License;
  cover: { tone: CoverTone; code: string };
  galleryCount: number;
  hasVideo: boolean;
  featured?: boolean;
  status: ModStatus;
}

export interface Collection {
  slug: string;
  title: string;
  summary: string;
  curatorSlug: string;
  modSlugs: string[];
  tone: CoverTone;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  date: string;
}
