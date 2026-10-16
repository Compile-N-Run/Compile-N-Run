from solution import *

cases = [
    ([7, 2, 5, 10, 8], 2, 18),
    ([1, 2, 3, 4, 5], 2, 9),
    ([1, 4, 4], 3, 4),
    ([5], 1, 5),
    ([1, 1, 1, 1], 4, 1),
    ([0, 0, 0], 2, 0),
    ([10, 1, 1, 1, 10], 3, 10),
    ([2, 3, 1, 2, 4, 3], 5, 4),
    (list(range(1, 1001)), 1, 500500),
    (list(range(1, 1001)), 2, 250278),
    ([1000000] * 1000, 3, 334000000),
]
for nums, k, expected in cases:
    check(Solution().splitArray(list(nums), k), expected, f'{nums[:6]} k={k}')
