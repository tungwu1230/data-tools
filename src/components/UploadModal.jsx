import { useState } from "react";
import { Upload, X, FileSpreadsheet } from "lucide-react";

export default function UploadModal(props) {
  const { isOpen, onClose, fileInputRef, handleUpload, loadingFiles } = props;
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleUpload({ target: { files: e.dataTransfer.files } });
      onClose();
    }
  };

  const handleFileInputChange = (e) => {
    handleUpload(e);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 520, width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <FileSpreadsheet size={18} color="var(--accent)" />
            <span>新增 CSV 試算表</span>
          </div>
          <button
            className="btn ghost xs"
            style={{ padding: "4px 6px", border: "none", color: "var(--text-faint)" }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
            borderRadius: 12,
            padding: "36px 20px",
            textAlign: "center",
            background: isDragging ? "var(--accent-dim)" : "var(--surface-alt)",
            transition: "all .15s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            cursor: "pointer"
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: isDragging ? "var(--surface)" : "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <Upload size={24} />
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              {isDragging ? "放開以開始上傳 CSV" : "拖拉 CSV 檔案至此處，或點擊選擇檔案"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              支援上傳單份或多份 .csv 檔案
            </div>
          </div>

          <label
            className="btn primary"
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Upload size={14} />
            <span>{loadingFiles ? "讀取中…" : "選擇電腦中的檔案"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
