const ones = Array(1023).fill(1);
const negatives = Array.from({ length: 1023 }, (_, i) => -(i % 5 + 1));
for (const [values, expected] of [[[2, 1, 3], 6], [[-8, 4, 6, null, null, 5, 7], 18], [[-3], -3], [[-2, -5, -1], -1],
  [[1, -2, 3], 4], [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 48],
  [[-10, 9, 20, null, null, 15, -7], 35], [ones, 19], [negatives, -1]]) {
  check(maxPathSum(buildTree(values)), expected, `${values.slice(0, 15)}`);
}
