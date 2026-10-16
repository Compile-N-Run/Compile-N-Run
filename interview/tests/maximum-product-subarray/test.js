const negatives = Array(9999).fill(-1); // odd count of negatives: drop one end
const ends = Array(10000).fill(1); // the whole array is the answer
ends[0] = ends[9999] = -2;
const productCases = [
  [[2, -3, 4], 4],
  [[-2, 3, -4], 24],
  [[2, -5, -2, -4, 3], 24],
  [[0, -1], 0],
  [[-5], -5],
  [[2, 0, 3, 4], 12],
  [[-1, -2, -3, 0, 5], 6],
  [[3, -1, 4], 4],
  [[-3, 0, -2, -1], 2],
  [[0, 0, 0], 0],
  [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1], 3628800],
  [negatives, 1],
  [ends, 4],
];
for (const [nums, expected] of productCases) {
  check(maxProduct(nums.slice()), expected, `${JSON.stringify(nums.slice(0, 8))} (n=${nums.length})`);
}
