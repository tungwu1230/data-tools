import { useState, useEffect, useRef } from "react";

// Parallel in responsibility to useMerge: dispatches analyzeDataQuality to the
// shared Worker (via the `request` function from useSharedWorker) once the
// merged Dataset is available, so Step 5's report doesn't block the main
// thread on large datasets. `qualityPending` lets StepDataQuality show a
// loading state instead of appearing to hang.
export function useDataQuality(request, step, merged) {
  const [qualityData, setQualityData] = useState(null);
  const [qualityPending, setQualityPending] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // rows.length === 0 is a legitimate result (e.g. an inner join with no
    // matches) — analyzeDataQuality handles that gracefully, so only bail
    // out when there's genuinely nothing to analyze yet.
    if (step < 5 || !merged || !merged.rows) {
      requestIdRef.current++; // invalidate any in-flight request's response
      setQualityData(null);
      setQualityPending(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setQualityPending(true);

    request("quality", { columns: merged.columns, rows: merged.rows })
      .then((result) => {
        if (requestId !== requestIdRef.current) return; // superseded by a newer request
        setQualityData(result);
        setQualityPending(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        console.error("計算資料品質報告時發生錯誤：", err.message);
        setQualityPending(false);
      });
  }, [step, merged]);

  return { qualityData, qualityPending };
}
