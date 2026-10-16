const dupCases = [
  [[2, 5, 1, 4, 3, 5], 5],
  [[1, 3, 4, 2, 2], 2],
  [[3, 1, 3, 4, 2], 3],
  [[4, 4, 4, 4, 4, 4], 4],
  [[1, 1], 1],
  [[2, 2, 1], 2],
  [[2, 5, 9, 6, 9, 3, 8, 9, 7, 1], 9],
  [[9, 8, 7, 6, 5, 4, 3, 2, 1, 9], 9],
  [[777].concat(Array.from({ length: 100000 }, (_, i) => 100000 - i)), 777],
  [new Array(50001).fill(1), 1],
];
for (const [nums, expected] of dupCases) {
  const original = nums.slice();
  check(findDuplicate(nums), expected, JSON.stringify(nums.slice(0, 6)));
  check(nums, original, `${JSON.stringify(nums.slice(0, 6))} must not be modified`);
}
