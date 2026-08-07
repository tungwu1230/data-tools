import { GitMerge, ArrowRight, CheckCircle2, Columns, Key, AlertCircle, Layers } from "lucide-react";

export default function StepMergeConfig(props) {
  const { files, baseFileId, setBaseFileId, others, joinConfig, setJoinConfig, selections = {}, outputCols = [] } = props;

  const getSelectedCols = (file) => {
    if (!file) return [];
    const sel = selections[file.id] || new Set();
    return file.headers.filter((h) => sel.has(h));
  };

  if (files.length <= 1) {
    const singleFile = files[0];
    const selCols = getSelectedCols(singleFile);
    return (
      <div className="merge-panel" style={{ padding: "28px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", padding: 10, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", marginBottom: 12 }}>
            <CheckCircle2 size={24} />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>單一檔案模式</h4>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>
            目前僅上傳了 {singleFile ? `「${singleFile.name}」` : "1 份檔案"}，不需要進行多檔關聯比對。請直接點擊右下角「下一步」繼續設定輸出欄位。
          </p>
        </div>

        {singleFile && (
          <div className="selected-cols-section">
            <div className="selected-cols-header">
              <Columns size={14} className="selected-cols-icon" />
              <span className="selected-cols-title">已選取的欄位清單</span>
              <span className="selected-cols-count">
                已選 {selCols.length} / 共 {singleFile.headers.length} 欄
              </span>
            </div>
            {selCols.length > 0 ? (
              <div className="selected-cols-pills-wrap">
                {selCols.map((col) => (
                  <span className="col-pill" key={col}>
                    {col}
                  </span>
                ))}
              </div>
            ) : (
              <div className="no-cols-warn">
                <AlertCircle size={14} />
                <span>目前尚未選擇任何欄位，請回上一步「檔案與欄位」進行勾選。</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const baseFile = files.find((x) => x.id === baseFileId);
  const baseSelCols = getSelectedCols(baseFile);
  const baseJoinKeys = new Set(
    others.map((f) => joinConfig[f.id]?.baseKey).filter(Boolean)
  );

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

        {/* Selected columns for Base File */}
        <div className="selected-cols-section">
          <div className="selected-cols-header">
            <Columns size={14} className="selected-cols-icon" />
            <span className="selected-cols-title">主檔案已選取的欄位清單</span>
            <span className="selected-cols-count">
              已選 {baseSelCols.length} / 共 {baseFile?.headers.length || 0} 欄
            </span>
          </div>
          {baseSelCols.length > 0 ? (
            <div className="selected-cols-pills-wrap">
              {baseSelCols.map((col) => {
                const isJoinKey = baseJoinKeys.has(col);
                return (
                  <span className={`col-pill ${isJoinKey ? "is-key" : ""}`} key={col}>
                    {isJoinKey && <Key size={11} className="key-icon" title="比對 Key 欄位" />}
                    <span>{col}</span>
                    {isJoinKey && <span className="key-tag">Key</span>}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="no-cols-warn">
              <AlertCircle size={14} />
              <span>主檔案尚未選取任何欄位，請在 Step 1 進行勾選。</span>
            </div>
          )}
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
              const fSelCols = getSelectedCols(f);
              const theirKey = cfg.theirKey;
              const isKeySelected = theirKey ? fSelCols.includes(theirKey) : false;

              return (
                <div className="join-file-card" key={f.id}>
                  <div className="join-file-header">
                    <span className="join-file-tag">副檔案</span>
                    <span className="join-file-name" title={f.name}>{f.name}</span>
                    <span className="join-file-meta">{f.rowCount} 列 · 已選 {fSelCols.length} 欄</span>
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
                            {h} {fSelCols.includes(h) ? "(已選取)" : ""}
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
                            {h} {baseSelCols.includes(h) ? "(已選取)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Columns for this Secondary File */}
                  <div className="selected-cols-section">
                    <div className="selected-cols-header">
                      <Columns size={14} className="selected-cols-icon" />
                      <span className="selected-cols-title">副檔案已選取的欄位清單</span>
                      <span className="selected-cols-count">
                        已選 {fSelCols.length} / 共 {f.headers.length} 欄
                      </span>
                    </div>
                    {fSelCols.length > 0 ? (
                      <div className="selected-cols-pills-wrap">
                        {fSelCols.map((col) => {
                          const isJoinKey = col === theirKey;
                          return (
                            <span className={`col-pill ${isJoinKey ? "is-key" : ""}`} key={col}>
                              {isJoinKey && <Key size={11} className="key-icon" title="比對 Key 欄位" />}
                              <span>{col}</span>
                              {isJoinKey && <span className="key-tag">Key</span>}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-cols-warn">
                        <AlertCircle size={14} />
                        <span>此副檔案尚未選取任何欄位，合併後將不會輸出此檔案的欄位資料。</span>
                      </div>
                    )}
                    {theirKey && !isKeySelected && (
                      <div className="key-not-selected-note">
                        <AlertCircle size={12} style={{ flexShrink: 0 }} />
                        <span>比對欄位「{theirKey}」未在 Step 1 勾選為輸出欄位（僅用於資料關聯比對，不會包含於輸出結果中）。</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Output Columns Summary */}
      <div className="all-output-summary-section">
        <div className="summary-header">
          <div className="summary-title">
            <Layers size={16} color="var(--accent)" />
            <span>預計合併輸出欄位總覽</span>
          </div>
          <span className="badge amber" style={{ borderRadius: 12 }}>
            總計 {outputCols.length} 個欄位
          </span>
        </div>
        {outputCols.length > 0 ? (
          <div className="summary-files-group">
            {files.map((file) => {
              const colsForFile = outputCols.filter((c) => c.fileId === file.id);
              if (colsForFile.length === 0) return null;
              const isBase = file.id === baseFileId;
              return (
                <div key={file.id} className="summary-file-block">
                  <div className="summary-file-label">
                    <span className={`file-role-badge ${isBase ? "base" : "other"}`}>
                      {isBase ? "主檔案" : "副檔案"}
                    </span>
                    <span className="summary-file-name">{file.name}</span>
                    <span className="summary-file-count">({colsForFile.length} 欄)</span>
                  </div>
                  <div className="selected-cols-pills-wrap">
                    {colsForFile.map((oc) => {
                      const isBaseKey = isBase && baseJoinKeys.has(oc.column);
                      const isTheirKey = !isBase && joinConfig[file.id]?.theirKey === oc.column;
                      const isKey = isBaseKey || isTheirKey;
                      return (
                        <span className={`col-pill ${isKey ? "is-key" : ""}`} key={oc.id}>
                          {isKey && <Key size={11} className="key-icon" />}
                          <span>{oc.outputName}</span>
                          {oc.outputName !== oc.column && <span className="orig-name">({oc.column})</span>}
                          {isKey && <span className="key-tag">Key</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-cols-warn">
            <AlertCircle size={14} />
            <span>尚未選擇任何輸出欄位</span>
          </div>
        )}
      </div>
    </div>
  );
}

