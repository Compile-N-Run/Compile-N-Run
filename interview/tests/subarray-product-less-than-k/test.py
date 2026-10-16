from solution import *

cases = [
    ([2, 3, 4], 10, 4),
    ([1, 1, 1], 2, 6),
    ([5, 5], 5, 0),
    ([3], 0, 0),
    ([3], 1, 0),
    ([3], 4, 1),
    ([10, 5, 2, 6], 100, 8),
    ([1, 2, 3, 4, 5], 20, 9),
    ([4, 1, 1, 8, 2], 9, 10),
    ([2] * 20, 1024, 144),
    ([1] * 30000, 2, 450015000),
    ([1000] * 30000, 1000000, 30000),
]
for nums, k, expected in cases:
    check(Solution().numSubarrayProductLessThanK(list(nums), k), expected, f'{nums[:6]} k={k}')
