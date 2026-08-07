import { GitMerge, ArrowRight, CheckCircle2 } from "lucide-react";

export default function StepMergeConfig(props) {
  const { files, baseFileId, setBaseFileId, others, joinConfig, setJoinConfig } = props;

  if (files.length <= 1) {
    const singleFile = files[0];
    return (
      <div className="merge-panel" style={{ textAlign: "center", padding: "36px 24px" }}>
        <div style={{ display: "inline-flex", padding: 10, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", marginBottom: 12 }}>
          <CheckCircle2 size={24} />
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>單一檔案模式</h4>
        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>
          目前僅上傳了 {singleFile ? `「${singleFile.name}」` : "1 份檔案"}，不需要進行多檔關聯比對。請直接點擊右下角「下一步」繼續設定輸出欄位。
        </p>
      </div>
    );
  }

  return (
    <div className="merge-panel">
      <div className="merge-panel-head">
        <div className="merge-panel-title-row">
          <GitMerge className="merge-icon" size={18} />
          <h4>合併設定 (Left Join)</h4>
        </div>
        <p>選一份「主檔案」作為合併基準，其餘檔案透過指定的比對欄位（Key）將資料合併進來。</p>
      </div>

      <div className="merge-section base-file-section">
        <div className="merge-field-group">
          <label className="merge-label">
            <span className="badge amber">主檔案</span>
            <span>基準檔案：</span>
          </label>
          <div className="merge-select-wrap">
            <select
              className="merge-select base-select"
              value={baseFileId || ""}
              onChange={(e) => setBaseFileId(e.target.value)}
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.rowCount} 列 · {f.headers.length} 欄)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <div className="merge-section join-files-section">
          <div className="merge-section-subtitle">
            副檔案比對欄位設定
          </div>
          <div className="join-cards-list">
            {others.map((f) => {
              const base = files.find((x) => x.id === baseFileId);
              const cfg = joinConfig[f.id] || {};
              return (
                <div className="join-file-card" key={f.id}>
                  <div className="join-file-header">
                    <span className="join-file-tag">副檔案</span>
                    <span className="join-file-name" title={f.name}>{f.name}</span>
                    <span className="join-file-meta">{f.rowCount} 列</span>
                  </div>
                  <div className="join-mapping-row">
                    <div className="mapping-col">
                      <label className="mapping-label">此檔案的比對欄位</label>
                      <select
                        className="merge-select"
                        value={cfg.theirKey || ""}
                        onChange={(e) =>
                          setJoinConfig((p) => ({
                            ...p,
                            [f.id]: { ...cfg, theirKey: e.target.value },
                          }))
                        }
                      >
                        <option value="">選擇此檔案的欄位…</option>
                        {f.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mapping-connector">
                      <ArrowRight className="connector-arrow" size={16} />
                      <span className="connector-text">對應主檔案</span>
                    </div>

                    <div className="mapping-col">
                      <label className="mapping-label" title={`主檔案 (${base?.name || ""}) 的比對欄位`}>
                        主檔案 ({base?.name || "主檔案"}) 的比對欄位
                      </label>
                      <select
                        className="merge-select"
                        value={cfg.baseKey || ""}
                        onChange={(e) =>
                          setJoinConfig((p) => ({
                            ...p,
                            [f.id]: { ...cfg, baseKey: e.target.value },
                          }))
                        }
                      >
                        <option value="">選擇主檔案的欄位…</option>
                        {base?.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
