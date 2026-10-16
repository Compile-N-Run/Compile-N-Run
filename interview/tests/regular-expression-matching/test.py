from solution import *

cases = [('abb', 'c*ab*', True), ('hello', 'h.l*o', True), ('ab', 'a', False), ('aaa', 'ab*a', False), ('abc', '.*', True), ('', 'x*y*', True), ('', '.', False), ('a', 'ab*', True), ('xy', '.*z', False), ('ab', '.*c', False), ('aaaaaaaaaaaaaaaaaab', 'a*a*a*a*a*a*a*c', False), ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'a*a*a*a*a*a*a*a*a*a*a', True), ('mnop', 'm.*p.*', True)]
for s, p, expected in cases:
    check(Solution().isMatch(s, p), expected, f'{s!r} {p!r}')
