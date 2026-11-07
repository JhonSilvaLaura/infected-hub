import type { CreatorSubmission } from "@/types/creator";
import type { PublishValues } from "./publish-validation";

/** Form values for editing an existing mod. */
export function submissionToValues(s: CreatorSubmission): PublishValues {
  return {
    title: s.title,
    categorySlug: s.categorySlug,
    summary: s.summary,
    description: s.description,
    version: s.version,
    releaseNotes: "",
    replaces: s.replaces,
    includes: s.includes,
    price: s.price === null ? "" : (s.price / 100).toFixed(2),
    license: s.price !== null ? "commercial" : "personal",
    credits: "",
    videoUrl: "",
    rightsConfirmed: true,
  };
}
