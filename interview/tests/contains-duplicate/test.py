from solution import *

cases = [
    ([4, 1, 7, 1], True),
    ([3, 8, -2, 5], False),
    ([0, 0], True),
    ([42], False),
    ([-1, 1, -1], True),
    ([2147483647, -2147483648, 0], False),
    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5], True),
    (list(range(100000)), False),
    (list(range(100000)) + [99999], True),
]
for nums, expected in cases:
    check(Solution().containsDuplicate(list(nums)), expected, f'{nums[:8]}')
