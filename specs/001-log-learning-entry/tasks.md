---
description: "Task list for Log Learning Entry"
---

# Tasks: Log Learning Entry

**Input**: Design documents from `specs/001-log-learning-entry/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-interface.md, research.md, quickstart.md

**Tests**: Included — the project constitution (Principle V, NON-NEGOTIABLE)
requires tests written before implementation for validation and aggregation
logic.

**Organization**: Tasks are grouped by user story (US1/US2/US3 from spec.md)
to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repository root

## Path Conventions

Single project: `src/`, `tests/` at repository root (per plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization

- [X] T001 Create directories `src/commands/`, `src/models/`, `src/services/`, `tests/unit/`, `tests/integration/`
- [X] T002 Create `package.json` at repo root: name `learnjournal`, `bin.learnjournal` → `src/cli.js`, `engines.node` → `>=20`, no dependencies
- [X] T003 [P] Add a `#!/usr/bin/env node` shebang to `src/cli.js` (empty stub file for now)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and infrastructure every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Write unit tests for Entry validation rules (non-empty `topic`/`resource`, `minutes` > 0 and numeric, valid `YYYY-MM-DD` `date`) in `tests/unit/entry.test.js`, per data-model.md — tests MUST fail before T005
- [X] T005 Implement Entry model + validation in `src/models/entry.js` to make T004 pass
- [X] T006 [P] Implement JSON Lines store service (`append(entry)`, `readAll()`, resolves path from `LEARNJOURNAL_DATA_DIR` env var or defaults to `~/.learnjournal/entries.jsonl`, creates the directory/file if missing) in `src/services/store.js`
- [X] T007 [P] Write unit tests for effective-entries resolution and total aggregation (a correction supersedes its original by `correctionOf`, `totalMinutes`/`entryCount` sums) in `tests/unit/stats.test.js`, per data-model.md — tests MUST fail before T008
- [X] T008 Implement `resolveEffectiveEntries(rawEntries)` and `aggregate(effectiveEntries)` in `src/services/stats.js` to make T007 pass
- [X] T009 Implement CLI argument parser and command dispatcher skeleton (routes `log`/`list`/`total`/`correct` subcommands; unknown command prints usage to stderr and exits 1) in `src/cli.js` (depends on T005, T006, T008)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Record a Learning Entry (Priority: P1) 🎯 MVP

**Goal**: A user can log a complete learning entry in one command, with
invalid entries rejected before anything is saved, and can correct a past
entry without erasing its history.

**Independent Test**: Run `learnjournal log --topic ... --resource ... --minutes ...` and confirm the entry is saved; run it missing a required field and confirm it's rejected with nothing written; run `learnjournal correct <id> --minutes ...` and confirm a new corrected record is appended. Matches quickstart.md scenarios 1, 2, and 5.

### Tests for User Story 1

- [X] T010 [P] [US1] Integration test: `log` creates an entry and prints its id (exit 0); `log` missing `--topic`, missing `--resource`, and non-numeric/zero `--minutes` are each rejected (exit 1, nothing appended to the store) in `tests/integration/cli.test.js` — MUST fail before T012
- [X] T011 [P] [US1] Integration test: `correct <id>` appends a correction that carries forward unspecified fields; `correct` with an unknown id or no fields given fails (exit 1) in `tests/integration/cli.test.js` — MUST fail before T013

### Implementation for User Story 1

- [X] T012 [US1] Implement `log` command (parse `--topic`, `--resource`, `--minutes`, optional `--date` defaulting to today, optional `--notes`; validate via `src/models/entry.js`; on success call `store.append` and print the new id; on failure print the specific invalid field to stderr and write nothing) in `src/commands/log.js`
- [X] T013 [US1] Implement `correct` command (positional `<id>`, at least one of `--topic`/`--resource`/`--minutes`/`--notes` required; look up the original via `store.readAll`, merge changed fields over it, validate, append with `correctionOf` set to `<id>`; error if `<id>` not found or no fields given) in `src/commands/correct.js`
- [X] T014 [US1] Wire `log` and `correct` commands into the dispatcher in `src/cli.js`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Review Learning History (Priority: P2)

