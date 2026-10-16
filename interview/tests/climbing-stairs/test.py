from solution import *

cases = [(1, 1), (2, 2), (3, 3), (4, 5), (6, 13), (10, 89), (20, 10946), (45, 1836311903)]
for n, expected in cases:
    check(Solution().climbStairs(n), expected, f'n={n}')
