const productCases = [
  [[2, 3, 4], 10, 4],
  [[1, 1, 1], 2, 6],
  [[5, 5], 5, 0],
  [[3], 0, 0],
  [[3], 1, 0],
  [[3], 4, 1],
  [[10, 5, 2, 6], 100, 8],
  [[1, 2, 3, 4, 5], 20, 9],
  [[4, 1, 1, 8, 2], 9, 10],
  [new Array(20).fill(2), 1024, 144],
  [new Array(30000).fill(1), 2, 450015000],
  [new Array(30000).fill(1000), 1000000, 30000],
];
for (const [nums, k, expected] of productCases) {
  check(numSubarrayProductLessThanK(nums.slice(), k), expected, `${nums.slice(0, 6)} k=${k}`);
}
