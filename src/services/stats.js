function resolveEffectiveEntries(rawEntries) {
  const byId = new Map();

  for (const record of rawEntries) {
    const targetId = record.correctionOf || record.id;
    const current = byId.get(targetId);
    if (!current || record.createdAt >= current.createdAt) {
      byId.set(targetId, { ...record, id: targetId });
    }
  }

  return Array.from(byId.values());
}

function aggregate(effectiveEntries) {
  const totalMinutes = effectiveEntries.reduce((sum, e) => sum + e.minutes, 0);
  return { totalMinutes, entryCount: effectiveEntries.length };
}

module.exports = { resolveEffectiveEntries, aggregate };
