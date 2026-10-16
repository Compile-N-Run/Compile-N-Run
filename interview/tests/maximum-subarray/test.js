// Larger case: 100000 values alternating 10000, -9999; the best run stops at the last 10000.
const big = Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 10000 : -9999));
for (const [nums, expected] of [[[2, -5, 3, -1, 4, -6, 1], 6], [[-4, -2, -7], -2], [[1, 2, 3], 6], [[7], 7], [[0], 0],
  [[-1, 0, -2], 0], [[5, -10, 5], 5], [[-3, 4, -1, 2, 1, -5], 6], [[-10000], -10000], [big, 59999]]) {
  check(maxSubArray(nums.slice()), expected, nums.slice(0, 8).join(','));
}
