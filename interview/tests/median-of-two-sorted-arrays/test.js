function referenceMedian(a, b) {
  const m = a.concat(b).sort((x, y) => x - y), t = m.length;
  return t % 2 ? m[t >> 1] : (m[t / 2 - 1] + m[t / 2]) / 2;
}
const big1 = Array.from({ length: 999 }, (_, i) => ((i * 7919) % 2001) - 1000).sort((x, y) => x - y);
const big2 = Array.from({ length: 1000 }, (_, i) => ((i * 104729) % 1999) - 1000).sort((x, y) => x - y);
for (const [a, b, expected] of [[[1, 4, 9], [2, 3], 3], [[5, 8], [1, 2, 10, 12], 6.5], [[], [7], 7], [[2, 2], [2, 2], 2],
  [[3], [], 3], [[1, 2], [3, 4], 2.5], [[10, 20, 30], [1, 2, 3, 4, 5, 6], 5], [[-5, -3], [-4], -4],
  [[1000000], [-1000000], 0], [big1, big2, referenceMedian(big1, big2)]]) {
  const got = findMedianSortedArrays(a.slice(), b.slice());
  if (!(Math.abs(got - expected) <= 1e-6)) { console.error(`${a.slice(0, 5)} | ${b.slice(0, 5)}: expected ${expected}, got ${got}`); process.exit(1); }
}
