import { Activity, GitCompare, X, Info } from "lucide-react";
import { useExploreMode } from "../hooks/useExploreMode.js";
import { buildAxisTicks } from "../utils/distribution.js";

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
      <option value="discrete">離散數值</option>
      <option value="continuous">連續數值</option>
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
    if (dist.nonNumericCount === dist.filled) {
      return (
        <div className="warn">
          <Info size={13} className="explore-warn-icon" />
          此欄位的已填值都無法解析為數字，因此沒有圖表可顯示（可能是手動選擇了「離散數值」/「連續數值」，但欄位內容其實不是數字）。
        </div>
      );
    }
    const chart = dist.isDiscrete ? <DiscreteBars values={dist.discreteValues} /> : <Histogram histogram={dist.histogram} />;
    if (dist.nonNumericCount > 0) {
      return (
        <div>
          <div className="warn">
            <Info size={13} className="explore-warn-icon" />
            {dist.nonNumericCount.toLocaleString()} 筆已填值無法解析為數字，未列入以下圖表。
          </div>
          {chart}
        </div>
      );
    }
    return chart;
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

// Shared y-axis scaffold (gridlines + tick labels + baseline) for GroupedStats
// and DistCompareChart — both are bar charts over the same buildAxisTicks() output.
function ChartYAxis({ ticks, yFor, padL, right, baseY }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={right} y2={yFor(t)} className="bar-chart-grid" />
          <text x={padL - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="bar-chart-tick">
            {fmtNum(t)}
          </text>
        </g>
      ))}
      <line x1={padL} y1={baseY} x2={right} y2={baseY} className="bar-chart-axis" />
    </>
  );
}

