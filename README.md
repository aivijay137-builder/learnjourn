# learnjournal

A personal CLI to track what you learned each day, how long you actively
spent learning it, and where you learned it from.

## Requirements

- Node.js v20 or later
- No other dependencies

## Install

```bash
npm link
```

This makes the `learnjournal` command available globally, backed by
`src/cli.js`. Alternatively, run it directly without installing:

```bash
node src/cli.js <command> ...
```

## Usage

```bash
# Record a learning entry
learnjournal log --topic "Node streams" --resource "https://nodejs.org/api/stream.html" --minutes 25

# Review your history, most recent first
learnjournal list

# See cumulative time invested
learnjournal total

# Correct a past entry (keeps the original for audit history)
learnjournal correct <id> --minutes 30
```

Run `learnjournal --help` for the full command reference.

## Data

Entries are stored as JSON Lines at `~/.learnjournal/entries.jsonl`. Set
`LEARNJOURNAL_DATA_DIR` to use a different location (useful for tests).

## Development

```bash
node --test
```

See [specs/001-log-learning-entry/](specs/001-log-learning-entry/) for the
full spec, plan, data model, and CLI contract behind this feature, and
[.specify/memory/constitution.md](.specify/memory/constitution.md) for the
project's governing principles.
