{
  const big = Array.from({ length: 100000 }, (_, i) => (100000 - i === 77777 ? -1 : 100000 - i)); // 77777 removed
  for (const [nums, expected] of [[[2, 5, 1, 9], 3], [[-4, 0, 6], 1], [[3, 1, 2, 2], 4], [[1], 2], [[2], 1], [[1, 1], 2], [[0], 1],
    [[7, 8, 9, 11, 12], 1], [[-2147483648, 2147483647, 1, 2], 3], [[4, 3, 2, 1], 5], [big, 77777]]) {
    check(firstMissingPositive(nums.slice()), expected, `${nums.slice(0, 10)}`);
  }
}
