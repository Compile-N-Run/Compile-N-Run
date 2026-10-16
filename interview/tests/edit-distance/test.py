from solution import *

cases = [("kitten", "sitting", 3), ("sunday", "saturday", 3), ("abc", "", 3), ("", "abc", 3), ("", "", 0), ("same", "same", 0),
         ("a", "b", 1), ("abcdef", "azced", 3), ("ab", "ba", 2), ("abcabcabc", "cba", 6),
         ("a" * 500, "b" * 500, 500), ("ab" * 250, "ba" * 250, 2), ("x" * 300, "x" * 500, 200)]
for word1, word2, expected in cases:
    check(Solution().minDistance(word1, word2), expected, f'{word1[:10]!r} -> {word2[:10]!r}')
