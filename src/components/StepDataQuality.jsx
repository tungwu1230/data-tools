import { useState, useMemo } from "react";
import { Download, BarChart2, CheckCircle2, FileText, Search, Activity, Copy, Check } from "lucide-react";
import { analyzeDataQuality } from "../utils/quality.js";

export default function StepDataQuality({ merged, baseFile, files = [], exportCsv, exporting }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [copied, setCopied] = useState(false);

  const qualityData = useMemo(() => {
    if (!merged || !merged.rows) return null;
    return analyzeDataQuality(merged);
  }, [merged]);

  if (!merged || !qualityData) return <div className="empty">尚未計算合併結果。</div>;

  const filteredColStats = useMemo(() => {
    if (!qualityData.colStats) return [];
    if (!searchFilter.trim()) return qualityData.colStats;
    const term = searchFilter.trim().toLowerCase();
    return qualityData.colStats.filter(
      (cs) => cs.outputName.toLowerCase().includes(term) || cs.fileName.toLowerCase().includes(term)
    );
  }, [qualityData, searchFilter]);

  const copyToClipboard = () => {
    if (!merged || merged.rows.length === 0) return;
    // Dataset.toMatrix() → [labels, ...rows]; join as TSV for spreadsheet paste.
    const tsvStr = merged.toMatrix().map((row) => row.join("\t")).join("\n");

    navigator.clipboard.writeText(tsvStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="quality-tab-content">
      {/* Top Header / Actions Bar */}
      <div className="preview-toolbar" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2 size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>📊 資料品質與統計報告</span>
          <span className={`completeness-badge ${qualityData.overallCompleteness >= 90 ? "good" : "warn"}`}>
            {qualityData.overallCompleteness}% 完整度
          </span>
        </div>

        <div className="preview-action-buttons">
          <button
            className="btn ghost xs"
            onClick={copyToClipboard}
            title="複製全部資料為 TSV 格式（可直接貼至 Excel / Google Sheets）"
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            {copied ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copied ? "已複製至剪貼簿！" : "複製資料 (TSV)"}</span>
          </button>
          <button
            className="btn primary xs"
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            onClick={exportCsv}
            disabled={exporting || merged.total === 0}
          >
            <Download size={14} />
            <span>{exporting ? "匯出中…" : "匯出 CSV"}</span>
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="quality-overview-grid">
        <div className="quality-card">
          <div className="quality-card-head">
            <Activity size={16} className="card-icon" />
            <span className="card-title">全表資料完整度</span>
          </div>
          <div className="quality-card-val">{qualityData.overallCompleteness}%</div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${qualityData.overallCompleteness}%`,
                background: qualityData.overallCompleteness >= 90 ? "var(--accent)" : "var(--amber)",
              }}
            />
          </div>
          <div className="quality-card-sub">
            共 {qualityData.totalCells.toLocaleString()} 個儲存格 (非空值 {qualityData.totalFilledCells.toLocaleString()})
          </div>
        </div>

        <div className="quality-card">
          <div className="quality-card-head">
            <FileText size={16} className="card-icon" />
            <span className="card-title">合併資料規模</span>
          </div>
          <div className="quality-card-val">{qualityData.totalRows.toLocaleString()} 列</div>
          <div className="quality-card-sub">
            跨 {files.length} 個來源檔案 · 共 {qualityData.totalCols} 個輸出欄位
          </div>
        </div>

        <div className="quality-card">
          <div className="quality-card-head">
            <CheckCircle2 size={16} className="card-icon" />
            <span className="card-title">空白儲存格總數</span>
          </div>
          <div className="quality-card-val">
            {(qualityData.totalCells - qualityData.totalFilledCells).toLocaleString()}
          </div>
          <div className="quality-card-sub">
            空白儲存格佔總數的 {(100 - qualityData.overallCompleteness).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Per-Column Analysis Section */}
      <div className="column-analysis-panel">
        <div className="panel-header-row">
          <div className="panel-title">
            <BarChart2 size={16} color="var(--accent)" />
            <span>各欄位品質與統計明細 ({qualityData.colStats.length} 欄)</span>
          </div>

          <div className="panel-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="panel-search-input"
              placeholder="搜尋欄位或來源檔名…"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="quality-table-wrap">
          <table className="quality-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>欄位名稱</th>
                <th style={{ width: "16%" }}>來源檔案</th>
                <th style={{ width: "10%" }}>推導型態</th>
                <th style={{ width: "20%" }}>資料完整度</th>
                <th style={{ width: "12%" }}>非空值 / 空白</th>
                <th style={{ width: "10%" }}>不重複數</th>
                <th style={{ width: "20%" }}>特徵與摘要</th>
              </tr>
            </thead>
            <tbody>
              {filteredColStats.map((cs) => {
                const isBase = baseFile && cs.fileId === baseFile.id;
                return (
                  <tr key={cs.id}>
                    <td>
                      <div className="col-name-cell">
                        <span className="col-name">{cs.outputName}</span>
                        {cs.outputName !== cs.originalColumn && (
                          <span className="orig-col-name">原名: {cs.originalColumn}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`file-role-badge ${isBase ? "base" : "other"}`}>
                        {isBase ? "主檔" : "副檔"}
                      </span>
                      <span className="file-name-text" title={cs.fileName}>{cs.fileName}</span>
                    </td>
                    <td>
                      <span className={`type-badge ${cs.inferredType}`}>
                        {cs.inferredType === "number" ? "數字" : cs.inferredType === "date" ? "日期" : cs.inferredType === "boolean" ? "布林" : "文字"}
                      </span>
                    </td>
                    <td>
                      <div className="completeness-cell">
                        <div className="mini-progress-bg">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${cs.completenessPct}%`,
                              background: cs.completenessPct >= 90 ? "#22c55e" : cs.completenessPct >= 50 ? "#eab308" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="pct-text">{cs.completenessPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="count-text">
                        {cs.filledCount.toLocaleString()} / <span className="empty-text">{cs.emptyCount.toLocaleString()}</span>
                      </span>
                    </td>
                    <td>
                      <span className="mono-text">{cs.uniqueCount.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="summary-cell">
                        {cs.inferredType === "number" && cs.summary.min !== undefined ? (
                          <span className="num-summary">
                            {cs.summary.min} ~ {cs.summary.max} (均: {cs.summary.avg})
                          </span>
                        ) : cs.summary.topValues && cs.summary.topValues.length > 0 ? (
                          <div className="top-vals-list">
                            {cs.summary.topValues.map((tv, idx) => (
                              <span className="top-val-pill" key={idx} title={`出現 ${tv.count} 次 (${tv.pct}%)`}>
                                {tv.value || "(空)"} <span className="val-pct">{tv.pct}%</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="faint-text">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
