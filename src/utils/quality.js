export function analyzeDataQuality(rows, outputCols, files = []) {
  if (!rows || rows.length === 0 || !outputCols || outputCols.length === 0) {
    return {
      totalRows: 0,
      totalCols: 0,
      totalCells: 0,
      totalFilledCells: 0,
      overallCompleteness: "0.0",
      colStats: [],
    };
  }

  const totalRows = rows.length;
  const totalCols = outputCols.length;
  const totalCells = totalRows * totalCols;
  let totalFilledCells = 0;

  const fileMap = new Map(files.map((f) => [f.id, f]));

  const colStats = outputCols.map((oc) => {
    const colKey = oc.outputName || oc.column;
    const file = fileMap.get(oc.fileId);
    const fileName = file ? file.name : "未知檔案";

    let filledCount = 0;
    const valMap = new Map();
    const typeCounts = { number: 0, date: 0, boolean: 0, text: 0 };
    let numSum = 0;
    let numMin = Infinity;
    let numMax = -Infinity;

    rows.forEach((r) => {
      const rawVal = r[colKey];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
        filledCount++;
        const valStr = String(rawVal).trim();
        valMap.set(valStr, (valMap.get(valStr) || 0) + 1);

        // Type checking
        if (!isNaN(Number(valStr))) {
          typeCounts.number++;
          const num = Number(valStr);
          numSum += num;
          if (num < numMin) numMin = num;
          if (num > numMax) numMax = num;
        } else if (valStr.toLowerCase() === "true" || valStr.toLowerCase() === "false") {
          typeCounts.boolean++;
        } else if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(valStr) && !isNaN(Date.parse(valStr))) {
          typeCounts.date++;
        } else {
          typeCounts.text++;
        }
      }
    });

    totalFilledCells += filledCount;
    const emptyCount = totalRows - filledCount;
    const completenessPct = totalRows > 0 ? ((filledCount / totalRows) * 100).toFixed(1) : "0.0";
    const uniqueCount = valMap.size;

    // Infer dominant data type
    let inferredType = "text";
    if (filledCount > 0) {
      if (typeCounts.number / filledCount >= 0.8) inferredType = "number";
      else if (typeCounts.boolean / filledCount >= 0.8) inferredType = "boolean";
      else if (typeCounts.date / filledCount >= 0.8) inferredType = "date";
    }

    // Generate summary details
    let summary = {};
    if (inferredType === "number" && typeCounts.number > 0) {
      summary = {
        min: numMin === Infinity ? 0 : numMin,
        max: numMax === -Infinity ? 0 : numMax,
        avg: (numSum / typeCounts.number).toFixed(2),
      };
    }

    // Top 3 frequent values
    const sortedValues = [...valMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([val, count]) => ({ value: val, count, pct: ((count / totalRows) * 100).toFixed(1) }));

    summary.topValues = sortedValues;

    return {
      id: oc.id,
      outputName: colKey,
      originalColumn: oc.column,
      fileId: oc.fileId,
      fileName,
      filledCount,
      emptyCount,
      completenessPct: Number(completenessPct),
      uniqueCount,
      inferredType,
      summary,
    };
  });

  const overallCompleteness = totalCells > 0 ? ((totalFilledCells / totalCells) * 100).toFixed(1) : "0.0";

  return {
    totalRows,
    totalCols,
    totalCells,
    totalFilledCells,
    overallCompleteness: Number(overallCompleteness),
    colStats,
  };
}
