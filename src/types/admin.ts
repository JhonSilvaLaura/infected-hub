import type { CategorySlug } from "@/types/mod";

export type Role = "USER" | "CREATOR" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "UNVERIFIED" | "SUSPENDED";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  joinedAt: string;
  lastSeenAt: string;
  modsPublished: number;
  reportsReceived: number;
}

export type ReportReason =
  | "INAPPROPRIATE"
  | "SUSPICIOUS_FILE"
  | "UNAUTHORIZED"
  | "IMPERSONATION"
  | "OFFENSIVE_COMMENT"
  | "LICENSE_BREACH";

export type ReportStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";

export interface Report {
  id: string;
  targetType: "MOD" | "COMMENT";
  targetTitle: string;
  /** Public mod slug, when the target is a mod or a comment on a mod */
  modSlug?: string;
  reason: ReportReason;
  details: string;
  reporter: string;
  createdAt: string;
  status: ReportStatus;
}

export type ScanResult = "CLEAN" | "PENDING" | "FLAGGED";

export interface QueueItem {
  id: string;
  title: string;
  creator: string;
  categorySlug: CategorySlug;
  kind: "NEW" | "UPDATE";
  version: string;
  submittedAt: string;
  fileName: string;
  fileSizeMb: number;
  scan: ScanResult;
  license: string;
  credits?: string;
  summary: string;
  releaseNotes?: string;
}

export type AuditAction =
  | "MOD_APPROVED"
  | "MOD_REJECTED"
  | "MOD_SUSPENDED"
  | "REPORT_RESOLVED"
  | "REPORT_DISMISSED"
  | "USER_ROLE_CHANGED"
  | "USER_SUSPENDED"
  | "CATEGORY_UPDATED"
  | "SETTINGS_UPDATED";

export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: Role;
  action: AuditAction;
  target: string;
  detail?: string;
  at: string;
}

export interface PlatformSettings {
  registrationOpen: boolean;
  requireEmailVerification: boolean;
  commentsEnabled: boolean;
  maxModFileMb: number;
  maxImagesPerMod: number;
  maintenanceMessage: string;
}
