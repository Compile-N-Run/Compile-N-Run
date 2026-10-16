from solution import *

cases = [('())((())', 4), ('(()()', 4), ('()(())', 6), (')(', 0), ('', 0), ('((((', 0), ('()(()', 2),
         (')()())()()(', 4), ('()', 2),
         ('(' + '()' * 5000 + ')' + ')', 10002), ('()' * 3000 + '(' + '()' * 2000, 6000)]
for s, expected in cases:
    check(Solution().longestValidParentheses(s), expected, repr(s[:20]))
