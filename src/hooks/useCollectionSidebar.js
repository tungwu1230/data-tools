import { useState } from "react";

// local workflow state for the "collections" sidebar (list vs. create form)
export function useCollectionSidebar({ files, collections, createCollection }) {
  const [sidebarMode, setSidebarMode] = useState("list");
  const [createMode, setCreateMode] = useState("manual");
  const [createName, setCreateName] = useState("");
  const [manualText, setManualText] = useState("");
  const [fromDataFileId, setFromDataFileId] = useState(null);
  const [fromDataChecked, setFromDataChecked] = useState(new Set());
  const [fromDataFilterText, setFromDataFilterText] = useState("");

  const openCreateFromFile = (file, currentSelection) => {
    setSidebarMode("create");
    setCreateMode("fromData");
    setFromDataFileId(file.id);
    setFromDataChecked(new Set(currentSelection || []));
    setFromDataFilterText("");
    setCreateName("");
  };

  const openCreateBlank = (mode) => {
    setSidebarMode("create");
    setCreateMode(mode);
    setCreateName("");
    setManualText("");
    if (mode === "fromData" && !fromDataFileId && files.length > 0) setFromDataFileId(files[0].id);
    setFromDataChecked(new Set());
    setFromDataFilterText("");
  };

  const cancelCreate = () => {
    setSidebarMode("list");
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
    if (collections.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
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
    createCollection(name, columns);
    cancelCreate();
  };

  return {
    sidebarMode, createMode, setCreateMode, createName, setCreateName, manualText, setManualText,
    fromDataFileId, setFromDataFileId, fromDataChecked, fromDataFilterText, setFromDataFilterText,
    openCreateFromFile, openCreateBlank, cancelCreate, toggleFromDataChecked, saveCollection,
  };
}
