const inc = Array.from({ length: 2500 }, (_, i) => i), pairs = Array.from({ length: 2000 }, (_, i) => i >> 1);
for (const [nums, expected] of [[[4, 1, 6, 2, 7, 3, 8], 4], [[5, 5, 5], 1], [[9, 7, 4, 2], 1], [[-3, 10, -1, 0, 2], 4], [[7], 1],
  [[1, 3, 2, 3, 4, 0], 4], [inc, 2500], [pairs, 1000]]) {
  check(lengthOfLIS(nums.slice()), expected, `${nums.slice(0, 8)}`);
}
