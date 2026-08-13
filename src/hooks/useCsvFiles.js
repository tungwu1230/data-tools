import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { parseCsvFile } from "../utils/csv.js";
import { nextId } from "../utils/ids.js";

// owns the uploaded file list and which one is the merge base
export function useCsvFiles() {
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [baseFileId, setBaseFileId] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;
    setLoadingFiles(true);
    try {
      const parsed = [];
      for (const f of list) {
        const { headers, rows } = await parseCsvFile(f);
        parsed.push({ id: nextId(), name: f.name, headers, rows, rowCount: rows.length });
      }
      setFiles((prev) => {
        const next = [...prev, ...parsed];
        if (!baseFileId && next.length > 0) setBaseFileId(next[0].id);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("讀取檔案時發生錯誤，請確認上傳的是標準格式的 CSV。");
    } finally {
      setLoadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [baseFileId]);

  const removeFile = useCallback((fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setBaseFileId((prev) => (prev === fileId ? null : prev));
  }, []);

  useEffect(() => {
    if (!baseFileId && files.length > 0) setBaseFileId(files[0].id);
    if (baseFileId && !files.find((f) => f.id === baseFileId) && files.length > 0) {
      setBaseFileId(files[0].id);
    }
  }, [files]); // eslint-disable-line

  const baseFile = useMemo(() => files.find((f) => f.id === baseFileId) || null, [files, baseFileId]);
  const others = useMemo(() => files.filter((f) => f.id !== baseFileId), [files, baseFileId]);

  return { files, loadingFiles, fileInputRef, handleUpload, removeFile, baseFileId, setBaseFileId, baseFile, others };
}
