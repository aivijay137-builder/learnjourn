const { createEntry, ValidationError } = require("../models/entry.js");
const store = require("../services/store.js");
const { resolveEffectiveEntries } = require("../services/stats.js");

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      args[key] = argv[i + 1];
      i += 1;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

const EDITABLE_FIELDS = ["topic", "resource", "minutes", "notes"];

function run(argv) {
  const args = parseArgs(argv);
  const targetId = args._[0];

  if (!targetId) {
    console.error("Usage: learnjournal correct <id> [--topic ...] [--resource ...] [--minutes ...] [--notes ...]");
    return 1;
  }

  const hasAnyField = EDITABLE_FIELDS.some((field) => args[field] !== undefined);
  if (!hasAnyField) {
    console.error("No fields given to correct. Provide at least one of --topic, --resource, --minutes, --notes.");
    return 1;
  }

  const effective = resolveEffectiveEntries(store.readAll());
  const original = effective.find((entry) => entry.id === targetId);
  if (!original) {
    console.error(`Entry ${targetId} not found`);
    return 1;
  }

  try {
    const correction = createEntry({
      topic: args.topic !== undefined ? args.topic : original.topic,
      resource: args.resource !== undefined ? args.resource : original.resource,
      minutes: args.minutes !== undefined ? args.minutes : original.minutes,
      date: original.date,
      notes: args.notes !== undefined ? args.notes : original.notes,
    });
    correction.correctionOf = targetId;
    store.append(correction);
    console.log(`Corrected entry ${targetId} (new record ${correction.id})`);
    return 0;
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(`Invalid ${err.field}: ${err.message}`);
      return 1;
    }
    throw err;
  }
}

module.exports = { run };
