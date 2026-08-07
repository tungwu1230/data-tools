export default function StepPreview({ merged, exporting, exportCsv, outputCols }) {
  if (!merged) return <div className="empty">尚未計算合併結果。</div>;
  return (
    <div>
      <div className="stat-strip">
        <div className="stat"><div className="n">{merged.total}</div><div className="l">輸出列數</div></div>
        <div className="stat"><div className="n">{outputCols.length}</div><div className="l">輸出欄數</div></div>
      </div>
      {merged.warnings.length > 0 && (
        <div className="warn">{merged.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}</div>
      )}
      <div className="final-preview-wrap">
        <table className="final-preview">
          <thead><tr>{outputCols.map((oc) => <th key={oc.id}>{oc.outputName || oc.column}</th>)}</tr></thead>
          <tbody>
            {merged.rows.slice(0, 100).map((r, i) => (
              <tr key={i}>{outputCols.map((oc) => <td key={oc.id}>{String(r[oc.outputName || oc.column] ?? "")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {merged.total > 100 && <div style={{ fontSize: 11, color: "var(--text-faint)", margin: "8px 0" }}>僅預覽前 100 列，匯出檔案會包含全部 {merged.total} 列。</div>}
      <div style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={exportCsv} disabled={exporting || merged.total === 0}>{exporting ? "匯出中…" : "匯出 CSV"}</button>
      </div>
    </div>
  );
}
