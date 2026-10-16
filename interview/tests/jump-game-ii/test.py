from solution import *

cases = [
    ([3, 1, 1, 4, 1, 1, 1], 2),
    ([1, 1, 1, 1], 3),
    ([4, 1, 1, 1, 1], 1),
    ([1, 3, 0, 0, 2, 0, 1], 3),
    ([5], 0),
    ([0], 0),
    ([2, 1], 1),
    ([1, 2, 3], 2),
    ([3, 0, 0, 1, 0], 2),
    ([1] * 10000, 9999),
    ([10000] + [1] * 9999, 1),
    ([2] * 10001, 5000),
]
for nums, expected in cases:
    check(Solution().jump(list(nums)), expected, f'{nums[:8]} (n={len(nums)})')
