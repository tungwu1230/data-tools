import Papa from "papaparse";

let uid = 0;
export const nextId = () => `id${Date.now()}_${uid++}`;

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    file.text().then((text) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          resolve({ headers: res.meta.fields || [], rows: res.data });
        },
        error: (err) => reject(err),
      });
    }).catch(reject);
  });
}

export function computeMerge(baseFile, others, outputCols, joinConfig) {
  if (!baseFile || outputCols.length === 0) return null;
  const warnings = [];
  const maps = {};
  others.forEach((f) => {
    const cfg = joinConfig[f.id];
    if (!cfg || !cfg.theirKey || !cfg.baseKey) {
      warnings.push(`「${f.name}」尚未設定比對欄位，來自這份檔案的欄位將全部留空。`);
      return;
    }
    const map = new Map();
    let dup = 0;
    f.rows.forEach((r) => {
      const k = r[cfg.theirKey];
      if (k === undefined || k === "") return;
      if (map.has(k)) dup++; else map.set(k, r);
    });
    if (dup > 0) warnings.push(`「${f.name}」的比對欄位「${cfg.theirKey}」有 ${dup} 筆重複值，合併時只取第一筆相符的資料。`);
    maps[f.id] = { map, cfg };
  });

  const rows = baseFile.rows.map((row) => {
    const out = {};
    outputCols.forEach((oc) => {
      if (oc.fileId === baseFile.id) {
        out[oc.outputName || oc.column] = row[oc.column] ?? "";
      } else {
        const entry = maps[oc.fileId];
        if (!entry) { out[oc.outputName || oc.column] = ""; return; }
        const key = row[entry.cfg.baseKey];
        const matched = entry.map.get(key);
        out[oc.outputName || oc.column] = matched ? (matched[oc.column] ?? "") : "";
      }
    });
    return out;
  });
  return { rows, total: rows.length, warnings };
}
