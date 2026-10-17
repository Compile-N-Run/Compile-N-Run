// only right/down steps: 199 + 199 + 1
const ordered = Array.from({ length: 200 }, (_, r) => Array.from({ length: 200 }, (_, c) => r * 200 + c));
// one increasing path that covers every cell
const snake = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => r * 20 + (r % 2 === 0 ? c : 19 - c)));
const pathCases = [
  [[[1, 2, 3], [6, 5, 4], [7, 8, 9]], 9],
  [[[9, 1], [8, 2]], 4],
  [[[5, 5], [5, 5]], 1],
  [[[7]], 1],
  [[[3, 4, 5], [3, 2, 6], [2, 2, 1]], 4],
  [[[-3, -2], [0, -1]], 4],
  [[[1, 2], [2, 1]], 2],
  [[[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], 10],
  [ordered, 399],
  [snake, 400],
];
for (const [matrix, expected] of pathCases) {
  const label = `${matrix.length}x${matrix[0].length} ${matrix.length <= 3 ? JSON.stringify(matrix) : '...'}`;
  check(longestIncreasingPath(matrix.map((row) => row.slice())), expected, label);
}
