from solution import *


def with_single(n, single):
    """Pairs 0,0,1,1,...,n-1,n-1 with the lone value `single` inserted in sorted position."""
    values = [v for v in range(n) if v != single for _ in range(2)]
    bisect.insort(values, single)
    return values


cases = [
    ([1, 1, 2, 3, 3, 4, 4], 2),
    ([0, 0, 5, 5, 9], 9),
    ([2, 3, 3], 2),
    ([-4, -4, -1, -1, 0, 6, 6], 0),
    ([7], 7),
    ([1, 1, 2, 2, 3], 3),
    ([1, 2, 2, 3, 3], 1),
    ([1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6], 3),
    ([-7, -7, -3, -3, -2, -1, -1], -2),
    (with_single(1000, 0), 0),  # the lone value first among 1999 elements
    (with_single(1000, 999), 999),  # the lone value last
    (with_single(1000, 617), 617),  # the lone value somewhere in the middle
]
for nums, expected in cases:
    got = Solution().singleNonDuplicate(list(nums))
    check(got, expected, f'nums={nums[:8]}{"..." if len(nums) > 8 else ""} ({len(nums)} elements)')
