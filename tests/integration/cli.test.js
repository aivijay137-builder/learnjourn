const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const CLI_PATH = path.join(__dirname, "..", "..", "src", "cli.js");

function runCli(args, dataDir) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    env: { ...process.env, LEARNJOURNAL_DATA_DIR: dataDir },
    encoding: "utf8",
  });
}

function freshDataDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "learnjournal-test-"));
}

function readStoredEntries(dataDir) {
  const filePath = path.join(dataDir, "entries.jsonl");
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

// --- US1: log ---

test("log creates an entry and prints its id", () => {
  const dataDir = freshDataDir();
  const result = runCli(
    ["log", "--topic", "Node streams", "--resource", "https://nodejs.org", "--minutes", "25"],
    dataDir,
  );

  assert.equal(result.status, 0);
  const entries = readStoredEntries(dataDir);
  assert.equal(entries.length, 1);
  assert.match(result.stdout, new RegExp(entries[0].id));
  assert.equal(entries[0].topic, "Node streams");
  assert.equal(entries[0].minutes, 25);
});

test("log rejects a missing topic and writes nothing", () => {
  const dataDir = freshDataDir();
  const result = runCli(["log", "--resource", "MDN", "--minutes", "10"], dataDir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /topic/i);
  assert.equal(readStoredEntries(dataDir).length, 0);
});

test("log rejects a missing resource and writes nothing", () => {
  const dataDir = freshDataDir();
  const result = runCli(["log", "--topic", "X", "--minutes", "10"], dataDir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /resource/i);
  assert.equal(readStoredEntries(dataDir).length, 0);
});

test("log rejects a zero/non-numeric duration and writes nothing", () => {
  const dataDir = freshDataDir();
  const zero = runCli(["log", "--topic", "X", "--resource", "MDN", "--minutes", "0"], dataDir);
  assert.equal(zero.status, 1);
  assert.match(zero.stderr, /minutes/i);

  const nonNumeric = runCli(
    ["log", "--topic", "X", "--resource", "MDN", "--minutes", "abc"],
    dataDir,
  );
  assert.equal(nonNumeric.status, 1);
  assert.match(nonNumeric.stderr, /minutes/i);

  assert.equal(readStoredEntries(dataDir).length, 0);
});

// --- US1: correct ---

test("correct appends a correction carrying forward unspecified fields", () => {
  const dataDir = freshDataDir();
  runCli(
    ["log", "--topic", "Node streams", "--resource", "https://nodejs.org", "--minutes", "25"],
    dataDir,
  );
  const original = readStoredEntries(dataDir)[0];

  const result = runCli(["correct", original.id, "--minutes", "30"], dataDir);
  assert.equal(result.status, 0);

  const entries = readStoredEntries(dataDir);
  assert.equal(entries.length, 2);
  const correction = entries[1];
  assert.equal(correction.correctionOf, original.id);
  assert.equal(correction.minutes, 30);
  assert.equal(correction.topic, original.topic);
  assert.equal(correction.resource, original.resource);
});

test("correct fails for an unknown id", () => {
  const dataDir = freshDataDir();
  const result = runCli(["correct", "not-a-real-id", "--minutes", "5"], dataDir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /not found/i);
});

test("correct fails when no fields are given", () => {
  const dataDir = freshDataDir();
  runCli(["log", "--topic", "X", "--resource", "MDN", "--minutes", "10"], dataDir);
  const original = readStoredEntries(dataDir)[0];

  const result = runCli(["correct", original.id], dataDir);
  assert.equal(result.status, 1);
});

// --- US2: list ---

test("list shows entries most-recent-first and reflects corrections", () => {
  const dataDir = freshDataDir();
  runCli(
    ["log", "--topic", "Day 1 topic", "--resource", "R1", "--minutes", "10", "--date", "2026-01-01"],
    dataDir,
  );
  runCli(
    ["log", "--topic", "Day 2 topic", "--resource", "R2", "--minutes", "20", "--date", "2026-01-02"],
    dataDir,
  );
  const day1Id = readStoredEntries(dataDir)[0].id;
  runCli(["correct", day1Id, "--minutes", "15"], dataDir);

  const result = runCli(["list"], dataDir);

  assert.equal(result.status, 0);
  const lines = result.stdout.split("\n").filter((l) => l.trim().length > 0);
  const day1Line = lines.find((l) => l.includes("Day 1 topic"));
  const day2Line = lines.find((l) => l.includes("Day 2 topic"));
  assert.ok(day1Line && day2Line, "both entries should be listed");
  assert.ok(lines.indexOf(day2Line) < lines.indexOf(day1Line), "most recent entry should appear first");
  assert.match(day1Line, /15min/);
  assert.doesNotMatch(day1Line, /10min/);
});

test("list shows a friendly empty-state message when there are no entries", () => {
  const dataDir = freshDataDir();
  const result = runCli(["list"], dataDir);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /no entries/i);
});

// --- US3: total ---

test("total sums minutes across effective entries, reflecting corrections", () => {
  const dataDir = freshDataDir();
  runCli(["log", "--topic", "A", "--resource", "R1", "--minutes", "25"], dataDir);
  runCli(["log", "--topic", "B", "--resource", "R2", "--minutes", "15"], dataDir);
  const firstId = readStoredEntries(dataDir)[0].id;
  runCli(["correct", firstId, "--minutes", "30"], dataDir);

  const result = runCli(["total"], dataDir);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /45/);
});

test("total reports zero when there are no entries", () => {
  const dataDir = freshDataDir();
  const result = runCli(["total"], dataDir);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /\b0\b/);
});
