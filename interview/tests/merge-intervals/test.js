const mergeCases = [
  [[[6, 8], [1, 4], [3, 5]], [[1, 5], [6, 8]]],
  [[[2, 4], [4, 7]], [[2, 7]]],
  [[[1, 10], [2, 3], [4, 5]], [[1, 10]]],
  [[[5, 5]], [[5, 5]]],
  [[[1, 2], [3, 4]], [[1, 2], [3, 4]]],
  [[[0, 0], [0, 0]], [[0, 0]]],
  [[[4, 9], [1, 3], [2, 4]], [[1, 9]]],
];
const disjoint = [], disjointWant = [], chain = [];
for (let i = 999; i >= 0; i--) { disjoint.push([2 * i, 2 * i + 1]); chain.push([i, i + 1]); }
for (let i = 0; i < 1000; i++) disjointWant.push([2 * i, 2 * i + 1]);
mergeCases.push([disjoint, disjointWant], [chain, [[0, 1000]]]);
for (const [intervals, expected] of mergeCases) {
  const got = merge(intervals.map((iv) => iv.slice())).map((iv) => iv.slice());
  got.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  check(got, expected, JSON.stringify(intervals.slice(0, 4)));
}
