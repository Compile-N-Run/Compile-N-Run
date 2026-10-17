import { record, validateSnapshot, SNAPSHOT_MAX_BYTES } from './snapshot.js';

export const LIMITS = { read: 20000, course: 1000, lesson: 5000, draft: 100 };
const encoder = new TextEncoder();
export const identity = row => JSON.stringify([row.kind, row.key]);
export const recordBytes = row => encoder.encode(JSON.stringify([row.kind, row.key, row.value])).byteLength;
export const emptyCounts = () => ({ read: 0, course: 0, lesson: 0, draft: 0 });
export function blank(exportedAt) {
  return { format: 'cnr-learning-backup', version: 1, exportedAt,
    progress: { v: 1, done: {}, tuts: {} }, learning: { v: 1, lessons: {} }, playground: { version: 1, drafts: {} } };
}
function groups(data) {
  return { read: data.progress.done, course: data.progress.tuts, lesson: data.learning.lessons, draft: data.playground.drafts };
}
export function toRecords(data) {
  return Object.entries(groups(data)).flatMap(([kind, entries]) => Object.entries(entries).map(([key, value]) => ({ kind, key, value })));
}
export function decodeRows(text) {
  return JSON.parse(text || '[]').map(([kind, key, value]) => ({ kind, key, value }));
}
export function validateChanges(input) {
  if (!Array.isArray(input.changes) || input.changes.length > 26100 ||
      typeof input.exportedAt !== 'string' || input.exportedAt.length > 64 || !Number.isFinite(Date.parse(input.exportedAt))) throw new TypeError('invalid_changes');
  const seen = new Set(), partial = blank(input.exportedAt), maps = groups(partial);
  for (const item of input.changes) {
    if (!record(item) || !Object.hasOwn(LIMITS, item.kind) || typeof item.key !== 'string' ||
        !item.key || item.key.length > 600 || /[\u0000-\u001f]/.test(item.key) ||
        ['__proto__', 'prototype', 'constructor'].includes(item.key) || !Object.hasOwn(item, 'value')) throw new TypeError('invalid_changes');
    const id = identity(item);
    if (seen.has(id)) throw new TypeError('duplicate_change');
    seen.add(id);
    if (item.value !== null) {
      if (item.kind === 'read' ? !(item.value === true || Number.isSafeInteger(item.value) && item.value >= 0) : !record(item.value)) throw new TypeError('invalid_changes');
      maps[item.kind][item.key] = item.value;
    }
  }
  // Apply the same bounded-depth, unsafe-key and byte checks as full backups.
  validateSnapshot(partial);
  return input.changes;
}
export function changesBetween(previous, incoming) {
  const next = new Map(incoming.map(row => [identity(row), row]));
  for (const row of previous) if (!next.has(identity(row))) next.set(identity(row), { ...row, value: null });
  return [...next.values()];
}
export function measureChanges(head, previous, proposed) {
  const old = new Map(previous.map(row => [identity(row), row]));
  const counts = head.normalized ? JSON.parse(head.record_counts) : emptyCounts();
  let bytes = head.normalized ? head.record_bytes : 0;
  const changed = [];
  for (const row of proposed) {
    const before = old.get(identity(row));
    if (row.value === null ? !before : before && JSON.stringify(before.value) === JSON.stringify(row.value)) continue;
    if (before) { bytes -= recordBytes(before); counts[row.kind]--; }
    if (row.value !== null) { bytes += recordBytes(row); counts[row.kind]++; }
    changed.push(row);
  }
  if (bytes > SNAPSHOT_MAX_BYTES) throw new RangeError('snapshot_too_large');
  if (Object.entries(counts).some(([kind, count]) => count < 0 || count > LIMITS[kind])) throw new TypeError('snapshot_too_complex');
  return { changed, bytes, counts };
}
