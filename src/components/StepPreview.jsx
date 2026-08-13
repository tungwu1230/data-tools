import { Download, AlertTriangle, BarChart2 } from "lucide-react";

export default function StepPreview({ merged, mergePending, exporting, exportCsv, goToStep5 }) {
  if (mergePending) return <div className="empty">正在合併資料，請稍候…</div>;
  if (!merged) return <div className="empty">尚未計算合併結果。</div>;
  return (
    <div>
      <div className="stat-strip">
        <div className="stat"><div className="n">{merged.total.toLocaleString()}</div><div className="l">輸出列數</div></div>
        <div className="stat"><div className="n">{merged.columns.length}</div><div className="l">輸出欄數</div></div>
      </div>

      {merged.warnings.length > 0 && (
        <div className="warn">
          {merged.warnings.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} color="var(--amber)" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="final-preview-wrap">
        <table className="final-preview">
          <thead>
            <tr>
              {merged.columns.map((c) => (
                <th key={c.id}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {merged.rows.slice(0, 100).map((r, i) => (
              <tr key={i}>
                {merged.columns.map((c) => (
                  <td key={c.id}>{String(r[c.id] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {merged.total > 100 && (
        <div style={{ fontSize: 11.5, color: "var(--text-faint)", margin: "8px 0" }}>
          僅預覽前 100 列，匯出檔案會包含全部 {merged.total.toLocaleString()} 列。
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          className="btn primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={exportCsv}
          disabled={exporting || merged.total === 0}
        >
          <Download size={15} />
          <span>{exporting ? "匯出中…" : "匯出 CSV"}</span>
        </button>

        {goToStep5 && (
          <button
            className="btn ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={goToStep5}
          >
            <BarChart2 size={15} color="var(--accent)" />
            <span>查看資料品質與統計報告</span>
          </button>
        )}
      </div>
    </div>
  );
}
