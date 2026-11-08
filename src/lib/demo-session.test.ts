import { describe, expect, it } from "vitest";
import { safeNext } from "./demo-session";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/creador/ventas", "/")).toBe("/creador/ventas");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(safeNext("https://evil.test", "/creador")).toBe("/creador");
    expect(safeNext("//evil.test/x", "/creador")).toBe("/creador");
    expect(safeNext(null, "/cuenta")).toBe("/cuenta");
  });
});
