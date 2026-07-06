const crypto = require("node:crypto");

class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function validateTopic(topic) {
  if (typeof topic !== "string" || topic.trim().length === 0) {
    throw new ValidationError("topic", "topic is required");
  }
  return topic.trim();
}

function validateResource(resource) {
  if (typeof resource !== "string" || resource.trim().length === 0) {
    throw new ValidationError("resource", "resource is required");
  }
  return resource.trim();
}

function validateMinutes(minutes) {
  const n = typeof minutes === "string" ? Number(minutes) : minutes;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) {
    throw new ValidationError(
      "minutes",
      "minutes must be a number greater than 0",
    );
  }
  return n;
}

function validateDate(date) {
  if (date === undefined || date === null) return todayDate();
  if (!isValidDate(date)) {
    throw new ValidationError("date", "date must be a valid YYYY-MM-DD date");
  }
  return date;
}

function createEntry(input) {
  const topic = validateTopic(input.topic);
  const resource = validateResource(input.resource);
  const minutes = validateMinutes(input.minutes);
  const date = validateDate(input.date);
  const notes =
    input.notes !== undefined && input.notes !== null && input.notes !== ""
      ? String(input.notes)
      : undefined;

  const entry = {
    id: crypto.randomUUID(),
    date,
    topic,
    resource,
    minutes,
    createdAt: new Date().toISOString(),
  };
  if (notes !== undefined) entry.notes = notes;
  return entry;
}

module.exports = { createEntry, isValidDate, ValidationError };
