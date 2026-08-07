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

export function computeMerge(baseFile, others, outputCols, joinConfig, joinType = "left") {
  if (!baseFile || outputCols.length === 0) return null;
  const warnings = [];
  const maps = {};

  const activeOthers = others.filter((f) => {
    const cfg = joinConfig[f.id];
    if (!cfg || !cfg.theirKey || !cfg.baseKey) {
      warnings.push(`「${f.name}」尚未設定比對欄位，來自這份檔案的欄位將全部留空。`);
      return false;
    }
    return true;
  });

  activeOthers.forEach((f) => {
    const cfg = joinConfig[f.id];
    const map = new Map();
    let dup = 0;
    f.rows.forEach((r, idx) => {
      const k = r[cfg.theirKey];
      if (k === undefined || k === "") return;
      if (map.has(k)) {
        dup++;
      } else {
        map.set(k, { row: r, idx, used: false });
      }
    });
    if (dup > 0) warnings.push(`「${f.name}」的比對欄位「${cfg.theirKey}」有 ${dup} 筆重複值，合併時只取第一筆相符的資料。`);
    maps[f.id] = { map, cfg, file: f };
  });

  const resultRows = [];

  // Process baseFile rows
  baseFile.rows.forEach((baseRow) => {
    let allOthersMatched = true;
    const matchedEntries = {};

    activeOthers.forEach((f) => {
      const entry = maps[f.id];
      const baseKeyVal = baseRow[entry.cfg.baseKey];
      const matchObj = baseKeyVal !== undefined && baseKeyVal !== "" ? entry.map.get(baseKeyVal) : undefined;
      if (matchObj) {
        matchObj.used = true;
        matchedEntries[f.id] = matchObj.row;
      } else {
        allOthersMatched = false;
      }
    });

    if (joinType === "inner" && activeOthers.length > 0 && !allOthersMatched) {
      return;
    }

    const out = {};
    outputCols.forEach((oc) => {
      if (oc.fileId === baseFile.id) {
        out[oc.outputName || oc.column] = baseRow[oc.column] ?? "";
      } else {
        const matchedRow = matchedEntries[oc.fileId];
        out[oc.outputName || oc.column] = matchedRow ? (matchedRow[oc.column] ?? "") : "";
      }
    });
    resultRows.push(out);
  });

  // If Full Outer Join, add unmatched rows from secondary files
  if (joinType === "outer") {
    activeOthers.forEach((f) => {
      const entry = maps[f.id];
      if (!entry) return;
      entry.map.forEach(({ row: otherRow, used }) => {
        if (!used) {
          const out = {};
          outputCols.forEach((oc) => {
            if (oc.fileId === f.id) {
              out[oc.outputName || oc.column] = otherRow[oc.column] ?? "";
            } else {
              out[oc.outputName || oc.column] = "";
            }
          });
          resultRows.push(out);
        }
      });
    });
  }

  return { rows: resultRows, total: resultRows.length, warnings };
}
