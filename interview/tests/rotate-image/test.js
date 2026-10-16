const grid = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i * n + j));
const rotated = (m) => { // reference: copy into a new matrix
  const n = m.length;
  const out = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[j][n - 1 - i] = m[i][j];
  return out;
};
for (const [matrix, expected] of [
  [[[1, 2], [3, 4]], [[3, 1], [4, 2]]],
  [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[7, 4, 1], [8, 5, 2], [9, 6, 3]]],
  [[[5]], [[5]]],
  [[[-1, 0], [0, -1]], [[0, -1], [-1, 0]]],
  [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]]],
  [grid(5), rotated(grid(5))],
  [grid(20), rotated(grid(20))]]) {
  const m = matrix.map((row) => row.slice());
  rotate(m);
  check(m, expected, `${m.length}x${m.length}`);
}
