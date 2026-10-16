const editCases = [["kitten", "sitting", 3], ["sunday", "saturday", 3], ["abc", "", 3], ["", "abc", 3], ["", "", 0], ["same", "same", 0],
  ["a", "b", 1], ["abcdef", "azced", 3], ["ab", "ba", 2], ["abcabcabc", "cba", 6],
  ["a".repeat(500), "b".repeat(500), 500], ["ab".repeat(250), "ba".repeat(250), 2], ["x".repeat(300), "x".repeat(500), 200]];
for (const [word1, word2, expected] of editCases) {
  check(minDistance(word1, word2), expected, `${JSON.stringify(word1.slice(0, 10))} -> ${JSON.stringify(word2.slice(0, 10))}`);
}
