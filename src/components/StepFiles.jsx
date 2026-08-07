import { highlightMatch } from "../utils/highlightMatch.jsx";
import {
  ChevronRight,
  ChevronDown,
  GitMerge,
  ArrowRight,
  Upload,
  Trash2,
  BookmarkPlus,
  Eye,
  EyeOff,
  FileSpreadsheet
} from "lucide-react";

export default function StepFiles(props) {
  const {
    files, loadingFiles, fileInputRef, handleUpload, removeFile,
    collapsed, setCollapsed, previewOpen, setPreviewOpen,
    selections, toggleColumn, visibleHeaders, filterMode, updateFilter, clearFilter,
    selectAllVisible, clearVisible, collections, openCreateFromFile,
    baseFileId, setBaseFileId, others, joinConfig, setJoinConfig,
  } = props;

  return (
    <div>
      <div className="dropzone">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
            <FileSpreadsheet size={16} color="var(--accent)" />
            <span>上傳 CSV 檔案</span>
          </div>
          <div className="dropzone-text">可一次選取多份檔案；每份檔案獨立顯示欄位與資料預覽。</div>
        </div>
        <label className="btn primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Upload size={14} />
          <span>{loadingFiles ? "讀取中…" : "選擇檔案"}</span>
          <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleUpload} />
        </label>
      </div>

      {files.length === 0 && (
        <div className="empty"><b>還沒有上傳任何檔案。</b><br />上傳兩份以上的 CSV，即可開始挑選要合併的欄位。</div>
      )}

      {files.length > 1 && (
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
      )}

      {files.map((file) => {
        const isCollapsed = collapsed[file.id];
        const isOpen = previewOpen[file.id];
        const sel = selections[file.id] || new Set();
        const vis = visibleHeaders(file);
        const fm = filterMode[file.id] || { mode: "text", text: "" };
        const appliedCollection = fm.mode === "collection" ? collections.find((c) => c.id === fm.collectionId) : null;
        return (
          <div className={`file-card ${file.id === baseFileId ? "is-base" : ""}`} key={file.id}>
            <div className="file-card-head" onClick={() => setCollapsed((p) => ({ ...p, [file.id]: !p[file.id] }))}>
              <span className="chev">
                {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
              </span>
              <span className="file-name">{file.name}</span>
              <span className="file-meta">{file.rowCount} 列 · {file.headers.length} 欄</span>
              {file.id === baseFileId && files.length > 1 && <span className="badge">主檔案</span>}
              {sel.size > 0 && <span className="sel-count">已選 {sel.size}</span>}
              <span style={{ flex: 1 }} />
              <button
                className="btn ghost xs"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
              >
                <Trash2 size={12} />
                <span>移除</span>
              </button>
            </div>

            {!isCollapsed && (
              <div className="file-card-body">
                <button
                  className="preview-toggle"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                  onClick={() => setPreviewOpen((p) => ({ ...p, [file.id]: !p[file.id] }))}
                >
                  {isOpen ? (
                    <>
                      <EyeOff size={13} />
                      <span>隱藏資料預覽</span>
                    </>
                  ) : (
                    <>
                      <Eye size={13} />
                      <span>檢視資料預覽（前 8 列）</span>
                    </>
                  )}
                </button>
                {isOpen && (
                  <div className="preview-wrap">
                    <table className="preview-table">
                      <thead><tr>{file.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {file.rows.slice(0, 8).map((r, i) => (
                          <tr key={i}>{file.headers.map((h) => <td key={h}>{String(r[h] ?? "")}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="filter-row">
                  <input
                    className="search-input" placeholder="輸入欄位開頭篩選，或輸入 $集合名稱$ 套用集合並全選"
                    value={fm.text || ""}
                    onChange={(e) => updateFilter(file.id, e.target.value)}
                  />
                  <button className="btn xs" onClick={() => selectAllVisible(file)}>全選目前顯示</button>
                  <button className="btn ghost xs" onClick={() => clearVisible(file)}>取消勾選目前顯示</button>
                  <button
                    className="btn ghost xs"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                    onClick={() => openCreateFromFile(file, sel)}
                  >
                    <BookmarkPlus size={12} />
                    <span>存成集合</span>
                  </button>
                </div>
                {appliedCollection && (
                  <div className="applied-set">
                    已套用集合「{appliedCollection.name}」，符合的欄位已全選
                    <button onClick={() => clearFilter(file.id)}>清除</button>
                  </div>
                )}

                <div className="col-list">
                  {vis.length === 0 && <div className="no-match">沒有符合的欄位。</div>}
                  {vis.map((h) => (
                    <label className={`col-item ${sel.has(h) ? "checked" : ""}`} key={h}>
                      <input type="checkbox" checked={sel.has(h)} onChange={() => toggleColumn(file.id, h)} />
                      {highlightMatch(h, fm)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
