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

## Mobile Sheet View

A separate, view-only mobile page lives at the repo root
(`index.html`, `styles.css`, `app.js`, `csv-parser.js`, `sheet-data.js`).
It is independent of the CLI above — it reads a Google Sheet, not
`~/.learnjournal/entries.jsonl`.

### 1. Create the Google Sheet

Create a sheet with this exact header row: `Date, Topic, Resource, Minutes`.
Add one row per learning entry underneath.

### 2. Publish it as CSV

In Google Sheets: File → Share → Publish to web → select the sheet →
format **Comma-separated values (.csv)** → Publish. Copy the URL it
gives you.

### 3. Point the page at your sheet

Open `app.js` and replace the `CSV_URL` constant near the top with the
URL you just copied. Then commit:

```bash
git add app.js
git commit -m "chore: point mobile view at published Sheet CSV"
```

### 4. Push to GitHub and enable Pages

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

Then on GitHub: Settings → Pages → Source → Deploy from a branch →
branch `main`, folder `/ (root)` → Save.

### 5. View it on your phone

Visit `https://<your-username>.github.io/<your-repo>/` — bookmark it
for quick access. The page re-fetches the Sheet's published CSV every
time it's opened, so edits to the Sheet show up within a few minutes
(Google's own publish-to-web refresh interval), with no further action
needed on your part.
