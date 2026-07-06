// Replace with your published Google Sheet CSV URL — see README
// "Mobile Sheet View" section for how to get it.
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTWw5b83CYNGeQjIW39F_p20GywuXQAtWgsORItMh2hqZjQQKYfXtXT9CyF_Q-BHsMi6SFPCpTL3M_/pub?output=csv";

function renderEntry(entry) {
  const card = document.createElement("li");
  card.className = "entry-card";

  const dateEl = document.createElement("div");
  dateEl.className = "entry-date";
  dateEl.textContent = entry.date;

  const topicEl = document.createElement("div");
  topicEl.className = "entry-topic";
  topicEl.textContent = entry.topic;

  const metaEl = document.createElement("div");
  metaEl.className = "entry-meta";
  const minutesLabel =
    entry.minutes === null ? "⚠ invalid duration" : `${entry.minutes} min`;
  metaEl.append(`${minutesLabel} · `);

  if (/^https?:\/\//i.test(entry.resource)) {
    const link = document.createElement("a");
    link.href = entry.resource;
    link.textContent = entry.resource;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    metaEl.append(link);
  } else {
    metaEl.append(entry.resource);
  }

  card.append(dateEl, topicEl, metaEl);
  return card;
}

async function main() {
  const summaryEl = document.getElementById("summary");
  const listEl = document.getElementById("entry-list");

  let text;
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    text = await response.text();
  } catch (err) {
    summaryEl.textContent = "Couldn't load your learning log right now.";
    return;
  }

  const rows = parseCSV(text);
  const { entries, skippedCount } = rowsToEntries(rows);

  if (entries.length === 0) {
    summaryEl.textContent = "No entries yet.";
    listEl.innerHTML = "";
    return;
  }

  const total = computeTotalMinutes(entries);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const breakdown = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const entryWord = entries.length === 1 ? "entry" : "entries";
  let summary = `Total: ${total} minutes (${breakdown}) across ${entries.length} ${entryWord}`;
  if (skippedCount > 0) {
    summary += ` — ${skippedCount} row(s) skipped (missing required fields)`;
  }
  summaryEl.textContent = summary;

  listEl.innerHTML = "";
  for (const entry of entries) {
    listEl.appendChild(renderEntry(entry));
  }
}

document.addEventListener("DOMContentLoaded", main);
