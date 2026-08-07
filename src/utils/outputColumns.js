// Pure derivation of the output-column list from the selection (the single
// source of truth) plus two transient overlays the user controls in step 3:
//
//   orderPrefs   — colId[] the user has explicitly reordered. Stale-tolerant:
//                  ids for deselected columns are simply ignored, and a
//                  deselected-then-reselected column returns to its old place.
//   renameOverlay — { [colId]: label }. Absent entry ⇒ original column name.
//
// Keeping this a pure function makes it the test surface for the whole
// selection→output derivation (no React needed). useOutputColumns is a thin
// useMemo wrapper over it.
//
// The returned shape matches what consumers + the Dataset expect:
//   { id, fileId, fileName, column, outputName }
export function buildOutputCols(files, selections, orderPrefs = [], renameOverlay = {}) {
  // Pass 1: selected columns in "natural" order (file order, then header order).
  const natural = [];
  for (const f of files) {
    const sel = selections[f.id];
    if (!sel) continue;
    for (const col of f.headers) {
      if (sel.has(col)) {
        natural.push({ id: `${f.id}::${col}`, fileId: f.id, fileName: f.name, column: col });
      }
    }
  }

  const naturalById = new Map(natural.map((n) => [n.id, n]));
  const prefSet = new Set(orderPrefs);

  // Pass 2: resolve order. Explicitly reordered columns keep their place
  // (only those still selected); any newly selected columns append in natural
  // order. This is what makes reordering survive later selection changes.
  const orderedIds = [];
  const seen = new Set();
  for (const id of orderPrefs) {
    if (naturalById.has(id) && !seen.has(id)) {
      orderedIds.push(id);
      seen.add(id);
    }
  }
  for (const n of natural) {
    if (!seen.has(n.id)) {
      orderedIds.push(n.id);
      seen.add(n.id);
    }
  }

  // Pass 3: apply rename overlay.
  return orderedIds.map((id) => {
    const n = naturalById.get(id);
    return {
      id,
      fileId: n.fileId,
      fileName: n.fileName,
      column: n.column,
      outputName: Object.prototype.hasOwnProperty.call(renameOverlay, id) ? renameOverlay[id] : n.column,
    };
  });
}
