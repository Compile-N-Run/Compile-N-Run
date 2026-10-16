{
  const big = Array.from({ length: 100000 }, (_, i) => Math.floor(i / 10)); // each value 0..9999 appears 10 times
  for (const [nums, target, expected] of [[[1, 3, 3, 3, 6, 9], 3, [1, 3]], [[2, 4, 4, 8], 5, [-1, -1]], [[7], 7, [0, 0]],
    [[], 0, [-1, -1]], [[5, 5, 5, 5], 5, [0, 3]], [[1, 2, 3], 0, [-1, -1]], [[1, 2, 3], 4, [-1, -1]], [[-3, -1, -1, 0], -1, [1, 2]],
    [[1, 2, 3, 3], 3, [2, 3]], [big, 4321, [43210, 43219]], [big, 10000, [-1, -1]]]) {
    check(searchRange(nums.slice(), target), expected, `${nums.slice(0, 10)} ${target}`);
  }
}
