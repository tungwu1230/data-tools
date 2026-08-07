export default function CollectionsSidebar(props) {
  const {
    collections, collectionsLoaded, deleteCollection, files,
    sidebarMode, createMode, setCreateMode, createName, setCreateName,
    manualText, setManualText, fromDataFileId, setFromDataFileId,
    fromDataChecked, toggleFromDataChecked, fromDataFilterText, setFromDataFilterText,
    editingId, openCreateBlank, openEditCollection, cancelCreate, saveCollection,
  } = props;

  const fromDataFile = files.find((f) => f.id === fromDataFileId) || null;
  const fromDataVisible = fromDataFile
    ? (fromDataFilterText.trim()
        ? fromDataFile.headers.filter((h) => h.toLowerCase().startsWith(fromDataFilterText.trim().toLowerCase()))
        : fromDataFile.headers)
    : [];

  return (
    <div className="wb-sidebar">
      <div className="sidebar-head">
        <h4>欄位集合</h4>
        {sidebarMode === "list" && (
          <button className="btn primary xs" onClick={() => openCreateBlank("manual")}>+ 新增集合</button>
        )}
      </div>

      {sidebarMode === "list" && (
        <div className="collection-list">
          {collectionsLoaded && collections.length === 0 && (
            <div className="empty-mini">還沒有集合。集合是全域的——手動輸入固定的欄位名稱，或從某份資料勾選建立，之後任何資料都能用它來比對欄位。</div>
          )}
          {collections.map((c) => (
            <div className="collection-row" key={c.id}>
              <div className="collection-row-main">
                <span className="collection-name">{c.name}</span>
                <span className="collection-count">{c.columns.length} 欄</span>
              </div>
              <div className="collection-row-cols">{c.columns.slice(0, 8).join(", ")}{c.columns.length > 8 ? "…" : ""}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn ghost xs" onClick={() => openEditCollection(c)}>編輯</button>
                <button className="btn ghost xs" onClick={() => deleteCollection(c.id)}>刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sidebarMode === "create" && (
        <div className="collection-create">
          <div className="edit-form-title">{editingId ? "編輯集合" : "新增集合"}</div>
          <div className="mode-toggle">
            <button className={createMode === "manual" ? "active" : ""} onClick={() => setCreateMode("manual")}>手動輸入</button>
            <button
              className={createMode === "fromData" ? "active" : ""}
              onClick={() => { setCreateMode("fromData"); if (!fromDataFileId && files.length > 0) setFromDataFileId(files[0].id); }}
            >
              從資料勾選
            </button>
          </div>

          <input type="text" placeholder="集合名稱" value={createName} onChange={(e) => setCreateName(e.target.value)} />

          {createMode === "manual" ? (
            <>
              <textarea
                placeholder={"輸入欄位名稱，用逗號或換行分隔\n例如：as66, user_id, created_at"}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <label className="hint">會直接存成這幾個確切的欄位名稱，之後套用到任何資料時，只比對完全相同的名稱。</label>
            </>
          ) : (
            files.length === 0 ? (
              <div className="empty-mini">請先上傳至少一份 CSV 才能從資料勾選。</div>
            ) : (
              <>
                <select value={fromDataFileId || ""} onChange={(e) => setFromDataFileId(e.target.value)}>
                  {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input type="text" placeholder="搜尋欄位開頭…" value={fromDataFilterText} onChange={(e) => setFromDataFilterText(e.target.value)} />
                <div className="col-list small">
                  {fromDataVisible.length === 0 && <div className="no-match">沒有符合的欄位。</div>}
                  {fromDataVisible.map((h) => (
                    <label className={`col-item ${fromDataChecked.has(h) ? "checked" : ""}`} key={h}>
                      <input type="checkbox" checked={fromDataChecked.has(h)} onChange={() => toggleFromDataChecked(h)} />
                      {h}
                    </label>
                  ))}
                </div>
              </>
            )
          )}

          <div className="create-actions">
            {editingId && (
              <button
                className="btn ghost xs edit-delete"
                onClick={() => { deleteCollection(editingId); cancelCreate(); }}
              >
                刪除這個集合
              </button>
            )}
            <button className="btn ghost xs" onClick={cancelCreate}>取消</button>
            <button className="btn primary xs" onClick={saveCollection}>{editingId ? "儲存變更" : "儲存集合"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
