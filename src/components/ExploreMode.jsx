import { Activity, GitCompare, X, Info } from "lucide-react";
import { useExploreMode } from "../hooks/useExploreMode.js";

function fmtNum(n) {
  if (n === undefined || n === null || Number.isNaN(n)) return "-";
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function typeLabel(t) {
  return t === "number" ? "數值" : "類別";
}

function DistChips({ dist }) {
  const overridden = dist.inferredType !== dist.autoType;
  return (
    <div className="explore-stat-chips">
      <span className="explore-stat-chip">
        視為{typeLabel(dist.inferredType)}
        {overridden && <span className="faint-text">（自動判斷為{typeLabel(dist.autoType)}）</span>}
      </span>
      <span className="explore-stat-chip">總筆數 {dist.total.toLocaleString()}</span>
      <span className="explore-stat-chip">已填 {dist.filled.toLocaleString()}</span>
      <span className="explore-stat-chip">缺漏 {dist.missing.toLocaleString()}</span>
      <span className="explore-stat-chip">不重複 {dist.uniqueCount.toLocaleString()}</span>
      {dist.inferredType === "number" && dist.stats && (
        <span className="explore-stat-chip">
          {fmtNum(dist.stats.min)} ~ {fmtNum(dist.stats.max)}（均 {fmtNum(dist.stats.avg)} · 中位 {fmtNum(dist.stats.median)}）
        </span>
      )}
    </div>
  );
}

function TypePicker({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="auto">自動判斷</option>
      <option value="number">連續數值</option>
      <option value="text">類別</option>
    </select>
  );
}

function Histogram({ histogram }) {
  const max = Math.max(1, ...histogram.map((b) => b.count));
  return (
    <div>
      <div className="dist-chart">
        {histogram.map((b, i) => (
          <div className="dist-bar-col" key={i}>
            <div
              className="dist-bar"
              style={{ height: `${(b.count / max) * 100}%` }}
              title={`${fmtNum(b.binStart)} ~ ${fmtNum(b.binEnd)}：${b.count} 筆`}
            />
          </div>
        ))}
      </div>
      <div className="dist-axis-row">
        <span>{fmtNum(histogram[0]?.binStart)}</span>
        <span>{fmtNum(histogram[histogram.length - 1]?.binEnd)}</span>
      </div>
    </div>
  );
}

function DiscreteBars({ values }) {
  const max = Math.max(1, ...values.map((v) => v.count));
  return (
    <div>
      <div className="dist-chart">
        {values.map((v) => (
          <div className="dist-bar-col" key={v.value}>
            <div
              className="dist-bar"
              style={{ height: `${(v.count / max) * 100}%` }}
              title={`${fmtNum(v.value)}：${v.count} 筆（${v.pct}%）`}
            />
          </div>
        ))}
      </div>
      <div className="dist-discrete-labels">
        {values.map((v) => (
          <span className="dist-discrete-label" key={v.value} title={fmtNum(v.value)}>
            {fmtNum(v.value)}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ topValues, otherCount, otherPct }) {
  const max = Math.max(1, ...topValues.map((t) => t.count), otherCount);
  return (
    <div>
      {topValues.map((t) => (
        <div className="cat-bar-row" key={t.value}>
          <span className="cat-bar-label" title={t.value}>{t.value || "(空)"}</span>
          <div className="cat-bar-track">
            <div className="cat-bar-fill" style={{ width: `${(t.count / max) * 100}%` }} />
          </div>
          <span className="cat-bar-count">{t.count.toLocaleString()}（{t.pct}%）</span>
        </div>
      ))}
      {otherCount > 0 && (
        <div className="cat-bar-row">
          <span className="cat-bar-label faint-text">其他</span>
          <div className="cat-bar-track">
            <div className="cat-bar-fill other" style={{ width: `${(otherCount / max) * 100}%` }} />
          </div>
          <span className="cat-bar-count">{otherCount.toLocaleString()}（{otherPct}%）</span>
        </div>
      )}
    </div>
  );
}

function DistributionBody({ dist }) {
  if (dist.filled === 0) return <div className="empty-mini">此欄位沒有可用的資料值。</div>;
  if (dist.inferredType === "number") {
    return dist.isDiscrete ? <DiscreteBars values={dist.discreteValues} /> : <Histogram histogram={dist.histogram} />;
  }
  return <CategoryBars topValues={dist.topValues} otherCount={dist.otherCount} otherPct={dist.otherPct} />;
}

function ScatterChart({ points, correlation, labelX, labelY }) {
  if (points.length === 0) return <div className="empty-mini">沒有足夠的成對數值可繪製散佈圖。</div>;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 600, H = 260, PAD = 24;
  const sx = (x) => (maxX === minX ? W / 2 : PAD + ((x - minX) / (maxX - minX)) * (W - PAD * 2));
  const sy = (y) => (maxY === minY ? H / 2 : H - PAD - ((y - minY) / (maxY - minY)) * (H - PAD * 2));
  const strength = correlation === null ? null : Math.abs(correlation) >= 0.7 ? "強" : Math.abs(correlation) >= 0.3 ? "中等" : "弱";
  return (
    <div className="scatter-wrap">
      <svg className="scatter-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
        {points.map((p, i) => (
          <circle key={i} className="scatter-point" cx={sx(p.x)} cy={sy(p.y)} r="4">
            <title>{`${labelX}: ${fmtNum(p.x)} / ${labelY}: ${fmtNum(p.y)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="dist-axis-row">
        <span>{labelX}：{fmtNum(minX)} ~ {fmtNum(maxX)}</span>
        <span>{labelY}：{fmtNum(minY)} ~ {fmtNum(maxY)}</span>
      </div>
      <div className="scatter-corr">
        Pearson 相關係數 r = {correlation === null ? "無法計算" : correlation}
        {strength && <span className="faint-text">（{strength}{correlation >= 0 ? "正相關" : "負相關"}）</span>}
      </div>
    </div>
  );
}

function CrossTab({ table, labelA, labelB }) {
  const { catsA, catsB, matrix, maxCell, totalPairs } = table;
  if (totalPairs === 0) return <div className="empty-mini">沒有足夠的成對資料可比較。</div>;
  return (
    <div className="quality-table-wrap">
      <table className="quality-table">
        <thead>
          <tr>
            <th>{labelA} × {labelB}</th>
            {catsB.map((b) => <th key={b}>{b || "(空)"}</th>)}
          </tr>
        </thead>
        <tbody>
          {catsA.map((a, i) => (
            <tr key={a}>
              <td style={{ fontWeight: 700 }}>{a || "(空)"}</td>
              {catsB.map((b, j) => {
                const count = matrix[i][j];
                const alpha = maxCell > 0 ? count / maxCell : 0;
                return (
                  <td
                    key={b}
                    title={`${a} × ${b}：${count} 筆`}
                    style={{ background: `rgba(28, 93, 143, ${alpha * 0.65})`, color: alpha > 0.55 ? "#fff" : "var(--text)" }}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupedStats({ groups, catLabel, numLabel }) {
  if (groups.length === 0) return <div className="empty-mini">沒有足夠的成對資料可比較。</div>;
  const maxAvg = Math.max(1, ...groups.map((g) => g.avg));
  return (
    <div className="quality-table-wrap">
      <table className="quality-table">
        <thead>
          <tr>
            <th>{catLabel}</th>
            <th>筆數</th>
            <th>{numLabel} 範圍</th>
            <th>{numLabel} 平均</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.category}>
              <td style={{ fontWeight: 700 }}>{g.category}</td>
              <td className="mono-text">{g.count.toLocaleString()}</td>
              <td className="num-summary">{fmtNum(g.min)} ~ {fmtNum(g.max)}</td>
              <td>
                <div className="cat-bar-row inline">
                  <div className="cat-bar-track" style={{ width: 90 }}>
                    <div className="cat-bar-fill" style={{ width: `${(g.avg / maxAvg) * 100}%` }} />
                  </div>
                  <span className="cat-bar-count auto">{fmtNum(g.avg)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExploreMode({ files }) {
  const {
    fileA, fileAId, setFileAId, colA, setColA, typeA, setTypeA,
    fileB, fileBId, setFileBId, colB, setColB, typeB, setTypeB,
    distA, distB, comparing, sameFile, pairwise, clearCompare,
  } = useExploreMode(files);

  if (files.length === 0) {
    return <div className="empty">請先在「檔案與欄位」上傳至少一份 CSV，即可使用探索模式檢視欄位分佈。</div>;
  }

  return (
    <div className="explore-container">
      <div className="explore-toolbar">
        <div className="explore-toolbar-head">
          <Activity size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>探索模式：檢視欄位分佈</span>
        </div>
        <p className="explore-toolbar-desc">
          直接從已上傳的原始檔案觀察單一欄位的分佈，或加入第二個欄位做比較——不需要先完成合併設定。
        </p>

        <div className="explore-picker-row">
          <span className="explore-series-tag a">A</span>
          <div className="explore-picker">
            <label>檔案</label>
            <select value={fileAId || ""} onChange={(e) => setFileAId(e.target.value)}>
              {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="explore-picker">
            <label>欄位</label>
            <select value={colA || ""} onChange={(e) => setColA(e.target.value)}>
              <option value="">選擇欄位…</option>
              {fileA?.headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="explore-picker explore-type-picker">
            <label>視為</label>
            <TypePicker value={typeA} onChange={setTypeA} />
          </div>

          {!fileBId ? (
            <button
              className="btn ghost xs"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              onClick={() => setFileBId(fileAId)}
              disabled={!colA}
            >
              <GitCompare size={13} />
              <span>加入第二個欄位比較</span>
            </button>
          ) : (
            <>
              <span className="explore-series-tag b">B</span>
              <div className="explore-picker">
                <label>檔案</label>
                <select value={fileBId || ""} onChange={(e) => setFileBId(e.target.value)}>
                  {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="explore-picker">
                <label>欄位</label>
                <select value={colB || ""} onChange={(e) => setColB(e.target.value)}>
                  <option value="">選擇欄位…</option>
                  {fileB?.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="explore-picker explore-type-picker">
                <label>視為</label>
                <TypePicker value={typeB} onChange={setTypeB} />
              </div>
              <button className="btn ghost xs" onClick={clearCompare} title="取消比較" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <X size={13} />
                <span>取消比較</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!colA && <div className="empty">請先選擇欄位 A，開始檢視分佈。</div>}

      {colA && !comparing && distA && (
        <div className="explore-panel">
          <div className="explore-panel-head">
            <span className="explore-panel-title">{fileA.name} · {colA}</span>
          </div>
          <DistChips dist={distA} />
          <div className="explore-body"><DistributionBody dist={distA} /></div>
        </div>
      )}

      {comparing && sameFile && pairwise && (
        <div className="explore-panel">
          <div className="explore-panel-head">
            <span className="explore-panel-title">
              {fileA.name} · {colA} <GitCompare size={13} className="explore-vs-icon" /> {colB}
            </span>
          </div>
          {pairwise.kind === "scatter" && (
            <ScatterChart points={pairwise.points} correlation={pairwise.correlation} labelX={colA} labelY={colB} />
          )}
          {pairwise.kind === "crosstab" && <CrossTab table={pairwise.table} labelA={colA} labelB={colB} />}
          {pairwise.kind === "grouped" && (
            <GroupedStats
              groups={pairwise.groups}
              catLabel={distA.inferredType === "number" ? colB : colA}
              numLabel={distA.inferredType === "number" ? colA : colB}
            />
          )}
        </div>
      )}

      {comparing && !sameFile && distA && distB && (
        <>
          <div className="warn">
            <Info size={13} className="explore-warn-icon" />
            這兩個欄位來自不同檔案，資料列彼此沒有對應關係，以下僅並排比較兩者的分佈「形狀」，而非逐列比對。
          </div>
          <div className="explore-side-by-side">
            <div className="explore-panel">
              <div className="explore-panel-head">
                <span className="explore-panel-title"><span className="explore-series-tag a">A</span> {fileA.name} · {colA}</span>
              </div>
              <DistChips dist={distA} />
              <div className="explore-body"><DistributionBody dist={distA} /></div>
            </div>
            <div className="explore-panel">
              <div className="explore-panel-head">
                <span className="explore-panel-title"><span className="explore-series-tag b">B</span> {fileB.name} · {colB}</span>
              </div>
              <DistChips dist={distB} />
              <div className="explore-body"><DistributionBody dist={distB} /></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
