# Data Model: Log Learning Entry

## Entity: Learning Entry

Represents one recorded learning session, or a correction to a prior one.
Stored as one JSON object per line in `entries.jsonl`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUID) | yes | Generated via `crypto.randomUUID()` on creation |
| `date` | string (`YYYY-MM-DD`) | yes | Defaults to today if not specified (FR-002) |
| `topic` | string, non-empty | yes | Rejected if blank (FR-003) |
| `resource` | string, non-empty | yes | Free text: URL, book title, person, etc. (FR-004, FR-006) |
| `minutes` | number, > 0 | yes | Rejected if zero, negative, or non-numeric (FR-005) |
| `notes` | string | no | Free text, optional (FR-007) |
| `createdAt` | string (ISO 8601 timestamp) | yes | Set automatically when the line is written |
| `correctionOf` | string (UUID) | no | Present only on correction entries; references the `id` of the entry being corrected (FR-011) |

### Validation Rules

- `topic`, `resource` MUST be non-empty after trimming whitespace.
- `minutes` MUST parse as a finite number greater than 0.
- `date` MUST be a valid calendar date in `YYYY-MM-DD` form.
- A record with `correctionOf` set MUST reference an `id` that already
  exists earlier in the file.

### State / Lifecycle

- Entries are **append-only**. A normal entry is written once and never
  edited in place (constitution: "entries are immutable once a day has
  passed").
- A **correction** is a new entry with the same shape plus `correctionOf`
  set to the original entry's `id`. Readers (list/total) MUST treat the
  correction as superseding the original entry's values when both are
  present, while preserving the original line for audit history.

### Derived View: Effective Entries

When reading the file for `list` or `total`, the effective value for an
entry `id` is its most recent record (the original, or its latest
correction if one exists) — never a sum of the original plus corrections.

## Entity: Aggregate Summary

Not persisted — computed on demand from the effective entries for the
`total` command.

| Field | Type | Description |
|-------|------|--------------|
| `totalMinutes` | number | Sum of `minutes` across all effective entries |
| `entryCount` | number | Count of effective entries |
