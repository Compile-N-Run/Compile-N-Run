from solution import *


def norm(groups):
    return sorted(sorted(g) for g in groups)


cases = [(["note", "stone", "tone", "onset", "cat"], [["note", "tone"], ["stone", "onset"], ["cat"]]),
         (["", "b", ""], [["", ""], ["b"]]),
         (["loop"], [["loop"]]),
         ([""], [[""]]),
         (["ab", "ab", "ba", "abb"], [["ab", "ab", "ba"], ["abb"]]),
         (["aab", "abb", "bab", "aba"], [["aab", "aba"], ["abb", "bab"]]),
         (["x", "y", "z"], [["x"], ["y"], ["z"]])]

# Larger case: 1000 rotations of prefixes of "abcdefghij"; words of equal length are anagrams.
big, expected_big = [], [[] for _ in range(10)]
for i in range(1000):
    n = i % 10 + 1
    base = "abcdefghij"[:n]
    r = (i // 10) % n
    w = base[r:] + base[:r]
    big.append(w)
    expected_big[n - 1].append(w)
cases.append((big, expected_big))

for strs, expected in cases:
    check(norm(Solution().groupAnagrams(list(strs))), norm(expected), f'{strs[:5]}')
