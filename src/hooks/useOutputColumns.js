import { useState, useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { buildOutputCols } from "../utils/outputColumns.js";

// useOutputColumns is a derived view: the output-column list comes straight
// from the selection (the single source of truth, owned by useColumnSelection).
// The only state here is what step 3 layers on top as transient overlays:
//   orderPrefs    — explicit column ordering (survives selection changes)
//   renameOverlay — user-chosen output names
// plus the step-3 bulk-action UI state (selectedOutIds, prefix/suffix).
export function useOutputColumns(files, selections) {
  const [orderPrefs, setOrderPrefs] = useState([]);
  const [renameOverlay, setRenameOverlay] = useState({});
  const [selectedOutIds, setSelectedOutIds] = useState(new Set());
  const [prefixVal, setPrefixVal] = useState("");
  const [suffixVal, setSuffixVal] = useState("");

  const outputCols = useMemo(
    () => buildOutputCols(files, selections, orderPrefs, renameOverlay),
    [files, selections, orderPrefs, renameOverlay]
  );

  // Hydrate orderPrefs to the current effective order, then move. After the
  // first reorder, orderPrefs holds the full list, so new selections append and
  // deselections are simply filtered out by buildOutputCols.
  const reorderOutputCols = (activeId, overId) => {
    setOrderPrefs((prev) => {
      const currentOrder = outputCols.map((oc) => oc.id);
      const oldIndex = currentOrder.indexOf(activeId);
      const newIndex = currentOrder.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
      return arrayMove(currentOrder, oldIndex, newIndex);
    });
  };

  const renameOutputCol = (id, name) =>
    setRenameOverlay((prev) => ({ ...prev, [id]: name }));

  const resetOutputName = (id) =>
    setRenameOverlay((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const resetSelectedOutputNames = () => {
    if (selectedOutIds.size === 0) { alert("請先勾選要還原名稱的欄位。"); return; }
    setRenameOverlay((prev) => {
      const next = { ...prev };
      selectedOutIds.forEach((id) => delete next[id]);
      return next;
    });
  };

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
    setRenameOverlay((prev) => {
      const next = { ...prev };
      outputCols.forEach((oc) => {
        if (selectedOutIds.has(oc.id)) {
          next[oc.id] = `${prefixVal}${oc.outputName}${suffixVal}`;
        }
      });
      return next;
    });
  };

  return {
    outputCols, selectedOutIds, prefixVal, setPrefixVal, suffixVal, setSuffixVal,
    toggleOutSelect, selectAllOut, clearOutSel, selectOutIds, deselectOutIds, applyPrefixSuffix,
    reorderOutputCols, renameOutputCol, resetOutputName, resetSelectedOutputNames,
  };
}
