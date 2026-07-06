#!/usr/bin/env node

const COMMANDS = {
  log: () => require("./commands/log.js"),
  list: () => require("./commands/list.js"),
  total: () => require("./commands/total.js"),
  correct: () => require("./commands/correct.js"),
};

function printUsage() {
  console.error("Usage: learnjournal <log|list|total|correct> [options]");
}

function printHelp() {
  console.log(`learnjournal — track what you learned, how long, and from where

Usage:
  learnjournal log --topic <text> --resource <text> --minutes <number> [--date YYYY-MM-DD] [--notes <text>]
  learnjournal list
  learnjournal total
  learnjournal correct <id> [--topic <text>] [--resource <text>] [--minutes <number>] [--notes <text>]

Commands:
  log       Record a new learning entry
  list      Show past entries, most recent first
  total     Show cumulative time spent learning
  correct   Correct a past entry without erasing its history

Run \`learnjournal <command>\` with no flags to see that command fail with a
validation error naming its required fields.`);
}

function main(argv) {
  const [command, ...rest] = argv;

  if (!command) {
    printUsage();
    return 1;
  }

  if (command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  const loadCommand = COMMANDS[command];
  if (!loadCommand) {
    printUsage();
    return 1;
  }

  return loadCommand().run(rest);
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main };
