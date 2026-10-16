const alphabet = "abcdefghijklmnopqrstuvwxyz";
for (const [s, expected] of [["xyzxab", 5], ["abba", 2], ["zzzz", 1], ["", 0], ["a b!a", 4], ["dvdf", 3], ["tmmzuxt", 5],
  ["q", 1], ["01234567890", 10], [alphabet.repeat(2000), 26], ["a".repeat(30000) + alphabet, 26]]) {
  check(lengthOfLongestSubstring(s), expected, JSON.stringify(s.slice(0, 20)));
}
