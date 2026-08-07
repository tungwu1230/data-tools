// Dataset — the single seam between the merge engine and its consumers
// (preview, CSV export, TSV copy, data-quality report).
//
// It owns the merged-row schema: an ordered list of output columns and the
// merged rows keyed by *column id* (not by display label). Keying by id means
// two output columns may share a display label without overwriting each other's
// data — see CONTEXT.md.

// Resolve the selection-domain output columns into dataset columns.
// This is the one place that knows the display label = `outputName || column`.
export function columnsFromOutputCols(outputCols) {
  return outputCols.map((oc) => ({
    id: oc.id,
    label: oc.outputName || oc.column,
    fileId: oc.fileId,
    fileName: oc.fileName,
    originalColumn: oc.column,
  }));
}

function duplicateLabelWarnings(columns) {
  const counts = new Map();
  for (const c of columns) counts.set(c.label, (counts.get(c.label) || 0) + 1);
  const dups = [...counts.entries()].filter(([, n]) => n > 1).map(([l]) => l);
  return dups.map(
    (l) => `輸出欄位名稱「${l}」重複，匯出時會出現多個同名欄位（資料不會遺失）。`
  );
}

export class Dataset {
  // columns: [{ id, label, fileId, fileName, originalColumn }]  (ordered)
  // rows:    [{ [columnId]: value }]
  // warnings: operational warnings from the merge (e.g. duplicate join keys)
  constructor({ columns, rows, warnings = [] }) {
    this.columns = columns;
    this.rows = rows;
    this.total = rows.length;
    this.warnings = [...warnings, ...duplicateLabelWarnings(columns)];
  }

  // read one cell; treats missing/undefined as empty string, like the old code
  cell(row, columnId) {
    return row ? row[columnId] ?? "" : "";
  }

  // ordered matrix: first row is the labels, then one array per data row.
  // Both CSV export (Papa.unparse) and TSV copy consume this; Papa stays at the
  // edge and only this method knows the column order.
  toMatrix() {
    const header = this.columns.map((c) => c.label);
    const body = this.rows.map((r) => this.columns.map((c) => r[c.id] ?? ""));
    return [header, ...body];
  }
}
