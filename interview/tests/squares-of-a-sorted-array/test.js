const squaresCases = [
  [[-4, -1, 0, 3, 10], [0, 1, 9, 16, 100]],
  [[-7, -3, 2, 3, 11], [4, 9, 9, 49, 121]],
  [[1, 2, 3], [1, 4, 9]],
  [[-3, -2, -1], [1, 4, 9]],
  [[0], [0]],
  [[-5], [25]],
  [[0, 0, 0], [0, 0, 0]],
  [[-2, -2, 2, 2], [4, 4, 4, 4]],
  [[-10000, 10000], [100000000, 100000000]],
];
const bigInput = Array.from({ length: 1000 }, (_, i) => i - 500);
squaresCases.push([bigInput, bigInput.map((x) => x * x).sort((a, b) => a - b)]);
for (const [nums, expected] of squaresCases) {
  check(sortedSquares(nums.slice()), expected, JSON.stringify(nums.slice(0, 8)));
}
