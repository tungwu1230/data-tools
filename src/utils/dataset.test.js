import { describe, it, expect } from "vitest";
import { Dataset, columnsFromOutputCols } from "./dataset.js";

const oc = (id, column, outputName, fileId = "f1", fileName = "f1.csv") => ({
  id,
  fileId,
  fileName,
  column,
  outputName,
});

describe("columnsFromOutputCols", () => {
  it("resolves label as outputName when set, falling back to column", () => {
    const cols = columnsFromOutputCols([
      oc("f1::a", "a", "A renamed"),
      oc("f1::b", "b", undefined),
      oc("f1::c", "c", ""),
    ]);
    expect(cols.map((c) => c.label)).toEqual(["A renamed", "b", "c"]);
    expect(cols[1]).toMatchObject({
      id: "f1::b",
      originalColumn: "b",
      fileId: "f1",
      fileName: "f1.csv",
    });
  });
});

describe("Dataset", () => {
  const columns = [
    { id: "c1", label: "Name", fileId: "f1", fileName: "f1.csv", originalColumn: "name" },
    { id: "c2", label: "City", fileId: "f1", fileName: "f1.csv", originalColumn: "city" },
  ];
  const rows = [
    { c1: "Alice", c2: "Taipei" },
    { c1: "Bob" }, // missing c2 → treated as empty
  ];

  it("exposes columns, rows, total", () => {
    const ds = new Dataset({ columns, rows });
    expect(ds.columns).toBe(columns);
    expect(ds.rows).toBe(rows);
    expect(ds.total).toBe(2);
  });

  it("cell() reads by column id, coercing missing to empty string", () => {
    const ds = new Dataset({ columns, rows });
    expect(ds.cell(rows[0], "c1")).toBe("Alice");
    expect(ds.cell(rows[1], "c2")).toBe("");
    expect(ds.cell(undefined, "c1")).toBe("");
  });

  it("toMatrix() yields [labels, ...rows] in column order, keyed by id", () => {
    const ds = new Dataset({ columns, rows });
    expect(ds.toMatrix()).toEqual([
      ["Name", "City"],
      ["Alice", "Taipei"],
      ["Bob", ""],
    ]);
  });

  it("emits a warning when two columns share a label (data still survives)", () => {
    const dupColumns = [
      { id: "c1", label: "name", fileId: "f1", fileName: "f1.csv", originalColumn: "name" },
      { id: "c2", label: "name", fileId: "f2", fileName: "f2.csv", originalColumn: "name" },
    ];
    const dupRows = [{ c1: "from-base", c2: "from-other" }];
    const ds = new Dataset({ columns: dupColumns, rows: dupRows });
    expect(ds.warnings.some((w) => w.includes("name") && w.includes("重複"))).toBe(true);
    // both columns survive in the matrix — no data loss
    expect(ds.toMatrix()).toEqual([
      ["name", "name"],
      ["from-base", "from-other"],
    ]);
  });

  it("does not emit a duplicate warning for unique labels", () => {
    const ds = new Dataset({ columns, rows });
    expect(ds.warnings.filter((w) => w.includes("重複"))).toEqual([]);
  });

  it("preserves caller-supplied operational warnings", () => {
    const ds = new Dataset({ columns, rows, warnings: ["dup key in other"] });
    expect(ds.warnings).toContain("dup key in other");
  });
});
