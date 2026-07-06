# Feature Specification: Log Learning Entry

**Feature Branch**: `001-log-learning-entry`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "A way to keep track of what I learned every day, how much time I spent in active learning, and from which resource/reference/link I learned from."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record a Learning Entry (Priority: P1)

As a learner, I want to quickly record what I learned today, how long I actively
spent learning it, and where I learned it from, so that I build a running record
of my learning without it becoming a chore.

**Why this priority**: This is the core value of learnjournal — without fast,
reliable capture, there is no journal. Every other capability depends on entries
existing.

**Independent Test**: Can be fully tested by creating one entry with a topic,
duration, and resource, and confirming it is saved and retrievable. Delivers
value on its own as a single day's record.

**Acceptance Scenarios**:

1. **Given** no entry exists for today, **When** the user records a topic,
   duration, and resource, **Then** the entry is saved and associated with
   today's date.
2. **Given** the user omits a resource, **When** they try to save the entry,
   **Then** the system rejects the save and prompts for a resource.
3. **Given** the user omits a topic, **When** they try to save the entry,
   **Then** the system rejects the save and prompts for a topic.
4. **Given** the user has already logged one entry today, **When** they log a
   second entry the same day, **Then** both entries are saved separately.

---

### User Story 2 - Review Learning History (Priority: P2)

As a learner, I want to look back at everything I've logged, so that I can see
what I've studied and find the resource I used for a past topic again.

**Why this priority**: Capture alone has limited value until the learner can
retrieve what they logged; this turns the log into a usable reference.

**Independent Test**: Can be fully tested by creating multiple entries across
different days and confirming they can all be viewed, most recent first,
without needing any other feature.

**Acceptance Scenarios**:

1. **Given** multiple entries exist across several days, **When** the user
   views their history, **Then** entries are listed with date, topic, resource,
   and duration, ordered most recent first.
2. **Given** no entries exist yet, **When** the user views their history,
   **Then** the system shows an empty state rather than an error.

---

### User Story 3 - See Total Time Invested (Priority: P3)

As a learner, I want to see how much total time I've spent actively learning,
so that I can stay motivated and notice patterns in my learning habits.

**Why this priority**: A nice-to-have reflection layer on top of raw entries;
valuable but not required for the journal to function.

**Independent Test**: Can be fully tested by creating entries with known
durations and confirming the displayed total matches the sum, independent of
history browsing or entry creation UI.

**Acceptance Scenarios**:

1. **Given** several entries with recorded durations, **When** the user views
   their summary, **Then** the total time shown equals the sum of all entry
   durations.

---

### Edge Cases

- What happens when a user tries to save an entry with a duration of zero or a
  negative number? System MUST reject it as invalid.
- How does the system handle a user correcting a past entry (e.g., wrong
  duration) after the day has passed? The correction MUST be saved with its
  own timestamp rather than silently overwriting history (per project
  constitution).
- What happens when the resource is not a URL but a book title, person, or
  offline reference? The system MUST accept free-text resources, not just
  links.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the user to create a learning entry consisting
  of a date, topic, resource/reference, and duration in minutes.
- **FR-002**: System MUST default an entry's date to today if the user does not
  specify one.
- **FR-003**: System MUST reject saving an entry that has no topic.
- **FR-004**: System MUST reject saving an entry that has no resource/reference.
- **FR-005**: System MUST reject saving an entry with a duration that is zero,
  negative, or non-numeric.
- **FR-006**: System MUST allow an entry's resource to be free text (a link,
  book title, person, or any other reference), not only a URL.
- **FR-007**: System MUST allow an optional free-text note on any entry.
- **FR-008**: System MUST allow the user to record more than one entry on the
  same date.
- **FR-009**: Users MUST be able to view all past entries ordered by date, most
  recent first.
- **FR-010**: Users MUST be able to view the total time spent across all
  logged entries.
- **FR-011**: System MUST allow a past entry to be corrected, and MUST record
  the correction with its own timestamp rather than overwriting the original
  silently.

### Key Entities

- **Learning Entry**: A single record of one learning session. Attributes:
  date, topic, resource/reference, duration (minutes), optional notes, and a
  created/corrected timestamp for audit purposes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log a complete entry (topic, resource, duration) in
  under 60 seconds.
- **SC-002**: 100% of saved entries include both a topic and a resource — the
  system allows no entry to be saved without them.
- **SC-003**: A user can retrieve any past entry's resource and duration by
  browsing history, without needing to remember it themselves.
- **SC-004**: A user can view their cumulative learning time at any point
  without manually adding up individual entries.

## Assumptions

- Single user, no accounts or authentication required.
- Entries persist locally between sessions; no cloud sync is in scope for v1.
- No reminders, notifications, or scheduling are in scope for v1.
- Topic categorization/tagging beyond a single free-text topic field is out of
  scope for v1 (may be revisited later per Simplicity & YAGNI).
- "Active learning" time is self-reported by the user, not tracked
  automatically (per constitution Principle II).
