# Implementation Plan: Log Learning Entry

**Branch**: `001-log-learning-entry` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-log-learning-entry/spec.md`

## Summary

Give the user a single command to log a day's learning (topic, resource,
minutes spent, optional notes), plus commands to review history and see total
time invested. Implemented as a dependency-free Node.js CLI that appends
entries to a local JSON Lines file — no server, no database, no accounts.

## Technical Context

**Language/Version**: Node.js (LTS, v20+; developed against v24)

**Primary Dependencies**: None — Node.js standard library only (`node:fs`,
`node:path`, `node:os`, `node:crypto`, `node:test`)

**Storage**: Local JSON Lines file, one JSON object per line, at
`~/.learnjournal/entries.jsonl` (overridable via `LEARNJOURNAL_DATA_DIR` env
var for testing/portability)

**Testing**: Node's built-in test runner (`node:test` + `node:assert`) — no
external test framework

**Target Platform**: Cross-platform CLI, anywhere Node.js runs (Windows,
macOS, Linux)

**Project Type**: Single project — CLI tool

**Performance Goals**: Every command completes in well under 1 second for a
single user's realistic entry volume (up to a few thousand entries)

**Constraints**: Fully offline; no network calls; zero external npm
dependencies (per constitution Simplicity & YAGNI)

**Scale/Scope**: Single user, expected low hundreds of entries per year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Frictionless Daily Capture | Single CLI command (`learnjournal log ...`) with flags for all required fields; no multi-step wizard | PASS |
| II. Honest Time Accounting | Duration is an explicit required `--minutes` flag; nothing is auto-inferred | PASS |
| III. Source Traceability | `--resource` is a required flag; save is rejected without it | PASS |
| IV. Simplicity & YAGNI | Zero external dependencies, single flat-file store, no server/db/accounts | PASS |
| V. Test-First for Core Logic | Validation and aggregation logic (`services/`) get `node:test` tests written before implementation in the tasks phase | PASS |

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-log-learning-entry/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── cli.js                 # Entry point; parses argv, dispatches to commands
├── commands/
│   ├── log.js              # `learnjournal log` — create an entry
│   ├── list.js              # `learnjournal list` — view history
│   ├── total.js             # `learnjournal total` — aggregate time
│   └── correct.js           # `learnjournal correct` — correct a past entry
├── models/
│   └── entry.js             # Entry shape + validation rules
└── services/
    ├── store.js             # Read/append JSON Lines file
    └── stats.js             # Aggregation (totals, ordering)

tests/
├── unit/
│   ├── entry.test.js        # Validation rules (FR-003..FR-006, FR-011)
│   └── stats.test.js        # Aggregation logic (FR-010)
└── integration/
    └── cli.test.js          # End-to-end: log → list → total → correct
```

**Structure Decision**: Single project (Option 1). This is a standalone CLI
tool with no frontend/backend split and no separate deployable API, so the
default single-project layout applies directly.

## Complexity Tracking

*No violations — table intentionally empty.*
