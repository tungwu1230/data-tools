import { useState } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { highlightMatch } from "../utils/highlightMatch.jsx";
import {
  ChevronRight,
  ChevronDown,
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
    baseFileId,
  } = props;

  const [fileToDelete, setFileToDelete] = useState(null);

  const handleConfirmRemove = () => {
    if (fileToDelete) {
      removeFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!fileToDelete}
        title="確定要移除此檔案？"
        message={fileToDelete ? `移除「${fileToDelete.name}」後，其已選取的欄位與設定將會一併清除。` : ""}
        confirmText="確定移除"
        cancelText="取消"
        onConfirm={handleConfirmRemove}
        onCancel={() => setFileToDelete(null)}
      />

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
        <div className="empty"><b>還沒有上傳任何檔案。</b><br />上傳 CSV，即可開始挑選要合併的欄位。</div>
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
                onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
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
