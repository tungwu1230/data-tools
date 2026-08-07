import { describe, it, expect } from "vitest";
import { buildOutputCols } from "./outputColumns.js";

const f = (id, name, headers) => ({ id, name, headers });
const sel = (cols) => new Set(cols);

const files = [
  f("a", "a.csv", ["x", "y", "z"]),
  f("b", "b.csv", ["x", "w"]),
];

describe("buildOutputCols — membership & natural order", () => {
  it("includes only selected columns", () => {
    const out = buildOutputCols(files, { a: sel(["x", "z"]), b: sel(["w"]) });
    expect(out.map((o) => o.id)).toEqual(["a::x", "a::z", "b::w"]);
  });

  it("natural order is file order then header order", () => {
    const out = buildOutputCols(files, { a: sel(["z", "x"]), b: sel(["x"]) });
    // selections Set order is ignored; iteration follows files→headers
    expect(out.map((o) => o.id)).toEqual(["a::x", "a::z", "b::x"]);
  });

  it("carries file/column metadata and defaults outputName to the column", () => {
    const out = buildOutputCols(files, { a: sel(["x"]) });
    expect(out[0]).toMatchObject({
      id: "a::x",
      fileId: "a",
      fileName: "a.csv",
      column: "x",
      outputName: "x",
    });
  });

  it("empty selections ⇒ empty list", () => {
    expect(buildOutputCols(files, {})).toEqual([]);
  });
});

describe("buildOutputCols — rename overlay", () => {
  it("applies a rename when present, else the original column", () => {
    const out = buildOutputCols(files, { a: sel(["x", "y"]) }, [], { "a::y": "Y!" });
    expect(out.map((o) => o.outputName)).toEqual(["x", "Y!"]);
  });

  it("a renamed-then-reset column (overlay entry removed) falls back to original", () => {
    const out = buildOutputCols(files, { a: sel(["x"]) }, [], {});
    expect(out[0].outputName).toBe("x");
  });

  it("tolerates stale rename entries for deselected columns", () => {
    const out = buildOutputCols(files, { a: sel(["x"]) }, [], { "a::z": "ghost" });
    expect(out.map((o) => o.id)).toEqual(["a::x"]);
    expect(out[0].outputName).toBe("x");
  });
});

describe("buildOutputCols — order overlay (the order-wipe fix)", () => {
  it("orderPrefs reorders surviving columns; unlisted ones append in natural order", () => {
    const out = buildOutputCols(files, { a: sel(["x", "y", "z"]) }, ["a::z", "a::x"]);
    // z and x from prefs (still selected), then y (newly selected) appended
    expect(out.map((o) => o.id)).toEqual(["a::z", "a::x", "a::y"]);
  });

  it("reorder survives a later selection change — the bug that was previously wiped", () => {
    // user reordered z ahead of x
    let out = buildOutputCols(files, { a: sel(["x", "y", "z"]) }, ["a::z", "a::x", "a::y"]);
    expect(out.map((o) => o.id)).toEqual(["a::z", "a::x", "a::y"]);
    // now toggle a NEW column on (b::w). Old reordering must survive.
    out = buildOutputCols(
      files,
      { a: sel(["x", "y", "z"]), b: sel(["w"]) },
      ["a::z", "a::x", "a::y"]
    );
    expect(out.map((o) => o.id)).toEqual(["a::z", "a::x", "a::y", "b::w"]);
  });

  it("a deselected-then-reselected column returns to its old place (not appended)", () => {
    let out = buildOutputCols(files, { a: sel(["x", "y", "z"]) }, ["a::z", "a::x", "a::y"]);
    // deselect y
    out = buildOutputCols(files, { a: sel(["x", "z"]) }, ["a::z", "a::x", "a::y"]);
    expect(out.map((o) => o.id)).toEqual(["a::z", "a::x"]);
    // reselect y — comes back to its slot, not the end
    out = buildOutputCols(files, { a: sel(["x", "y", "z"]) }, ["a::z", "a::x", "a::y"]);
    expect(out.map((o) => o.id)).toEqual(["a::z", "a::x", "a::y"]);
  });

  it("ignores orderPrefs ids that are no longer selected (stale-tolerant)", () => {
    const out = buildOutputCols(files, { a: sel(["x"]) }, ["a::ghost", "a::x"]);
    expect(out.map((o) => o.id)).toEqual(["a::x"]);
  });
});
