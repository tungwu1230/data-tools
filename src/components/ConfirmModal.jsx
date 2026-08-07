import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, confirmText = "確定刪除", cancelText = "取消", onConfirm, onCancel, isDanger = true }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <AlertTriangle size={18} color={isDanger ? "var(--danger)" : "var(--amber)"} />
          <span>{title}</span>
        </div>
        {message && <div className="modal-desc">{message}</div>}
        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${isDanger ? "danger" : "primary"}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
