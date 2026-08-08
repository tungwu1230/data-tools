export const CSS = `
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

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
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  overflow: hidden;
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

.wb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.wb-head {
  padding: 12px 16px 0 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
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
.wb-body { flex: 1; min-height: 0; overflow-y: auto; background: var(--bg-canvas); }
.wb-body.flush { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.wb-body.padded { padding: 20px 24px; }
.wb-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 28px; border-top: 1px solid var(--border); background: var(--surface);
  flex-shrink: 0;
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

/* Selected Columns display in Merge Step */
.selected-cols-section {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
}
.selected-cols-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.selected-cols-icon {
  color: var(--accent);
  flex-shrink: 0;
}
.selected-cols-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.selected-cols-count {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--mono);
  margin-left: auto;
}
.selected-cols-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 140px;
  overflow-y: auto;
  padding: 4px;
  border-radius: 8px;
}
.col-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 6px;
  background: var(--surface-alt);
  color: var(--text);
  border: 1px solid var(--border);
  transition: all 0.12s ease;
}
.col-pill.is-key {
  background: var(--amber-dim);
  color: var(--amber);
  border-color: var(--amber-line);
  font-weight: 600;
}
.col-pill .key-icon {
  color: var(--amber);
}
.col-pill .key-tag {
  font-size: 9.5px;
  font-weight: 700;
  background: var(--amber-line);
  color: #fff;
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 2px;
}
.col-pill .orig-name {
  font-size: 10.5px;
  color: var(--text-faint);
}
.no-cols-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-dim);
  background: var(--surface-alt);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px dashed var(--border);
}
.key-not-selected-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--amber);
  margin-top: 8px;
  background: var(--amber-dim);
  padding: 6px 10px;
  border-radius: 6px;
}
.all-output-summary-section {
  margin-top: 24px;
  padding: 16px 18px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
}
.summary-files-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-file-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-file-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
}
.file-role-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.file-role-badge.base {
  background: var(--amber-dim);
  color: var(--amber);
  border: 1px solid var(--amber-line);
}
.file-role-badge.other {
  background: var(--surface);
  color: var(--text-dim);
  border: 1px solid var(--border);
}
.summary-file-name {
  font-family: var(--mono);
  color: var(--text);
}
.summary-file-count {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--mono);
}

/* Join Mode selection cards */
.join-type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 8px;
}
.join-type-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.join-type-card:hover {
  border-color: var(--text-faint);
  background: var(--surface-alt);
}
.join-type-card.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  box-shadow: 0 0 0 1px var(--accent) inset;
}
.join-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}
.join-type-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text);
}
.join-type-card.active .join-type-title {
  color: var(--accent-strong);
}
.join-type-badge {
  font-size: 9.5px;
  font-weight: 700;
  background: var(--accent);
  color: #fff;
  padding: 1px 6px;
  border-radius: 10px;
}
.join-type-desc {
  font-size: 11px;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.45;
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
   Sheet View & Right Selection Panel Layout (Clean Non-Overlapping Flex)
----------------------------------------------------------------*/
.step-files-container {
  display: flex; flex-direction: column; flex: 1; min-height: 0; width: 100%;
}

.step-files-layout {
  display: flex; gap: 0; align-items: stretch; flex: 1; min-height: 0; width: 100%;
}

.sheet-main-view {
  flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0;
}

.sheet-right-panel {
  width: 320px; flex-shrink: 0; background: var(--surface);
  border: 1px solid var(--border); border-radius: 0;
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
  position: sticky; top: 0; height: 100%; overflow-y: auto;
  box-shadow: none;
}

.file-tabs-bar {
  display: flex; align-items: center; gap: 6px; overflow-x: auto;
  padding: 8px 16px 0 16px; background: var(--surface-alt);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}

.file-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 8px 8px 0 0;
  border: 1px solid var(--border); border-bottom: none;
  background: var(--surface); color: var(--text-dim);
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

.add-tab-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: 7px 7px 0 0;
  border: 1px dashed var(--accent); border-bottom: none;
  background: var(--accent-dim); color: var(--accent-strong);
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all .15s ease; position: relative; top: 1px;
  white-space: nowrap;
}
.add-tab-btn:hover {
  background: #d4e4f2; border-color: var(--accent-strong); color: var(--accent-strong);
}

.file-tab-title { display: flex; align-items: center; gap: 6px; }

.sheet-card {
  border: none; border-radius: 0;
  background: var(--surface); overflow: hidden;
  box-shadow: none; flex: 1; min-height: 0; display: flex; flex-direction: column;
}

.sheet-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid var(--border-soft);
  background: var(--surface-alt); flex-wrap: wrap; gap: 8px; flex-shrink: 0;
}

.sheet-info {
  display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-dim);
}

.sheet-table-wrap {
  overflow: auto; flex: 1; min-height: 0;
  position: relative; background: var(--surface);
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

/* Step 4 Preview & Quality Report Styles */
.step-preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.preview-tab-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-alt);
  color: var(--text-dim);
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.preview-tab-btn:hover {
  background: var(--surface);
  color: var(--text);
  border-color: var(--text-faint);
}
.preview-tab-btn.active {
  background: var(--accent-dim);
  color: var(--accent-strong);
  border-color: var(--accent);
}
.completeness-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 12px;
  margin-left: 2px;
}
.completeness-badge.good {
  background: var(--accent);
  color: #fff;
}
.completeness-badge.warn {
  background: var(--amber);
  color: #fff;
}
.preview-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Quality Tab Grid & Cards */
.quality-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.quality-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.quality-card-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.quality-card-head .card-icon {
  color: var(--accent);
}
.quality-card-head .card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
}
.quality-card-val {
  font-family: var(--mono);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--surface-sunken);
  border-radius: 3px;
  overflow: hidden;
  margin: 2px 0;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.quality-card-sub {
  font-size: 11px;
  color: var(--text-faint);
}

/* Column Analysis Panel */
.column-analysis-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.panel-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
}
.panel-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 4px 10px;
  width: 220px;
}
.panel-search-wrap .search-icon {
  color: var(--text-faint);
  flex-shrink: 0;
}
.panel-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--sans);
  font-size: 12px;
  color: var(--text);
  width: 100%;
}

/* Quality Table */
.quality-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}
.quality-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.quality-table th, .quality-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-soft);
  border-right: 1px solid var(--border-soft);
  text-align: left;
  vertical-align: middle;
}
.quality-table th {
  background: var(--surface-alt);
  color: var(--text-dim);
  font-weight: 600;
  font-size: 11.5px;
}
.col-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.col-name-cell .col-name {
  font-family: var(--mono);
  font-weight: 700;
  color: var(--text);
}
.col-name-cell .orig-col-name {
  font-size: 10.5px;
  color: var(--text-faint);
}
.file-name-text {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-dim);
  margin-left: 6px;
}
.type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  font-family: var(--mono);
}
.type-badge.number { background: #e0f2fe; color: #0369a1; }
.type-badge.text { background: #f3f4f6; color: #374151; }
.type-badge.date { background: #fef3c7; color: #b45309; }
.type-badge.boolean { background: #f3e8ff; color: #6b21a8; }

.completeness-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mini-progress-bg {
  flex: 1;
  height: 6px;
  background: var(--surface-sunken);
  border-radius: 3px;
  overflow: hidden;
}
.mini-progress-fill {
  height: 100%;
  border-radius: 3px;
}
.pct-text {
  font-family: var(--mono);
  font-size: 11.5px;
  font-weight: 600;
  min-width: 42px;
}
.count-text {
  font-family: var(--mono);
  font-size: 11.5px;
}
.empty-text {
  color: var(--text-faint);
}
.mono-text {
  font-family: var(--mono);
  font-weight: 600;
}
.num-summary {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-dim);
}
.top-vals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.top-val-pill {
  font-family: var(--mono);
  font-size: 10.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-alt);
  border: 1px solid var(--border-soft);
  color: var(--text-dim);
}
.top-val-pill .val-pct {
  font-size: 9.5px;
  color: var(--text-faint);
  margin-left: 2px;
}
.faint-text {
  color: var(--text-faint);
}

/* Mode toggle (合併模式 / 探索模式) in the header, alongside the step tabs */
.wb-mode-toggle { display: flex; gap: 4px; margin-bottom: 10px; }
.wb-mode-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-alt); color: var(--text-dim);
  font-family: var(--sans); font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: all .15s ease;
}
.wb-mode-btn:hover:not(:disabled) { border-color: var(--text-faint); color: var(--text); }
.wb-mode-btn.active { background: var(--accent-dim); color: var(--accent-strong); border-color: var(--accent); }
.wb-mode-btn:disabled { cursor: not-allowed; opacity: .5; }

/* Explore Mode */
.explore-container { display: flex; flex-direction: column; gap: 16px; }
.explore-toolbar {
  border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;
}
.explore-toolbar-head { display: flex; align-items: center; gap: 8px; }
.explore-toolbar-desc { margin: 0; font-size: 12px; color: var(--text-dim); line-height: 1.55; }
.explore-picker-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.explore-picker { display: flex; flex-direction: column; gap: 6px; min-width: 190px; flex: 1; }
.explore-picker label { font-size: 11.5px; color: var(--text-dim); font-weight: 600; }
.explore-type-picker { min-width: 130px; flex: 0 0 auto; }
.explore-series-tag {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 6px; font-size: 11px; font-weight: 700;
  font-family: var(--mono); flex-shrink: 0; margin-bottom: 8px;
}
.explore-series-tag.a { background: var(--accent-dim); color: var(--accent-strong); border: 1px solid var(--accent); }
.explore-series-tag.b { background: #f3e8ff; color: #6b21a8; border: 1px solid #c084fc; }

.explore-panel { border: 1px solid var(--border); border-radius: 12px; background: var(--surface); padding: 16px 18px; }
.explore-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.explore-panel-title { font-size: 13.5px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px; }
.explore-vs-icon { color: var(--accent); margin: 0 2px; }
.explore-warn-icon { margin-right: 6px; vertical-align: -2px; }
.explore-body { margin-top: 14px; }

.explore-side-by-side { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }

.explore-stat-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.explore-stat-chip {
  font-size: 11px; font-family: var(--mono); background: var(--surface-alt);
  border: 1px solid var(--border-soft); border-radius: 20px; padding: 3px 10px; color: var(--text-dim);
}

/* Histogram (numeric distribution) */
.dist-chart { display: flex; align-items: flex-end; gap: 3px; height: 160px; padding-top: 8px; border-bottom: 1px solid var(--border-soft); }
.dist-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 6px; }
.dist-bar { width: 100%; background: var(--accent); border-radius: 3px 3px 0 0; min-height: 2px; transition: height .2s ease; }
.dist-axis-row { display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-faint); font-family: var(--mono); margin-top: 6px; }
.dist-discrete-labels { display: flex; gap: 3px; margin-top: 6px; }
.dist-discrete-label { flex: 1; min-width: 6px; text-align: center; font-size: 10.5px; font-family: var(--mono); color: var(--text-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Category bars (categorical distribution) */
.cat-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.cat-bar-row.inline { margin-bottom: 0; }
.cat-bar-row:last-child { margin-bottom: 0; }
.cat-bar-label { width: 120px; flex-shrink: 0; font-size: 11.5px; font-family: var(--mono); color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cat-bar-track { flex: 1; height: 14px; background: var(--surface-sunken); border-radius: 4px; overflow: hidden; }
.cat-bar-fill { height: 100%; background: var(--accent); border-radius: 4px; }
.cat-bar-fill.other { background: var(--text-faint); }
.cat-bar-count { width: 90px; flex-shrink: 0; text-align: right; font-size: 10.5px; font-family: var(--mono); color: var(--text-dim); }
.cat-bar-count.auto { width: auto; }

/* Scatter (same-file numeric × numeric) */
.scatter-wrap { display: flex; flex-direction: column; gap: 8px; }
.scatter-svg { width: 100%; height: 260px; background: var(--surface-alt); border-radius: 8px; border: 1px solid var(--border-soft); }
.scatter-point { fill: var(--accent); fill-opacity: 0.55; }
.scatter-point:hover { fill-opacity: 0.9; }
.scatter-corr { font-size: 11.5px; color: var(--text-dim); font-family: var(--mono); }

`;
