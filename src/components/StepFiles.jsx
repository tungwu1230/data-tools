import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import {
  Upload,
  Trash2,
  FileSpreadsheet,
  Check,
  Star
} from "lucide-react";

function getColLetter(index) {
  let letter = "";
  let i = index;
  while (i >= 0) {
    letter = String.fromCharCode((i % 26) + 65) + letter;
    i = Math.floor(i / 26) - 1;
  }
  return letter;
}

export default function StepFiles(props) {
  const {
    files, loadingFiles, fileInputRef, handleUpload, removeFile,
    selections, toggleColumn,
    baseFileId, setBaseFileId,
    activeFileId, setActiveFileId,
  } = props;

  const [fileToDelete, setFileToDelete] = useState(null);

  // Sync activeFileId when files change
  useEffect(() => {
    if (files.length > 0) {
      if (!activeFileId || !files.some((f) => f.id === activeFileId)) {
        setActiveFileId(baseFileId && files.some((f) => f.id === baseFileId) ? baseFileId : files[0].id);
      }
    }
  }, [files, baseFileId, activeFileId, setActiveFileId]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleConfirmRemove = () => {
    if (fileToDelete) {
      removeFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  if (files.length === 0) {
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

        <div className="dropzone" style={{ flexDirection: "column", padding: "48px 24px", textAlign: "center", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <FileSpreadsheet size={28} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
              上傳 CSV 檔案
            </div>
            <div className="dropzone-text" style={{ fontSize: 13, maxWidth: 420, margin: "0 auto" }}>
              可一次選取多份 CSV 檔案。主要畫面將以試算表 (Sheet) 形式直觀瀏覽資料，並可於右側側邊欄快選欄位。
            </div>
          </div>
          <label className="btn primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px", fontSize: 13 }}>
            <Upload size={16} />
            <span>{loadingFiles ? "讀取中…" : "選擇 CSV 檔案"}</span>
            <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleUpload} />
          </label>
        </div>
      </div>
    );
  }

  const activeSel = activeFile ? (selections[activeFile.id] || new Set()) : new Set();

  return (
    <div className="step-files-container">
      <ConfirmModal
        isOpen={!!fileToDelete}
        title="確定要移除此檔案？"
        message={fileToDelete ? `移除「${fileToDelete.name}」後，其已選取的欄位與設定將會一併清除。` : ""}
        confirmText="確定移除"
        cancelText="取消"
        onConfirm={handleConfirmRemove}
        onCancel={() => setFileToDelete(null)}
      />

      {/* Top action bar with Add files & Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {/* Tabs for files */}
        <div className="file-tabs-bar" style={{ flex: 1, minWidth: 0 }}>
          {files.map((file) => {
            const isSelected = file.id === activeFileId;
            const selCount = (selections[file.id] || new Set()).size;
            const isBase = file.id === baseFileId;
            return (
              <div
                key={file.id}
                className={`file-tab ${isSelected ? "active" : ""}`}
                onClick={() => setActiveFileId(file.id)}
              >
                <FileSpreadsheet size={14} color={isSelected ? "var(--accent)" : "var(--text-faint)"} />
                <span className="file-tab-title">{file.name}</span>
                {isBase && files.length > 1 && (
                  <span className="badge" style={{ fontSize: 9, padding: "1px 5px" }}>主檔</span>
                )}
                <span className="sel-count" style={{ fontSize: 9.5, padding: "1px 6px" }}>
                  {selCount > 0 ? `已選 ${selCount}` : `${file.headers.length} 欄`}
                </span>
                <button
                  className="btn ghost xs"
                  style={{ padding: "1px 3px", border: "none", color: "var(--text-faint)", marginLeft: 2 }}
                  title="移除檔案"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileToDelete(file);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload more button */}
        <label className="btn ghost xs" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, shrink: 0 }}>
          <Upload size={13} />
          <span>{loadingFiles ? "讀取中…" : "+ 新增 CSV"}</span>
          <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleUpload} />
        </label>
      </div>

      {/* Main Sheet View */}
      {activeFile && (
        <div className="sheet-main-view">
          <div className="sheet-card">
            <div className="sheet-card-head">
              <div className="sheet-info">
                <span style={{ fontWeight: 700, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13 }}>
                  {activeFile.name}
                </span>
                <span>·</span>
                <span>{activeFile.rowCount} 列</span>
                <span>·</span>
                <span>共 {activeFile.headers.length} 欄</span>
                <span>·</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  已勾選 {activeSel.size} 欄 (提示：點擊欄位表頭可快速勾選)
                </span>
              </div>

              {files.length > 1 && (
                <div>
                  {activeFile.id === baseFileId ? (
                    <span className="badge">當前為合併主檔案</span>
                  ) : (
                    <button
                      className="btn xs ghost"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      onClick={() => setBaseFileId(activeFile.id)}
                    >
                      <Star size={12} />
                      <span>設為主檔案</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sheet Table View */}
            <div className="sheet-table-wrap" style={{ maxHeight: "calc(100vh - 240px)" }}>
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th className="sheet-row-num-header">#</th>
                    {activeFile.headers.map((h, index) => {
                      const isChecked = activeSel.has(h);
                      return (
                        <th
                          key={h}
                          className={`sheet-col-header ${isChecked ? "is-selected" : ""}`}
                          onClick={() => toggleColumn(activeFile.id, h)}
                          title={`點擊${isChecked ? "取消" : "勾選"}欄位「${h}」`}
                        >
                          <span className="sheet-col-letter">{getColLetter(index)}</span>
                          <div className="sheet-col-header-content">
                            <span className="sheet-col-name">{h}</span>
                            {isChecked && (
                              <span className="sheet-col-badge">
                                <Check size={10} />
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeFile.rows.slice(0, 50).map((row, rIdx) => (
                    <tr key={rIdx} className="sheet-row">
                      <td className="sheet-row-num">{rIdx + 1}</td>
                      {activeFile.headers.map((h) => {
                        const isChecked = activeSel.has(h);
                        return (
                          <td key={h} className={`sheet-cell ${isChecked ? "is-selected" : ""}`}>
                            {String(row[h] ?? "")}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
