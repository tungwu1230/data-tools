/* ---------------------------------------------------------------
   design tokens — "drafting workbench" direction:
   light paper canvas, white index-card panels, prussian-blue accent
   for active/selected state, amber for the "base file" marker,
   brick red for destructive actions. Fills the full viewport —
   no outer card, no max-width — this *is* the page.
----------------------------------------------------------------*/
export const CSS = `
.wb {
  --bg-canvas: #eef1f3;
  --bg-canvas-line: #e3e8eb;
  --surface: #ffffff;
  --surface-alt: #f3f6f8;
  --surface-sunken: #e9eef1;
  --border: #d9e0e4;
  --border-soft: #e7ecef;
  --text: #13232e;
  --text-dim: #55707c;
  --text-faint: #93a6ad;
  --accent: #1c5d8f;
  --accent-strong: #124a75;
  --accent-dim: #e3edf6;
  --amber: #b9781c;
  --amber-dim: #f8ecd6;
  --amber-line: #dba955;
  --danger: #ac4136;
  --danger-dim: #f6e6e2;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace;
  --sans: "PingFang TC", "Hiragino Sans CNS", "Noto Sans TC", "Microsoft JhengHei", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;

  background: var(--bg-canvas);
  color: var(--text);
  font-family: var(--sans);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
}
.wb * { box-sizing: border-box; }

.wb-sidebar {
  width: 264px; flex-shrink: 0; border-right: 1px solid var(--border);
  background: var(--surface); display: flex; flex-direction: column;
  padding: 18px 16px; overflow-y: auto;
  position: sticky; top: 0; height: 100vh; max-height: 100vh; align-self: flex-start;
}
.wb-sidebar-right {
  width: 280px; flex-shrink: 0; border-left: 1px solid var(--border);
  background: var(--surface); display: flex; flex-direction: column;
  padding: 18px 16px; overflow-y: auto;
  position: sticky; top: 0; height: 100vh; max-height: 100vh; align-self: flex-start;
}
.resize-handle {
  position: absolute; top: 0; bottom: 0; width: 6px;
  cursor: col-resize; z-index: 50; user-select: none;
  transition: background 0.15s ease;
}
.resize-handle.left-edge { left: -3px; }
.resize-handle.right-edge { right: -3px; }
.resize-handle:hover, .resize-handle.is-resizing {
  background: var(--accent); opacity: 0.7;
}
.sidebar-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.sidebar-head h4 { margin: 0; font-size: 11px; color: var(--text-dim); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.empty-mini { font-size: 11.5px; color: var(--text-faint); padding: 8px 0; line-height: 1.65; }
.collection-list { display: flex; flex-direction: column; gap: 8px; }
.collection-row { border: 1px solid var(--border); border-radius: 10px; padding: 10px 11px; background: var(--surface-alt); }
.collection-row-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; gap: 6px; }
.collection-name { font-size: 12.5px; font-weight: 600; word-break: break-word; color: var(--text); }
.collection-count {
  font-size: 10px; font-family: var(--mono); color: var(--accent); white-space: nowrap;
  background: var(--accent-dim); padding: 1px 7px; border-radius: 20px;
}
.collection-row-cols { font-size: 10.5px; font-family: var(--mono); color: var(--text-faint); line-height: 1.6; margin-bottom: 7px; word-break: break-word; }
.mode-toggle { display: flex; gap: 4px; margin-bottom: 10px; }
.mode-toggle button { flex: 1; font-size: 11px; padding: 6px 4px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); color: var(--text-dim); cursor: pointer; font-family: var(--sans); }
.mode-toggle button.active { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-dim); }
.edit-form-title { font-size: 12.5px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.collection-create input[type=text], .collection-create textarea, .collection-create select {
  width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); font-family: var(--mono); font-size: 12px; padding: 7px 9px; margin-bottom: 8px;
}
.collection-create input[type=text]:focus, .collection-create textarea:focus, .collection-create select:focus {
  outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);
}
.collection-create textarea { min-height: 90px; resize: vertical; }
.collection-create label.hint { font-size: 10.5px; color: var(--text-faint); display: block; margin: -4px 0 8px 0; line-height: 1.6; }
.col-list.small { max-height: 190px; }
.create-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.edit-delete { color: var(--danger); margin-right: auto; }
.edit-delete:hover { border-color: var(--danger); background: var(--danger-dim); }
.applied-set { font-size: 11px; color: var(--accent-strong); margin: -2px 0 8px 0; display: flex; align-items: center; gap: 6px; }
.applied-set button { background: none; border: none; color: var(--text-faint); cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0; }

.wb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wb-head {
  padding: 22px 28px 0 28px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.wb-title { font-size: 17px; font-weight: 700; letter-spacing: -.005em; margin: 0 0 3px 0; color: var(--text); }
.wb-sub { font-size: 12.5px; color: var(--text-dim); margin: 0 0 18px 0; }
.wb-steps { display: flex; gap: 2px; }
.wb-step-btn {
  background: var(--surface-alt); border: 1px solid var(--border); border-bottom: none; cursor: pointer;
  padding: 10px 16px 11px 16px; border-radius: 9px 9px 0 0; position: relative; top: 1px;
  font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--text-faint);
  display: flex; align-items: center; gap: 9px;
  transition: color .15s ease, background .15s ease;
}
.wb-step-btn .num {
  width: 19px; height: 19px; border-radius: 50%;
  border: 1.5px solid var(--text-faint); color: var(--text-faint);
  font-size: 10.5px; font-family: var(--mono); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s ease;
}
.wb-step-btn.active { color: var(--text); background: var(--surface); border-color: var(--border); border-bottom: 1px solid var(--surface); }
.wb-step-btn.active .num { background: var(--accent); border-color: var(--accent); color: #fff; }
.wb-step-btn.done .num { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.wb-step-btn:disabled { cursor: not-allowed; opacity: .5; }
.wb-body { flex: 1; padding: 24px 28px 10px 28px; overflow-y: auto;
  background:
    linear-gradient(var(--bg-canvas-line) 1px, transparent 1px) 0 0/100% 28px,
    linear-gradient(90deg, var(--bg-canvas-line) 1px, transparent 1px) 0 0/28px 100%,
    var(--bg-canvas);
}
.wb-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 28px; border-top: 1px solid var(--border); background: var(--surface);
}
.btn {
  font-family: var(--sans); font-size: 12.5px; font-weight: 600;
  border-radius: 8px; border: 1px solid var(--border); background: var(--surface);
  color: var(--text); padding: 7px 14px; cursor: pointer; transition: all .12s ease;
  white-space: nowrap;
}
.btn:hover:not(:disabled) { border-color: var(--text-faint); background: var(--surface-alt); }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn.primary:hover:not(:disabled) { background: var(--accent-strong); border-color: var(--accent-strong); }
.btn.danger { color: var(--danger); }
.btn.danger:hover:not(:disabled) { border-color: var(--danger); background: var(--danger-dim); }
.btn.ghost { background: none; border-color: transparent; color: var(--text-dim); }
.btn.ghost:hover:not(:disabled) { color: var(--text); background: var(--surface-alt); }
.btn.xs { padding: 4px 10px; font-size: 11.5px; font-weight: 500; border-radius: 6px; }

.empty {
  border: 1.5px dashed var(--border); border-radius: 12px;
  padding: 44px 20px; text-align: center; color: var(--text-dim); font-size: 13px; background: var(--surface);
}
.empty b { color: var(--text); }

.dropzone {
  border: 1.5px dashed var(--border); border-radius: 12px; padding: 20px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  margin-bottom: 20px; background: var(--surface-alt);
}
.dropzone-text { font-size: 12px; color: var(--text-dim); }
.dropzone input[type=file] { display: none; }

.file-card { border: 1px solid var(--border); border-radius: 12px; margin-bottom: 16px; overflow: hidden; background: var(--surface); }
.file-card.is-base { border-color: var(--amber-line); box-shadow: 0 0 0 1px var(--amber-line) inset; }
.file-card-head {
  display: flex; align-items: center; gap: 11px; padding: 13px 16px;
  cursor: pointer; user-select: none;
}
.file-card-head:hover { background: var(--surface-alt); }
.chev { color: var(--text-faint); font-size: 10px; width: 10px; }
.file-name { font-family: var(--mono); font-size: 12.5px; font-weight: 700; color: var(--text); }
.file-meta { font-size: 11px; color: var(--text-dim); font-family: var(--mono); }
.badge {
  font-size: 10px; font-weight: 700; font-family: var(--mono); padding: 2px 8px; border-radius: 20px;
  border: 1px solid var(--amber-line); color: var(--amber); background: var(--amber-dim);
}
.sel-count {
  font-size: 10.5px; font-family: var(--mono); padding: 2px 8px; border-radius: 20px;
  border: 1px solid var(--border); color: var(--accent); background: var(--accent-dim);
}
.file-card-body { padding: 2px 16px 16px 16px; border-top: 1px solid var(--border-soft); }

.preview-toggle { font-size: 11.5px; font-weight: 600; color: var(--text-dim); background: none; border: none; cursor: pointer; padding: 10px 0 6px 0; }
.preview-toggle:hover { color: var(--accent-strong); }
.preview-wrap { overflow-x: auto; border: 1px solid var(--border-soft); border-radius: 9px; margin-bottom: 12px; }
.preview-table { border-collapse: collapse; font-family: var(--mono); font-size: 11px; white-space: nowrap; width: 100%; }
.preview-table th, .preview-table td { padding: 6px 11px; border-bottom: 1px solid var(--border-soft); border-right: 1px solid var(--border-soft); }
.preview-table th { color: var(--text-dim); font-weight: 600; text-align: left; background: var(--surface-alt); position: sticky; top: 0; }
.preview-table td { color: var(--text-dim); }

.filter-row { display: flex; gap: 8px; align-items: center; margin: 10px 0 8px 0; flex-wrap: wrap; }
.search-input {
  flex: 1; min-width: 200px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 7px 11px; color: var(--text); font-family: var(--mono); font-size: 12px;
}
.search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.search-input::placeholder { color: var(--text-faint); }

.col-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 6px; max-height: 260px; overflow-y: auto; padding: 2px; }
.col-item {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px;
  border: 1px solid var(--border-soft); cursor: pointer; font-family: var(--mono); font-size: 12px; background: var(--surface);
  transition: all .1s ease;
}
.col-item:hover { border-color: var(--text-faint); }
.col-item.checked { background: var(--accent-dim); border-color: var(--accent); color: var(--accent-strong); }
.col-item input { accent-color: var(--accent); }
.col-item .match { color: var(--accent-strong); font-weight: 700; }
.no-match { color: var(--text-faint); font-size: 12px; padding: 10px 4px; }

.merge-panel {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: var(--surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.merge-panel-head {
  margin-bottom: 18px;
}
.merge-panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.merge-icon {
  width: 18px;
  height: 18px;
  color: var(--accent);
  flex-shrink: 0;
}
.merge-panel h4 {
  margin: 0;
  font-size: 14.5px;
  color: var(--text);
  font-weight: 700;
}
.merge-panel p {
  margin: 6px 0 0 0;
  font-size: 12.5px;
  color: var(--text-dim);
  line-height: 1.5;
}

.base-file-section {
  background: var(--surface-alt);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.merge-field-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.merge-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
}
.badge.amber {
  background: var(--amber-dim);
  color: var(--amber);
  border: 1px solid var(--amber-line);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}
.merge-select-wrap {
  flex: 1;
  min-width: 280px;
}

.merge-section-subtitle {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.join-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.join-file-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}
.join-file-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-soft);
  flex-wrap: wrap;
}
.join-file-tag {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-dim);
  padding: 1px 7px;
  border-radius: 4px;
  font-weight: 600;
}
.join-file-name {
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
  flex: 1;
  min-width: 180px;
}
.join-file-meta {
  font-size: 11.5px;
  color: var(--text-faint);
  font-family: var(--mono);
}

.join-mapping-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}
.mapping-col {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mapping-label {
  font-size: 11.5px;
  color: var(--text-dim);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mapping-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 7px;
  flex-shrink: 0;
  color: var(--accent);
  gap: 2px;
}
.connector-arrow {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}
.connector-text {
  font-size: 10.5px;
  color: var(--text-faint);
  white-space: nowrap;
}

.merge-select, select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  padding: 7px 10px;
  width: 100%;
}
select:focus, .merge-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.out-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; padding: 13px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface-alt); }
.out-toolbar input[type=text] { width: 90px; background: var(--surface); border: 1px solid var(--border); border-radius: 7px; color: var(--text); font-family: var(--mono); font-size: 12px; padding: 6px 9px; }
.out-toolbar .divider { width: 1px; align-self: stretch; background: var(--border); margin: 0 2px; }

.out-filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 16px; padding: 10px 14px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
}
.filter-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-dim); }
.filter-item label { font-weight: 600; white-space: nowrap; font-size: 11.5px; }
.filter-item select, .filter-item.search-item input {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 7px;
  color: var(--text); font-size: 11.5px; padding: 5px 8px; font-family: var(--sans);
}
.filter-item select:focus, .filter-item.search-item input:focus {
  outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim);
}

.out-table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.out-table th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-faint); font-weight: 700; padding: 8px 10px; border-bottom: 1px solid var(--border); background: var(--surface-alt); }
.out-table td { padding: 7px 10px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
.out-table tr:last-child td { border-bottom: none; }
.out-table tr:hover td { background: var(--surface-alt); }
.out-src-file { font-size: 11.5px; color: var(--text-dim); }
.out-src-col { font-family: var(--mono); font-size: 11.5px; color: var(--text); font-weight: 600; }
.out-name-input {
  width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 7px;
  color: var(--text); font-family: var(--mono); font-size: 12px; padding: 6px 9px;
}
.out-name-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.drag-handle-btn {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim);
  cursor: grab;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}
.drag-handle-btn:hover {
  color: var(--accent);
  background: var(--surface-alt);
  border-color: var(--border-soft);
}
.drag-handle-btn:active {
  cursor: grabbing;
}
.out-table tr.is-dragging {
  background: var(--surface-alt);
  border-color: var(--accent);
}

.stat-strip { display: flex; gap: 14px; margin-bottom: 16px; }
.stat { border: 1px solid var(--border); border-radius: 12px; padding: 12px 20px; background: var(--surface-alt); }
.stat .n { font-family: var(--mono); font-size: 20px; font-weight: 700; color: var(--accent-strong); font-variant-numeric: tabular-nums; }
.stat .l { font-size: 10.5px; color: var(--text-dim); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

.warn { border: 1px solid var(--amber-line); background: var(--amber-dim); color: #8a5a10; border-radius: 10px; padding: 11px 14px; font-size: 11.5px; margin-bottom: 16px; line-height: 1.65; }

.final-preview-wrap { overflow: auto; border: 1px solid var(--border); border-radius: 12px; max-height: 420px; }
.final-preview { border-collapse: collapse; font-family: var(--mono); font-size: 11.5px; white-space: nowrap; width: 100%; }
.final-preview th, .final-preview td { padding: 8px 14px; border-bottom: 1px solid var(--border-soft); border-right: 1px solid var(--border-soft); }
.final-preview th { color: var(--accent-strong); font-weight: 700; text-align: left; background: var(--surface-alt); position: sticky; top: 0; }
.final-preview td { color: var(--text-dim); }
.final-preview tr:nth-child(even) td { background: var(--surface-alt); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(19, 35, 46, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn .15s ease-out;
}
.modal-box {
  background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
  width: 90%; max-width: 420px; padding: 22px 24px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
  animation: popIn .15s ease-out;
}
.modal-title {
  font-size: 15px; font-weight: 700; color: var(--text);
  margin: 0 0 8px 0; display: flex; align-items: center; gap: 9px;
}
.modal-desc {
  font-size: 12.5px; color: var(--text-dim); line-height: 1.55;
  margin: 0 0 20px 0;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px;
}

/* ---------------------------------------------------------------
   Sheet View & Right Selection Panel Layout
----------------------------------------------------------------*/
.step-files-container {
  display: flex; flex-direction: column; gap: 16px;
}

.step-files-layout {
  display: flex; gap: 20px; align-items: flex-start;
}

.sheet-main-view {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px;
}

.sheet-right-panel {
  width: 320px; flex-shrink: 0; background: var(--surface);
  border: 1px solid var(--border); border-radius: 12px;
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
  position: sticky; top: 12px; max-height: calc(100vh - 180px); overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.file-tabs-bar {
  display: flex; align-items: center; gap: 8px; overflow-x: auto;
  padding-bottom: 2px; border-bottom: 1px solid var(--border);
}

.file-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 8px 8px 0 0;
  border: 1px solid var(--border); border-bottom: none;
  background: var(--surface-alt); color: var(--text-dim);
  font-family: var(--mono); font-size: 12px; cursor: pointer;
  transition: all .15s ease; position: relative; top: 1px;
  white-space: nowrap; user-select: none;
}

.file-tab:hover { background: var(--surface); color: var(--text); }
.file-tab.active {
  background: var(--surface); color: var(--text); font-weight: 700;
  border-color: var(--accent); border-bottom: 1px solid var(--surface);
  box-shadow: 0 -2px 0 0 var(--accent) inset;
}

.file-tab-title { display: flex; align-items: center; gap: 6px; }

.sheet-card {
  border: 1px solid var(--border); border-radius: 12px;
  background: var(--surface); overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.sheet-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid var(--border-soft);
  background: var(--surface-alt); flex-wrap: wrap; gap: 8px;
}

.sheet-info {
  display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-dim);
}

.sheet-table-wrap {
  overflow: auto; max-height: 480px; position: relative; background: var(--surface);
}

.sheet-table {
  border-collapse: separate; border-spacing: 0; width: 100%;
  font-family: var(--mono); font-size: 11.5px; white-space: nowrap;
}

.sheet-row-num-header {
  position: sticky; top: 0; left: 0; z-index: 10;
  width: 44px; min-width: 44px; max-width: 44px; text-align: center;
  background: var(--surface-sunken); color: var(--text-faint);
  font-size: 10px; font-weight: 700; border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border); padding: 8px 4px; user-select: none;
}

.sheet-row-num {
  position: sticky; left: 0; z-index: 5;
  width: 44px; min-width: 44px; max-width: 44px; text-align: center;
  background: var(--surface-alt); color: var(--text-faint);
  font-size: 10px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border-soft);
  padding: 6px 4px; user-select: none; font-weight: 600;
}

.sheet-col-header {
  position: sticky; top: 0; z-index: 8;
  background: var(--surface-alt); color: var(--text-dim);
  border-bottom: 2px solid var(--border); border-right: 1px solid var(--border-soft);
  padding: 8px 12px; text-align: left; font-weight: 600;
  cursor: pointer; transition: all .12s ease; user-select: none;
}

.sheet-col-header:hover {
  background: var(--accent-dim); color: var(--accent-strong);
}

.sheet-col-header.is-selected {
  background: #e3edf6;
  color: var(--accent-strong);
  border-bottom: 2px solid var(--accent);
  box-shadow: inset 0 2px 0 0 var(--accent);
}

.sheet-col-header-content {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}

.sheet-col-letter {
  font-size: 9.5px; color: var(--text-faint); text-transform: uppercase;
  font-weight: 700; letter-spacing: 0.05em; display: block; margin-bottom: 2px;
}

.sheet-col-name {
  font-size: 12px; font-weight: 700; color: inherit;
}

.sheet-col-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; background: var(--accent);
  color: #fff; font-size: 10px; flex-shrink: 0;
}

.sheet-cell {
  padding: 7px 12px; border-bottom: 1px solid var(--border-soft);
  border-right: 1px solid var(--border-soft); color: var(--text);
  transition: background .1s ease;
}

.sheet-cell.is-selected {
  background: rgba(28, 93, 143, 0.06);
}

.sheet-row:hover .sheet-cell {
  background: var(--surface-alt);
}

.sheet-row:hover .sheet-cell.is-selected {
  background: rgba(28, 93, 143, 0.11);
}

.right-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 8px; border-bottom: 1px solid var(--border-soft);
}

.right-panel-title {
  font-size: 13px; font-weight: 700; color: var(--text);
  display: flex; align-items: center; gap: 6px;
}

.col-item-badge {
  font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px;
  background: var(--surface-sunken); color: var(--text-faint);
}

.col-item.checked .col-item-badge {
  background: var(--accent); color: #fff;
}

`;
