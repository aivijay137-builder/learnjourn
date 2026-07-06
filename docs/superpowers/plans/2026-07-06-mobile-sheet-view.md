# Mobile Sheet View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user view their Google-Sheet-based learning log (total time + most-recent-first entry list) on their phone from anywhere, via a static page hosted on GitHub Pages that fetches the Sheet's published CSV directly.

**Architecture:** A published-to-web Google Sheet CSV is fetched client-side by a static page (`index.html` + `styles.css` + `app.js`), parsed by a small dependency-free CSV parser, mapped into entry objects, and rendered as a mobile-responsive summary + list. No backend, no build step, no sync job.

**Tech Stack:** Plain HTML/CSS/vanilla JS (browser), Node's built-in `node:test` for the two pure-logic modules. Zero npm dependencies, consistent with the existing CLI.

## Global Constraints

- Zero external dependencies (no npm packages, no build step) — matches constitution Principle IV (Simplicity & YAGNI).
- This system is entirely separate from `src/` (the CLI) and must not read/write `~/.learnjournal/entries.jsonl`.
- Public visibility is acceptable — no auth/login system.
- Repository is public on GitHub, hosted via GitHub Pages, `Deploy from branch: main, / (root)`.
- Content scope for v1: total time summary + most-recent-first entry list only — no charts/streaks.
- Files live at the repository root (per the approved design): `index.html`, `styles.css`, `app.js`, plus `csv-parser.js` and `sheet-data.js` (split out from `app.js` specifically so the parsing/mapping logic is unit-testable with `node:test` without a DOM).

---

## File Structure

- **Create** `csv-parser.js` — pure CSV tokenizer: `parseCSV(text) -> string[][]`. No dependencies on the DOM or on `sheet-data.js`.
- **Create** `sheet-data.js` — pure data mapping: `rowsToEntries(rows) -> { entries, skippedCount }` and `computeTotalMinutes(entries) -> number`. Consumes the row-array shape `parseCSV` produces, but does not call it directly (kept decoupled — `app.js` wires them together).
- **Create** `app.js` — browser-only glue: fetches `CSV_URL`, calls `parseCSV` then `rowsToEntries`/`computeTotalMinutes` (loaded as globals via `<script>` tags, not `require`), and renders the DOM.
- **Create** `index.html` — page shell, loads `styles.css`, then `csv-parser.js`, `sheet-data.js`, `app.js` in that order.
- **Create** `styles.css` — mobile-first responsive styling.
- **Create** `tests/unit/csv-parser.test.js`, `tests/unit/sheet-data.test.js`.
- **Modify** `README.md` — add a "Mobile Sheet View" section with exact setup/deploy steps.

Both `csv-parser.js` and `sheet-data.js` use the UMD-lite pattern (`if (typeof module !== "undefined" && module.exports) module.exports = {...}`) so the same file works as a plain `<script>` global in the browser and as a `require()`-able module in `node:test`, with no bundler.

---

## Task 1: CSV Parser

**Files:**
- Create: `csv-parser.js`
- Test: `tests/unit/csv-parser.test.js`

**Interfaces:**
- Produces: `parseCSV(text: string) -> string[][]` — one array per non-blank row, each cell a string with quotes/escaping resolved. Used by `app.js` in Task 3.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/csv-parser.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCSV } = require("../../csv-parser.js");

test("parseCSV parses a simple well-formed CSV", () => {
  const rows = parseCSV("Date,Topic,Resource,Minutes\n2026-01-01,Node streams,MDN,25\n");
  assert.deepEqual(rows, [
    ["Date", "Topic", "Resource", "Minutes"],
    ["2026-01-01", "Node streams", "MDN", "25"],
  ]);
});

test("parseCSV handles a quoted field containing a comma", () => {
  const rows = parseCSV(
    'Date,Topic,Resource,Minutes\n2026-01-01,"Streams, buffers, and pipes",MDN,25\n',
  );
  assert.deepEqual(rows[1], ["2026-01-01", "Streams, buffers, and pipes", "MDN", "25"]);
});

