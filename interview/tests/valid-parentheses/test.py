from solution import *

cases = [('([]{})', True), ('([)]', False), ('((', False), ('}', False), ('()[]{}', True), (')(', False),
         ('{[()()]}', True), ('[', False), ('(]', False), ('{[(' * 3000 + ')]}' * 3000, True),
         ('(' * 5000 + ')' * 4999, False)]
for s, expected in cases:
    check(Solution().isValid(s), expected, s[:20])
