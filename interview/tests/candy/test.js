const candyCases = [
  [[1, 3, 2], 4],
  [[2, 2, 2], 3],
  [[5, 4, 3, 2], 10],
  [[1, 2, 2, 1], 6],
  [[7], 1],
  [[1, 0, 2], 5],
  [[1, 2, 3, 1], 7],
  [[1, 2, 87, 87, 87, 2, 1], 13],
  [[1, 2, 3, 4, 3, 2, 1], 16],
  [Array.from({ length: 1000 }, (_, i) => i % 2), 1500], // alternating valleys and peaks: 1, 2, 1, 2, ...
  [Array.from({ length: 1000 }, (_, i) => i), 500500], // strictly rising: 1 + 2 + ... + 1000
  [Array.from({ length: 999 }, (_, i) => (i < 500 ? 500 - i : i - 499)), 250000], // a long slope down then up
];
for (const [ratings, expected] of candyCases) {
  const got = candy(ratings.slice());
  check(got, expected, `ratings=${JSON.stringify(ratings.slice(0, 8))}${ratings.length > 8 ? '...' : ''}`);
}
