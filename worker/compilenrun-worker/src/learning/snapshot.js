export const SNAPSHOT_MAX_BYTES = 1_800_000;
const encoder = new TextEncoder();
export const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function validateSnapshot(data) {
  if (!record(data) || data.format !== 'cnr-learning-backup' || data.version !== 1 ||
      typeof data.exportedAt !== 'string' || data.exportedAt.length > 64 || !Number.isFinite(Date.parse(data.exportedAt)) ||
      !record(data.progress) || data.progress.v !== 1 || !record(data.progress.done) || !record(data.progress.tuts) ||
      !record(data.learning) || data.learning.v !== 1 || !record(data.learning.lessons) ||
      !record(data.playground) || data.playground.version !== 1 || !record(data.playground.drafts)) {
    throw new TypeError('invalid_snapshot');
  }
  const pending = [[data, 0]];
  let count = 0;
  while (pending.length) {
    const [value, depth] = pending.pop();
    if (++count > 150000 || depth > 30) throw new TypeError('snapshot_too_complex');
    if (typeof value === 'string' && value.includes('\0')) throw new TypeError('invalid_snapshot');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('invalid_snapshot');
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new TypeError('unsafe_snapshot_key');
        pending.push([item, depth + 1]);
      }
    }
  }
  if (Object.keys(data.progress.done).length > 20000 || Object.keys(data.progress.tuts).length > 1000 ||
      Object.keys(data.learning.lessons).length > 5000 || Object.keys(data.playground.drafts).length > 100) {
    throw new TypeError('snapshot_too_complex');
  }
  const invalidKey = key => !key || key.length > 600 || /[\u0000-\u001f]/.test(key);
  if (Object.keys(data.progress.done).some(invalidKey) ||
      Object.values(data.progress.done).some(value => value !== true && !(Number.isSafeInteger(value) && value >= 0)) ||
      [data.progress.tuts, data.learning.lessons, data.playground.drafts].some(entries =>
        Object.entries(entries).some(([key, value]) => invalidKey(key) || !record(value)))) {
    throw new TypeError('invalid_snapshot');
  }
  const encoded = JSON.stringify(data);
  if (encoder.encode(encoded).byteLength > SNAPSHOT_MAX_BYTES) throw new RangeError('snapshot_too_large');
  return encoded;
}
