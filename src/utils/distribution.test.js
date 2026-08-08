import { describe, it, expect } from "vitest";
import {
  inferColumnType,
  numericSummary,
  buildHistogram,
  buildDiscreteNumericDistribution,
  topValueCounts,
  buildColumnDistribution,
  pearsonCorrelation,
  buildScatterPoints,
  buildCrossTab,
  buildGroupedNumericStats,
} from "./distribution.js";

describe("inferColumnType", () => {
  it("empty ⇒ text", () => {
    expect(inferColumnType([])).toBe("text");
  });
  it("≥80% numeric ⇒ number", () => {
    expect(inferColumnType(["1", "2", "3", "4", "x"])).toBe("number");
  });
  it("<80% numeric ⇒ text", () => {
    expect(inferColumnType(["1", "a", "b", "c", "d"])).toBe("text");
  });
});

describe("numericSummary", () => {
  it("null on empty input", () => {
    expect(numericSummary([])).toBeNull();
  });
  it("computes min/max/avg/median (odd count)", () => {
    expect(numericSummary([3, 1, 2])).toEqual({ min: 1, max: 3, avg: 2, median: 2 });
  });
  it("computes median for even count as the midpoint average", () => {
    expect(numericSummary([1, 2, 3, 4]).median).toBe(2.5);
  });
});

describe("buildHistogram", () => {
  it("empty ⇒ empty", () => {
    expect(buildHistogram([])).toEqual([]);
  });
  it("all-equal values collapse into a single bin", () => {
    const bins = buildHistogram([5, 5, 5]);
    expect(bins).toEqual([{ binStart: 5, binEnd: 5, count: 3 }]);
  });
  it("distributes values across bins and keeps the max value in the last bin", () => {
    const bins = buildHistogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10);
    expect(bins).toHaveLength(10);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(11);
    expect(bins[9].count).toBeGreaterThan(0); // the max (10) lands in the last bin, not overflow
  });
});

describe("topValueCounts", () => {
  it("ranks by frequency and buckets the rest into other", () => {
    const values = ["a", "a", "a", "b", "b", "c"];
    const { top, otherCount, uniqueCount } = topValueCounts(values, 2);
    expect(top).toEqual([
      { value: "a", count: 3, pct: 50 },
      { value: "b", count: 2, pct: 33.3 },
    ]);
    expect(otherCount).toBe(1);
    expect(uniqueCount).toBe(3);
  });
});

describe("buildDiscreteNumericDistribution", () => {
  it("one bar per distinct value, sorted ascending", () => {
    expect(buildDiscreteNumericDistribution([4, -9, 4, 0, -9, -9])).toEqual([
      { value: -9, count: 3, pct: 50 },
      { value: 0, count: 1, pct: 16.7 },
      { value: 4, count: 2, pct: 33.3 },
    ]);
  });
});

describe("buildColumnDistribution", () => {
  const rows = [
    { age: "10", city: "Taipei" },
    { age: "20", city: "Taipei" },
    { age: "30", city: "Tainan" },
    { age: "", city: "" },
  ];

  it("low-cardinality numeric column ⇒ discrete bars, not a binned histogram", () => {
    // 3 distinct values, well under the default binCount(10) — this is exactly
    // the case that used to get smeared across mostly-empty histogram bins.
    const d = buildColumnDistribution(rows, "age");
    expect(d.inferredType).toBe("number");
    expect(d.filled).toBe(3);
    expect(d.missing).toBe(1);
    expect(d.stats).toMatchObject({ min: 10, max: 30 });
    expect(d.isDiscrete).toBe(true);
    expect(d.histogram).toBeNull();
    expect(d.discreteValues).toEqual([
      { value: 10, count: 1, pct: 33.3 },
      { value: 20, count: 1, pct: 33.3 },
      { value: 30, count: 1, pct: 33.3 },
    ]);
  });

  it("high-cardinality numeric column ⇒ binned histogram, not discrete bars", () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => ({ age: String(i) }));
    const d = buildColumnDistribution(manyRows, "age");
    expect(d.isDiscrete).toBe(false);
    expect(d.discreteValues).toBeNull();
    expect(d.histogram.length).toBeGreaterThan(0);
  });

  it("categorical column: top values, missing counted", () => {
    const d = buildColumnDistribution(rows, "city");
    expect(d.inferredType).toBe("text");
    expect(d.filled).toBe(3);
    expect(d.missing).toBe(1);
    expect(d.topValues[0]).toEqual({ value: "Taipei", count: 2, pct: 66.7 });
  });

  it("auto-detected type is exposed even when not overridden", () => {
    expect(buildColumnDistribution(rows, "age").autoType).toBe("number");
    expect(buildColumnDistribution(rows, "city").autoType).toBe("text");
  });

  it("forcedType: 'text' overrides an auto-numeric column into categorical top-values", () => {
    const d = buildColumnDistribution(rows, "age", { forcedType: "text" });
    expect(d.autoType).toBe("number");
    expect(d.inferredType).toBe("text");
    expect(d.topValues).toBeDefined();
    expect(d.histogram).toBeUndefined();
  });

  it("forcedType: 'number' overrides an auto-categorical column into numeric stats", () => {
    const d = buildColumnDistribution(rows, "city", { forcedType: "number" });
    expect(d.autoType).toBe("text");
    expect(d.inferredType).toBe("number");
    // "Taipei"/"Tainan" aren't numeric, so no values survive the numeric parse
    expect(d.stats).toBeNull();
    expect(d.discreteValues).toEqual([]);
  });

  it("an invalid forcedType value is ignored and falls back to auto-detection", () => {
    const d = buildColumnDistribution(rows, "age", { forcedType: "bogus" });
    expect(d.inferredType).toBe("number");
  });
});

