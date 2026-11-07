export interface LibraryEntry {
  modId: string;
  acquiredAt: string;
  /** Simulated: in the demo nothing was ever charged */
  kind: "purchase" | "free";
  /** Version the buyer downloaded */
  installedVersion: string;
}
