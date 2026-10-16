const wsCases = [
  [['cat', 'ore', 'dog'], ['care', 'tar', 'code', 'god', 'cac'], ['care', 'god', 'tar']],
  [['ab', 'dc'], ['ab', 'abc', 'abcd', 'abcda'], ['ab', 'abc', 'abcd']],
  [['a'], ['a', 'b', 'aa'], ['a']],
  [['xyz', 'qrs'], ['hello'], []],
  [['aa', 'aa'], ['aaa', 'aaaa', 'aaaaa'], ['aaa', 'aaaa']],
  [['tape', 'oarn', 'pike', 'seal'], ['tap', 'pan', 'pear', 'rope', 'kin', 'ikea', 'seal', 'lake', 'ran', 'topi', 'tapenade'],
    ['lake', 'seal', 'tap', 'topi']],
  [['cat', 'ore', 'dog'], ['care', 'doge', 'code', 'cac', 'tar', 'caterodog', 'dog', 'god', 'rod', 'ore'],
    ['care', 'caterodog', 'dog', 'doge', 'god', 'ore', 'rod', 'tar']],
  [['abc', 'def', 'ghi'], ['abcfedghi', 'abcfi', 'adgheb', 'ihgfedcba', 'bei', 'aei'], ['abcfedghi', 'abcfi', 'adgheb']],
];
const aWords = [], aWant = [];
for (let k = 1; k <= 10; k++) { aWords.push('a'.repeat(k)); aWant.push('a'.repeat(k)); }
for (let k = 0; k < 10; k++) aWords.push('a'.repeat(k) + 'b');
wsCases.push([new Array(6).fill('aaaaaa'), aWords, aWant]);
// 12x12 grid; the words walked along rows and columns exist, 2000 pseudo-random words do not.
const grid = [];
for (let r = 0; r < 12; r++) {
  let row = '';
  for (let c = 0; c < 12; c++) row += String.fromCharCode(97 + ((r * 7 + c * 3) % 26));
  grid.push(row);
}
const walks = [];
for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) walks.push(grid[r].slice(c, c + 10));
for (let c = 0; c < 12; c++) {
  for (let r = 0; r < 3; r++) {
    let w = '';
    for (let i = 0; i < 10; i++) w += grid[r + i][c];
    walks.push(w);
  }
}
let seed = 12345;
const rand = () => { seed = (seed * 48271) % 2147483647; return seed; };
const bigWords = walks.slice();
for (let n = 0; n < 2000; n++) {
  const length = 6 + (rand() % 5);
  let w = '';
  for (let i = 0; i < length; i++) w += String.fromCharCode(97 + (rand() % 26));
  bigWords.push(w);
}
wsCases.push([grid, [...new Set(bigWords)], [...new Set(walks)].sort()]);
for (const [rows, words, expected] of wsCases) {
  const got = findWords(rows.map((row) => row.split('')), words.slice());
  check(got.slice().sort(), expected, `${rows.slice(0, 3)} ${words.slice(0, 4)}`);
}
