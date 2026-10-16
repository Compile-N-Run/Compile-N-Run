const big = Array.from({ length: 100 }, (_, i) => (i * 37) % 401);
for (const [nums, expected] of [[[3, 10, 3, 1, 8], 18], [[6, 1, 1, 6], 12], [[4, 1, 2, 7, 5, 3, 1], 14], [[9], 9],
  [[0, 0, 0], 0], [[2, 1], 2], [[1, 2], 2], [[5, 0, 0, 5, 0, 0, 5], 15], [new Array(100).fill(400), 20000], [big, 10569]]) {
  check(rob(nums.slice()), expected, `${nums.slice(0, 10)}`);
}
