const inc = Array.from({ length: 1000 }, (_, i) => i + 1), flat = new Array(100000).fill(10000);
for (const [heights, expected] of [[[2, 1, 4, 5, 1, 3], 8], [[3, 3, 3], 9], [[1, 2, 3, 4, 5], 9], [[6, 0, 6], 6], [[7], 7],
  [[0, 0], 0], [[5, 4, 1, 2], 8], [[2, 4, 2, 4, 2], 10], [inc, 250500], [flat, 1000000000]]) {
  check(largestRectangleArea(heights.slice()), expected, `${heights.slice(0, 8)}`);
}
