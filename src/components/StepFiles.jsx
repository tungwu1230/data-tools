import { highlightMatch } from "../utils/highlightMatch.jsx";

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
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>上傳 CSV 檔案</div>
          <div className="dropzone-text">可一次選取多份檔案；每份檔案獨立顯示欄位與資料預覽。</div>
        </div>
        <label className="btn primary" style={{ cursor: "pointer" }}>
          {loadingFiles ? "讀取中…" : "選擇檔案"}
          <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleUpload} />
        </label>
      </div>

      {files.length === 0 && (
        <div className="empty"><b>還沒有上傳任何檔案。</b><br />上傳兩份以上的 CSV，即可開始挑選要合併的欄位。</div>
      )}

      {files.length > 1 && (
        <div className="merge-panel">
          <h4>合併設定</h4>
          <p>選一份「主檔案」作為合併基準，其餘檔案透過指定的比對欄位（key）合併進來，等同於以主檔案為主的左合併（left join）。</p>
          <div className="merge-row">
            <label>主檔案</label>
            <select value={baseFileId || ""} onChange={(e) => setBaseFileId(e.target.value)}>
              {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          {others.map((f) => {
            const base = files.find((x) => x.id === baseFileId);
            const cfg = joinConfig[f.id] || {};
            return (
              <div className="merge-row" key={f.id}>
                <label style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{f.name}</label>
                <select value={cfg.theirKey || ""} onChange={(e) => setJoinConfig((p) => ({ ...p, [f.id]: { ...cfg, theirKey: e.target.value } }))}>
                  <option value="">此檔案的比對欄位…</option>
                  {f.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{ color: "var(--text-faint)", fontSize: 11 }}>對應主檔案的</span>
                <select value={cfg.baseKey || ""} onChange={(e) => setJoinConfig((p) => ({ ...p, [f.id]: { ...cfg, baseKey: e.target.value } }))}>
                  <option value="">主檔案的比對欄位…</option>
                  {base?.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            );
          })}
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
              <span className="chev">{isCollapsed ? "▸" : "▾"}</span>
              <span className="file-name">{file.name}</span>
              <span className="file-meta">{file.rowCount} 列 · {file.headers.length} 欄</span>
              {file.id === baseFileId && files.length > 1 && <span className="badge">主檔案</span>}
              {sel.size > 0 && <span className="sel-count">已選 {sel.size}</span>}
              <span style={{ flex: 1 }} />
              <button className="btn ghost xs" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}>移除</button>
            </div>

            {!isCollapsed && (
              <div className="file-card-body">
                <button className="preview-toggle" onClick={() => setPreviewOpen((p) => ({ ...p, [file.id]: !p[file.id] }))}>
                  {isOpen ? "隱藏資料預覽 ▾" : "檢視資料預覽（前 8 列）▸"}
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
                  <button className="btn ghost xs" onClick={() => openCreateFromFile(file, sel)}>存成集合</button>
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