test("parseCSV handles an escaped quote inside a quoted field", () => {
  const rows = parseCSV('Date,Topic,Resource,Minutes\n2026-01-01,"Say ""hi""",MDN,10\n');
  assert.deepEqual(rows[1], ["2026-01-01", 'Say "hi"', "MDN", "10"]);
});

test("parseCSV skips trailing blank lines", () => {
  const rows = parseCSV("Date,Topic,Resource,Minutes\n2026-01-01,X,Y,10\n\n\n");
  assert.equal(rows.length, 2);
});

test("parseCSV handles CRLF line endings", () => {
  const rows = parseCSV("Date,Topic,Resource,Minutes\r\n2026-01-01,X,Y,10\r\n");
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], ["2026-01-01", "X", "Y", "10"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/unit/csv-parser.test.js`
Expected: FAIL with `Cannot find module '../../csv-parser.js'`

- [ ] **Step 3: Write minimal implementation**

Create `csv-parser.js`:

```js
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      pushField();
      pushRow();
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return rows;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseCSV };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/unit/csv-parser.test.js`
Expected: PASS (5 tests, 0 failures)

- [ ] **Step 5: Commit**

```bash
git add csv-parser.js tests/unit/csv-parser.test.js
git commit -m "feat: add dependency-free CSV parser for mobile sheet view"
```

---

## Task 2: Sheet Data Mapping

**Files:**
- Create: `sheet-data.js`
- Test: `tests/unit/sheet-data.test.js`

**Interfaces:**
- Consumes: nothing from Task 1 directly (tested with literal `string[][]` fixtures matching what `parseCSV` produces).
- Produces: `rowsToEntries(rows: string[][]) -> { entries: Array<{date: string, topic: string, resource: string, minutes: number}>, skippedCount: number }` and `computeTotalMinutes(entries) -> number`. Both used by `app.js` in Task 3.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/sheet-data.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { rowsToEntries, computeTotalMinutes } = require("../../sheet-data.js");

const HEADER = ["Date", "Topic", "Resource", "Minutes"];

test("rowsToEntries skips the header row", () => {
  const { entries } = rowsToEntries([HEADER, ["2026-01-01", "X", "Y", "10"]]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].topic, "X");
});

test("rowsToEntries includes a row with invalid minutes, flagged with minutes: null, excluded from the total", () => {
  const { entries, skippedCount } = rowsToEntries([
    HEADER,
    ["2026-01-01", "X", "Y", "not-a-number"],
    ["2026-01-02", "Z", "W", "20"],
  ]);
  assert.equal(entries.length, 2);
  const invalid = entries.find((e) => e.topic === "X");
  assert.equal(invalid.minutes, null);
  assert.equal(skippedCount, 0);
  assert.equal(computeTotalMinutes(entries), 20);
});

test("rowsToEntries skips a row missing a required field and counts it", () => {
  const { entries, skippedCount } = rowsToEntries([
    HEADER,
    ["2026-01-01", "", "Y", "10"],
  ]);
  assert.equal(entries.length, 0);
  assert.equal(skippedCount, 1);
});

test("rowsToEntries sorts most-recent-first", () => {
  const { entries } = rowsToEntries([
    HEADER,
    ["2026-01-01", "Old", "R1", "10"],
    ["2026-01-03", "Newest", "R2", "15"],
    ["2026-01-02", "Middle", "R3", "20"],
  ]);
  assert.deepEqual(
    entries.map((e) => e.topic),
    ["Newest", "Middle", "Old"],
  );
});

test("rowsToEntries reverses same-day ties so the later sheet row appears first", () => {
  const { entries } = rowsToEntries([
    HEADER,
    ["2026-01-01", "Morning session", "R1", "10"],
    ["2026-01-01", "Evening session", "R2", "15"],
  ]);
  assert.deepEqual(
    entries.map((e) => e.topic),
    ["Evening session", "Morning session"],
  );
});

test("computeTotalMinutes sums minutes across entries", () => {
  assert.equal(computeTotalMinutes([{ minutes: 10 }, { minutes: 15 }]), 25);
});

test("computeTotalMinutes returns 0 for an empty list", () => {
  assert.equal(computeTotalMinutes([]), 0);
});

test("computeTotalMinutes treats invalid (null) minutes as 0", () => {
  assert.equal(computeTotalMinutes([{ minutes: 10 }, { minutes: null }]), 10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/unit/sheet-data.test.js`
Expected: FAIL with `Cannot find module '../../sheet-data.js'`

- [ ] **Step 3: Write minimal implementation**

Create `sheet-data.js`:

```js
function parseDateForSort(dateStr) {
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

function rowsToEntries(rows) {
  const dataRows = rows.length > 0 ? rows.slice(1) : [];
  const entries = [];
  let skippedCount = 0;

  // Iterate in reverse so that, after the stable sort below, entries
  // sharing the same date keep the later sheet row first.
  for (let i = dataRows.length - 1; i >= 0; i -= 1) {
    const [date, topic, resource, minutesRaw] = dataRows[i];

    if (!date || !topic || !resource) {
      // Missing a required text field — nothing sensible to display.
      skippedCount += 1;
      continue;
    }

    const parsedMinutes = Number(minutesRaw);
    const minutes =
      Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : null;

    entries.push({
      date: date.trim(),
      topic: topic.trim(),
      resource: resource.trim(),
      minutes,
    });
  }

  entries.sort((a, b) => parseDateForSort(b.date) - parseDateForSort(a.date));

  return { entries, skippedCount };
}

function computeTotalMinutes(entries) {
  return entries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { rowsToEntries, computeTotalMinutes };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/unit/sheet-data.test.js`
Expected: PASS (8 tests, 0 failures)

- [ ] **Step 5: Commit**

```bash
git add sheet-data.js tests/unit/sheet-data.test.js
git commit -m "feat: add sheet-row-to-entry mapping and total-minutes aggregation"
```

---

## Task 3: Frontend Page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

**Interfaces:**
- Consumes: `parseCSV(text) -> string[][]` (Task 1, loaded as a global via `<script>`), `rowsToEntries(rows) -> {entries, skippedCount}` and `computeTotalMinutes(entries) -> number` (Task 2, loaded as globals via `<script>`). Each entry is `{date, topic, resource, minutes: number | null}` — `minutes` is `null` when the sheet row's minutes value was missing/non-numeric/non-positive; such entries still render, flagged, but are excluded from the total.
- Produces: the rendered page. Nothing downstream depends on `app.js`.

- [ ] **Step 1: Create the page shell**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>learnjournal</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>learnjournal</h1>
    <p id="summary">Loading…</p>
    <ul id="entry-list"></ul>
  </main>
  <script src="csv-parser.js"></script>
  <script src="sheet-data.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create the stylesheet**

Create `styles.css`:

```css
:root {
  color-scheme: light dark;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

body {
  margin: 0;
  padding: 1rem;
  max-width: 640px;
  margin-inline: auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

#summary {
  font-weight: 600;
  margin-bottom: 1rem;
}

#entry-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.entry-card {
  border: 1px solid #8883;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}

.entry-date {
  font-size: 0.85rem;
  opacity: 0.7;
}

.entry-topic {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0.15rem 0;
}

.entry-meta {
  font-size: 0.9rem;
  opacity: 0.8;
  word-break: break-word;
}
```

- [ ] **Step 3: Create the app logic**

Create `app.js`. Note the `CSV_URL` constant is a smoke-test placeholder for now — Task 4 replaces it with the real published Sheet URL:

```js
// Replace with your published Google Sheet CSV URL — see README
// "Mobile Sheet View" section for how to get it.
const CSV_URL =
  "data:text/csv,Date%2CTopic%2CResource%2CMinutes%0A2026-01-01%2CTest%20topic%2CTest%20resource%2C15";

function renderEntry(entry) {
  const card = document.createElement("li");
  card.className = "entry-card";

  const dateEl = document.createElement("div");
  dateEl.className = "entry-date";
  dateEl.textContent = entry.date;

  const topicEl = document.createElement("div");
  topicEl.className = "entry-topic";
  topicEl.textContent = entry.topic;

  const metaEl = document.createElement("div");
  metaEl.className = "entry-meta";
  const minutesLabel =
    entry.minutes === null ? "⚠ invalid duration" : `${entry.minutes} min`;
  metaEl.textContent = `${minutesLabel} · ${entry.resource}`;

  card.append(dateEl, topicEl, metaEl);
  return card;
}

async function main() {
  const summaryEl = document.getElementById("summary");
  const listEl = document.getElementById("entry-list");

  let text;
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    text = await response.text();
  } catch (err) {
    summaryEl.textContent = "Couldn't load your learning log right now.";
    return;
  }

  const rows = parseCSV(text);
  const { entries, skippedCount } = rowsToEntries(rows);

  if (entries.length === 0) {
    summaryEl.textContent = "No entries yet.";
    listEl.innerHTML = "";
    return;
  }

  const total = computeTotalMinutes(entries);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const breakdown = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  let summary = `Total: ${total} minutes (${breakdown}) across ${entries.length} entries`;
  if (skippedCount > 0) {
    summary += ` — ${skippedCount} row(s) skipped (missing required fields)`;
  }
  summaryEl.textContent = summary;

  listEl.innerHTML = "";
  for (const entry of entries) {
    listEl.appendChild(renderEntry(entry));
  }
}

document.addEventListener("DOMContentLoaded", main);
```

- [ ] **Step 4: Manual smoke test with the placeholder data URL**

Run: `python -m http.server 8080` from the repository root, then open `http://localhost:8080/` in a browser.

Expected: page shows `Total: 15 minutes (15m) across 1 entries`, and one card reading `2026-01-01` / `Test topic` / `15 min · Test resource`. Stop the server with Ctrl+C when done.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat: add mobile-responsive frontend page for the sheet-backed log"
```

---

## Task 4: Sheet Setup and Deployment Instructions

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing new — this documents how a human operator (not code) wires `CSV_URL` in `app.js` (Task 3) to a real Google Sheet and deploys the three static files (Task 3) to GitHub Pages.
- Produces: nothing consumed by other tasks — this is the last task.

- [ ] **Step 1: Add the setup/deploy section to README.md**

Append this section to `README.md` (after the existing "Development" section):

```markdown
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

\`\`\`bash
git add app.js
git commit -m "chore: point mobile view at published Sheet CSV"
\`\`\`

### 4. Push to GitHub and enable Pages

\`\`\`bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
\`\`\`

Then on GitHub: Settings → Pages → Source → Deploy from a branch →
branch `main`, folder `/ (root)` → Save.

### 5. View it on your phone

Visit `https://<your-username>.github.io/<your-repo>/` — bookmark it
for quick access. The page re-fetches the Sheet's published CSV every
time it's opened, so edits to the Sheet show up within a few minutes
(Google's own publish-to-web refresh interval), with no further action
needed on your part.
```

- [ ] **Step 2: Verify the README renders sensibly**

Run: `cat README.md` (or open it in an editor) and confirm the new section reads correctly and the fenced code blocks are properly closed.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Google Sheet setup and GitHub Pages deploy instructions"
```

**Note for whoever executes this task:** actually creating the GitHub
repository, pushing to it, and enabling Pages are steps for the human
user to run (or explicitly ask their agent to run) with their own
GitHub credentials — do not attempt to create a repository, push, or
change GitHub settings on the user's behalf without their explicit
go-ahead at that specific step.
