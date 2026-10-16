for (const [s, expected] of [['aba', 4], ['aaaa', 10], ['abba', 6], ['abcd', 4], ['x', 1], ['racecar', 10], ['zz', 3],
  ['a'.repeat(1000), 500500], ['ab'.repeat(500), 250500]]) {
  check(countSubstrings(s), expected, s.slice(0, 20));
}
