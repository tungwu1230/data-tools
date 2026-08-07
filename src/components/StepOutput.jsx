import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";

export default function StepOutput(props) {
  const {
    outputCols, selectedOutIds, toggleOutSelect, selectAllOut, clearOutSel,
    prefixVal, setPrefixVal, suffixVal, setSuffixVal, applyPrefixSuffix,
    moveOutputCol, renameOutputCol, resetOutputName, resetSelectedOutputNames,
  } = props;

  const allSelected = outputCols.length > 0 && selectedOutIds.size === outputCols.length;

  return (
    <div>
      <div className="out-toolbar">
        <button className="btn xs" onClick={selectAllOut}>全選</button>
        <button className="btn ghost xs" onClick={clearOutSel}>清除勾選</button>
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

      <table className="out-table">
        <thead>
          <tr>
            <th style={{ width: 32, textAlign: "center" }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => (e.target.checked ? selectAllOut() : clearOutSel())}
              />
            </th>
            <th style={{ width: 60, textAlign: "center" }}>順序</th>
            <th style={{ width: "24%" }}>來源檔案</th>
            <th style={{ width: "24%" }}>原始欄位</th>
            <th>輸出欄位名稱</th>
            <th style={{ width: 70, textAlign: "center" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {outputCols.map((oc, i) => (
            <tr key={oc.id}>
              <td style={{ textAlign: "center" }}>
                <input type="checkbox" checked={selectedOutIds.has(oc.id)} onChange={() => toggleOutSelect(oc.id)} />
              </td>
              <td style={{ textAlign: "center" }}>
                <div className="move-btns" style={{ justifyContent: "center" }}>
                  <button disabled={i === 0} onClick={() => moveOutputCol(i, -1)}>
                    <ChevronUp size={12} />
                  </button>
                  <button disabled={i === outputCols.length - 1} onClick={() => moveOutputCol(i, 1)}>
                    <ChevronDown size={12} />
                  </button>
                </div>
              </td>
              <td className="out-src-file">{oc.fileName}</td>
              <td className="out-src-col">{oc.column}</td>
              <td>
                <input className="out-name-input" value={oc.outputName} onChange={(e) => renameOutputCol(oc.id, e.target.value)} />
              </td>
              <td style={{ textAlign: "center" }}>
                <button
                  className="btn ghost xs"
                  title="還原成原始欄位名稱"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                  onClick={() => resetOutputName(oc.id)}
                >
                  <RotateCcw size={11} />
                  <span>還原</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {outputCols.length === 0 && <div className="empty">還沒有選取任何欄位，回上一步挑選要輸出的欄位。</div>}
    </div>
  );
}
