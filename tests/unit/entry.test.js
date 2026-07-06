const test = require("node:test");
const assert = require("node:assert/strict");
const { createEntry, ValidationError } = require("../../src/models/entry.js");

test("createEntry accepts a valid entry and fills in defaults", () => {
  const entry = createEntry({
    topic: "Node streams",
    resource: "https://nodejs.org/api/stream.html",
    minutes: 25,
  });

  assert.match(entry.id, /^[0-9a-f-]{36}$/);
  assert.equal(entry.topic, "Node streams");
  assert.equal(entry.resource, "https://nodejs.org/api/stream.html");
  assert.equal(entry.minutes, 25);
  assert.equal(entry.notes, undefined);
  assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(entry.date, new Date().toISOString().slice(0, 10));
  assert.match(entry.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("createEntry accepts an explicit date and optional notes", () => {
  const entry = createEntry({
    topic: "CLI arg parsing",
    resource: "MDN",
    minutes: 15,
    date: "2026-01-05",
    notes: "Focused on process.argv",
  });

  assert.equal(entry.date, "2026-01-05");
  assert.equal(entry.notes, "Focused on process.argv");
});

test("createEntry rejects a missing topic", () => {
  assert.throws(
    () => createEntry({ resource: "MDN", minutes: 10 }),
    (err) => err instanceof ValidationError && err.field === "topic",
  );
});

test("createEntry rejects a blank topic", () => {
  assert.throws(
    () => createEntry({ topic: "   ", resource: "MDN", minutes: 10 }),
    (err) => err instanceof ValidationError && err.field === "topic",
  );
});

test("createEntry rejects a missing resource", () => {
  assert.throws(
    () => createEntry({ topic: "X", minutes: 10 }),
    (err) => err instanceof ValidationError && err.field === "resource",
  );
});

test("createEntry rejects a zero duration", () => {
  assert.throws(
    () => createEntry({ topic: "X", resource: "MDN", minutes: 0 }),
    (err) => err instanceof ValidationError && err.field === "minutes",
  );
});

test("createEntry rejects a negative duration", () => {
  assert.throws(
    () => createEntry({ topic: "X", resource: "MDN", minutes: -5 }),
    (err) => err instanceof ValidationError && err.field === "minutes",
  );
});

test("createEntry rejects a non-numeric duration", () => {
  assert.throws(
    () => createEntry({ topic: "X", resource: "MDN", minutes: "abc" }),
    (err) => err instanceof ValidationError && err.field === "minutes",
  );
});

test("createEntry rejects an invalid date", () => {
  assert.throws(
    () =>
      createEntry({
        topic: "X",
        resource: "MDN",
        minutes: 10,
        date: "not-a-date",
      }),
    (err) => err instanceof ValidationError && err.field === "date",
  );
});
