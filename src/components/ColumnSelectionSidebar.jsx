import { highlightMatch } from "../utils/highlightMatch.jsx";
import { useResizableSidebar } from "../hooks/useResizableSidebar.js";
import {
  CheckSquare,
  Square,
  BookmarkPlus,
  Search,
  FileSpreadsheet
} from "lucide-react";

export default function ColumnSelectionSidebar(props) {
  const {
    files,
    activeFileId,
    setActiveFileId,
    selections,
    toggleColumn,
    visibleHeaders,
    filterMode,
    updateFilter,
    clearFilter,
    selectAllVisible,
    clearVisible,
    collections,
    openCreateFromFile,
  } = props;

  const { width, isResizing, startResizing } = useResizableSidebar({
    initialWidth: 280,
    minWidth: 220,
    maxWidth: 600,
    direction: "right",
    storageKey: "wb_right_sidebar_width"
  });

  if (!files || files.length === 0) {
    return null;
  }

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const activeSel = activeFile ? (selections[activeFile.id] || new Set()) : new Set();
  const activeVis = activeFile ? visibleHeaders(activeFile) : [];
  const fm = activeFile ? (filterMode[activeFile.id] || { mode: "text", text: "" }) : { mode: "text", text: "" };
  const appliedCollection = fm.mode === "collection" ? collections.find((c) => c.id === fm.collectionId) : null;

  return (
    <div className="wb-sidebar-right" style={{ width: `${width}px`, position: "sticky" }}>
      {/* Resizable handle on the left edge of right sidebar */}
      <div
        className={`resize-handle left-edge ${isResizing ? "is-resizing" : ""}`}
        onMouseDown={startResizing}
        title="拖曳調整右側面板寬度"
      />

      <div className="sidebar-head">
        <h4>欄位選取與管理</h4>
        <span className="collection-count">
          已選 {activeSel.size} / {activeFile ? activeFile.headers.length : 0}
        </span>
      </div>

      {files.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            當前選取檔案
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={activeFile.id}
              onChange={(e) => setActiveFileId(e.target.value)}
              style={{ width: "100%", paddingLeft: 28 }}
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (已選 {(selections[f.id] || new Set()).size}/{f.headers.length})
                </option>
              ))}
            </select>
            <FileSpreadsheet size={13} style={{ position: "absolute", left: 9, top: 9, color: "var(--accent)" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: "var(--text-faint)" }} />
          <input
            className="search-input"
            style={{ paddingLeft: 28, width: "100%" }}
            placeholder="搜尋欄位，或 $集合名稱$"
            value={fm.text || ""}
            onChange={(e) => updateFilter(activeFile.id, e.target.value)}
          />
        </div>

        {appliedCollection && (
          <div className="applied-set">
            <span>套用集合「{appliedCollection.name}」</span>
            <button onClick={() => clearFilter(activeFile.id)}>清除</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn xs ghost"
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            onClick={() => selectAllVisible(activeFile)}
          >
            <CheckSquare size={11} />
            <span>全選目前</span>
          </button>
          <button
            className="btn xs ghost"
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            onClick={() => clearVisible(activeFile)}
          >
            <Square size={11} />
            <span>取消顯示</span>
          </button>
        </div>

        <button
          className="btn primary xs"
          style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
          onClick={() => openCreateFromFile(activeFile, activeSel)}
        >
          <BookmarkPlus size={12} />
          <span>將勾選欄位存成集合</span>
        </button>
      </div>

      <div className="sidebar-head" style={{ marginBottom: 8, marginTop: 4 }}>
        <h4 style={{ fontSize: 10.5 }}>欄位清單 ({activeVis.length})</h4>
      </div>

      <div className="col-list" style={{ gridTemplateColumns: "1fr", maxHeight: "calc(100vh - 320px)", flex: 1 }}>
        {activeVis.length === 0 && <div className="empty-mini">沒有符合條件的欄位。</div>}
        {activeVis.map((h) => {
          const isChecked = activeSel.has(h);
          return (
            <label className={`col-item ${isChecked ? "checked" : ""}`} key={h} style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleColumn(activeFile.id, h)}
                />
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {highlightMatch(h, fm)}
                </span>
              </div>
              <span className="col-item-badge">
                {isChecked ? "已選" : "未選"}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