**Goal**: A user can see every entry they've logged, most recent first, with
corrections shown in place of their originals.

**Independent Test**: Log entries across several days (including one
correction), run `learnjournal list`, and confirm ordering, fields, and that
the corrected value (not the original) is shown. With no entries logged,
confirm an empty-state message instead of an error. Matches quickstart.md
scenario 3.

### Tests for User Story 2

- [X] T015 [P] [US2] Integration test: `list` prints effective entries (date, topic, resource, minutes) most-recent-first, reflecting corrections; `list` with zero entries prints a friendly empty-state message (exit 0) in `tests/integration/cli.test.js` — MUST fail before T016

### Implementation for User Story 2

- [X] T016 [US2] Implement `list` command (read via `store.readAll`, resolve via `stats.resolveEffectiveEntries`, sort most-recent-first by `date`, print one line per entry or the empty-state message) in `src/commands/list.js`
- [X] T017 [US2] Wire `list` command into the dispatcher in `src/cli.js`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - See Total Time Invested (Priority: P3)

**Goal**: A user can see their cumulative active-learning minutes across all
logged entries at a glance.

**Independent Test**: Log entries with known durations (including a
correction), run `learnjournal total`, and confirm the printed total equals
the sum of effective entries' minutes. Matches quickstart.md scenario 4.

### Tests for User Story 3

- [X] T018 [P] [US3] Integration test: `total` prints the sum of effective entries' minutes (post-correction), and `0` when no entries exist, in `tests/integration/cli.test.js` — MUST fail before T019

### Implementation for User Story 3

- [X] T019 [US3] Implement `total` command (read via `store.readAll`, resolve via `stats.resolveEffectiveEntries`, compute via `stats.aggregate`, print total minutes plus an hours/minutes breakdown) in `src/commands/total.js`
- [X] T020 [US3] Wire `total` command into the dispatcher in `src/cli.js`

**Checkpoint**: All three user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 [P] Add `learnjournal --help` / `-h` output listing all commands and flags, matching contracts/cli-interface.md, in `src/cli.js`
- [X] T022 [P] Add a `README.md` at repo root with install (`npm link`) and usage instructions
- [X] T023 Run `node --test` and confirm all unit and integration tests pass
- [X] T024 Manually run through every scenario in `specs/001-log-learning-entry/quickstart.md` and confirm expected output matches actual output

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends only on Foundational
- **User Story 2 (Phase 4)**: Depends only on Foundational (not on US1)
- **User Story 3 (Phase 5)**: Depends only on Foundational (not on US1/US2)
- **Polish (Phase 6)**: Depends on whichever user stories are in scope for the release

### Within Each User Story

- Tests (T010/T011, T015, T018) MUST be written and FAIL before their
  corresponding implementation tasks
- Command implementation before dispatcher wiring

### Parallel Opportunities

- T004 and T006 and T007 can run in parallel (different files, no
  dependencies on each other)
- T010 and T011 can run in parallel (same test file, but independent test
  cases with no shared state)
- Once Phase 2 (Foundational) is complete, Phases 3, 4, and 5 (US1, US2, US3)
  can be implemented in any order or in parallel — none depends on another
- T021 and T022 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch independent foundational tasks together:
Task: "Write unit tests for Entry validation in tests/unit/entry.test.js"
Task: "Implement JSON Lines store service in src/services/store.js"
Task: "Write unit tests for effective-entries resolution in tests/unit/stats.test.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks everything)
3. Complete Phase 3: User Story 1 (log + correct)
4. **STOP and VALIDATE**: run quickstart.md scenarios 1, 2, and 5
5. This alone is a usable journal — a user can log and correct entries

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 (log/correct) → validate → usable MVP
3. Add US2 (list) → validate → user can review history
4. Add US3 (total) → validate → user can see cumulative time
5. Polish (help text, README, full quickstart pass)

## Notes

- [P] tasks touch different files or independent test cases with no
  dependencies
- Each user story is independently completable and testable per its
  Independent Test description above
- Verify tests fail before implementing (Principle V, NON-NEGOTIABLE)
- Commit after each task or logical group
