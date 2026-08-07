import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import UploadModal from "./UploadModal.jsx";
import {
  Upload,
  Trash2,
  FileSpreadsheet,
  Check,
  Star,
  Plus
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      <div style={{ padding: 24 }}>
        <ConfirmModal
          isOpen={!!fileToDelete}
          title="確定要移除此檔案？"
          message={fileToDelete ? `移除「${fileToDelete.name}」後，其已選取的欄位與設定將會一併清除。` : ""}
          confirmText="確定移除"
          cancelText="取消"
          onConfirm={handleConfirmRemove}
          onCancel={() => setFileToDelete(null)}
        />

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          fileInputRef={fileInputRef}
          handleUpload={handleUpload}
          loadingFiles={loadingFiles}
        />

        <div className="dropzone" style={{ flexDirection: "column", padding: "60px 24px", textAlign: "center", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <FileSpreadsheet size={32} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
              還沒有上傳任何 CSV 試算表
            </div>
            <div className="dropzone-text" style={{ fontSize: 13, maxWidth: 460, margin: "0 auto" }}>
              上傳一或多份 CSV 檔案，主要畫面將以完整試算表形式展示，並可於右側側邊欄進行欄位比對與勾選。
            </div>
          </div>
          <button
            className="btn primary"
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", fontSize: 13 }}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={16} />
            <span>選擇或拖拉上傳 CSV 檔案</span>
          </button>
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

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        fileInputRef={fileInputRef}
        handleUpload={handleUpload}
        loadingFiles={loadingFiles}
      />

      {/* Tabs bar for uploaded files + Add Spreadsheet Button */}
      <div className="file-tabs-bar">
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

        {/* Add Spreadsheet Button next to tabs */}
        <button
          className="add-tab-btn"
          onClick={() => setIsUploadModalOpen(true)}
          title="點擊開啟選擇檔案或拖拉上傳視窗"
        >
          <Plus size={13} />
          <span>新增試算表</span>
        </button>
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
            <div className="sheet-table-wrap">
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
                  {activeFile.rows.slice(0, 100).map((row, rIdx) => (
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
