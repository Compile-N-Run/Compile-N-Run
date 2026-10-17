const grid = [[2, 4, 6], [9, 11, 13], [20, 25, 30]];
const matrixCases = [
  [grid, 11, true],
  [grid, 12, false],
  [grid, 2, true],
  [grid, 30, true],
  [grid, 1, false],
  [grid, 31, false],
  [grid, 9, true],
  [[[7]], 7, true],
  [[[7]], 8, false],
  [[[1, 2, 3, 4, 5]], 4, true], // a single row
  [[[1, 2, 3, 4, 5]], 0, false],
  [[[1], [3], [5]], 3, true], // a single column
  [[[1], [3], [5]], 4, false],
  [[[-9, -7], [-5, -3], [-1, 0]], -3, true], // negatives
  [[[-9, -7], [-5, -3], [-1, 0]], -4, false],
];
for (const [matrix, target, expected] of matrixCases) {
  check(searchMatrix(matrix.map((r) => r.slice()), target), expected, `${JSON.stringify(matrix).slice(0, 30)} target=${target}`);
}

// Larger case: a 100 x 100 matrix of even numbers; every even value is found and no odd one is.
const big = Array.from({ length: 100 }, (_, i) => Array.from({ length: 100 }, (_, j) => 2 * (i * 100 + j)));
let allEven = true, anyOdd = false;
for (let k = 0; k < 10000; k++) {
  allEven = allEven && searchMatrix(big, 2 * k);
  anyOdd = anyOdd || searchMatrix(big, 2 * k + 1);
}
check(allEven, true, '100x100 all even values present');
check(anyOdd, false, '100x100 no odd value present');
check(searchMatrix(big, 20000), false, '100x100 target past the end');
