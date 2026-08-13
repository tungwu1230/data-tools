// Thin message-passing transport around computeMerge and analyzeDataQuality —
// neither's logic is touched here, this just runs them off the main thread.
// One shared worker handles both message types (rather than a worker each)
// since merge and quality analysis already run sequentially in the wizard
// (Step 3→4 merges, Step 5 analyzes the result).
import { computeMerge } from "../utils/csv.js";
import { analyzeDataQuality } from "../utils/quality.js";

self.onmessage = (event) => {
  const { id, type, payload } = event.data;

  if (type === "merge") {
    const { baseFile, others, outputCols, joinConfig, joinType } = payload;
    const merged = computeMerge(baseFile, others, outputCols, joinConfig, joinType);
    // Dataset instances don't survive structured cloning with their prototype
    // methods intact — send back the plain data fields; the main thread
    // reconstructs a real Dataset from them (see useMerge.js).
    const result = merged ? { columns: merged.columns, rows: merged.rows, warnings: merged.warnings } : null;
    self.postMessage({ id, type, result });
  } else if (type === "quality") {
    // payload is already the plain { columns, rows } shape analyzeDataQuality
    // expects — no Dataset reconstruction needed since it never calls methods.
    const result = analyzeDataQuality(payload);
    self.postMessage({ id, type, result });
  }
};
