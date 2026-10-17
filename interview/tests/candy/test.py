from solution import *

cases = [
    ([1, 3, 2], 4),
    ([2, 2, 2], 3),
    ([5, 4, 3, 2], 10),
    ([1, 2, 2, 1], 6),
    ([7], 1),
    ([1, 0, 2], 5),
    ([1, 2, 3, 1], 7),
    ([1, 2, 87, 87, 87, 2, 1], 13),
    ([1, 2, 3, 4, 3, 2, 1], 16),
    ([0, 1] * 500, 1500),  # alternating valleys and peaks: 1, 2, 1, 2, ...
    (list(range(1000)), 500500),  # strictly rising: 1 + 2 + ... + 1000
    (list(range(500, 0, -1)) + list(range(1, 500)), 250000),  # a long slope down then up
]
for ratings, expected in cases:
    got = Solution().candy(list(ratings))
    check(got, expected, f'ratings={ratings[:8]}{"..." if len(ratings) > 8 else ""}')
