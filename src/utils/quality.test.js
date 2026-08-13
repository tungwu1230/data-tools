import { describe, it, expect } from "vitest";
import { analyzeDataQuality } from "./quality.js";

// minimal Dataset-shaped input: { columns, rows }
// columns: [{ id, label, fileId, fileName, originalColumn }]
const col = (id, label = id, fileId = "f1", fileName = "f1.csv", originalColumn = label) => ({
  id,
  label,
  fileId,
  fileName,
  originalColumn,
});

describe("analyzeDataQuality — empty input", () => {
  it("returns zeroed-out stats for a null/empty dataset", () => {
    expect(analyzeDataQuality(null)).toEqual({
      totalRows: 0,
      totalCols: 0,
      totalCells: 0,
      totalFilledCells: 0,
      overallCompleteness: 0,
      colStats: [],
    });
    expect(analyzeDataQuality({ columns: [], rows: [] })).toMatchObject({ colStats: [] });
    expect(analyzeDataQuality({ columns: [col("a")], rows: [] })).toMatchObject({ colStats: [] });
  });
});

describe("analyzeDataQuality — numeric column", () => {
  const dataset = {
    columns: [col("amount", "金額")],
    rows: [
      { amount: "10" },
      { amount: "20.5" },
      { amount: "-3" },
      { amount: "" }, // empty — excluded from completeness
    ],
  };

  it("infers number type and computes min/max/avg over filled cells", () => {
    const result = analyzeDataQuality(dataset);
    expect(result.totalRows).toBe(4);
    expect(result.totalCells).toBe(4);
    expect(result.totalFilledCells).toBe(3);
    expect(result.overallCompleteness).toBe(75);

    const stats = result.colStats[0];
    expect(stats.inferredType).toBe("number");
    expect(stats.filledCount).toBe(3);
    expect(stats.emptyCount).toBe(1);
    expect(stats.completenessPct).toBe(75);
    expect(stats.uniqueCount).toBe(3);
    expect(stats.summary.min).toBe(-3);
    expect(stats.summary.max).toBe(20.5);
    expect(stats.summary.avg).toBe((27.5 / 3).toFixed(2));
  });
});

describe("analyzeDataQuality — boolean column", () => {
  const dataset = {
    columns: [col("active")],
    rows: [{ active: "true" }, { active: "FALSE" }, { active: "True" }, { active: "false" }],
  };

  it("infers boolean type when >=80% of filled values are true/false", () => {
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.inferredType).toBe("boolean");
    expect(stats.filledCount).toBe(4);
    expect(stats.summary.topValues.length).toBeGreaterThan(0);
  });
});

describe("analyzeDataQuality — date column", () => {
  const dataset = {
    columns: [col("signup")],
    rows: [{ signup: "2024-01-15" }, { signup: "2024/02/20" }, { signup: "2024.03.05" }],
  };

  it("infers date type via shape regex + Date.parse", () => {
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.inferredType).toBe("date");
    expect(stats.filledCount).toBe(3);
  });

  it("does not classify date-shaped-but-unparseable strings as date", () => {
    const bad = {
      columns: [col("weird")],
      rows: [{ weird: "2024-99-99" }], // shape matches, Date.parse fails
    };
    const stats = analyzeDataQuality(bad).colStats[0];
    expect(stats.inferredType).toBe("text");
  });
});

describe("analyzeDataQuality — text column", () => {
  const dataset = {
    columns: [col("name")],
    rows: [{ name: "Alice" }, { name: "Bob" }, { name: "Alice" }],
  };

  it("infers text type and ranks topValues by frequency", () => {
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.inferredType).toBe("text");
    expect(stats.uniqueCount).toBe(2);
    expect(stats.summary.topValues[0]).toEqual({ value: "Alice", count: 2, pct: "66.7" });
    expect(stats.summary.topValues[1]).toEqual({ value: "Bob", count: 1, pct: "33.3" });
  });
});

describe("analyzeDataQuality — mixed-type column", () => {
  it("falls back to text when no single type reaches the 80% threshold", () => {
    const dataset = {
      columns: [col("mixed")],
      rows: [{ mixed: "10" }, { mixed: "true" }, { mixed: "2024-01-01" }, { mixed: "hello" }, { mixed: "world" }],
    };
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.inferredType).toBe("text");
    expect(stats.filledCount).toBe(5);
  });
});

describe("analyzeDataQuality — fully empty column", () => {
  it("reports zero completeness and empty summary/topValues", () => {
    const dataset = {
      columns: [col("blank")],
      rows: [{ blank: "" }, { blank: undefined }, { blank: null }, {}],
    };
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.filledCount).toBe(0);
    expect(stats.emptyCount).toBe(4);
    expect(stats.completenessPct).toBe(0);
    expect(stats.inferredType).toBe("text");
    expect(stats.summary).toEqual({ topValues: [] });
  });
});

describe("analyzeDataQuality — multi-column dataset", () => {
  it("carries column id/label/originalColumn/fileId/fileName through into colStats", () => {
    const dataset = {
      columns: [col("f1::id", "編號", "f1", "base.csv", "id"), col("f2::name", "姓名", "f2", "other.csv", "name")],
      rows: [
        { "f1::id": "1", "f2::name": "Alice" },
        { "f1::id": "2", "f2::name": "Bob" },
      ],
    };
    const result = analyzeDataQuality(dataset);
    expect(result.totalCols).toBe(2);
    expect(result.totalCells).toBe(4);
    expect(result.colStats.map((s) => s.id)).toEqual(["f1::id", "f2::name"]);
    expect(result.colStats[0]).toMatchObject({
      outputName: "編號",
      originalColumn: "id",
      fileId: "f1",
      fileName: "base.csv",
    });
  });

  it("defaults fileName to 未知檔案 when a column has none", () => {
    const dataset = {
      columns: [{ id: "x", label: "X", fileId: "f1", originalColumn: "x" }],
      rows: [{ x: "1" }],
    };
    const stats = analyzeDataQuality(dataset).colStats[0];
    expect(stats.fileName).toBe("未知檔案");
  });
});
