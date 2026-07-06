# CLI Interface Contract: learnjournal

## `learnjournal log`

Create a new learning entry.

```text
learnjournal log --topic <text> --resource <text> --minutes <number> [--date YYYY-MM-DD] [--notes <text>]
```

- **Required**: `--topic`, `--resource`, `--minutes`
- **Optional**: `--date` (defaults to today), `--notes`
- **Success**: prints the created entry's `id` and a one-line confirmation;
  exit code `0`
- **Failure** (missing/invalid required field): prints a specific error to
  stderr naming the offending field; exit code `1`; nothing is written to
  the store (FR-003, FR-004, FR-005)

## `learnjournal list`

Show past entries, most recent first.

```text
learnjournal list [--limit <number>]
```

- **Success**: prints each effective entry's date, topic, resource, and
  minutes, one per line, most recent first (FR-009); exit code `0`
- **Empty state**: if no entries exist, prints a friendly "no entries yet"
  message rather than an error; exit code `0`

## `learnjournal total`

Show cumulative time invested.

```text
learnjournal total
```

- **Success**: prints total minutes (and a human-readable hours/minutes
  breakdown) across all effective entries (FR-010); exit code `0`

## `learnjournal correct <id>`

Correct a past entry without erasing its original record.

```text
learnjournal correct <id> [--topic <text>] [--resource <text>] [--minutes <number>] [--notes <text>]
```

- **Required**: `<id>` (positional) and at least one field to change
- **Success**: appends a new entry with `correctionOf` set to `<id>`,
  carrying forward any unspecified fields from the original; exit code `0`
  (FR-011)
- **Failure** (`<id>` not found, or no fields given): prints an error to
  stderr; exit code `1`

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error or not-found error |
