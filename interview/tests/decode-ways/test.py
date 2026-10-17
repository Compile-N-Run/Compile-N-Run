from solution import *

cases = [
    ('12', 2),
    ('226', 3),
    ('06', 0),
    ('2101', 1),
    ('27', 1),
    ('0', 0),
    ('1', 1),
    ('10', 1),
    ('100', 0),
    ('230', 0),
    ('11106', 2),
    ('1000', 0),
    ('12' * 10, 10946),
    ('1' * 40, 165580141),  # 41st Fibonacci number
    ('10' * 500, 1),  # every "10" must be taken as a pair
    ('27' * 500, 1),  # "27" is never a pair
    ('9' * 1000, 1),
]
for s, expected in cases:
    check(Solution().numDecodings(s), expected, f'"{s[:12]}{"..." if len(s) > 12 else ""}" (length {len(s)})')
