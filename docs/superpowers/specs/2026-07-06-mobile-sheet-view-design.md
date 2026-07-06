# Mobile Sheet View — Design

**Date**: 2026-07-06
**Status**: Approved

## Purpose

Let the user log learning entries by editing a Google Sheet from any
device, and view that log — most recent first, plus a total-time
summary — from their phone, from anywhere with internet access.

This is a separate, parallel system from the existing `learnjournal` CLI
(`src/`). It does not read or write `~/.learnjournal/entries.jsonl`, and
the CLI is unaffected by it. The two may converge later, but that is
explicitly out of scope for this feature.

## Constraints established during brainstorming

- Must be viewable from anywhere (not just on the home network) —
  requires internet-hosted content, not a locally-served page.
- Public visibility is acceptable — no login/auth system needed.
- No existing hosting account preference — free static hosting (GitHub
  Pages) is acceptable and preferred.
- Content scope: entry list (most recent first) + a total time summary.
  No charts/streaks in v1 (YAGNI — can be added later if wanted).

## Architecture

```text
Google Sheet (Date, Topic, Resource, Minutes)
        │  "Publish to web" → public CSV URL
        ▼
index.html + app.js (static, hosted on GitHub Pages)
        │  fetch() the CSV URL directly in the browser on page load
        ▼
Rendered mobile-responsive page: total time + entry list
```

No backend, no scheduled sync job, no build step, no npm dependencies —
the page fetches the live published CSV every time it's opened, so it is
always as current as the last Sheet edit (Google typically refreshes a
published-to-web CSV within a few minutes of a change).

**Why this approach over the alternatives considered**: a scheduled
GitHub Action snapshotting the Sheet into a committed JSON file was
considered, but rejected — it adds a moving part (the Action, its
schedule, its failure modes) and a sync delay, for no benefit over
fetching the CSV directly on each page load. Using the Google Sheets API
instead of the published CSV was also considered — it would give
cleaner structured JSON instead of CSV, but requires generating and
shipping a Google API key and sharing the sheet as link-viewable. Direct
CSV fetch avoids any API key management entirely, at the minor cost of
writing a small CSV parser.

## Google Sheet

- Header row: `Date, Topic, Resource, Minutes` (matches the CLI's data
  model conceptually, but this is an independently maintained sheet, not
  a synced copy of `entries.jsonl`).
- Published via File → Share → Publish to web → this sheet → CSV format.
  The resulting URL is hardcoded into `app.js`.
- No corrections/audit-trail concept here (unlike the CLI's
  append-only JSONL design) — editing a cell in place is the Sheet's
  natural editing model, and that's fine for this lightweight viewer.

## Frontend

Three static files at the repository root:

- `index.html` — page shell, mobile viewport meta tag, containers for
  the summary and the entry list.
- `styles.css` — mobile-first responsive layout: single-column stacked
  cards, readable font sizes, no separate desktop layout needed for v1.
- `app.js` — on `DOMContentLoaded`:
  1. `fetch()` the published CSV URL.
  2. Parse it with a small hand-written CSV parser (handles quoted
     fields containing commas — e.g. a resource title with a comma in
     it).
  3. Map rows to `{ date, topic, resource, minutes }`, skipping blank
     rows.
  4. Sort most-recent-first by date; entries sharing the same date keep
     their relative order from the sheet reversed (so the row entered
     latest in the day appears first), giving a stable, predictable
     order without needing a timestamp column.
  5. Render a total-minutes summary (sum of the `minutes` column) at
     the top, then one card per entry.

### Error handling

- Fetch fails (offline, URL wrong, sheet unpublished) → show a plain
  "Couldn't load your learning log right now" message instead of a
  blank page.
- Sheet has a header row but no data rows → show "No entries yet."
- A row is missing/malformed `minutes` (non-numeric) → skip that row
  from the total and flag it visibly in the list rather than silently
  producing `NaN`.

## Hosting & Deployment

This repository was not yet a git repository; it now is (`git init`
completed as part of this feature). Deployment steps:

1. Create a GitHub repository and push this repo to it.
2. Enable GitHub Pages: Settings → Pages → Deploy from branch → `main`
   → `/ (root)`.
3. The page is then live at `https://<username>.github.io/<repo>/`.

Repo visibility: **public**. A private repo would require a paid GitHub
plan just to publish Pages from it, and even then the published page
itself is still a public URL to anyone with the link — private-repo
Pages give no actual privacy benefit for personal/free accounts. Since
public visibility was already accepted as fine, a public repo is
simplest and free.

## Testing

There is no server or build logic to test, but the CSV parser is real
logic and gets unit tests (`node:test`, matching the CLI's existing
testing approach) covering:

- A simple well-formed CSV.
- A quoted field containing a comma.
- A trailing blank line.
- A row with a non-numeric `minutes` value (should be skippable).

Beyond that, verification is manual: publish a real test sheet, open the
deployed GitHub Pages URL on an actual phone, and confirm the summary
and list render correctly, then verify the error states by temporarily
unpublishing/clearing the sheet.

## Out of scope (v1)

- Charts, streaks, per-topic breakdowns.
- Any sync back into the CLI's `entries.jsonl`.
- Authentication/access control.
- Editing entries from the mobile page (view-only; editing still
  happens in the Sheet itself).
