from solution import *

cases = [
    ([2, 5, 1, 4, 3, 5], 5),
    ([1, 3, 4, 2, 2], 2),
    ([3, 1, 3, 4, 2], 3),
    ([4, 4, 4, 4, 4, 4], 4),
    ([1, 1], 1),
    ([2, 2, 1], 2),
    ([2, 5, 9, 6, 9, 3, 8, 9, 7, 1], 9),
    ([9, 8, 7, 6, 5, 4, 3, 2, 1, 9], 9),
    ([777] + list(range(100000, 0, -1)), 777),
    ([1] * 50001, 1),
]
for nums, expected in cases:
    original = list(nums)
    check(Solution().findDuplicate(nums), expected, f'{nums[:6]}')
    check(nums, original, f'{nums[:6]} must not be modified')
