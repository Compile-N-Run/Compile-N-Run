const dupCases = [
  ['abbbacd', 3, 'aacd'],
  ['abbbaac', 3, 'c'],
  ['aabbccbba', 2, 'a'],
  ['xyz', 2, 'xyz'],
  ['aaaa', 3, 'a'],
  ['abcd', 2, 'abcd'],
  ['deeedbbcccbdaa', 3, 'aa'],
  ['pbbcggttciiippooaais', 2, 'ps'],
  ['aaa', 3, ''],
  ['aa', 3, 'aa'],
  ['yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy', 4, 'ybth'],
  ['a', 2, 'a'],
  ['a'.repeat(10000), 10, ''],
  ['a'.repeat(10001), 10, 'a'],
  ['ab'.repeat(5000), 2, 'ab'.repeat(5000)],
];
for (const [s, k, expected] of dupCases) {
  check(removeDuplicates(s, k), expected, `removeDuplicates(${s.slice(0, 16)}, ${k})`);
}
