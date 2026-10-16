from solution import *

big = ['x'] * 100000
big[10], big[30000], big[30005], big[30010] = 'a', 'a', 'c', 'b'
big = ''.join(big)
cases = [("thequickfox", "qf", "quickf"), ("abacab", "aab", "aba"), ("abc", "aa", ""), ("a", "ab", ""),
         ("a", "a", "a"), ("Aa", "a", "a"), ("Aa", "A", "A"), ("abc", "d", ""), ("MXNOYXMN", "MN", "MN"),
         ("aaflslflsldkalskaaa", "aaa", "aaa"), (big, "abc", big[30000:30011])]
for s, t, expected in cases:
    check(Solution().minWindow(s, t), expected, f'{s[:20]} {t}')
