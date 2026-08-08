import { useState, useMemo, useEffect } from "react";
import {
  buildColumnDistribution,
  buildScatterPoints,
  buildCrossTab,
  buildGroupedNumericStats,
  buildMarginalComparison,
  pearsonCorrelation,
} from "../utils/distribution.js";

// Explore Mode reads raw per-file rows straight from useCsvFiles — it does not
// depend on join config or the merged Dataset, so it's usable right after upload.
// "auto" defers to buildColumnDistribution's own heuristics (both the number/text
// split and the discrete/continuous split); "discrete"/"continuous" force the
// column to number and additionally force per-value bars vs. a binned histogram;
// "text" forces it to categorical.
function distOptsForType(type) {
  if (type === "discrete") return { forcedType: "number", forcedDiscrete: true };
  if (type === "continuous") return { forcedType: "number", forcedDiscrete: false };
  if (type === "text") return { forcedType: "text", forcedDiscrete: null };
  return { forcedType: null, forcedDiscrete: null };
}

export function useExploreMode(files) {
  const [fileAId, setFileAId] = useState(null);
  const [colA, setColA] = useState(null);
  const [typeA, setTypeA] = useState("auto");
  const [fileBId, setFileBId] = useState(null);
  const [colB, setColB] = useState(null);
  const [typeB, setTypeB] = useState("auto");

  // self-heal file selection when the file list changes, same pattern as useCsvFiles.baseFileId
  useEffect(() => {
    if (!fileAId && files.length > 0) setFileAId(files[0].id);
    if (fileAId && !files.find((f) => f.id === fileAId)) {
      setFileAId(files.length > 0 ? files[0].id : null);
      setColA(null);
    }
    if (fileBId && !files.find((f) => f.id === fileBId)) {
      setFileBId(null);
      setColB(null);
    }
  }, [files]); // eslint-disable-line

  const fileA = useMemo(() => files.find((f) => f.id === fileAId) || null, [files, fileAId]);
  const fileB = useMemo(() => files.find((f) => f.id === fileBId) || null, [files, fileBId]);

  useEffect(() => {
    if (colA && fileA && !fileA.headers.includes(colA)) setColA(null);
  }, [fileA]); // eslint-disable-line
  useEffect(() => {
    if (colB && fileB && !fileB.headers.includes(colB)) setColB(null);
  }, [fileB]); // eslint-disable-line

  // a fresh column pick shouldn't silently inherit the previous column's type override
  useEffect(() => setTypeA("auto"), [colA]);
  useEffect(() => setTypeB("auto"), [colB]);

  const distA = useMemo(
    () => (fileA && colA ? buildColumnDistribution(fileA.rows, colA, distOptsForType(typeA)) : null),
    [fileA, colA, typeA]
  );
  const distB = useMemo(
    () => (fileB && colB ? buildColumnDistribution(fileB.rows, colB, distOptsForType(typeB)) : null),
    [fileB, colB, typeB]
  );

  const comparing = !!(fileB && colB && distA && distB);
  const sameFile = comparing && fileA.id === fileB.id;

  // Two low-cardinality numeric columns (ratings, small integer codes) are
  // near-categorical — a scatter plot of e.g. two 1~4 columns is unreadable.
  // Compare their per-value tallies as a grouped bar chart instead. This is a
  // marginal comparison (each side's own counts), so it needs no row
  // alignment and works whether A and B come from the same file or not.
  const bothDiscreteNumeric = !!(
    comparing &&
    distA.inferredType === "number" &&
    distB.inferredType === "number" &&
    distA.isDiscrete &&
    distB.isDiscrete
  );
  const distCompare = useMemo(
    () => (bothDiscreteNumeric ? buildMarginalComparison(distA, distB) : null),
    [bothDiscreteNumeric, distA, distB]
  );

  // Only same-file pairs are row-aligned, so only they get a true pairwise view
  // (scatter / crosstab / grouped stats). Cross-file pairs fall back to a
  // side-by-side shape comparison, rendered directly from distA/distB.
  const pairwise = useMemo(() => {
    if (!sameFile || bothDiscreteNumeric) return null;
    if (distA.inferredType === "number" && distB.inferredType === "number") {
      const points = buildScatterPoints(fileA.rows, colA, colB);
      return { kind: "scatter", points, correlation: pearsonCorrelation(points) };
    }
    if (distA.inferredType !== "number" && distB.inferredType !== "number") {
      return { kind: "crosstab", table: buildCrossTab(fileA.rows, colA, colB) };
    }
    const [catCol, numCol] = distA.inferredType === "number" ? [colB, colA] : [colA, colB];
    return { kind: "grouped", groups: buildGroupedNumericStats(fileA.rows, catCol, numCol) };
  }, [sameFile, bothDiscreteNumeric, distA, distB, fileA, colA, colB]);

  const clearCompare = () => {
    setFileBId(null);
    setColB(null);
  };

  return {
    files,
    fileA, fileAId, setFileAId, colA, setColA, typeA, setTypeA,
    fileB, fileBId, setFileBId, colB, setColB, typeB, setTypeB,
    distA, distB, comparing, sameFile, pairwise,
    bothDiscreteNumeric, distCompare,
    clearCompare,
  };
}
