import { useState, useCallback, memo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw, Filter, Bookmark, Search, X } from "lucide-react";
import { useVirtualScroll } from "../hooks/useVirtualScroll.js";

// row slot height for the virtualized table body below — keep in sync with
// `.out-table td` padding (7px top/bottom + ~28px tallest content + border)
const ROW_HEIGHT = 43;
const ROW_OVERSCAN = 8;

const SortableRow = memo(function SortableRow({ oc, isSelected, onToggleSelect, onRename, onResetName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "var(--surface-alt)" : undefined,
    zIndex: isDragging ? 2 : 1,
    position: "relative",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "is-dragging" : ""}>
      <td style={{ textAlign: "center" }}>
        <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(oc.id)} />
      </td>
      <td style={{ textAlign: "center" }}>
        <button
          className="drag-handle-btn"
          title="按住拖拉以調整欄位順序"
          {...attributes}
          {...listeners}
          type="button"
        >
          <GripVertical size={14} />
        </button>
      </td>
      <td className="out-src-file">{oc.fileName}</td>
      <td className="out-src-col">{oc.column}</td>
      <td>
        <input className="out-name-input" value={oc.outputName} onChange={(e) => onRename(oc.id, e.target.value)} />
      </td>
      <td style={{ textAlign: "center" }}>
        <button
          className="btn ghost xs"
          title="還原成原始欄位名稱"
          style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
          onClick={() => onResetName(oc.id)}
        >
          <RotateCcw size={11} />
          <span>還原</span>
        </button>
      </td>
    </tr>
  );
});