describe("pearsonCorrelation", () => {
  it("null with fewer than 2 points", () => {
    expect(pearsonCorrelation([])).toBeNull();
    expect(pearsonCorrelation([{ x: 1, y: 1 }])).toBeNull();
  });
  it("null when one axis has zero variance", () => {
    expect(pearsonCorrelation([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
  });
  it("1 for a perfect positive linear relationship", () => {
    const pts = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }];
    expect(pearsonCorrelation(pts)).toBe(1);
  });
  it("-1 for a perfect negative linear relationship", () => {
    const pts = [{ x: 1, y: 6 }, { x: 2, y: 4 }, { x: 3, y: 2 }];
    expect(pearsonCorrelation(pts)).toBe(-1);
  });
});

describe("buildScatterPoints", () => {
  const rows = [
    { a: "1", b: "2" },
    { a: "2", b: "" }, // b missing ⇒ dropped
    { a: "x", b: "3" }, // a non-numeric ⇒ dropped
    { a: "3", b: "4" },
  ];
  it("drops rows with missing or non-numeric values on either side", () => {
    expect(buildScatterPoints(rows, "a", "b")).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
  });
  it("samples down to maxPoints while preserving order", () => {
    const many = Array.from({ length: 100 }, (_, i) => ({ a: String(i), b: String(i) }));
    const sampled = buildScatterPoints(many, "a", "b", 10);
    expect(sampled).toHaveLength(10);
    for (let i = 1; i < sampled.length; i++) expect(sampled[i].x).toBeGreaterThan(sampled[i - 1].x);
  });
});

describe("buildCrossTab", () => {
  const rows = [
    { region: "N", tier: "A" },
    { region: "N", tier: "A" },
    { region: "N", tier: "B" },
    { region: "S", tier: "B" },
  ];
  it("counts co-occurrences into a matrix keyed by top categories", () => {
    const ct = buildCrossTab(rows, "region", "tier");
    expect(ct.catsA).toEqual(["N", "S"]);
    expect(ct.catsB).toEqual(["A", "B"]); // A:2, B:2 — insertion order preserved on tie
    expect(ct.matrix).toEqual([[2, 1], [0, 1]]);
    expect(ct.maxCell).toBe(2);
    expect(ct.totalPairs).toBe(4);
  });
});

describe("buildGroupedNumericStats", () => {
  const rows = [
    { dept: "eng", salary: "100" },
    { dept: "eng", salary: "200" },
    { dept: "sales", salary: "50" },
  ];
  it("groups numeric stats by category, most-frequent category first", () => {
    const groups = buildGroupedNumericStats(rows, "dept", "salary");
    expect(groups[0]).toMatchObject({ category: "eng", count: 2, min: 100, max: 200, avg: 150 });
    expect(groups[1]).toMatchObject({ category: "sales", count: 1, min: 50, max: 50 });
  });
});
