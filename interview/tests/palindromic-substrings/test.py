from solution import *

cases = [('aba', 4), ('aaaa', 10), ('abba', 6), ('abcd', 4), ('x', 1), ('racecar', 10), ('zz', 3),
         ('a' * 1000, 500500), ('ab' * 500, 250500)]
for s, expected in cases:
    check(Solution().countSubstrings(s), expected, s[:20])
