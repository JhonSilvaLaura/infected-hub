import { describe, expect, it } from "vitest";
import { splitSale } from "@/lib/money";
import { cartTotals, findConflicts } from "./conflicts";

const m = (id: string, replaces: "nick" | "coach", includes: ("model" | "arms" | "portrait" | "voice")[]) => ({
  id,
  replaces,
  includes,
});

describe("findConflicts", () => {
  it("flags mods that overwrite the same part of the same character", () => {
    const groups = findConflicts([m("a", "nick", ["model", "arms"]), m("b", "nick", ["arms"]), m("c", "coach", ["model"])]);
    expect(groups).toHaveLength(1);
    expect(groups[0].slot).toBe("nick");
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("lets mods for the same character coexist when they touch different parts", () => {
    expect(findConflicts([m("a", "nick", ["model"]), m("b", "nick", ["arms"])])).toEqual([]);
  });

  it("returns nothing for an empty or single list", () => {
    expect(findConflicts([])).toEqual([]);
    expect(findConflicts([m("a", "coach", ["model"])])).toEqual([]);
  });
});

describe("cartTotals", () => {
  it("adds only priced items", () => {
    expect(cartTotals([{ price: 499 }, { price: null }, { price: 99 }])).toEqual({ count: 2, total: 598 });
  });
});

describe("splitSale", () => {
  it("keeps 20% for the platform and rounds to whole cents", () => {
    expect(splitSale(499)).toEqual({ gross: 499, fee: 100, net: 399 });
    expect(splitSale(99)).toEqual({ gross: 99, fee: 20, net: 79 });
  });
});
