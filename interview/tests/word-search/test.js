const wsGrid = ['CAT', 'ORE', 'DOG'];
const wsSnake = ['ABCDEF', 'LKJIHG', 'MNOPQR', 'XWVUTS', 'YZABCD', 'JIHGFE'];
const wsFlat = new Array(6).fill('AAAAAA');
for (const [rows, word, expected] of [[wsGrid, 'CARE', true], [wsGrid, 'DOGE', true], [wsGrid, 'CODE', false],
  [wsGrid, 'CAC', false], [wsGrid, 'TAR', true], [wsGrid, 'CATERODOG', true], [['a'], 'a', true], [['a'], 'b', false],
  [['ab'], 'aba', false], [['ab', 'cd'], 'abdc', true], [['ab', 'cd'], 'ad', false],
  [wsSnake, 'ABCDEFGHIJKLMNO', true], [wsSnake, 'ABCDEFGHIJKLMNQ', false], [wsFlat, 'AAAAAAAAAB', false],
  [wsFlat, 'A'.repeat(15), true]]) {
  check(exist(rows.map((row) => row.split('')), word), expected, `${rows} ${word}`);
}
