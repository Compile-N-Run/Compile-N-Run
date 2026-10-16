// Each op is [0, key, value] for put or [1, key, expected] for get.
const lruCases = [
  [2, [[0, 1, 10], [0, 2, 20], [1, 1, 10], [0, 3, 30], [1, 2, -1], [1, 3, 30], [1, 1, 10]]],
  [1, [[0, 5, 50], [1, 5, 50], [0, 6, 60], [1, 5, -1], [1, 6, 60]]],
  [2, [[0, 1, 1], [0, 2, 2], [0, 1, 100], [0, 3, 3], [1, 1, 100], [1, 2, -1], [1, 3, 3]]],
  [3, [[1, 7, -1], [0, 7, 0], [1, 7, 0], [1, 8, -1]]],
  [2, [[0, 1, 1], [0, 2, 2], [1, 1, 1], [0, 3, 3], [1, 2, -1], [0, 4, 4], [1, 1, -1], [1, 3, 3], [1, 4, 4]]],
  [2, [[0, 2, 1], [0, 2, 2], [1, 2, 2], [0, 1, 1], [0, 4, 1], [1, 2, -1]]],
];
const bigOps = [];
for (let i = 0; i < 1000; i++) bigOps.push([0, i, 2 * i]);
for (let i = 0; i < 1000; i++) bigOps.push([1, i, i >= 900 ? 2 * i : -1]);
lruCases.push([100, bigOps]);
lruCases.forEach(([capacity, ops], n) => {
  const cache = new LRUCache(capacity);
  ops.forEach(([op, a, b], step) => {
    if (op === 0) cache.put(a, b);
    else check(cache.get(a), b, `case ${n} step ${step} get(${a})`);
  });
});
