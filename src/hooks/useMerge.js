import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { datasetFromWorkerPayload } from "../utils/dataset.js";

// computes the final merged rows on entering step 3, and drives the CSV export.
// The actual computeMerge call runs in a Web Worker, dispatched through the
// `request` function from useSharedWorker (shared with useDataQuality) so
// large merges don't block the main thread; `mergePending` lets Step 3 → 4
// show a loading state instead of appearing to hang.
export function useMerge(request, step, baseFile, others, outputCols, joinConfig, joinType = "left") {
  const [merged, setMerged] = useState(null);
  const [mergePending, setMergePending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (step < 4) return;

    const requestId = ++requestIdRef.current;
    setMergePending(true);
    setMerged(null);

    request("merge", { baseFile, others, outputCols, joinConfig, joinType })
      .then((result) => {
        if (requestId !== requestIdRef.current) return; // superseded by a newer request
        setMerged(result ? datasetFromWorkerPayload(result) : null);
        setMergePending(false);
      })
      .catch((err) => {
        // without this, a thrown computeMerge (e.g. from unexpected input) leaves
        // mergePending stuck true forever, since no response would ever arrive
        if (requestId !== requestIdRef.current) return;
        console.error("合併資料時發生錯誤：", err.message);
        setMergePending(false);
      });
    // eslint-disable-next-line
  }, [step, baseFile, others, outputCols, JSON.stringify(joinConfig), joinType]);

  const exportCsv = () => {
    if (!merged || merged.rows.length === 0) return;
    setExporting(true);
    try {
      // Dataset.toMatrix() yields [labels, ...rows]; Papa turns the array-of-arrays into CSV.
      const csv = Papa.unparse(merged.toMatrix());
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return { merged, mergePending, exporting, exportCsv };
}
