const zeroCases = [
  [[[1, 2, 3], [4, 0, 6], [7, 8, 9]], [[1, 0, 3], [0, 0, 0], [7, 0, 9]]],
  [[[0, 5], [7, 8]], [[0, 0], [0, 8]]],
  [[[1, 1, 1], [0, 1, 1]], [[0, 1, 1], [0, 0, 0]]],
  [[[3, 4], [5, 6]], [[3, 4], [5, 6]]],
  [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]], [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]],
  [[[1]], [[1]]],
  [[[0]], [[0]]],
  [[[1, 0, 3]], [[0, 0, 0]]],
  [[[1], [0], [3]], [[0], [0], [0]]],
  [[[1, 0], [1, 1], [1, 1]], [[0, 0], [1, 0], [1, 0]]],
  [[[-1, 5], [0, -7]], [[0, 5], [0, 0]]],
  [[[1, 2, 3], [4, 5, 6], [7, 8, 0]], [[1, 2, 0], [4, 5, 0], [0, 0, 0]]],
];
// 200 x 200 with zeros on the diagonal at every 50th row: rows and columns 0, 50, 100, 150 are cleared.
const big = [], bigWant = [];
for (let r = 0; r < 200; r++) {
  big.push(Array.from({ length: 200 }, (_, c) => (r === c && r % 50 === 0 ? 0 : 1)));
  bigWant.push(Array.from({ length: 200 }, (_, c) => (r % 50 === 0 || c % 50 === 0 ? 0 : 1)));
}
zeroCases.push([big, bigWant]);
for (const [matrix, expected] of zeroCases) {
  const work = matrix.map((row) => row.slice());
  setZeroes(work);
  check(work, expected, JSON.stringify(matrix.slice(0, 3)));
}
