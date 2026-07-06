function parseDateForSort(dateStr) {
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

function rowsToEntries(rows) {
  const dataRows = rows.slice(1);
  const entries = [];
  let skippedCount = 0;

  // Iterate in reverse so that, after the stable sort below, entries
  // sharing the same date keep the later sheet row first.
  for (let i = dataRows.length - 1; i >= 0; i -= 1) {
    const [rawDate, rawTopic, rawResource, minutesRaw] = dataRows[i];
    const date = (rawDate || "").trim();
    const topic = (rawTopic || "").trim();
    const resource = (rawResource || "").trim();

    if (!date || !topic || !resource) {
      // Missing a required text field — nothing sensible to display.
      skippedCount += 1;
      continue;
    }

    const parsedMinutes = Number(minutesRaw);
    const minutes =
      Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : null;

    entries.push({ date, topic, resource, minutes });
  }

  entries.sort((a, b) => parseDateForSort(b.date) - parseDateForSort(a.date));

  return { entries, skippedCount };
}

function computeTotalMinutes(entries) {
  return entries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { rowsToEntries, computeTotalMinutes };
}
