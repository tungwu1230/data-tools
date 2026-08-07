import { useState, useEffect } from "react";
import Papa from "papaparse";
import { computeMerge } from "../utils/csv.js";

// computes the final merged rows on entering step 3, and drives the CSV export
export function useMerge(step, baseFile, others, outputCols, joinConfig, joinType = "left") {
  const [merged, setMerged] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (step === 4) setMerged(computeMerge(baseFile, others, outputCols, joinConfig, joinType));
    // eslint-disable-next-line
  }, [step, baseFile, others, outputCols, JSON.stringify(joinConfig), joinType]);

  const exportCsv = () => {
    if (!merged || merged.rows.length === 0) return;
    setExporting(true);
    try {
      const csv = Papa.unparse(merged.rows);
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

  return { merged, exporting, exportCsv };
}
