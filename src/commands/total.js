const store = require("../services/store.js");
const { resolveEffectiveEntries, aggregate } = require("../services/stats.js");

function run() {
  const effective = resolveEffectiveEntries(store.readAll());
  const { totalMinutes, entryCount } = aggregate(effective);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const breakdown = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  console.log(`Total: ${totalMinutes} minutes (${breakdown}) across ${entryCount} entries`);
  return 0;
}

module.exports = { run };
