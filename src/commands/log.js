const { createEntry, ValidationError } = require("../models/entry.js");
const store = require("../services/store.js");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      args[key] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function run(argv) {
  const args = parseArgs(argv);

  try {
    const entry = createEntry({
      topic: args.topic,
      resource: args.resource,
      minutes: args.minutes,
      date: args.date,
      notes: args.notes,
    });
    store.append(entry);
    console.log(`Logged entry ${entry.id} (${entry.minutes} min: ${entry.topic})`);
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
