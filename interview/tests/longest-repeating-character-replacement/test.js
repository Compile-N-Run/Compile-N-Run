const replaceCases = [
  ['AABCA', 1, 3],
  ['AABCA', 2, 5],
  ['ABBBAA', 1, 4],
  ['XYZ', 0, 1],
  ['BBBB', 0, 4],
  ['ABAB', 2, 4],
  ['AAABBB', 1, 4],
  ['A', 5, 1],
  ['ABCDE', 2, 3],
  ['AABBCC', 2, 4],
  ['A'.repeat(5000) + 'B'.repeat(5000), 100, 5100],
  ['AB'.repeat(5000), 0, 1],
  ['AB'.repeat(5000), 5000, 10000],
];
for (const [s, k, expected] of replaceCases) {
  check(characterReplacement(s, k), expected, `${JSON.stringify(s.slice(0, 12))} (n=${s.length}) k=${k}`);
}
