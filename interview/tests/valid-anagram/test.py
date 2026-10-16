from solution import *

big_s = ''.join(chr(ord('a') + i % 26) for i in range(50000))
big_t = big_s[::-1]
cases = [("listen", "silent", True), ("bell", "bel", False), ("aab", "abb", False), ("x", "x", True),
         ("a", "b", False), ("anagram", "nagaram", True), ("abc", "abcc", False), ("zzzz", "zzzz", True),
         (big_s, big_t, True), (big_s, big_t[:-1] + 'q', False)]
for s, t, expected in cases:
    check(Solution().isAnagram(s, t), expected, f'{s[:20]} {t[:20]}')
