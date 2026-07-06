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
