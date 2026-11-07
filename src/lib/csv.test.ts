import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins rows with CRLF and quotes cells that need it", () => {
    expect(toCsv(["a", "b"], [["x", 1], ['di "hola", ya', 2]])).toBe('a,b\r\nx,1\r\n"di ""hola"", ya",2');
  });

  it("neutralises cells that look like spreadsheet formulas", () => {
    expect(toCsv(["v"], [["=SUM(A1)"], ["-1"], [-1]])).toBe("v\r\n'=SUM(A1)\r\n'-1\r\n-1");
  });
});