function GroupedStats({ groups, catLabel, numLabel }) {
  if (groups.length === 0) return <div className="empty-mini">沒有足夠的成對資料可比較。</div>;

  const W = 640, H = 300, PAD_L = 46, PAD_R = 16, PAD_T = 20, PAD_B = 56;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  // Scale by magnitude (not raw value) so a negative average still gets a
  // proportional bar — drawn downward from the baseline instead of being
  // clamped to a 1px sliver above it.
  const { ticks, niceMax } = buildAxisTicks(Math.max(...groups.map((g) => Math.abs(g.avg)), 0));
  const yFor = (v) => PAD_T + plotH - (v / niceMax) * plotH;
  const slotW = plotW / groups.length;
  const barW = Math.min(56, slotW * 0.55);
  const baseY = PAD_T + plotH;

  return (
    <div className="bar-chart-wrap">
      <svg className="bar-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <ChartYAxis ticks={ticks} yFor={yFor} padL={PAD_L} right={W - PAD_R} baseY={baseY} />
        {groups.map((g, i) => {
          const cx = PAD_L + slotW * i + slotW / 2;
          const negative = g.avg < 0;
          const barH = niceMax > 0 ? (Math.abs(g.avg) / niceMax) * plotH : 0;
          const barY = negative ? baseY : baseY - barH;
          const valueY = negative ? barY + Math.max(barH, 1) + 12 : barY - 6;
          const labelY = baseY + 16;
          return (
            <g key={g.category}>
              <rect x={cx - barW / 2} y={barY} width={barW} height={Math.max(barH, 1)} className="bar-chart-bar">
                <title>{`${g.category}：${numLabel} 平均 ${fmtNum(g.avg)}（${g.count.toLocaleString()} 筆，範圍 ${fmtNum(g.min)} ~ ${fmtNum(g.max)}）`}</title>
              </rect>
              <text x={cx} y={valueY} textAnchor="middle" className="bar-chart-value">{fmtNum(g.avg)}</text>
              <text x={cx} y={labelY} textAnchor="end" className="bar-chart-xlabel" transform={`rotate(-30 ${cx} ${labelY})`}>
                {g.category}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="bar-chart-caption">{catLabel} 各類別的 {numLabel} 平均</div>
    </div>
  );
}

function DistCompareChart({ data, labelA, labelB }) {
  if (data.length === 0) return <div className="empty-mini">沒有足夠的資料可比較。</div>;

  const W = 640, H = 320, PAD_L = 46, PAD_R = 16, PAD_T = 20, PAD_B = 56;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const { ticks, niceMax } = buildAxisTicks(Math.max(...data.map((d) => Math.max(d.aCount, d.bCount)), 0));
  const yFor = (v) => PAD_T + plotH - (v / niceMax) * plotH;
  const baseY = PAD_T + plotH;
  const slotW = plotW / data.length;
  const groupW = Math.min(70, slotW * 0.7);
  const barW = groupW / 2 - 2;

  return (
    <div className="bar-chart-wrap">
      <div className="bar-chart-legend">
        <span className="bar-chart-legend-item"><span className="bar-chart-swatch a" />{labelA}</span>
        <span className="bar-chart-legend-item"><span className="bar-chart-swatch b" />{labelB}</span>
      </div>
      <svg className="bar-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <ChartYAxis ticks={ticks} yFor={yFor} padL={PAD_L} right={W - PAD_R} baseY={baseY} />
        {data.map((d, i) => {
          const groupCx = PAD_L + slotW * i + slotW / 2;
          const aH = niceMax > 0 ? (d.aCount / niceMax) * plotH : 0;
          const bH = niceMax > 0 ? (d.bCount / niceMax) * plotH : 0;
          const aX = groupCx - groupW / 2;
          const bX = groupCx + 2;
          const labelY = baseY + 16;
          return (
            <g key={d.label}>
              {d.aCount > 0 && (
                <>
                  <rect x={aX} y={baseY - aH} width={barW} height={Math.max(aH, 1)} className="bar-chart-bar a">
                    <title>{`${labelA} · ${d.label}：${d.aCount.toLocaleString()} 筆`}</title>
                  </rect>
                  <text x={aX + barW / 2} y={baseY - aH - 6} textAnchor="middle" className="bar-chart-value">{d.aCount}</text>
                </>
              )}
              {d.bCount > 0 && (
                <>
                  <rect x={bX} y={baseY - bH} width={barW} height={Math.max(bH, 1)} className="bar-chart-bar b">
                    <title>{`${labelB} · ${d.label}：${d.bCount.toLocaleString()} 筆`}</title>
                  </rect>
                  <text x={bX + barW / 2} y={baseY - bH - 6} textAnchor="middle" className="bar-chart-value">{d.bCount}</text>
                </>
              )}
              <text x={groupCx} y={labelY} textAnchor="end" className="bar-chart-xlabel" transform={`rotate(-30 ${groupCx} ${labelY})`}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ExploreMode({ files }) {
  const {
    fileA, fileAId, setFileAId, colA, setColA, typeA, setTypeA,
    fileB, fileBId, setFileBId, colB, setColB, typeB, setTypeB,
    view, clearCompare,
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

      {view.kind === "empty" && <div className="empty">請先選擇欄位 A，開始檢視分佈。</div>}

      {view.kind === "single" && (
        <div className="explore-panel">
          <div className="explore-panel-head">
            <span className="explore-panel-title">{fileA.name} · {colA}</span>
          </div>
          <DistChips dist={view.dist} />
          <div className="explore-body"><DistributionBody dist={view.dist} /></div>
        </div>
      )}

      {view.kind === "discreteCompare" && (
        <div className="explore-panel">
          <div className="explore-panel-head">
            <span className="explore-panel-title">
              <span className="explore-series-tag a">A</span> {fileA.name} · {colA}
              <GitCompare size={13} className="explore-vs-icon" />
              <span className="explore-series-tag b">B</span> {fileB.name} · {colB}
            </span>
          </div>
          <DistCompareChart data={view.data} labelA={view.labelA} labelB={view.labelB} />
        </div>
      )}

      {view.kind === "pairwise" && (
        <div className="explore-panel">
          <div className="explore-panel-head">
            <span className="explore-panel-title">
              {fileA.name} · {colA} <GitCompare size={13} className="explore-vs-icon" /> {colB}
            </span>
          </div>
          {view.pairwise.kind === "scatter" && (
            <ScatterChart points={view.pairwise.points} correlation={view.pairwise.correlation} labelX={view.pairwise.labelX} labelY={view.pairwise.labelY} />
          )}
          {view.pairwise.kind === "crosstab" && <CrossTab table={view.pairwise.table} labelA={view.pairwise.labelA} labelB={view.pairwise.labelB} />}
          {view.pairwise.kind === "grouped" && (
            <GroupedStats groups={view.pairwise.groups} catLabel={view.pairwise.catLabel} numLabel={view.pairwise.numLabel} />
          )}
        </div>
      )}

      {view.kind === "sideBySide" && (
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
              <DistChips dist={view.distA} />
              <div className="explore-body"><DistributionBody dist={view.distA} /></div>
            </div>
            <div className="explore-panel">
              <div className="explore-panel-head">
                <span className="explore-panel-title"><span className="explore-series-tag b">B</span> {fileB.name} · {colB}</span>
              </div>
              <DistChips dist={view.distB} />
              <div className="explore-body"><DistributionBody dist={view.distB} /></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
