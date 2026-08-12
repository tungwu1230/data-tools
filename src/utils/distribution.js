// Pure statistics helpers for Explore Mode (src/components/ExploreMode.jsx).
// Operates directly on a single file's raw { headers, rows } (see useCsvFiles) —
// no join/merge config required, so it works right after upload.

function toFilledStrings(rows, column) {
  const out = [];
  for (const r of rows) {
    const raw = r[column];
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
      out.push(String(raw).trim());
    }
  }
  return out;
}

function isNumeric(str) {
  return str !== "" && !isNaN(Number(str));
}

// Same 0.8 dominance threshold as utils/quality.js, collapsed to number/text
// since histograms only need to pick a chart shape, not a full type badge.
export function inferColumnType(values) {
  if (values.length === 0) return "text";
  const numericCount = values.filter(isNumeric).length;
  return numericCount / values.length >= 0.8 ? "number" : "text";
}

export function numericSummary(numbers) {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((s, n) => s + n, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Number((sum / sorted.length).toFixed(2)),
    median: Number(median.toFixed(2)),
  };
}

export function buildHistogram(numbers, binCount = 10) {
  if (numbers.length === 0) return [];
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  if (min === max) {
    return [{ binStart: min, binEnd: max, count: numbers.length }];
  }
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * width,
    binEnd: min + (i + 1) * width,
    count: 0,
  }));
  numbers.forEach((n) => {
    let idx = Math.floor((n - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  });
  return bins;
}

// One bar per distinct value, sorted ascending — for low-cardinality numeric
// columns (ratings, small integer codes) where binning into ranges would
// smear a handful of real values across mostly-empty bins.
export function buildDiscreteNumericDistribution(numbers) {
  const total = numbers.length;
  const counts = new Map();
  numbers.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
  return [...counts.keys()]
    .sort((a, b) => a - b)
    .map((value) => ({
      value,
      count: counts.get(value),
      pct: Number(((counts.get(value) / total) * 100).toFixed(1)),
    }));
}

export function topValueCounts(values, topN = 8) {
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN).map(([value, count]) => ({
    value,
    count,
    pct: Number(((count / values.length) * 100).toFixed(1)),
  }));
  const otherCount = sorted.slice(topN).reduce((s, [, c]) => s + c, 0);
  return {
    top,
    otherCount,
    otherPct: values.length > 0 ? Number(((otherCount / values.length) * 100).toFixed(1)) : 0,
    uniqueCount: counts.size,
  };
}

// The single-column entry point: infers number vs. categorical and returns
// whichever shape (histogram or top-values) the chart needs to render.
// `forcedType` ("number" | "text") lets the caller override the auto-detected
// type — the user knows better than an 80%-threshold heuristic whether a
// column is really categorical (e.g. zip codes) or continuous.
// `forcedDiscrete` (true | false) similarly overrides the "≤ binCount unique
// values ⇒ discrete" heuristic below, for numeric columns where the caller
// wants to force per-value bars vs. a binned histogram regardless of cardinality.
export function buildColumnDistribution(rows, column, opts = {}) {
  const { binCount = 10, topN = 8, forcedType = null, forcedDiscrete = null } = opts;
  const total = rows.length;
  const values = toFilledStrings(rows, column);
  const missing = total - values.length;
  const autoType = inferColumnType(values);
  const inferredType = forcedType === "number" || forcedType === "text" ? forcedType : autoType;

  if (inferredType === "number") {
    const numbers = values.filter(isNumeric).map(Number);
    // Few enough distinct values ⇒ show each one as its own bar instead of
    // binning into ranges (which would blur real values together) — unless
    // the caller has forced an explicit discrete/continuous choice.
    const isDiscrete = typeof forcedDiscrete === "boolean" ? forcedDiscrete : new Set(numbers).size <= binCount;
    return {
      column,
      total,
      filled: values.length,
      missing,
      autoType,
      inferredType,
      uniqueCount: new Set(values).size,
      stats: numericSummary(numbers),
      isDiscrete,
      histogram: isDiscrete ? null : buildHistogram(numbers, binCount),
      discreteValues: isDiscrete ? buildDiscreteNumericDistribution(numbers) : null,
    };
  }

  const { top, otherCount, otherPct, uniqueCount } = topValueCounts(values, topN);
  return {
    column,
    total,
    filled: values.length,
    missing,
    autoType,
    inferredType,
    uniqueCount,
    topValues: top,
    otherCount,
    otherPct,
  };
}

