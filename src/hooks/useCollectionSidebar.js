import { useState } from "react";

// local workflow state for the "collections" sidebar (list vs. create/edit form)
export function useCollectionSidebar({ files, collections, createCollection, updateCollection }) {
  const [sidebarMode, setSidebarMode] = useState("list");
  const [createMode, setCreateMode] = useState("manual");
  const [createName, setCreateName] = useState("");
  const [manualText, setManualText] = useState("");
  const [fromDataFileId, setFromDataFileId] = useState(null);
  const [fromDataChecked, setFromDataChecked] = useState(new Set());
  const [fromDataFilterText, setFromDataFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const openCreateFromFile = (file, currentSelection) => {
    setSidebarMode("create");
    setCreateMode("fromData");
    setEditingId(null);
    setFromDataFileId(file.id);
    setFromDataChecked(new Set(currentSelection || []));
    setFromDataFilterText("");
    setCreateName("");
  };

  const openCreateBlank = (mode) => {
    setSidebarMode("create");
    setCreateMode(mode);
    setEditingId(null);
    setCreateName("");
    setManualText("");
    if (mode === "fromData" && !fromDataFileId && files.length > 0) setFromDataFileId(files[0].id);
    setFromDataChecked(new Set());
    setFromDataFilterText("");
  };

  const openEditCollection = (collection) => {
    setSidebarMode("create");
    setCreateMode("manual");
    setEditingId(collection.id);
    setCreateName(collection.name);
    setManualText(collection.columns.join(", "));
    setFromDataChecked(new Set());
    setFromDataFilterText("");
  };

  const cancelCreate = () => {
    setSidebarMode("list");
    setEditingId(null);
    setCreateName("");
    setManualText("");
    setFromDataChecked(new Set());
    setFromDataFilterText("");
  };

  const toggleFromDataChecked = (h) => setFromDataChecked((prev) => {
    const set = new Set(prev);
    if (set.has(h)) set.delete(h); else set.add(h);
    return set;
  });

  const saveCollection = () => {
    const name = createName.trim();
    if (!name) { alert("請先幫這個集合取個名字。"); return; }
    if (collections.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId)) {
      alert("已經有同名的集合了，換一個名字吧。"); return;
    }
    let columns = [];
    if (createMode === "manual") {
      columns = [...new Set(manualText.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean))];
      if (columns.length === 0) { alert("請至少輸入一個欄位名稱。"); return; }
    } else {
      columns = [...fromDataChecked];
      if (columns.length === 0) { alert("請至少勾選一個欄位。"); return; }
    }
    if (editingId) {
      updateCollection(editingId, name, columns);
    } else {
      createCollection(name, columns);
    }
    cancelCreate();
  };

  return {
    sidebarMode, createMode, setCreateMode, createName, setCreateName, manualText, setManualText,
    fromDataFileId, setFromDataFileId, fromDataChecked, fromDataFilterText, setFromDataFilterText,
    editingId, openCreateFromFile, openCreateBlank, openEditCollection, cancelCreate, toggleFromDataChecked, saveCollection,
  };
}
