<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Modified principles: n/a (first adoption)
- Added sections: Core Principles (I-V), Data Requirements, Development Workflow, Governance
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (generic placeholders, Constitution Check gate references this file directly)
  - .specify/templates/spec-template.md ✅ no changes needed (generic placeholders)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic placeholders)
  - .claude/skills/speckit-*/SKILL.md ✅ no agent-specific references found requiring update
- Follow-up TODOs: none
-->

# learnjournal Constitution

## Core Principles/btw

### I. Frictionless Daily Capture
Logging a day's learning MUST take under a minute: date, topic, resource, and time
spent. Friction in capture is the primary failure mode for a personal habit-tracking
tool — every design or feature decision favors speed of entry over completeness of
features.

### II. Honest Time Accounting
Time spent MUST reflect active learning only (reading, practicing, watching,
exercises) — not passive or background time. Every entry MUST record a duration
that the user explicitly states or confirms; the system MUST NOT auto-infer or
round up time without user confirmation.

### III. Source Traceability
Every entry MUST capture the resource, reference, or link the learning came from.
An entry without at least one source reference MUST NOT be saved. This preserves
the ability to revisit material later and builds a reusable, searchable index of
resources over time.

### IV. Simplicity & YAGNI
As a single-user personal tool, the system MUST avoid speculative features
(multi-user accounts, external integrations, notification systems) until real
usage friction demonstrates the need. Start with the smallest viable data model —
date, topic, resource, duration, optional notes — and grow only from demonstrated
need.

### V. Test-First for Core Logic (NON-NEGOTIABLE)
Any logic that computes streaks, aggregates time, or validates entries MUST have
tests written before implementation, following Red-Green-Refactor. Purely
cosmetic UI/display code is exempt, but data integrity and calculation logic are
not.

## Data Requirements

Every learning entry MUST include: date, topic/subject, resource or reference
(name and/or link), and time spent in minutes. Notes are optional. Entries are
immutable once a day has passed, except for explicit corrections, which MUST be
timestamped.

## Development Workflow

This is a solo project developed via spec-driven development: each feature goes
through `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
`/speckit-implement`. There is no external PR review process, but the constitution
still governs every feature's Constitution Check gate in its plan.

## Governance

This constitution supersedes ad hoc implementation decisions. Amendments are made
by re-running `/speckit-constitution` with the desired change, and MUST include a
version bump following semantic versioning (MAJOR: incompatible principle removal
or redefinition; MINOR: new principle or materially expanded guidance; PATCH:
wording/clarification only) plus an updated Sync Impact Report. All feature plans
MUST verify compliance with these principles at their Constitution Check gate;
unjustifiable complexity must be simplified or explicitly justified in the plan's
Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-07-05 | **Last Amended**: 2026-07-05
