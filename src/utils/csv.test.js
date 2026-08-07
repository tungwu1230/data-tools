import { describe, it, expect } from "vitest";
import { computeMerge } from "./csv.js";

// minimal file shape: { id, name, headers, rows }
const file = (id, name, headers, rows) => ({ id, name, headers, rows });

// output column shape: { id, fileId, fileName, column, outputName }
const oc = (id, fileId, fileName, column, outputName = column) => ({
  id,
  fileId,
  fileName,
  column,
  outputName,
});

const base = file("base", "base.csv", ["id", "name"], [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
]);
const other = file("other", "other.csv", ["id", "city"], [{ id: "1", city: "Taipei" }]);

const outputCols = [
  oc("base::id", "base", "base.csv", "id"),
  oc("base::name", "base", "base.csv", "name"),
  oc("other::city", "other", "other.csv", "city"),
];
const joinConfig = { other: { theirKey: "id", baseKey: "id" } };

describe("computeMerge — returns a Dataset keyed by column id", () => {
  it("returns null without a base file or output columns", () => {
    expect(computeMerge(null, [other], outputCols, joinConfig)).toBeNull();
    expect(computeMerge(base, [other], [], joinConfig)).toBeNull();
  });

  it("left join keeps all base rows; blanks unmatched other columns", () => {
    const ds = computeMerge(base, [other], outputCols, joinConfig, "left");
    expect(ds.total).toBe(2);
    expect(ds.rows[0]).toEqual({
      "base::id": "1",
      "base::name": "Alice",
      "other::city": "Taipei",
    });
    expect(ds.rows[1]).toEqual({
      "base::id": "2",
      "base::name": "Bob",
      "other::city": "",
    });
    expect(ds.columns.map((c) => c.label)).toEqual(["id", "name", "city"]);
    expect(ds.toMatrix()).toEqual([
      ["id", "name", "city"],
      ["1", "Alice", "Taipei"],
      ["2", "Bob", ""],
    ]);
  });

  it("inner join drops base rows with no match in any other file", () => {
    const ds = computeMerge(base, [other], outputCols, joinConfig, "inner");
    expect(ds.total).toBe(1);
    expect(ds.rows[0]["base::name"]).toBe("Alice");
  });

  it("outer join keeps all base rows and appends unmatched other rows", () => {
    const o = file("other", "other.csv", ["id", "city"], [
      { id: "1", city: "Taipei" }, // matches Alice
      { id: "9", city: "Tainan" }, // no base match → appended
    ]);
    const ds = computeMerge(base, [o], outputCols, joinConfig, "outer");
    // 2 base rows + 1 unmatched other row
    expect(ds.total).toBe(3);
    const appended = ds.rows[2];
    expect(appended["other::city"]).toBe("Tainan");
    expect(appended["base::name"]).toBe(""); // base columns blank for appended row
  });

  it("warns on duplicate keys in an other file, keeping the first match", () => {
    const dupOther = file("other", "other.csv", ["id", "city"], [
      { id: "1", city: "Taipei" },
      { id: "1", city: "Kaohsiung" },
    ]);
    const ds = computeMerge(base, [dupOther], outputCols, joinConfig, "left");
    expect(ds.rows[0]["other::city"]).toBe("Taipei"); // first wins
    expect(ds.warnings.some((w) => w.includes("重複值"))).toBe(true);
  });

  it("warns and blanks a file that has no join config", () => {
    const ds = computeMerge(base, [other], outputCols, {}, "left");
    expect(ds.rows[0]["other::city"]).toBe("");
    expect(ds.warnings.some((w) => w.includes("尚未設定比對欄位"))).toBe(true);
  });
});

describe("computeMerge — duplicate output labels (the collision fix)", () => {
  it("keeps both same-named columns instead of overwriting", () => {
    const b = file("base", "base.csv", ["id", "name"], [{ id: "1", name: "Alice" }]);
    const o = file("other", "other.csv", ["id", "name"], [{ id: "1", name: "Alice-Other" }]);
    const cols = [
      oc("base::id", "base", "base.csv", "id"),
      oc("base::name", "base", "base.csv", "name", "name"),
      oc("other::name", "other", "other.csv", "name", "name"), // same label "name"
    ];
    const ds = computeMerge(b, [o], cols, { other: { theirKey: "id", baseKey: "id" } }, "left");
    // both values survive — no overwrite
    expect(ds.rows[0]["base::name"]).toBe("Alice");
    expect(ds.rows[0]["other::name"]).toBe("Alice-Other");
    // matrix has two "name" headers, both populated
    expect(ds.toMatrix()).toEqual([
      ["id", "name", "name"],
      ["1", "Alice", "Alice-Other"],
    ]);
    expect(ds.warnings.some((w) => w.includes("重複"))).toBe(true);
  });

  it("rename changes the label but the row stays keyed by the stable id", () => {
    const b = file("base", "base.csv", ["id", "name"], [{ id: "1", name: "Alice" }]);
    const cols = [
      oc("base::id", "base", "base.csv", "id"),
      oc("base::name", "base", "base.csv", "name", "姓名"), // renamed
    ];
    const ds = computeMerge(b, [], cols, {}, "left");
    expect(ds.columns.map((c) => c.label)).toEqual(["id", "姓名"]);
    expect(ds.rows[0]["base::name"]).toBe("Alice");
    expect(ds.cell(ds.rows[0], "base::name")).toBe("Alice");
  });
});
