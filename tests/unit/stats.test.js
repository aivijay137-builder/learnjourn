const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveEffectiveEntries, aggregate } = require("../../src/services/stats.js");

function entry(overrides) {
  return {
    id: "id-1",
    date: "2026-01-01",
    topic: "Topic",
    resource: "Resource",
    minutes: 10,
    createdAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

test("resolveEffectiveEntries returns originals when there are no corrections", () => {
  const raw = [entry({ id: "a" }), entry({ id: "b", minutes: 20 })];
  const effective = resolveEffectiveEntries(raw);

  assert.equal(effective.length, 2);
  assert.equal(effective.find((e) => e.id === "a").minutes, 10);
  assert.equal(effective.find((e) => e.id === "b").minutes, 20);
});

test("resolveEffectiveEntries applies a correction over its original", () => {
  const raw = [
    entry({ id: "a", minutes: 25, createdAt: "2026-01-01T10:00:00.000Z" }),
    entry({
      id: "a-correction-1",
      correctionOf: "a",
      minutes: 30,
      createdAt: "2026-01-02T10:00:00.000Z",
    }),
  ];
  const effective = resolveEffectiveEntries(raw);

  assert.equal(effective.length, 1);
  assert.equal(effective[0].minutes, 30);
  assert.equal(effective[0].id, "a");
});

test("resolveEffectiveEntries applies only the latest of multiple corrections", () => {
  const raw = [
    entry({ id: "a", minutes: 10, createdAt: "2026-01-01T10:00:00.000Z" }),
    entry({
      id: "a-c1",
      correctionOf: "a",
      minutes: 15,
      createdAt: "2026-01-02T10:00:00.000Z",
    }),
    entry({
      id: "a-c2",
      correctionOf: "a",
      minutes: 20,
      createdAt: "2026-01-03T10:00:00.000Z",
    }),
  ];
  const effective = resolveEffectiveEntries(raw);

  assert.equal(effective.length, 1);
  assert.equal(effective[0].minutes, 20);
});

test("aggregate sums minutes and counts effective entries", () => {
  const effective = [entry({ id: "a", minutes: 25 }), entry({ id: "b", minutes: 15 })];
  const summary = aggregate(effective);

  assert.equal(summary.totalMinutes, 40);
  assert.equal(summary.entryCount, 2);
});

test("aggregate returns zeroes for an empty list", () => {
  const summary = aggregate([]);

  assert.equal(summary.totalMinutes, 0);
  assert.equal(summary.entryCount, 0);
});
