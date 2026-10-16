from solution import *

# Larger case: 990 letters cycling through the alphabet (no palindrome longer than 1)
# with a 10-character palindrome inserted in the middle.
alpha = ''.join(chr(97 + i % 26) for i in range(990))
big = alpha[:500] + '1234554321' + alpha[500:]

cases = [('xracecarz', 7), ('abbc', 2), ('pqr', 1), ('aaaa', 4), ('a', 1), ('Aa', 1),
         ('abacdfgdcaba', 3), ('ab12321ba', 9), (big, 10)]
for s, length in cases:
    got = Solution().longestPalindrome(s)
    check((len(got), got == got[::-1], got in s), (length, True, True), s[:20])
