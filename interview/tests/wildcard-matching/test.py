from solution import *

cases = [
    ('adceb', '*a*b', True),
    ('acdcb', 'a*c?b', False),
    ('cb', '?a', False),
    ('', '**', True),
    ('abc', '', False),
    ('aa', 'a', False),
    ('aa', '*', True),
    ('', '', True),
    ('', '?', False),
    ('abc', 'abc', True),
    ('abc', 'a?c', True),
    ('a', 'a*', True),
    ('ho', '**ho', True),
    ('mississippi', 'm??*ss*?i*pi', False),
    ('abefcdgiescdfimde', 'ab*cd?i*de', True),
    ('a' * 2000 + 'b', '*a', False),
    ('a' * 1000 + 'b', '*a*b', True),
    ('a' * 2000, '*' * 50 + 'b', False),
    ('a' * 2000, '*a' * 100 + '*', True),  # many stars that must each stretch
]
for s, p, expected in cases:
    label = f'"{s[:10]}{"..." if len(s) > 10 else ""}" (length {len(s)}) against "{p[:12]}{"..." if len(p) > 12 else ""}"'
    check(Solution().isMatch(s, p), expected, label)
