from solution import *

cases = [
    ([2, -3, 4], 4),
    ([-2, 3, -4], 24),
    ([2, -5, -2, -4, 3], 24),
    ([0, -1], 0),
    ([-5], -5),
    ([2, 0, 3, 4], 12),
    ([-1, -2, -3, 0, 5], 6),
    ([3, -1, 4], 4),
    ([-3, 0, -2, -1], 2),
    ([0, 0, 0], 0),
    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1], 3628800),
    ([-1] * 9999, 1),  # odd count of negatives: drop one end
    ([-2] + [1] * 9998 + [-2], 4),  # the whole array is the answer
]
for nums, expected in cases:
    check(Solution().maxProduct(list(nums)), expected, f'{nums[:8]} (n={len(nums)})')
