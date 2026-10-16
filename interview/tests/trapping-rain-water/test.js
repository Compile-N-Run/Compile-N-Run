const big = [100000, ...new Array(19998).fill(0), 100000];
for (const [height, expected] of [[[3, 0, 2, 0, 4], 7], [[1, 2, 3, 4], 0], [[5, 1, 1, 5, 2, 4], 10], [[6], 0],
  [[2, 0, 2], 2], [[0, 0, 0], 0], [[5, 4, 3, 2, 1], 0], [[2, 1, 3, 1, 2], 2], [big, 100000 * 19998]]) {
  check(trap(height.slice()), expected, height.slice(0, 8).join(','));
}
