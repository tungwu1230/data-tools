// Thin message-passing transport around computeMerge — the merge logic itself
// is untouched and still independently importable/testable from csv.js.
// `type` is namespaced (rather than a single fixed message shape) because this
// worker is also where ticket 04 adds analyzeDataQuality, reusing one worker
// for both computations since they already run sequentially.
import { computeMerge } from "../utils/csv.js";

self.onmessage = (event) => {
  const { id, type, payload } = event.data;
  if (type !== "merge") return;

  const { baseFile, others, outputCols, joinConfig, joinType } = payload;
  const merged = computeMerge(baseFile, others, outputCols, joinConfig, joinType);
  // Dataset instances don't survive structured cloning with their prototype
  // methods intact — send back the plain data fields; the main thread
  // reconstructs a real Dataset from them (see useMerge.js).
  const result = merged ? { columns: merged.columns, rows: merged.rows, warnings: merged.warnings } : null;
  self.postMessage({ id, type, result });
};
