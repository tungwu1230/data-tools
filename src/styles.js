/* ---------------------------------------------------------------
   design tokens — "data workbench" direction:
   dark slate surface, mono type for column/data content,
   a single mint accent for active/selected state, amber for the
   "base file" marker, soft red for destructive actions.
----------------------------------------------------------------*/
export const CSS = `
.wb {
  --bg: #0f1216;
  --panel: #171b22;
  --panel-alt: #1d222b;
  --border: #2a2f3a;
  --border-soft: #22262f;
  --text: #e7eaf0;
  --text-dim: #8993a4;
  --text-faint: #5b6474;
  --accent: #5eead4;
  --accent-dim: #234845;
  --amber: #f0b355;
  --amber-dim: #4a3a1f;
  --danger: #f2726b;
  --danger-dim: #4a2422;
  --mono: ui-monospace, "SFMono-Regular", "Cascadia Code", "Roboto Mono", Menlo, Consolas, monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;

  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 640px;
  max-width: 1280px;
  margin: 0 auto;
}
.wb * { box-sizing: border-box; }

.wb-sidebar {
  width: 260px; flex-shrink: 0; border-right: 1px solid var(--border);
  background: var(--panel); display: flex; flex-direction: column;
  padding: 16px; overflow-y: auto;
}
.sidebar-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.sidebar-head h4 { margin: 0; font-size: 11.5px; color: var(--text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.empty-mini { font-size: 11.5px; color: var(--text-faint); padding: 8px 0; line-height: 1.6; }
.collection-list { display: flex; flex-direction: column; gap: 8px; }
.collection-row { border: 1px solid var(--border); border-radius: 8px; padding: 9px 10px; background: var(--panel-alt); }
.collection-row-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 6px; }
.collection-name { font-size: 12.5px; font-weight: 600; word-break: break-word; }
.collection-count { font-size: 10px; font-family: var(--mono); color: var(--accent); white-space: nowrap; }
.collection-row-cols { font-size: 10.5px; font-family: var(--mono); color: var(--text-faint); line-height: 1.6; margin-bottom: 6px; word-break: break-word; }
.mode-toggle { display: flex; gap: 4px; margin-bottom: 10px; }
.mode-toggle button { flex: 1; font-size: 11px; padding: 6px 4px; border-radius: 6px; border: 1px solid var(--border); background: var(--panel-alt); color: var(--text-dim); cursor: pointer; font-family: var(--sans); }
.mode-toggle button.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.collection-create input[type=text], .collection-create textarea, .collection-create select {
  width: 100%; background: var(--panel-alt); border: 1px solid var(--border); border-radius: 7px;
  color: var(--text); font-family: var(--mono); font-size: 12px; padding: 7px 9px; margin-bottom: 8px;
}
.collection-create textarea { min-height: 90px; resize: vertical; }
.collection-create label.hint { font-size: 10.5px; color: var(--text-faint); display: block; margin: -4px 0 8px 0; line-height: 1.6; }
.col-list.small { max-height: 190px; }
.create-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.applied-set { font-size: 11px; color: var(--accent); margin: -2px 0 8px 0; display: flex; align-items: center; gap: 6px; }
.applied-set button { background: none; border: none; color: var(--text-faint); cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0; }

.wb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wb-head {
  padding: 20px 24px 0 24px;
  border-bottom: 1px solid var(--border);
}
.wb-title { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; margin: 0 0 2px 0; }
.wb-sub { font-size: 12.5px; color: var(--text-dim); margin: 0 0 16px 0; }
.wb-steps { display: flex; gap: 4px; }
.wb-step-btn {
  background: none; border: none; cursor: pointer;
  padding: 10px 14px 12px 14px;
  font-family: var(--sans); font-size: 13px; color: var(--text-faint);
  border-bottom: 2px solid transparent;
  display: flex; align-items: center; gap: 8px;
  transition: color .15s ease;
}
.wb-step-btn .num {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1px solid var(--text-faint); color: var(--text-faint);
  font-size: 10.5px; font-family: var(--mono);
  display: flex; align-items: center; justify-content: center;
  transition: all .15s ease;
}
.wb-step-btn.active { color: var(--text); border-bottom-color: var(--accent); }
.wb-step-btn.active .num { background: var(--accent); border-color: var(--accent); color: #0b1210; }
.wb-step-btn.done .num { border-color: var(--accent); color: var(--accent); }
.wb-step-btn:disabled { cursor: not-allowed; opacity: .45; }
.wb-body { flex: 1; padding: 20px 24px 8px 24px; overflow-y: auto; }
.wb-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 24px; border-top: 1px solid var(--border); background: var(--panel);
}
.btn {
  font-family: var(--sans); font-size: 12.5px; font-weight: 500;
  border-radius: 7px; border: 1px solid var(--border); background: var(--panel-alt);
  color: var(--text); padding: 7px 13px; cursor: pointer; transition: all .12s ease;
  white-space: nowrap;
}
.btn:hover:not(:disabled) { border-color: var(--text-faint); }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #0b1210; font-weight: 600; }
.btn.primary:hover:not(:disabled) { filter: brightness(1.08); }
.btn.danger { color: var(--danger); }
.btn.danger:hover:not(:disabled) { border-color: var(--danger); }
.btn.ghost { background: none; border-color: transparent; color: var(--text-dim); }
.btn.ghost:hover:not(:disabled) { color: var(--text); }
.btn.xs { padding: 4px 9px; font-size: 11.5px; }

.empty {
  border: 1px dashed var(--border); border-radius: 10px;
  padding: 44px 20px; text-align: center; color: var(--text-dim); font-size: 13px;
}
.empty b { color: var(--text); }

.dropzone {
  border: 1px dashed var(--border); border-radius: 10px; padding: 18px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-bottom: 18px; background: var(--panel);
}
.dropzone-text { font-size: 12.5px; color: var(--text-dim); }
.dropzone input[type=file] { display: none; }

.file-card {
  border: 1px solid var(--border); border-radius: 10px; margin-bottom: 14px; overflow: hidden; background: var(--panel);
}
.file-card.is-base { border-color: var(--amber); }
.file-card-head {
  display: flex; align-items: center; gap: 10px; padding: 11px 14px;
  cursor: pointer; user-select: none;
}
.file-card-head:hover { background: var(--panel-alt); }
.chev { color: var(--text-faint); font-size: 10px; width: 10px; }
.file-name { font-family: var(--mono); font-size: 12.5px; font-weight: 600; }
.file-meta { font-size: 11px; color: var(--text-dim); font-family: var(--mono); }
.badge {
  font-size: 10px; font-family: var(--mono); padding: 2px 7px; border-radius: 20px;
  border: 1px solid var(--amber); color: var(--amber); background: var(--amber-dim);
}
.sel-count {
  font-size: 10.5px; font-family: var(--mono); padding: 2px 7px; border-radius: 20px;
  border: 1px solid var(--border); color: var(--accent); background: var(--accent-dim);
}
.file-card-body { padding: 0 14px 14px 14px; border-top: 1px solid var(--border-soft); }

.preview-toggle { font-size: 11.5px; color: var(--text-dim); background: none; border: none; cursor: pointer; padding: 8px 0 4px 0; }
.preview-toggle:hover { color: var(--accent); }
.preview-wrap { overflow-x: auto; border: 1px solid var(--border-soft); border-radius: 8px; margin-bottom: 10px; }
.preview-table { border-collapse: collapse; font-family: var(--mono); font-size: 11px; white-space: nowrap; }
.preview-table th, .preview-table td { padding: 5px 10px; border-bottom: 1px solid var(--border-soft); border-right: 1px solid var(--border-soft); }
.preview-table th { color: var(--text-dim); font-weight: 500; text-align: left; background: var(--panel-alt); position: sticky; top: 0; }
.preview-table td { color: var(--text-dim); }

.filter-row { display: flex; gap: 8px; align-items: center; margin: 10px 0 6px 0; flex-wrap: wrap; }
.search-input {
  flex: 1; min-width: 160px; background: var(--panel-alt); border: 1px solid var(--border);
  border-radius: 7px; padding: 6px 10px; color: var(--text); font-family: var(--mono); font-size: 12px;
}
.search-input:focus { outline: none; border-color: var(--accent); }

.col-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 5px; max-height: 260px; overflow-y: auto; padding: 2px; }
.col-item {
  display: flex; align-items: center; gap: 7px; padding: 6px 9px; border-radius: 6px;
  border: 1px solid transparent; cursor: pointer; font-family: var(--mono); font-size: 12px;
}
.col-item:hover { background: var(--panel-alt); }
.col-item.checked { background: var(--accent-dim); border-color: var(--accent); }
.col-item input { accent-color: var(--accent); }
.col-item .match { color: var(--accent); font-weight: 700; }
.no-match { color: var(--text-faint); font-size: 12px; padding: 10px 4px; }

.merge-panel { border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; background: var(--panel); }
.merge-panel h4 { margin: 0 0 4px 0; font-size: 12.5px; color: var(--text); font-weight: 600; }
.merge-panel p { margin: 0 0 12px 0; font-size: 11.5px; color: var(--text-dim); line-height: 1.6; }
.merge-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; }
.merge-row label { width: 92px; color: var(--text-dim); flex-shrink: 0; }
select {
  background: var(--panel-alt); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); font-family: var(--mono); font-size: 12px; padding: 5px 8px;
}
select:focus { outline: none; border-color: var(--accent); }

.out-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--panel); }
.out-toolbar input[type=text] { width: 90px; background: var(--panel-alt); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-family: var(--mono); font-size: 12px; padding: 5px 8px; }
.out-toolbar .divider { width: 1px; align-self: stretch; background: var(--border); margin: 0 2px; }

.out-table { width: 100%; border-collapse: collapse; }
.out-table th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--text-faint); font-weight: 500; padding: 6px 8px; border-bottom: 1px solid var(--border); }
.out-table td { padding: 5px 8px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
.out-table tr:hover td { background: var(--panel-alt); }
.out-src { font-family: var(--mono); font-size: 11.5px; color: var(--text-dim); }
.out-src .fname { color: var(--text-faint); }
.out-name-input {
  width: 100%; background: var(--panel-alt); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); font-family: var(--mono); font-size: 12px; padding: 5px 8px;
}
.out-name-input:focus { outline: none; border-color: var(--accent); }
.move-btns { display: flex; gap: 2px; }
.move-btns button { width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--border); background: var(--panel-alt); color: var(--text-dim); cursor: pointer; font-size: 10px; display:flex; align-items:center; justify-content:center; }
.move-btns button:hover:not(:disabled) { color: var(--text); border-color: var(--text-faint); }
.move-btns button:disabled { opacity: .3; cursor: not-allowed; }

.stat-strip { display: flex; gap: 18px; margin-bottom: 14px; }
.stat { border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; background: var(--panel); }
.stat .n { font-family: var(--mono); font-size: 18px; font-weight: 600; color: var(--accent); }
.stat .l { font-size: 10.5px; color: var(--text-dim); text-transform: uppercase; letter-spacing: .04em; }

.warn { border: 1px solid var(--amber); background: var(--amber-dim); color: var(--amber); border-radius: 8px; padding: 9px 12px; font-size: 11.5px; margin-bottom: 14px; line-height: 1.6; }

.final-preview-wrap { overflow: auto; border: 1px solid var(--border); border-radius: 10px; max-height: 420px; }
.final-preview { border-collapse: collapse; font-family: var(--mono); font-size: 11.5px; white-space: nowrap; }
.final-preview th, .final-preview td { padding: 6px 12px; border-bottom: 1px solid var(--border-soft); border-right: 1px solid var(--border-soft); }
.final-preview th { color: var(--accent); font-weight: 600; text-align: left; background: var(--panel-alt); position: sticky; top: 0; }
.final-preview td { color: var(--text-dim); }
.final-preview tr:nth-child(even) td { background: rgba(255,255,255,0.015); }
`;
