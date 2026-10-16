from solution import *

big = [i % 500 + 1 for i in range(50000)]
cases = [
    ([3, 2, 2, 4, 1, 4], 3, 6),
    ([7, 3, 5], 1, 15),
    ([7, 3, 5], 3, 7),
    ([5], 1, 5),
    ([1, 1, 1, 1], 2, 2),
    ([1, 1, 1, 1], 4, 1),
    ([1, 1, 1, 1], 3, 2),
    ([10, 1, 1, 1, 1, 10], 2, 12),
    ([6, 2, 9, 3, 8, 1], 4, 9),
    ([500, 500, 500], 50, 500),
    (big, 100, 125250),
    (big, 1, 12525000),
    (big, 50000, 500),
]
for weights, days, expected in cases:
    check(Solution().shipWithinDays(list(weights), days), expected, f'{weights[:6]} days={days}')