// Independent per-column tallies (NOT a joint cross-tab): each side's own
// value→count map, merged onto one shared category axis. Neither side needs
// row alignment, so this works whether A and B come from the same file or not.
export function buildMarginalComparison(distA, distB) {
  const entriesOf = (dist) => {
    if (dist.inferredType === "number") {
      return (dist.discreteValues || []).map((v) => [String(v.value), v.count]);
    }
    const entries = dist.topValues.map((v) => [v.value || "(空)", v.count]);
    if (dist.otherCount > 0) entries.push(["其他", dist.otherCount]);
    return entries;
  };
  const mapA = new Map(entriesOf(distA));
  const mapB = new Map(entriesOf(distB));
  const bothNumeric = distA.inferredType === "number" && distB.inferredType === "number";
  const labels = [...new Set([...mapA.keys(), ...mapB.keys()])];
  labels.sort((x, y) =>
    bothNumeric
      ? Number(x) - Number(y)
      : (mapB.get(y) || 0) + (mapA.get(y) || 0) - ((mapB.get(x) || 0) + (mapA.get(x) || 0))
  );
  return labels.map((label) => ({ label, aCount: mapA.get(label) || 0, bCount: mapB.get(label) || 0 }));
}

export function pearsonCorrelation(points) {
  const n = points.length;
  if (n < 2) return null;
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return Number((num / Math.sqrt(denX * denY)).toFixed(3));
}

// Same-file only: rows align 1:1 by position, so a numeric/numeric pair is a
// true scatter (not just a shape comparison). Evenly sampled above maxPoints.
export function buildScatterPoints(rows, colA, colB, maxPoints = 400) {
  const points = [];
  for (const r of rows) {
    const a = r[colA];
    const b = r[colB];
    if (a === undefined || a === null || String(a).trim() === "") continue;
    if (b === undefined || b === null || String(b).trim() === "") continue;
    const x = Number(String(a).trim());
    const y = Number(String(b).trim());
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    points.push({ x, y });
  }
  if (points.length <= maxPoints) return points;
  const step = points.length / maxPoints;
  const sampled = [];
  for (let i = 0; i < maxPoints; i++) sampled.push(points[Math.floor(i * step)]);
  return sampled;
}

// Same-file only: cross-tab of the top categories of two categorical columns.
export function buildCrossTab(rows, colA, colB, topN = 6) {
  const pairs = [];
  for (const r of rows) {
    const a = r[colA];
    const b = r[colB];
    if (a === undefined || a === null || String(a).trim() === "") continue;
    if (b === undefined || b === null || String(b).trim() === "") continue;
    pairs.push([String(a).trim(), String(b).trim()]);
  }
  const countsA = new Map();
  const countsB = new Map();
  pairs.forEach(([a, b]) => {
    countsA.set(a, (countsA.get(a) || 0) + 1);
    countsB.set(b, (countsB.get(b) || 0) + 1);
  });
  const catsA = [...countsA.entries()].sort((x, y) => y[1] - x[1]).slice(0, topN).map(([v]) => v);
  const catsB = [...countsB.entries()].sort((x, y) => y[1] - x[1]).slice(0, topN).map(([v]) => v);

  const matrix = catsA.map(() => catsB.map(() => 0));
  let maxCell = 0;
  pairs.forEach(([a, b]) => {
    const i = catsA.indexOf(a);
    const j = catsB.indexOf(b);
    if (i === -1 || j === -1) return;
    matrix[i][j]++;
    if (matrix[i][j] > maxCell) maxCell = matrix[i][j];
  });

  return { catsA, catsB, matrix, maxCell, totalPairs: pairs.length };
}

// "Nice" axis numbers (D3-style), so gridlines land on round values instead of the raw max.
function niceNumber(range, round) {
  if (range <= 0) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction;
  if (round) {
    niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  } else {
    niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  }
  return niceFraction * 10 ** exponent;
}

// Used by the bar-chart y-axes in ExploreMode.jsx (GroupedStats, DistCompareChart)
// to pick round tick values and a chart ceiling instead of using the raw data max.
export function buildAxisTicks(maxVal, tickCount = 5) {
  if (maxVal <= 0) return { ticks: [0, 1], niceMax: 1 };
  const tickSpacing = niceNumber(niceNumber(maxVal, false) / (tickCount - 1), true);
  const niceMax = Math.ceil(maxVal / tickSpacing) * tickSpacing;
  const ticks = [];
  for (let v = 0; v <= niceMax + tickSpacing * 1e-6; v += tickSpacing) ticks.push(Math.round(v * 1e6) / 1e6);
  return { ticks, niceMax };
}

// Same-file only: numeric summary of `numCol`, grouped by top categories of `catCol`.
export function buildGroupedNumericStats(rows, catCol, numCol, topN = 8) {
  const groups = new Map();
  for (const r of rows) {
    const catRaw = r[catCol];
    const numRaw = r[numCol];
    if (catRaw === undefined || catRaw === null || String(catRaw).trim() === "") continue;
    if (numRaw === undefined || numRaw === null || String(numRaw).trim() === "") continue;
    const num = Number(String(numRaw).trim());
    if (Number.isNaN(num)) continue;
    const cat = String(catRaw).trim();
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(num);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, topN)
    .map(([category, numbers]) => ({
      category,
      count: numbers.length,
      ...numericSummary(numbers),
    }));
}
