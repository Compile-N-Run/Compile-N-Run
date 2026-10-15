export function total(values) {
  if (!Array.isArray(values) || values.length === 0 || !values.every(Number.isFinite)) {
    throw new TypeError('Expected a nonempty array of finite numbers');
  }
  const result = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(result)) throw new RangeError('Total is outside the supported range');
  return result;
}
