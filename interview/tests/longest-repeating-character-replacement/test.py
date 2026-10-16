from solution import *

cases = [
    ('AABCA', 1, 3),
    ('AABCA', 2, 5),
    ('ABBBAA', 1, 4),
    ('XYZ', 0, 1),
    ('BBBB', 0, 4),
    ('ABAB', 2, 4),
    ('AAABBB', 1, 4),
    ('A', 5, 1),
    ('ABCDE', 2, 3),
    ('AABBCC', 2, 4),
    ('A' * 5000 + 'B' * 5000, 100, 5100),
    ('AB' * 5000, 0, 1),
    ('AB' * 5000, 5000, 10000),
]
for s, k, expected in cases:
    check(Solution().characterReplacement(s, k), expected, f'{s[:12]!r} (n={len(s)}) k={k}')
