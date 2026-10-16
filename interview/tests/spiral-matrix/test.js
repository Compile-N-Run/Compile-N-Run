{
  // m x n matrix whose spiral order is 0, 1, 2, ... (filled by a turning walker).
  const spiralFilled = (m, n) => {
    const grid = Array.from({ length: m }, () => new Array(n).fill(null));
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let i = 0, j = 0, d = 0;
    for (let v = 0; v < m * n; v++) {
      grid[i][j] = v;
      let ni = i + dirs[d][0], nj = j + dirs[d][1];
      if (ni < 0 || ni >= m || nj < 0 || nj >= n || grid[ni][nj] !== null) {
        d = (d + 1) % 4;
        ni = i + dirs[d][0]; nj = j + dirs[d][1];
      }
      i = ni; j = nj;
    }
    return grid;
  };
  const cases = [[[[10, 20, 30], [40, 50, 60], [70, 80, 90]], [10, 20, 30, 60, 90, 80, 70, 40, 50]],
    [[[1, 2, 3, 4], [5, 6, 7, 8]], [1, 2, 3, 4, 8, 7, 6, 5]], [[[7], [8], [9]], [7, 8, 9]], [[[5]], [5]],
    [[[1, 2, 3]], [1, 2, 3]], [[[1, 2], [3, 4], [5, 6]], [1, 2, 4, 6, 5, 3]],
    [[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]], [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8]],
    [[[-1, -2], [-3, -4]], [-1, -2, -4, -3]]];
  for (const [m, n] of [[10, 7], [7, 10], [10, 10]]) cases.push([spiralFilled(m, n), Array.from({ length: m * n }, (_, k) => k)]);
  for (const [matrix, expected] of cases) {
    check(spiralOrder(matrix.map((row) => row.slice())), expected, `${matrix.length}x${matrix[0].length}`);
  }
}
