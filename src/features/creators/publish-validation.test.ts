import { describe, expect, it } from "vitest";
import { hasErrors } from "@/features/auth/validation";
import {
  bumpPatch,
  compareSemver,
  firstStepWithErrors,
  moveItem,
  stepErrors,
  validateImage,
  validateModFile,
  validatePrice,
  validatePublish,
  validateNewVersion,
  validateVideoUrl,
  type PublishValues,
} from "./publish-validation";

const MB = 1024 * 1024;
const vpk = { name: "bombero_coach.vpk", size: 30 * MB, type: "application/octet-stream" };
const png = { name: "captura.png", size: 1 * MB, type: "image/png" };

const complete: PublishValues = {
  title: "Taxista de Madrugada",
  categorySlug: "survivors",
  summary: "Camisa hawaiana, chaleco de cuentas y gorra de conductor. Reemplaza a Nick.",
  description: "Modelo nuevo con texturas 4K, expresiones faciales y brazos en primera persona con reloj de pulsera. Reemplaza a Nick.",
  version: "1.0.0",
  releaseNotes: "",
  replaces: "nick",
  includes: ["model", "arms"],
  price: "",
  license: "personal",
  credits: "",
  videoUrl: "",
  rightsConfirmed: true,
};

describe("validateModFile", () => {
  it("accepts .vpk and .zip within the size limit", () => {
    expect(validateModFile(vpk)).toBeUndefined();
    expect(validateModFile({ ...vpk, name: "PACK.ZIP" })).toBeUndefined();
  });

  it("rejects executables, empty and oversized files", () => {
    expect(validateModFile({ ...vpk, name: "instalador.exe" })).toBeDefined();
    expect(validateModFile({ ...vpk, name: "mod.vpk.exe" })).toBeDefined();
    expect(validateModFile({ ...vpk, size: 0 })).toBeDefined();
    expect(validateModFile({ ...vpk, size: 2048 * MB })).toBeDefined();
    expect(validateModFile(null)).toBeDefined();
  });
});

describe("validateImage", () => {
  it("only allows JPG, PNG and WebP up to 5 MB", () => {
    expect(validateImage(png)).toBeUndefined();
    expect(validateImage({ ...png, name: "x.svg", type: "image/svg+xml" })).toBeDefined();
    expect(validateImage({ ...png, size: 6 * MB })).toBeDefined();
  });
});

describe("validatePublish", () => {
  it("only needs a title to save a draft", () => {
    const draft = { ...complete, categorySlug: "" as const, summary: "", rightsConfirmed: false };
    expect(hasErrors(validatePublish(draft, { modFile: null, images: [] }, "draft"))).toBe(false);
    expect(validatePublish({ ...draft, title: "" }, { modFile: null, images: [] }, "draft").title).toBeDefined();
  });

  it("requires files, license and the rights statement to send to review", () => {
    expect(hasErrors(validatePublish(complete, { modFile: vpk, images: [png] }, "review"))).toBe(false);
    const errors = validatePublish({ ...complete, rightsConfirmed: false, license: "" }, { modFile: null, images: [] }, "review");
    expect(errors.rightsConfirmed).toBeDefined();
    expect(errors.license).toBeDefined();
    expect(errors.modFile).toBeDefined();
    expect(errors.images).toBeDefined();
  });

  it("requires the replaced character and what the mod includes", () => {
    const errors = validatePublish({ ...complete, replaces: "", includes: [] }, { modFile: vpk, images: [png] }, "review");
    expect(errors.replaces).toBeDefined();
    expect(errors.includes).toBeDefined();
  });

  it("ties a price to the sale license", () => {
    const files = { modFile: vpk, images: [png] };
    expect(hasErrors(validatePublish({ ...complete, price: "3.99", license: "commercial" }, files, "review"))).toBe(false);
    expect(validatePublish({ ...complete, price: "3.99", license: "personal" }, files, "review").license).toBeDefined();
    expect(validatePublish({ ...complete, price: "", license: "commercial" }, files, "review").license).toBeDefined();
  });

  it("validates version format and requires release notes for updates", () => {
    expect(validatePublish({ ...complete, version: "v1" }, { modFile: vpk, images: [png] }, "review").version).toBeDefined();
    const update = validatePublish(complete, { modFile: null, images: [png] }, "review", { isUpdate: true });
    expect(update.modFile).toBeUndefined();
    expect(update.releaseNotes).toBeDefined();
  });
});

describe("validatePrice", () => {
  it("accepts empty (free) and amounts within range, with dot or comma", () => {
    expect(validatePrice("")).toBeUndefined();
    expect(validatePrice("4.99")).toBeUndefined();
    expect(validatePrice("4,99")).toBeUndefined();
  });

  it("rejects bad formats and out-of-range amounts", () => {
    expect(validatePrice("abc")).toBeDefined();
    expect(validatePrice("4.999")).toBeDefined();
    expect(validatePrice("0.10")).toBeDefined();
    expect(validatePrice("120")).toBeDefined();
  });
});

describe("validateVideoUrl", () => {
  it("accepts empty or https links only", () => {
    expect(validateVideoUrl("")).toBeUndefined();
    expect(validateVideoUrl("https://youtu.be/abc")).toBeUndefined();
    expect(validateVideoUrl("http://youtu.be/abc")).toBeDefined();
    expect(validateVideoUrl("javascript:alert(1)")).toBeDefined();
    expect(validateVideoUrl("mi video")).toBeDefined();
  });
});

describe("moveItem", () => {
  it("moves an item forwards and backwards and ignores bad indexes", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
  });
});

describe("wizard steps", () => {
  it("routes each error to the step that owns the field", () => {
    const errors = validatePublish({ ...complete, replaces: "", license: "" }, { modFile: vpk, images: [png] }, "review");
    expect(Object.keys(stepErrors(errors, 0))).toEqual([]);
    expect(Object.keys(stepErrors(errors, 1))).toEqual(["replaces"]);
    expect(Object.keys(stepErrors(errors, 3))).toEqual(["license"]);
    expect(firstStepWithErrors(errors)).toBe(1);
  });

  it("reports no step when the mod is ready", () => {
    expect(firstStepWithErrors(validatePublish(complete, { modFile: vpk, images: [png] }, "review"))).toBe(-1);
  });
});

describe("versions", () => {
  it("compares semver numerically, not as text", () => {
    expect(compareSemver("1.10.0", "1.9.0")).toBeGreaterThan(0);
    expect(compareSemver("2.0.0", "2.0.0")).toBe(0);
    expect(compareSemver("0.9.9", "1.0.0")).toBeLessThan(0);
  });

  it("requires a higher version, notes and a valid file", () => {
    const ok = validateNewVersion({ version: "2.2.0", notes: "Nueva variante sin casco.", file: vpk }, ["2.1.0", "1.0.0"]);
    expect(hasErrors(ok)).toBe(false);
    const bad = validateNewVersion({ version: "2.1.0", notes: "fix", file: null }, ["2.1.0"]);
    expect(bad.version).toContain("2.1.0");
    expect(bad.notes).toBeDefined();
    expect(bad.file).toBeDefined();
  });

  it("suggests the next patch", () => {
    expect(bumpPatch("1.4.9")).toBe("1.4.10");
  });
});
