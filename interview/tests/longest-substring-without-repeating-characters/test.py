from solution import *

alphabet = 'abcdefghijklmnopqrstuvwxyz'
cases = [('xyzxab', 5), ('abba', 2), ('zzzz', 1), ('', 0), ('a b!a', 4), ('dvdf', 3), ('tmmzuxt', 5),
         ('q', 1), ('01234567890', 10), (alphabet * 2000, 26), ('a' * 30000 + alphabet, 26)]
for s, expected in cases:
    check(Solution().lengthOfLongestSubstring(s), expected, repr(s[:20]))
