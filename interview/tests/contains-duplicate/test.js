const dupCases = [
  [[4, 1, 7, 1], true],
  [[3, 8, -2, 5], false],
  [[0, 0], true],
  [[42], false],
  [[-1, 1, -1], true],
  [[2147483647, -2147483648, 0], false],
  [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5], true],
];
const distinct = Array.from({ length: 100000 }, (_, i) => i);
dupCases.push([distinct, false], [distinct.concat([99999]), true]);
for (const [nums, expected] of dupCases) {
  check(containsDuplicate(nums.slice()), expected, `${nums.slice(0, 8)}`);
}