function StepOutput(props) {
  const {
    files, collections,
    outputCols, selectedOutIds, toggleOutSelect, selectAllOut, clearOutSel,
    selectOutIds, deselectOutIds,
    prefixVal, setPrefixVal, suffixVal, setSuffixVal, applyPrefixSuffix,
    reorderOutputCols, renameOutputCol, resetOutputName, resetSelectedOutputNames,
  } = props;

  const [fileFilter, setFileFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const displayCols = outputCols.filter((oc) => {
    if (fileFilter !== "all" && oc.fileId !== fileFilter) return false;
    if (collectionFilter !== "all") {
      const coll = collections?.find((c) => c.id === collectionFilter);
      if (coll && !coll.columns.includes(oc.column)) return false;
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const matchCol = oc.column.toLowerCase().includes(q);
      const matchFile = oc.fileName.toLowerCase().includes(q);
      const matchOut = oc.outputName.toLowerCase().includes(q);
      if (!matchCol && !matchFile && !matchOut) return false;
    }
    return true;
  });

  const isFiltered = fileFilter !== "all" || collectionFilter !== "all" || searchText.trim() !== "";
  const allDisplayedSelected = displayCols.length > 0 && displayCols.every((oc) => selectedOutIds.has(oc.id));
  const displayedSelectedCount = displayCols.filter((oc) => selectedOutIds.has(oc.id)).length;

  const handleHeaderCheckboxChange = (e) => {
    const ids = displayCols.map((oc) => oc.id);
    if (e.target.checked) {
      selectOutIds(ids);
    } else {
      deselectOutIds(ids);
    }
  };

  const resetFilters = () => {
    setFileFilter("all");
    setCollectionFilter("all");
    setSearchText("");
  };

  const handleDragStart = useCallback((event) => setActiveId(event.active.id), []);

  const handleDragEnd = useCallback((event) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderOutputCols(active.id, over.id);
    }
  }, [reorderOutputCols]);

  const handleDragCancel = useCallback(() => setActiveId(null), []);

  const activeCol = activeId ? outputCols.find((oc) => oc.id === activeId) : null;

  // Only mounted/visible rows get a useSortable instance — SortableContext
  // still gets the full id list so index/order math stays correct, but
  // `<tbody>` only renders the windowed slice plus two spacer rows sized to
  // account for the unmounted rows above/below. DndContext's built-in
  // autoScroll (scrolls the nearest scrollable ancestor, `.out-table-wrap`)
  // shifts this window as the user drags near the top/bottom edge; the
  // DragOverlay below keeps the dragged row visible even if its own
  // `SortableRow` unmounts mid-drag as the window moves.
  const { containerRef: rowsRef, onScroll: onRowsScroll, start: rowStart, end: rowEnd, offset: topSpacerHeight } = useVirtualScroll({
    count: displayCols.length,
    itemSize: ROW_HEIGHT,
    overscan: ROW_OVERSCAN,
    resetKey: `${fileFilter}|${collectionFilter}|${searchText}`,
  });
  const visibleCols = displayCols.slice(rowStart, rowEnd);
  const bottomSpacerHeight = Math.max(0, displayCols.length - rowEnd) * ROW_HEIGHT;

  return (
    <div>
      <div className="out-toolbar">
        <button className="btn xs" onClick={selectAllOut}>全選全部 ({outputCols.length})</button>
        <button className="btn ghost xs" onClick={clearOutSel}>清除全選</button>
        <button
          className="btn ghost xs"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          onClick={resetSelectedOutputNames}
          disabled={selectedOutIds.size === 0}
          title="將已勾選欄位還原為原始欄位名稱"
        >
          <RotateCcw size={12} />
          <span>還原已勾選欄位名稱</span>
        </button>
        <div className="divider" />
        <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>前綴</span>
        <input type="text" value={prefixVal} onChange={(e) => setPrefixVal(e.target.value)} placeholder="例如 a_" />
        <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>後綴</span>
        <input type="text" value={suffixVal} onChange={(e) => setSuffixVal(e.target.value)} placeholder="例如 _old" />
        <button className="btn primary xs" onClick={applyPrefixSuffix}>套用到已勾選欄位</button>
        <span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>
          已勾選 {selectedOutIds.size} / {outputCols.length}
        </span>
      </div>

      <div className="out-filter-bar">
        <div className="filter-item">
          <Filter size={13} color="var(--accent)" />
          <label>從來源過濾：</label>
          <select value={fileFilter} onChange={(e) => setFileFilter(e.target.value)}>
            <option value="all">全部來源檔案 ({files?.length || 0})</option>
            {files?.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <Bookmark size={13} color="var(--accent)" />
          <label>從集合過濾：</label>
          <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)}>
            <option value="all">全部集合 ({collections?.length || 0})</option>
            {collections?.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.columns.length} 欄)</option>
            ))}
          </select>
        </div>

        <div className="filter-item search-item" style={{ flex: 1, minWidth: 160 }}>
          <Search size={13} color="var(--text-faint)" />
          <input
            type="text"
            placeholder="搜尋來源 / 原始 / 輸出欄位…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {isFiltered && (
          <button className="btn ghost xs" onClick={resetFilters} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <X size={12} />
            <span>清除篩選</span>
          </button>
        )}

        <div style={{ display: "flex", gap: 8, width: "100%", paddingTop: 8, borderTop: "1px dashed var(--border-soft)", marginTop: 2, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
            顯示結果：共 {displayCols.length} 欄（已勾選 {displayedSelectedCount} 欄）
          </span>
          <span style={{ flex: 1 }} />
          <button className="btn xs" onClick={() => selectOutIds(displayCols.map((c) => c.id))} disabled={displayCols.length === 0}>
            勾選顯示的欄位
          </button>
          <button className="btn ghost xs" onClick={() => deselectOutIds(displayCols.map((c) => c.id))} disabled={displayCols.length === 0}>
            取消勾選顯示的欄位
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="out-table-wrap" ref={rowsRef} onScroll={onRowsScroll}>
          <table className="out-table">
            <thead>
              <tr>
                <th style={{ width: 32, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={allDisplayedSelected}
                    onChange={handleHeaderCheckboxChange}
                    disabled={displayCols.length === 0}
                  />
                </th>
                <th style={{ width: 50, textAlign: "center" }}>順序</th>
                <th style={{ width: "24%" }}>來源檔案</th>
                <th style={{ width: "24%" }}>原始欄位</th>
                <th>輸出欄位名稱</th>
                <th style={{ width: 70, textAlign: "center" }}>操作</th>
              </tr>
            </thead>
            <SortableContext items={displayCols.map((oc) => oc.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {topSpacerHeight > 0 && (
                  <tr aria-hidden="true" style={{ height: topSpacerHeight }}>
                    <td colSpan={6} style={{ padding: 0, border: "none" }} />
                  </tr>
                )}
                {visibleCols.map((oc) => (
                  <SortableRow
                    key={oc.id}
                    oc={oc}
                    isSelected={selectedOutIds.has(oc.id)}
                    onToggleSelect={toggleOutSelect}
                    onRename={renameOutputCol}
                    onResetName={resetOutputName}
                  />
                ))}
                {bottomSpacerHeight > 0 && (
                  <tr aria-hidden="true" style={{ height: bottomSpacerHeight }}>
                    <td colSpan={6} style={{ padding: 0, border: "none" }} />
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </table>
        </div>
        <DragOverlay>
          {activeCol ? (
            <table className="out-table out-drag-overlay-table">
              <tbody>
                <tr>
                  <td style={{ width: 32, textAlign: "center" }}>
                    <input type="checkbox" checked={selectedOutIds.has(activeCol.id)} readOnly />
                  </td>
                  <td style={{ width: 50, textAlign: "center" }}>
                    <GripVertical size={14} />
                  </td>
                  <td className="out-src-file" style={{ width: "24%" }}>{activeCol.fileName}</td>
                  <td className="out-src-col" style={{ width: "24%" }}>{activeCol.column}</td>
                  <td>{activeCol.outputName}</td>
                  <td style={{ width: 70 }} />
                </tr>
              </tbody>
            </table>
          ) : null}
        </DragOverlay>
      </DndContext>
      {outputCols.length === 0 && <div className="empty">還沒有選取任何欄位，回上一步挑選要輸出的欄位。</div>}
      {outputCols.length > 0 && displayCols.length === 0 && (
        <div className="empty">沒有符合當前篩選條件的欄位。<br /><button className="btn ghost xs" onClick={resetFilters} style={{ marginTop: 8 }}>清除篩選條件</button></div>
      )}
    </div>
  );
}

export default memo(StepOutput);
