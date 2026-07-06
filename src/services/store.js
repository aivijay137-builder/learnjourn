const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

function resolveStorePath() {
  const dir =
    process.env.LEARNJOURNAL_DATA_DIR || path.join(os.homedir(), ".learnjournal");
  return path.join(dir, "entries.jsonl");
}

function ensureStoreFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
}

function append(entry, filePath = resolveStorePath()) {
  ensureStoreFile(filePath);
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`);
  return entry;
}

function readAll(filePath = resolveStorePath()) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

module.exports = { resolveStorePath, append, readAll };
