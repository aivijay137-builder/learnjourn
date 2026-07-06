# Research: Log Learning Entry

All technical choices were specified directly by the user; no
`NEEDS CLARIFICATION` markers remained from the plan's Technical Context.
This document records the decisions and rationale for future reference.

## Decision: Node.js CLI, no framework

**Rationale**: Single-user personal tool. A CLI needs no UI framework,
routing, or build step. Node's standard library is sufficient for argument
parsing, file I/O, and testing — adding a framework (yargs/commander) or a
web stack would violate Simplicity & YAGNI (constitution Principle IV)
without a demonstrated need.

**Alternatives considered**:
- Web app (local server + browser UI) — rejected: adds a server process,
  routing, and UI framework for no functional gain over a CLI for a
  single, keyboard-comfortable user.
- Python — equally simple, but Node.js was the user's explicit choice.

## Decision: JSON Lines (JSONL) flat file for storage

**Rationale**: Append-only writes are simple and crash-safe (no partial
file rewrites). Each line is an independently parseable JSON object, so
corrections can be appended as new lines referencing the original entry
rather than mutating history in place — directly matching the constitution's
Data Requirements ("entries are immutable once a day has passed, except for
explicit corrections, which MUST be timestamped").

**Alternatives considered**:
- SQLite — more capable (indexing, queries) but adds a dependency and
  schema migrations for a dataset that will realistically stay in the
  hundreds-to-low-thousands of rows. Rejected per YAGNI; can be revisited
  if scale ever demands it.
- Single JSON array file — rejected: every write requires rewriting the
  entire file, which is both slower and riskier (a crash mid-write can
  corrupt the whole history instead of just the last line).

## Decision: `node:test` as the test runner

**Rationale**: Ships with Node.js — zero additional dependency, satisfies
constitution Principle IV, and is sufficient for unit-testing validation and
aggregation logic (Principle V).

**Alternatives considered**:
- Jest/Vitest — richer DX but an unnecessary dependency for this project's
  size and the constitution's zero-dependency constraint.

## Decision: Data file location `~/.learnjournal/entries.jsonl`

**Rationale**: Keeps personal data in the user's home directory, independent
of wherever the project source code lives, and outside version control. An
env var override (`LEARNJOURNAL_DATA_DIR`) keeps tests hermetic without
touching the user's real data.

**Alternatives considered**:
- Project-local `data/` folder — rejected: would risk being accidentally
  committed to git and ties personal journal data to wherever the source
  happens to be checked out.
