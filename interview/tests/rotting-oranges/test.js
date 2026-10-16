{
  const big = Array.from({ length: 10 }, () => new Array(10).fill(1));
  big[0][0] = 2; // the far corner is 18 steps away
  const allFresh = Array.from({ length: 10 }, () => new Array(10).fill(1));
  for (const [grid, expected] of [[[[2, 1, 0], [1, 1, 1], [0, 1, 1]], 4], [[[2, 1, 1, 1, 2]], 2], [[[1, 0, 2]], -1],
    [[[0, 2], [0, 0]], 0], [[[1]], -1], [[[0]], 0], [[[2, 2], [1, 1], [0, 1]], 2], [big, 18], [allFresh, -1]]) {
    check(orangesRotting(grid.map((row) => row.slice())), expected, JSON.stringify(grid.slice(0, 3)));
  }
}
