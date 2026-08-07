import { useState, useEffect } from "react";
import { parseCollectionSyntax } from "../utils/columns.js";
import { pruneByKey } from "../utils/state.js";

// per-file column checkboxes + the prefix/collection filter above them
export function useColumnSelection(files, collections) {
  const [selections, setSelections] = useState({});
  const [filterMode, setFilterMode] = useState({});

  // drop selection/filter state for files that no longer exist
  useEffect(() => {
    const validIds = new Set(files.map((f) => f.id));
    setSelections((prev) => pruneByKey(prev, validIds));
    setFilterMode((prev) => pruneByKey(prev, validIds));
  }, [files]);

  // if a collection currently applied as a filter gets deleted, fall back to plain text
  useEffect(() => {
    setFilterMode((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(next).forEach((fid) => {
        const fm = next[fid];
        if (fm?.mode === "collection" && !collections.some((c) => c.id === fm.collectionId)) {
          next[fid] = { mode: "text", text: "", collectionId: null };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [collections]);

  const toggleColumn = (fileId, col) => {
    setSelections((prev) => {
      const set = new Set(prev[fileId] || []);
      if (set.has(col)) set.delete(col); else set.add(col);
      return { ...prev, [fileId]: set };
    });
  };

  const visibleHeaders = (file) => {
    const fm = filterMode[file.id] || { mode: "text", text: "" };
    if (fm.mode === "collection") {
      const c = collections.find((c) => c.id === fm.collectionId);
      if (!c) return file.headers;
      return file.headers.filter((h) => c.columns.includes(h));
    }
    const t = (fm.text || "").trim().toLowerCase();
    if (!t) return file.headers;
    return file.headers.filter((h) => h.toLowerCase().startsWith(t));
  };

  // handles both plain prefix search and $collection_name$ syntax
  const updateFilter = (fileId, rawValue) => {
    const parsedName = parseCollectionSyntax(rawValue);
    if (parsedName) {
      const col = collections.find((c) => c.name.toLowerCase() === parsedName.toLowerCase());
      if (col) {
        setFilterMode((prev) => ({ ...prev, [fileId]: { mode: "collection", text: rawValue, collectionId: col.id } }));
        const file = files.find((f) => f.id === fileId);
        if (file) {
          const matchedCols = file.headers.filter((h) => col.columns.includes(h));
          setSelections((prev) => {
            const set = new Set(prev[fileId] || []);
            matchedCols.forEach((c) => set.add(c));
            return { ...prev, [fileId]: set };
          });
        }
        return;
      }
    }
    setFilterMode((prev) => ({ ...prev, [fileId]: { mode: "text", text: rawValue, collectionId: null } }));
  };

  const clearFilter = (fileId) => setFilterMode((prev) => ({ ...prev, [fileId]: { mode: "text", text: "", collectionId: null } }));

  const selectAllVisible = (file) => {
    const vis = visibleHeaders(file);
    setSelections((prev) => {
      const set = new Set(prev[file.id] || []);
      vis.forEach((h) => set.add(h));
      return { ...prev, [file.id]: set };
    });
  };
  const clearVisible = (file) => {
    const vis = new Set(visibleHeaders(file));
    setSelections((prev) => {
      const set = new Set(prev[file.id] || []);
      vis.forEach((h) => set.delete(h));
      return { ...prev, [file.id]: set };
    });
  };

  return {
    selections, filterMode, toggleColumn, visibleHeaders,
    updateFilter, clearFilter, selectAllVisible, clearVisible,
  };
}
