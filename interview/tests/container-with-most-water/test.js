// Larger case: 100000 lines rising to 10000 and then staying flat; best pair is index 10000 with the last line.
const big = Array.from({ length: 100000 }, (_, i) => Math.min(i, 10000));
for (const [height, expected] of [[[2, 7, 4, 1, 6, 3], 18], [[5, 5], 5], [[1, 8, 1, 1, 8, 1], 24], [[0, 0], 0], [[3, 1], 1],
  [[1, 2, 3, 4, 5], 6], [[4, 3, 2, 1, 4], 16], [[10000, 10000], 10000], [big, 10000 * 89999]]) {
  check(maxArea(height.slice()), expected, height.slice(0, 8).join(','));
}
