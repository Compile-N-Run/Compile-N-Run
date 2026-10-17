const build = (f) => Array.from({ length: 50 }, (_, r) => Array.from({ length: 50 }, (_, c) => f(r, c)));
const full = build(() => 1);
const checker = build((r, c) => (r + c) % 2); // every 1 touches only diagonally
const stripes = build((r) => (r % 2 === 0 ? 1 : 0)); // 25 separate rows of 50
const comb = build((r, c) => (r === 0 || c % 2 === 0 ? 1 : 0)); // one island: a top bar with 25 teeth
const islandCases = [
  [[[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]], 3],
  [[[1, 0, 1], [0, 1, 0], [1, 0, 1]], 1],
  [[[1, 1, 1], [1, 1, 1]], 6],
  [[[0, 0], [0, 0]], 0],
  [[[1]], 1],
  [[[0]], 0],
  [[[1, 1, 0, 0, 0], [1, 1, 0, 1, 1], [0, 0, 0, 1, 1], [0, 1, 0, 0, 1]], 5],
  [[[1, 0, 1, 1, 1, 0, 1]], 3],
  [full, 2500],
  [checker, 1],
  [stripes, 50],
  [comb, 50 + 25 * 49],
];
for (const [grid, expected] of islandCases) {
  const label = `${grid.length}x${grid[0].length} ${grid[0].length <= 7 ? JSON.stringify(grid) : '...'}`;
  check(maxAreaOfIsland(grid.map((row) => row.slice())), expected, label);
}
