import { useState, useEffect, useMemo } from "react";

// derives the ordered output column list from selections, syncs on change while
// preserving any renames/reordering already made
export function useOutputColumns(files, selections) {
  const [outputCols, setOutputCols] = useState([]);
  const [selectedOutIds, setSelectedOutIds] = useState(new Set());
  const [prefixVal, setPrefixVal] = useState("");
  const [suffixVal, setSuffixVal] = useState("");

  const selectionSignature = useMemo(
    () => files.map((f) => f.id + ":" + [...(selections[f.id] || [])].sort().join(",")).join("|"),
    [files, selections]
  );

  useEffect(() => {
    setOutputCols((prev) => {
      const next = [];
      files.forEach((f) => {
        const sel = selections[f.id] || new Set();
        f.headers.forEach((col) => {
          if (sel.has(col)) {
            const existing = prev.find((oc) => oc.fileId === f.id && oc.column === col);
            next.push(existing || { id: `${f.id}::${col}`, fileId: f.id, fileName: f.name, column: col, outputName: col });
          }
        });
      });
      return next;
    });
    // eslint-disable-next-line
  }, [selectionSignature]);

  const moveOutputCol = (index, dir) => {
    setOutputCols((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };
  const renameOutputCol = (id, name) => setOutputCols((prev) => prev.map((oc) => (oc.id === id ? { ...oc, outputName: name } : oc)));
  const resetOutputName = (id) => setOutputCols((prev) => prev.map((oc) => (oc.id === id ? { ...oc, outputName: oc.column } : oc)));
  const resetSelectedOutputNames = () => {
    if (selectedOutIds.size === 0) { alert("請先勾選要還原名稱的欄位。"); return; }
    setOutputCols((prev) => prev.map((oc) => (selectedOutIds.has(oc.id) ? { ...oc, outputName: oc.column } : oc)));
  };
  const removeOutputCol = (id) => setOutputCols((prev) => prev.filter((o) => o.id !== id));

  const toggleOutSelect = (id) => setSelectedOutIds((prev) => {
    const set = new Set(prev);
    if (set.has(id)) set.delete(id); else set.add(id);
    return set;
  });
  const selectOutIds = (ids) => setSelectedOutIds((prev) => {
    const next = new Set(prev);
    ids.forEach((id) => next.add(id));
    return next;
  });
  const deselectOutIds = (ids) => setSelectedOutIds((prev) => {
    const next = new Set(prev);
    ids.forEach((id) => next.delete(id));
    return next;
  });
  const selectAllOut = () => setSelectedOutIds(new Set(outputCols.map((o) => o.id)));
  const clearOutSel = () => setSelectedOutIds(new Set());
  const applyPrefixSuffix = () => {
    if (selectedOutIds.size === 0) { alert("請先勾選要套用前後綴的欄位。"); return; }
    setOutputCols((prev) => prev.map((oc) => (selectedOutIds.has(oc.id) ? { ...oc, outputName: `${prefixVal}${oc.outputName}${suffixVal}` } : oc)));
  };

  return {
    outputCols, selectedOutIds, prefixVal, setPrefixVal, suffixVal, setSuffixVal,
    toggleOutSelect, selectAllOut, clearOutSel, selectOutIds, deselectOutIds, applyPrefixSuffix,
    moveOutputCol, renameOutputCol, resetOutputName, resetSelectedOutputNames, removeOutputCol,
  };
}
