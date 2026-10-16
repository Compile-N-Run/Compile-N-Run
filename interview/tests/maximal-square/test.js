const big = [...new Array(50).fill('1'.repeat(100)), '0'.repeat(100), ...new Array(49).fill('1'.repeat(100))];
for (const [rows, expected] of [[['110', '111', '011'], 4], [['00', '00'], 0], [['1'], 1], [['1111', '1111', '1110'], 9],
  [['0'], 0], [['10111'], 1], [['01', '10'], 1], [['10111', '11111', '01111', '11110'], 9], [big, 2500]]) {
  check(maximalSquare(rows.map((r) => r.split(''))), expected, `${rows.slice(0, 4)}`);
}
