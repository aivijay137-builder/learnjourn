# Quickstart: Log Learning Entry

## Prerequisites

- Node.js v20+ installed and on `PATH`
- No other dependencies (zero npm packages)

## Setup

```bash
node src/cli.js --help
```

(No `npm install` step — the CLI uses only Node's standard library.)

## Validation Scenarios

Run these against the CLI to confirm the feature works end-to-end. Use a
scratch data directory so this doesn't touch real journal data:

```bash
export LEARNJOURNAL_DATA_DIR=/tmp/learnjournal-quickstart
```

### 1. Record an entry (US1)

```bash
node src/cli.js log --topic "Node streams" --resource "https://nodejs.org/api/stream.html" --minutes 25
```

**Expected**: prints a new entry id and confirmation; exit code `0`.

### 2. Reject an entry missing a resource (US1, FR-004)

```bash
node src/cli.js log --topic "Node streams" --minutes 25
```

**Expected**: error to stderr naming `resource`; exit code `1`; `list` count
unchanged.

### 3. View history (US2)

```bash
node src/cli.js list
```

**Expected**: shows the entry from step 1, most recent first.

### 4. View total time (US3)

```bash
node src/cli.js log --topic "CLI arg parsing" --resource "MDN" --minutes 15
node src/cli.js total
```

**Expected**: total shows 40 minutes (25 + 15) across 2 entries.

### 5. Correct a past entry (FR-011)

```bash
node src/cli.js correct <id-from-step-1> --minutes 30
node src/cli.js total
```

**Expected**: total now reflects 30 + 15 = 45 minutes; `list` shows the
corrected duration for that entry, and the original 25-minute record is
still present in the underlying file for audit purposes (see
[data-model.md](./data-model.md#derived-view-effective-entries)).

## Automated Tests

```bash
node --test
```

**Expected**: all unit tests (`entry.test.js`, `stats.test.js`) and the
integration test (`cli.test.js`) pass.

See [contracts/cli-interface.md](./contracts/cli-interface.md) for the full
command reference.
