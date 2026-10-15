export function summarize(values) {
  if (!Array.isArray(values) || values.length === 0 || values.length > 10000) {
    throw new TypeError('Expected an array containing 1 to 10000 values');
  }
  if (!values.every(Number.isFinite)) {
    throw new TypeError('Every value must be a finite number');
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total)) throw new RangeError('Total is outside the supported range');
  return { count: values.length, total, average: total / values.length };
}

export function parseReport(text) {
  return summarize(JSON.parse(text));
}
