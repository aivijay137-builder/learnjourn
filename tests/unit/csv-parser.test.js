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
