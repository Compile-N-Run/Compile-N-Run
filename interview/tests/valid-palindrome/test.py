from solution import *

half = 'Ab1, ' * 20000
big_yes = half + '#' + half[::-1]
big_no = half + 'x' + half[::-1] + 'z'
cases = [('Step on no pets!', True), ('Top spot 1', False), ('?! .', True), ('ab2a', False), ('a', True),
         ('Aa', True), ('0P', False), ("No 'x' in Nixon", True), (big_yes, True), (big_no, False)]
for s, expected in cases:
    check(Solution().isPalindrome(s), expected, repr(s[:30]))
