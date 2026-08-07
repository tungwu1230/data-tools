# CONTEXT.md — domain glossary

Domain language for the **CSV 合併工作台** (CSV merge workbench). Future
architecture reviews and ADRs should use these terms; update this file when a
concept is named or sharpened.

## The merge pipeline

- **Base file (主檔)** — the file whose rows define the output row set. Other
  files are joined onto it (left join by default).
- **Other file (副檔)** — any uploaded file that is not the base. Joined onto the
  base via its **join config**.
- **Join config** — per-other-file pair `{ theirKey, baseKey }`: the column in the
  other file and the column in the base file to match on.
- **Join type** — `left` (default), `inner`, or `outer` (full outer). Determines
  which rows survive when an other file has no match.
- **Merged dataset** / **Dataset** — the value object returned by the merge
  engine. Owns the ordered **output columns** and the **merged rows**. This is
  the single seam between the merge engine and its consumers (preview, export,
  TSV copy, quality report).

## Output columns

- **Output column** — a selected column in the final output. Carries a stable
  **column id**, a source (`fileId` + `originalColumn`), and a display **label**.
- **Column id** — `${fileId}::${column}`. The stable identity of an output
  column. A merged row is keyed by column id, *not* by label, so two output
  columns may share a label without overwriting each other's data.
- **Label** — the display name of an output column. Defaults to the original
  column name; user-renamable in step 3. May be non-unique across columns.

## Selection state

- **Selection** — which columns are checked for a given file. The single source
  of truth for "what goes into the output."
- **Collection** — a persisted, named set of column names (`window.storage`),
  used to bulk-select matching columns via the `$name$` filter syntax.

## Notes for explorers

- Merged rows are **keyed by column id**, not by display label. Two output
  columns with the same label both survive; the Dataset emits a warning. This is
  intentional (see ADR if recorded) — do not "fix" it by keying on label.
