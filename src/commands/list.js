const store = require("../services/store.js");
const { resolveEffectiveEntries } = require("../services/stats.js");

function run() {
  const effective = resolveEffectiveEntries(store.readAll());

  if (effective.length === 0) {
    console.log("No entries yet. Log your first one with `learnjournal log ...`.");
    return 0;
  }

  const sorted = [...effective].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  for (const entry of sorted) {
    const notes = entry.notes ? ` — ${entry.notes}` : "";
    console.log(`${entry.date}  ${entry.minutes}min  ${entry.topic}  (${entry.resource})${notes}`);
  }
  return 0;
}

module.exports = { run };
