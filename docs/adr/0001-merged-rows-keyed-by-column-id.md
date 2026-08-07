# ADR-0001: Merged rows are keyed by column id, not by display label

- **Status**: Accepted
- **Date**: 2026-08-07
- **Decides**: the internal shape of a merged `Dataset`

## Context

The merge engine (`computeMerge`) builds the output rows the user previews,
exports, copies as TSV, and analyzes in the data-quality report. Until this
decision, each row was a plain object keyed by the output column's **display
label** — resolved at every read site as `oc.outputName || oc.column`.

That representation had a latent data-loss bug. An output column's label defaults
to its original column name, so when two selected columns from different files
shared a name (e.g. both `name`), both wrote to the same key `out["name"]`. The
second silently overwrote the first. The cell value disappeared **and** the
exported CSV collapsed to a single `name` header — no warning was emitted.

This was surfaced while deepening the merge engine into a `Dataset` value object
(see `CONTEXT.md`), where the row schema needed a single owner rather than being
re-derived across nine call sites.

## Decision

Merged rows are **keyed by the output column's stable id**
(`${fileId}::${column}`), not by its display label. Display labels live only on
the `Dataset.columns` list. Concretely, the `Dataset` module owns:

- `columns` — ordered `[{ id, label, fileId, fileName, originalColumn }]`
- `rows` — `[{ [columnId]: value }]`, one entry per output row
- `cell(row, columnId)` and `toMatrix()` accessors

Two output columns may therefore share a label without colliding: they occupy
distinct keys. Both survive into the preview, the exported CSV, the TSV copy,
and the quality report. The `Dataset` emits a warning when duplicate labels are
present so the behavior is visible, not silent.

The single place that knows `label = outputName || oc.column` is the
`columnsFromOutputCols` helper inside `dataset.js`.

## Consequences

**Positive**

- Duplicate output labels no longer drop data — the bug is fixed.
- The row schema has one owner (`Dataset`); consumers read a stable interface
  instead of re-deriving keys, which removes nine duplicated resolution sites.
- `Dataset` is pure JS with no DOM or React dependency, giving the project its
  first real unit-testable surface (see `dataset.test.js`, `csv.test.js`).

**Negative**

- Merged rows are no longer addressable by display name from outside the module.
  Consumers must go through `Dataset.columns` / `cell()` / `toMatrix()` rather
  than reading `row[label]` directly. This is intentional — direct label access
  was the source of the collision.

**User-visible behavior change**: an export may now contain a column that
previously vanished (when two selected columns shared a name). This is correct
behavior, not a regression — the data was always meant to be there.

## Alternatives considered

- **Detect the collision and warn, but keep name-keyed rows.** Rejected: the
  data would still be lost; making the bug visible doesn't fix it.
- **Auto-disambiguate labels** (e.g. suffix `name`, `name (2)`). Rejected: it
  would alter the names the user explicitly set in step 3. Honoring chosen
  labels and warning is the less surprising behavior.
- **Pure positional rows** (`rows[i] = [v0, v1, …]`). Rejected: every consumer
  would have to zip against the column list, losing O(1) lookup by id.

## Notes for future explorers

Do not "fix" duplicate labels by keying rows on label again — that reintroduces
silent data loss. If a unique-header guarantee is ever required at export time,
add it as a post-processing step over `Dataset.toMatrix()`, not by changing the
row keying.
