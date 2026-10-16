for (const [nums, target, expected] of [[[3, 8, 11, 5], 13, [1, 3]], [[4, 6, 4], 8, [0, 2]], [[-2, 7, 1], -1, [0, 2]],
  [[2, 7, 11, 15], 9, [0, 1]], [[0, 4, 3, 0], 0, [0, 3]], [[1, 2], 3, [0, 1]]]) {
  check(twoSum(nums.slice(), target).sort((a, b) => a - b), expected, `${nums} ${target}`);
}
