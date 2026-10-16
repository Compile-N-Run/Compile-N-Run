const oneThenOnes = Array(10000).fill(1);
oneThenOnes[0] = 10000;
const jumpCases = [
  [[3, 1, 1, 4, 1, 1, 1], 2],
  [[1, 1, 1, 1], 3],
  [[4, 1, 1, 1, 1], 1],
  [[1, 3, 0, 0, 2, 0, 1], 3],
  [[5], 0],
  [[0], 0],
  [[2, 1], 1],
  [[1, 2, 3], 2],
  [[3, 0, 0, 1, 0], 2],
  [Array(10000).fill(1), 9999],
  [oneThenOnes, 1],
  [Array(10001).fill(2), 5000],
];
for (const [nums, expected] of jumpCases) {
  check(jump(nums.slice()), expected, `${JSON.stringify(nums.slice(0, 8))} (n=${nums.length})`);
}
