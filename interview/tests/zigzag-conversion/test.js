const zigLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const zigBig = Array.from({ length: 2000 }, (_, i) => zigLetters[i % 26].toLowerCase()).join('');
const zigEvens = [...zigBig].filter((_, i) => i % 2 === 0).join('');
const zigOdds = [...zigBig].filter((_, i) => i % 2 === 1).join('');
const zigCases = [
  ['ABCDEFGHIJ', 3, 'AEIBDFHJCG'],
  ['ABCD', 2, 'ACBD'],
  ['HELLO', 1, 'HELLO'],
  ['AB', 5, 'AB'],
  ['ABCDEFGH', 7, 'ABCDEFHG'],
  ['ABCDEFG', 7, 'ABCDEFG'],
  ['A', 1, 'A'],
  ['A', 3, 'A'],
  [zigLetters, 4, 'AGMSYBFHLNRTXZCEIKOQUWDJPV'],
  [zigLetters, 5, 'AIQYBHJPRXZCGKOSWDFLNTVEMU'],
  ['a.b,c d', 2, 'abcd., '], // punctuation and spaces are ordinary characters
  [zigBig, 2, zigEvens + zigOdds], // two rows: every other character, then the rest
  [zigBig, 2000, zigBig], // as many rows as characters: unchanged
  [zigBig, 1, zigBig],
];
for (const [s, numRows, expected] of zigCases) {
  const got = convert(s, numRows);
  check(got, expected, `s=${JSON.stringify(s.slice(0, 12))}${s.length > 12 ? '...' : ''} numRows=${numRows}`);
}
