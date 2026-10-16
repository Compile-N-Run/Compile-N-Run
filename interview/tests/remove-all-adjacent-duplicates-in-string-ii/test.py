from solution import *

cases = [
    ('abbbacd', 3, 'aacd'),
    ('abbbaac', 3, 'c'),
    ('aabbccbba', 2, 'a'),
    ('xyz', 2, 'xyz'),
    ('aaaa', 3, 'a'),
    ('abcd', 2, 'abcd'),
    ('deeedbbcccbdaa', 3, 'aa'),
    ('pbbcggttciiippooaais', 2, 'ps'),
    ('aaa', 3, ''),
    ('aa', 3, 'aa'),
    ('yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy', 4, 'ybth'),
    ('a', 2, 'a'),
    ('a' * 10000, 10, ''),
    ('a' * 10001, 10, 'a'),
    ('ab' * 5000, 2, 'ab' * 5000),
]
for s, k, expected in cases:
    check(Solution().removeDuplicates(s, k), expected, f'removeDuplicates({s[:16]}, {k})')
