# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses pnpm (pinned via `packageManager` in `package.json`) — don't use npm or yarn, the lockfile is `pnpm-lock.yaml` only.

- `pnpm run dev` — start Vite dev server
- `pnpm run build` — production build (outputs to `dist/`)
- `pnpm run preview` — preview the production build locally
- `pnpm test` — run the Vitest test suite once
- `pnpm run test:watch` — run Vitest in watch mode

There is no linter or type checker configured in this project. The test suite (Vitest) covers the pure modules under `src/utils/` (`dataset.js`, `csv.js`, `outputColumns.js`); component/hook behavior is not tested.

## What this is

A single-page CSV merge tool (`CSV 合併工作台`, UI text is in Traditional Chinese). The user uploads multiple CSVs, picks one as the "base" file, joins the others onto it by matching key columns, selects/renames/reorders output columns, and exports the merged result as a CSV. Everything runs client-side; there is no backend.

## Architecture

The whole app is one component, `CsvMergeWorkbench.jsx`, which is a 5-step wizard (`Step 1: 檔案與欄位` → `Step 2: 合併設定` → `Step 3: 輸出設定` → `Step 4: 預覽與匯出` → `Step 5: 資料品質報告`). All state lives in custom hooks under `src/hooks/`, one hook per concern, and `CsvMergeWorkbench.jsx` just wires their outputs together and passes props down to presentational components in `src/components/`. When changing behavior, find the owning hook first rather than looking in the components.

Hook responsibilities and how they connect (see `src/CsvMergeWorkbench.jsx` for the wiring):

- `useCsvFiles` — owns the uploaded file list and which file is the merge base (`baseFile` vs `others`).
- `useJoinConfig(files)` — per-non-base-file join key config (`{ theirKey, baseKey }`); prunes entries when a file is removed.
- `useCollections` — **global, persisted** named column sets ("collections"), saved via `window.storage` (see below), independent of any uploaded file.
- `useColumnSelection(files, collections)` — per-file column checkboxes plus the prefix-text/collection filter above them. The **single source of truth** for which columns appear in the output. Supports typing `$collection_name$` into the filter box to bulk-select a saved collection's columns (`utils/columns.js`). Prunes state for removed files via the shared `utils/state.js: pruneByKey`.
- `useOutputColumns(files, selections)` — a **derived view** over `selections`: the output-column list comes straight from the selection (no separate copy). Only renaming/reordering/prefix-suffix live here, as transient overlays (`renameOverlay`, `orderPrefs`) on top of the derivation. Pure derivation lives in `utils/outputColumns.js: buildOutputCols` (the test surface). Reordering survives later selection changes.
- `useMerge(step, baseFile, others, outputCols, joinConfig)` — recomputes the merged result only when `step >= 4`, and drives CSV export. Returns a `Dataset` value object (see below).
- `useCollectionSidebar` — local UI-only state for the collections sidebar (list vs. create-new-collection form); calls `useCollections.createCollection` to persist.

State crosses hook boundaries only by **derivation**, never by hand-wired write-back: `useOutputColumns` reads `selections` one-way, so there is no sync code to maintain.

Merge semantics (`utils/csv.js: computeMerge`): returns a **`Dataset`** value object (`utils/dataset.js`) — the single seam between the merge engine and its consumers (preview, CSV export, TSV copy, quality report). The dataset owns an ordered `columns` list and `rows` **keyed by stable column id** (`${fileId}::${column}`), never by display label — so two output columns may share a label without overwriting each other (see ADR-0001). Join type is `left` (default), `inner`, or `outer` (full outer). The base file's rows are always the output row set for left/inner; outer additionally appends unmatched rows from other files. For each `other` file, its rows are indexed into a `Map` keyed by `theirKey`; duplicate keys keep only the first row and emit a warning. Missing join config for a file leaves its columns blank in the output with a warning, rather than failing. The dataset also emits a warning when two output columns share a display label.

### The storage adapter

`useCollections(storage)` takes the storage adapter as an argument (threaded from `main.jsx`), so the hook is testable through its interface — no global reach. The async load/persist logic lives in `utils/collectionsStore.js: createCollectionsStore(storage)`, which is the test surface (pure-ish, no React). `main.jsx` picks the adapter: it prefers the host environment's `window.storage` if present (the app was prototyped against such a host), else falls back to `storage/localStorageAdapter.js`. The adapter contract is `get(key) → { value } | null` and `set(key, value) → true` (the collections store calls them with a `false` second arg for host-env scope compatibility; the localStorage adapter ignores it). If you touch persistence, keep the adapter contract intact and keep `main.jsx`'s "prefer host, fall back to localStorage" wiring.

### Other notes

- `styles.js` exports a single `CSS` template-literal string injected via a `<style>` tag in `CsvMergeWorkbench.jsx` — there is no CSS-in-JS library or separate stylesheet.
- IDs for files/collections/output-columns are generated by `utils/ids.js: nextId()` (a module-level counter + timestamp), not UUIDs.
- Files with `// @ts-nocheck` (`main.jsx`) are plain JS but annotated to suppress false-positive DOM typing on the `window.storage` host-env read — this is not a TypeScript project overall. (`useCollections.js` previously carried the same annotation but no longer reaches `window.storage`, so it was removed.)
